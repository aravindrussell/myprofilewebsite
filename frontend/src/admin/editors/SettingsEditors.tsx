import type { EditorProps } from "./types";
import { Fieldset } from "../components/Fieldset";
import {
  ChipsEditor,
  ColorField,
  Select,
  TextArea,
  TextField,
  UploadField,
} from "../components/fields";
import { AA_TEXT, SURFACES, contrastRatio } from "../../lib/color";
import { FONT_PAIRS } from "../../lib/fonts";
import type { Theme } from "../../types/profile";

export function ContactEditor({ draft, edit, errors }: EditorProps) {
  return (
    <Fieldset legend="Contact section">
      <TextArea
        label="Intro message"
        rows={3}
        value={draft.contact.message}
        error={errors["/contact/message"]}
        onChange={(v) => {
          edit((d) => {
            d.contact.message = v;
          });
        }}
      />
      <p className="text-sm text-muted">
        Email, LinkedIn, GitHub and phone come from the Profile tab. A contact form appears when{" "}
        <code className="font-mono">VITE_FORMSPREE_ID</code> is set in <code>.env</code>.
      </p>
    </Fieldset>
  );
}

function contrastHint(color: string, surface: string): string | undefined {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return undefined;
  const ratio = contrastRatio(color, surface);
  const verdict = ratio >= AA_TEXT ? "passes WCAG AA" : "FAILS WCAG AA for text (needs 4.5:1)";
  return `Contrast ${ratio.toFixed(2)}:1 against the background, ${verdict}.`;
}

export function ThemeEditor({ draft, edit, errors }: EditorProps) {
  const t = draft.theme;
  return (
    <Fieldset legend="Theme">
      <ColorField
        label="Accent (light mode)"
        value={t.accent}
        error={errors["/theme/accent"]}
        hint={contrastHint(t.accent, SURFACES.light)}
        onChange={(v) => {
          edit((d) => {
            d.theme.accent = v;
          });
        }}
      />
      <ColorField
        label="Accent (dark mode)"
        value={t.accentDark}
        error={errors["/theme/accentDark"]}
        hint={contrastHint(t.accentDark, SURFACES.dark)}
        onChange={(v) => {
          edit((d) => {
            d.theme.accentDark = v;
          });
        }}
      />
      <Select<Theme["defaultMode"]>
        label="Default colour mode"
        value={t.defaultMode}
        options={[
          { value: "system", label: "Follow the visitor's system" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={(v) => {
          edit((d) => {
            d.theme.defaultMode = v;
          });
        }}
      />
      <Select<Theme["fontPair"]>
        label="Font pair"
        value={t.fontPair}
        options={Object.entries(FONT_PAIRS).map(([value, f]) => ({
          value: value as Theme["fontPair"],
          label: f.label,
        }))}
        onChange={(v) => {
          edit((d) => {
            d.theme.fontPair = v;
          });
        }}
      />
    </Fieldset>
  );
}

export function SeoEditor({ draft, edit, errors }: EditorProps) {
  const s = draft.seo;
  return (
    <Fieldset legend="Search & social">
      <TextField
        label="Page title"
        value={s.title}
        error={errors["/seo/title"]}
        hint={`${s.title.length}/70 characters`}
        onChange={(v) => {
          edit((d) => {
            d.seo.title = v;
          });
        }}
      />
      <TextArea
        label="Meta description"
        rows={3}
        value={s.description}
        error={errors["/seo/description"]}
        hint={`${s.description.length}/170 characters`}
        onChange={(v) => {
          edit((d) => {
            d.seo.description = v;
          });
        }}
      />
      <ChipsEditor
        label="Keywords"
        value={s.keywords}
        error={errors["/seo/keywords"]}
        onChange={(v) => {
          edit((d) => {
            d.seo.keywords = v;
          });
        }}
      />
      <TextField
        label="Site URL"
        value={s.siteUrl}
        error={errors["/seo/siteUrl"]}
        hint="Used for canonical, Open Graph and sitemap URLs. VITE_SITE_URL overrides it."
        onChange={(v) => {
          edit((d) => {
            d.seo.siteUrl = v;
          });
        }}
      />
      <UploadField
        label="Open Graph image (1200×630 recommended)"
        kind="image"
        value={s.ogImage}
        error={errors["/seo/ogImage"]}
        onChange={(v) => {
          edit((d) => {
            d.seo.ogImage = v;
          });
        }}
      />
    </Fieldset>
  );
}
