import type { EditorProps } from "./types";
import { Fieldset } from "../components/Fieldset";
import { LinesField, Select, TextArea, TextField, Toggle, UploadField } from "../components/fields";
import { SortableList } from "../components/SortableList";
import { newId } from "../useDraft";

export function ProfileEditor({ draft, edit, errors }: EditorProps) {
  const p = draft.profile;
  const e = (path: string) => errors[`/profile/${path}`];

  return (
    <div className="space-y-8">
      <Fieldset legend="Identity">
        <TextField
          label="Name"
          value={p.name}
          error={e("name")}
          onChange={(v) => {
            edit((d) => {
              d.profile.name = v;
            });
          }}
        />
        <TextField
          label="Title"
          value={p.title}
          error={e("title")}
          onChange={(v) => {
            edit((d) => {
              d.profile.title = v;
            });
          }}
        />
        <TextField
          label="Headline (one-line value proposition)"
          value={p.headline}
          error={e("headline")}
          onChange={(v) => {
            edit((d) => {
              d.profile.headline = v;
            });
          }}
        />
        <TextArea
          label="About"
          rows={5}
          value={p.about}
          error={e("about")}
          onChange={(v) => {
            edit((d) => {
              d.profile.about = v;
            });
          }}
        />
        <LinesField
          label="Highlights"
          value={p.highlights}
          error={e("highlights")}
          onChange={(v) => {
            edit((d) => {
              d.profile.highlights = v;
            });
          }}
        />
      </Fieldset>

      <Fieldset legend="Contact & availability">
        <TextField
          label="Email"
          type="email"
          value={p.email}
          error={e("email")}
          onChange={(v) => {
            edit((d) => {
              d.profile.email = v;
            });
          }}
        />
        <TextField
          label="Phone"
          value={p.phone}
          error={e("phone")}
          onChange={(v) => {
            edit((d) => {
              d.profile.phone = v;
            });
          }}
        />
        <Toggle
          label="Show phone number on the public site"
          checked={p.showPhone}
          onChange={(v) => {
            edit((d) => {
              d.profile.showPhone = v;
            });
          }}
        />
        <TextField
          label="Location"
          value={p.location}
          error={e("location")}
          onChange={(v) => {
            edit((d) => {
              d.profile.location = v;
            });
          }}
        />
        <TextField
          label="Availability"
          value={p.availability}
          error={e("availability")}
          onChange={(v) => {
            edit((d) => {
              d.profile.availability = v;
            });
          }}
        />
      </Fieldset>

      <Fieldset legend="Social links">
        {(["linkedin", "github", "naukri"] as const).map((key) => (
          <TextField
            key={key}
            label={{ linkedin: "LinkedIn URL", github: "GitHub URL", naukri: "Naukri URL" }[key]}
            placeholder="https://…"
            value={p.socials[key]}
            error={e(`socials/${key}`)}
            hint="Leave empty to hide."
            onChange={(v) => {
              edit((d) => {
                d.profile.socials[key] = v;
              });
            }}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Resume">
        <Select
          label="Download Resume button opens"
          value={p.resume.mode}
          options={[
            { value: "url", label: "A link (e.g. OneDrive)" },
            { value: "file", label: "An uploaded PDF" },
          ]}
          onChange={(v) => {
            edit((d) => {
              d.profile.resume.mode = v;
            });
          }}
        />
        {p.resume.mode === "url" ? (
          <TextField
            label="Resume URL"
            value={p.resume.url}
            error={e("resume/url") ?? errors["/profile/resume"]}
            onChange={(v) => {
              edit((d) => {
                d.profile.resume.url = v;
              });
            }}
          />
        ) : (
          <UploadField
            label="Resume PDF"
            kind="resume"
            value={p.resume.file}
            error={e("resume/file")}
            onChange={(v) => {
              edit((d) => {
                d.profile.resume.file = v;
              });
            }}
          />
        )}
      </Fieldset>

      <Fieldset legend="Photo (optional)">
        <UploadField
          label="Photo"
          kind="image"
          value={p.photo}
          error={e("photo")}
          onChange={(v) => {
            edit((d) => {
              d.profile.photo = v;
            });
          }}
        />
        {p.photo && (
          <TextField
            label="Photo alt text"
            value={p.photoAlt}
            error={e("photoAlt")}
            onChange={(v) => {
              edit((d) => {
                d.profile.photoAlt = v;
              });
            }}
          />
        )}
      </Fieldset>

      <Fieldset legend="Hero stats">
        <SortableList
          noun="stat"
          items={p.stats}
          getId={(s) => s.id}
          getLabel={(s) => `${s.value} ${s.label}`}
          onReorder={(items) => {
            edit((d) => {
              d.profile.stats = items;
            });
          }}
          onDelete={(i) => {
            edit((d) => {
              d.profile.stats.splice(i, 1);
            });
          }}
          renderItem={(s, i) => (
            <>
              <TextField
                label="Value"
                value={s.value}
                error={e(`stats/${i}/value`)}
                onChange={(v) => {
                  edit((d) => {
                    d.profile.stats[i]!.value = v;
                  });
                }}
              />
              <TextField
                label="Label"
                value={s.label}
                error={e(`stats/${i}/label`)}
                onChange={(v) => {
                  edit((d) => {
                    d.profile.stats[i]!.label = v;
                  });
                }}
              />
            </>
          )}
        />
        <AddButton
          disabled={p.stats.length >= 6}
          onClick={() => {
            edit((d) => {
              d.profile.stats.push({ id: newId("stat"), value: "1", label: "New stat" });
            });
          }}
        >
          Add stat
        </AddButton>
      </Fieldset>
    </div>
  );
}

export function AddButton({
  children,
  onClick,
  disabled,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-accent hover:text-fg disabled:opacity-40"
    >
      + {children}
    </button>
  );
}
