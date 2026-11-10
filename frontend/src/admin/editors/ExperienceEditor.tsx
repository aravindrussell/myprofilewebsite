import type { EditorProps } from "./types";
import { AddButton } from "./ProfileEditor";
import { ChipsEditor, LinesField, TextField } from "../components/fields";
import { SortableList } from "../components/SortableList";
import { newId } from "../useDraft";

export function ExperienceEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <SortableList
        noun="experience"
        items={draft.experience}
        getId={(x) => x.id}
        getLabel={(x) => `${x.role} @ ${x.company}`}
        visible={(x) => x.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            d.experience[i]!.visible = !d.experience[i]!.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.experience = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.experience.splice(i, 1);
          });
        }}
        renderItem={(x, i) => {
          const e = (f: string) => errors[`/experience/${i}/${f}`];
          const set =
            (f: "company" | "role" | "start" | "end" | "client" | "project" | "location") =>
            (v: string) => {
              edit((d) => {
                d.experience[i]![f] = v;
              });
            };
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Company"
                  value={x.company}
                  error={e("company")}
                  onChange={set("company")}
                />
                <TextField label="Role" value={x.role} error={e("role")} onChange={set("role")} />
                <TextField
                  label="Start (YYYY-MM)"
                  placeholder="2024-09"
                  value={x.start}
                  error={e("start")}
                  onChange={set("start")}
                />
                <TextField
                  label="End (YYYY-MM)"
                  placeholder="empty = Present"
                  value={x.end}
                  error={e("end")}
                  hint="Leave empty for your current role."
                  onChange={set("end")}
                />
                <TextField
                  label="Client"
                  value={x.client}
                  error={e("client")}
                  onChange={set("client")}
                />
                <TextField
                  label="Project"
                  value={x.project}
                  error={e("project")}
                  onChange={set("project")}
                />
              </div>
              <TextField
                label="Location"
                value={x.location}
                error={e("location")}
                onChange={set("location")}
              />
              <LinesField
                label="Responsibilities & achievements"
                rows={7}
                value={x.bullets}
                error={e("bullets")}
                onChange={(v) => {
                  edit((d) => {
                    d.experience[i]!.bullets = v;
                  });
                }}
              />
              <ChipsEditor
                label="Tech tags"
                value={x.tags}
                error={e("tags")}
                onChange={(v) => {
                  edit((d) => {
                    d.experience[i]!.tags = v;
                  });
                }}
              />
            </>
          );
        }}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            const now = new Date();
            const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            d.experience.unshift({
              id: newId("job"),
              company: "Company",
              role: "Role",
              start: ym,
              end: "",
              location: "",
              client: "",
              project: "",
              bullets: [],
              tags: [],
              visible: true,
            });
          });
        }}
      >
        Add experience
      </AddButton>
    </div>
  );
}
