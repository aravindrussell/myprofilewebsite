"""Content schema for content/profile.json.

These Pydantic models are the single source of truth: scripts/gen_schema.py exports them to
content/profile.schema.json, which generates the frontend TypeScript types and drives
validation in the admin page and the production build.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator
from pydantic.alias_generators import to_camel

# ---- Constrained primitives ---------------------------------------------------------------

Id = Annotated[str, StringConstraints(pattern=r"^[a-z0-9][a-z0-9-]{0,63}$")]
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]
MediumText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=300)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=4000)]
RequiredShortText = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]
Tag = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]
# Absolute http(s) URL, or empty when not set.
UrlOrEmpty = Annotated[
    str, StringConstraints(strip_whitespace=True, max_length=500, pattern=r"^(https?://\S+)?$")
]
# A file inside content/assets/, or empty when not set.
AssetPath = Annotated[
    str, StringConstraints(max_length=200, pattern=r"^(assets/[A-Za-z0-9][A-Za-z0-9._-]*)?$")
]
Email = Annotated[
    str, StringConstraints(strip_whitespace=True, max_length=200, pattern=r"^[^@\s]+@[^@\s]+\.\w+$")
]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^[+0-9 ()-]{0,25}$")]
HexColor = Annotated[str, StringConstraints(pattern=r"^#[0-9a-fA-F]{6}$")]
# Year and month, e.g. 2024-09.
YearMonth = Annotated[str, StringConstraints(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]
YearMonthOrEmpty = Annotated[str, StringConstraints(pattern=r"^(\d{4}-(0[1-9]|1[0-2]))?$")]

SectionId = Literal[
    "hero",
    "about",
    "skills",
    "experience",
    "projects",
    "education",
    "certifications",
    "testimonials",
    "contact",
]
ALL_SECTION_IDS: tuple[SectionId, ...] = SectionId.__args__  # type: ignore[attr-defined]

SkillLevel = Literal["core", "proficient", "familiar"]
ColorMode = Literal["system", "light", "dark"]
FontPair = Literal["inter-jetbrains", "grotesk-plex", "serif-mono"]
ResumeMode = Literal["url", "file"]


class StrictModel(BaseModel):
    """Base model: camelCase JSON, unknown fields rejected."""

    model_config = ConfigDict(
        extra="forbid",
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
        json_schema_serialization_defaults_required=True,
    )


def _unique_ids(items: Sequence[_HasId], kind: str) -> None:
    seen: set[str] = set()
    for item in items:
        if item.id in seen:
            raise ValueError(f"Duplicate {kind} id: {item.id!r}")
        seen.add(item.id)


class _HasId(StrictModel):
    id: Id


# ---- Profile ------------------------------------------------------------------------------


class SocialLinks(StrictModel):
    linkedin: UrlOrEmpty = ""
    github: UrlOrEmpty = ""
    naukri: UrlOrEmpty = ""


class Resume(StrictModel):
    mode: ResumeMode = "url"
    url: UrlOrEmpty = ""
    file: AssetPath = ""

    @model_validator(mode="after")
    def _source_present(self) -> Resume:
        if self.mode == "url" and not self.url:
            raise ValueError("Resume mode is 'url' but no URL is set")
        if self.mode == "file" and not self.file:
            raise ValueError("Resume mode is 'file' but no file is set")
        return self


class Stat(_HasId):
    value: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=24)]
    label: ShortText


class Profile(StrictModel):
    name: RequiredShortText
    title: RequiredShortText
    headline: MediumText = Field(description="One-line value proposition shown in the hero.")
    about: LongText = ""
    highlights: list[MediumText] = Field(default_factory=list, max_length=12)
    location: ShortText = ""
    availability: ShortText = ""
    email: Email
    phone: Phone = ""
    show_phone: bool = False
    photo: AssetPath = ""
    photo_alt: ShortText = ""
    socials: SocialLinks = Field(default_factory=SocialLinks)
    resume: Resume
    stats: list[Stat] = Field(default_factory=list, max_length=6)

    @model_validator(mode="after")
    def _check(self) -> Profile:
        _unique_ids(self.stats, "stat")
        if self.photo and not self.photo_alt:
            raise ValueError("Photo needs alt text")
        return self


# ---- Sections -----------------------------------------------------------------------------


class SectionMeta(StrictModel):
    id: SectionId
    nav_label: ShortText
    title: ShortText
    visible: bool = True


class Skill(StrictModel):
    name: Tag
    level: SkillLevel | None = None


class SkillGroup(_HasId):
    name: RequiredShortText
    skills: list[Skill] = Field(default_factory=list, max_length=40)


class Experience(_HasId):
    company: RequiredShortText
    role: RequiredShortText
    start: YearMonth
    end: YearMonthOrEmpty = Field(default="", description="Empty means 'Present'.")
    location: ShortText = ""
    client: ShortText = ""
    project: ShortText = ""
    bullets: list[MediumText] = Field(default_factory=list, max_length=20)
    tags: list[Tag] = Field(default_factory=list, max_length=30)
    visible: bool = True

    @model_validator(mode="after")
    def _dates(self) -> Experience:
        if self.end and self.end < self.start:
            raise ValueError(f"{self.company}: end date is before start date")
        return self


class ProjectLink(StrictModel):
    label: RequiredShortText
    url: Annotated[str, StringConstraints(max_length=500, pattern=r"^https?://\S+$")]


class Project(_HasId):
    title: RequiredShortText
    description: LongText = ""
    tags: list[Tag] = Field(default_factory=list, max_length=20)
    links: list[ProjectLink] = Field(default_factory=list, max_length=6)
    image: AssetPath = ""
    image_alt: ShortText = ""
    visible: bool = True

    @model_validator(mode="after")
    def _alt(self) -> Project:
        if self.image and not self.image_alt:
            raise ValueError(f"Project {self.title!r}: image needs alt text")
        return self


class Education(_HasId):
    qualification: RequiredShortText
    institution: RequiredShortText
    start: Annotated[str, StringConstraints(pattern=r"^(\d{4})?$")] = ""
    end: Annotated[str, StringConstraints(pattern=r"^(\d{4})?$")] = ""
    visible: bool = True


class Certification(_HasId):
    name: RequiredShortText
    issuer: ShortText = ""
    date: YearMonthOrEmpty = ""
    url: UrlOrEmpty = ""
    visible: bool = True


class Testimonial(_HasId):
    quote: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1200)]
    author: RequiredShortText
    role: ShortText = ""
    url: UrlOrEmpty = ""
    visible: bool = True


class Contact(StrictModel):
    message: MediumText = ""


class Theme(StrictModel):
    accent: HexColor = Field(description="Accent colour used on light backgrounds.")
    accent_dark: HexColor = Field(description="Accent colour used on dark backgrounds.")
    default_mode: ColorMode = "system"
    font_pair: FontPair = "inter-jetbrains"


class Seo(StrictModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=70)]
    description: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=170)
    ]
    keywords: list[Tag] = Field(default_factory=list, max_length=25)
    og_image: AssetPath = ""
    site_url: UrlOrEmpty = Field(default="", description="Overridden by VITE_SITE_URL if set.")


# ---- Document -----------------------------------------------------------------------------


class PortfolioContent(StrictModel):
    """Everything the public site renders."""

    model_config = ConfigDict(title="PortfolioContent")

    schema_version: Literal[1] = 1
    profile: Profile
    sections: list[SectionMeta]
    skills: list[SkillGroup] = Field(default_factory=list, max_length=20)
    experience: list[Experience] = Field(default_factory=list, max_length=30)
    projects: list[Project] = Field(default_factory=list, max_length=30)
    education: list[Education] = Field(default_factory=list, max_length=10)
    certifications: list[Certification] = Field(default_factory=list, max_length=30)
    testimonials: list[Testimonial] = Field(default_factory=list, max_length=20)
    contact: Contact = Field(default_factory=Contact)
    theme: Theme
    seo: Seo

    @model_validator(mode="after")
    def _check(self) -> PortfolioContent:
        ids = [s.id for s in self.sections]
        if sorted(ids) != sorted(ALL_SECTION_IDS):
            missing = set(ALL_SECTION_IDS) - set(ids)
            dupes = {i for i in ids if ids.count(i) > 1}
            raise ValueError(
                f"Sections must list each section exactly once (missing: {sorted(missing)}, "
                f"duplicated: {sorted(dupes)})"
            )
        if ids[0] != "hero":
            raise ValueError("The hero section must come first")
        _unique_ids(self.skills, "skill group")
        _unique_ids(self.experience, "experience")
        _unique_ids(self.projects, "project")
        _unique_ids(self.education, "education")
        _unique_ids(self.certifications, "certification")
        _unique_ids(self.testimonials, "testimonial")
        return self

    def referenced_assets(self) -> set[str]:
        """Asset paths the content points at (used to verify files exist)."""
        refs = {self.profile.photo, self.seo.og_image, *(p.image for p in self.projects)}
        if self.profile.resume.mode == "file":
            refs.add(self.profile.resume.file)
        return {r for r in refs if r}
