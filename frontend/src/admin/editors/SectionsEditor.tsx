import type { EditorProps } from "./types";
import { Fieldset } from "../components/Fieldset";
import { SortableList } from "../components/SortableList";
import { TextField } from "../components/fields";

/** Section order, visibility and labels. Hero always stays first. */
export function SectionsEditor({ draft, edit, errors }: EditorProps) {
  const [hero, ...rest] = draft.sections;
  return (
    <Fieldset legend="Order & visibility">
      <p className="text-sm text-muted">
        Hero always comes first. Sections with no visible items are hidden automatically.
      </p>
      {hero && (
        <p className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium">
          Hero <span className="font-mono text-xs text-muted">(fixed)</span>
        </p>
      )}
      <SortableList
        noun="section"
        items={rest}
        getId={(s) => s.id}
        getLabel={(s) => s.title || s.id}
        visible={(s) => s.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            const s = d.sections[i + 1];
            if (s) s.visible = !s.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.sections = [d.sections[0]!, ...items];
          });
        }}
        renderItem={(s, i) => (
          <>
            <TextField
              label="Heading"
              value={s.title}
              error={errors[`/sections/${i + 1}/title`]}
              onChange={(v) => {
                edit((d) => {
                  d.sections[i + 1]!.title = v;
                });
              }}
            />
            <TextField
              label="Navigation label"
              value={s.navLabel}
              error={errors[`/sections/${i + 1}/navLabel`]}
              onChange={(v) => {
                edit((d) => {
                  d.sections[i + 1]!.navLabel = v;
                });
              }}
            />
          </>
        )}
      />
    </Fieldset>
  );
}
