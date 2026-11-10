import type { EditorProps } from "./types";
import { AddButton } from "./ProfileEditor";
import { ChipsEditor, TextArea, TextField, UploadField } from "../components/fields";
import { SortableList } from "../components/SortableList";
import { newId } from "../useDraft";

export function ProjectsEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <SortableList
        noun="project"
        items={draft.projects}
        getId={(p) => p.id}
        getLabel={(p) => p.title}
        visible={(p) => p.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            d.projects[i]!.visible = !d.projects[i]!.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.projects = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.projects.splice(i, 1);
          });
        }}
        renderItem={(p, i) => {
          const e = (f: string) => errors[`/projects/${i}/${f}`];
          return (
            <>
              <TextField
                label="Title"
                value={p.title}
                error={e("title")}
                onChange={(v) => {
                  edit((d) => {
                    d.projects[i]!.title = v;
                  });
                }}
              />
              <TextArea
                label="Description"
                value={p.description}
                error={e("description")}
                onChange={(v) => {
                  edit((d) => {
                    d.projects[i]!.description = v;
                  });
                }}
              />
              <ChipsEditor
                label="Tech tags"
                value={p.tags}
                error={e("tags")}
                onChange={(v) => {
                  edit((d) => {
                    d.projects[i]!.tags = v;
                  });
                }}
              />
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Links</legend>
                {p.links.map((l, j) => (
                  <div key={j} className="grid items-end gap-2 sm:grid-cols-[8rem_1fr_auto]">
                    <TextField
                      label="Label"
                      value={l.label}
                      error={e(`links/${j}/label`)}
                      onChange={(v) => {
                        edit((d) => {
                          d.projects[i]!.links[j]!.label = v;
                        });
                      }}
                    />
                    <TextField
                      label="URL"
                      value={l.url}
                      error={e(`links/${j}/url`)}
                      onChange={(v) => {
                        edit((d) => {
                          d.projects[i]!.links[j]!.url = v;
                        });
                      }}
                    />
                    <button
                      type="button"
                      className="mb-1 rounded-md px-2 py-2 text-sm text-muted hover:text-red-600"
                      aria-label={`Remove link ${l.label}`}
                      onClick={() => {
                        edit((d) => {
                          d.projects[i]!.links.splice(j, 1);
                        });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <AddButton
                  disabled={p.links.length >= 6}
                  onClick={() => {
                    edit((d) => {
                      d.projects[i]!.links.push({ label: "GitHub", url: "https://" });
                    });
                  }}
                >
                  Add link
                </AddButton>
              </fieldset>
              <UploadField
                label="Image (optional)"
                kind="image"
                value={p.image}
                error={e("image")}
                onChange={(v) => {
                  edit((d) => {
                    d.projects[i]!.image = v;
                  });
                }}
              />
              {p.image && (
                <TextField
                  label="Image alt text"
                  value={p.imageAlt}
                  error={e("imageAlt")}
                  onChange={(v) => {
                    edit((d) => {
                      d.projects[i]!.imageAlt = v;
                    });
                  }}
                />
              )}
            </>
          );
        }}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            d.projects.push({
              id: newId("project"),
              title: "New project",
              description: "",
              tags: [],
              links: [],
              image: "",
              imageAlt: "",
              visible: true,
            });
          });
        }}
      >
        Add project
      </AddButton>
    </div>
  );
}
