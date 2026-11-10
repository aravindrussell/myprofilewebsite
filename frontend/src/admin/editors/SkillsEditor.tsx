import type { Skill } from "../../types/profile";
import type { EditorProps } from "./types";
import { AddButton } from "./ProfileEditor";
import { ChipsEditor, TextField } from "../components/fields";
import { SortableList } from "../components/SortableList";
import { newId } from "../useDraft";

const LEVELS = ["", "core", "proficient", "familiar"] as const;

export function SkillsEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Levels are optional and shown as words (core / proficient / familiar), never as percentages.
      </p>
      <SortableList
        noun="skill group"
        items={draft.skills}
        getId={(g) => g.id}
        getLabel={(g) => `${g.name} (${g.skills.length})`}
        onReorder={(items) => {
          edit((d) => {
            d.skills = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.skills.splice(i, 1);
          });
        }}
        renderItem={(g, i) => (
          <>
            <TextField
              label="Group name"
              value={g.name}
              error={errors[`/skills/${i}/name`]}
              onChange={(v) => {
                edit((d) => {
                  d.skills[i]!.name = v;
                });
              }}
            />
            <ChipsEditor
              label="Skills"
              value={g.skills.map((s) => s.name)}
              error={errors[`/skills/${i}/skills`]}
              onChange={(names) => {
                edit((d) => {
                  const byName = new Map(d.skills[i]!.skills.map((s) => [s.name, s]));
                  d.skills[i]!.skills = names.map(
                    (name) => byName.get(name) ?? { name, level: null },
                  );
                });
              }}
            />
            {g.skills.length > 0 && (
              <fieldset>
                <legend className="text-sm font-medium">Levels</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {g.skills.map((s, j) => (
                    <label key={s.name} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{s.name}</span>
                      <select
                        value={s.level ?? ""}
                        onChange={(e) => {
                          const level = (e.target.value || null) as Skill["level"];
                          edit((d) => {
                            d.skills[i]!.skills[j]!.level = level;
                          });
                        }}
                        className="rounded-md border border-line bg-bg px-2 py-1 text-sm"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l || "—"}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            d.skills.push({ id: newId("group"), name: "New group", skills: [] });
          });
        }}
      >
        Add skill group
      </AddButton>
    </div>
  );
}
