import type { EditorProps } from "./types";
import { AddButton } from "./ProfileEditor";
import { TextArea, TextField } from "../components/fields";
import { SortableList } from "../components/SortableList";
import { newId } from "../useDraft";

export function EducationEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <SortableList
        noun="education"
        items={draft.education}
        getId={(x) => x.id}
        getLabel={(x) => x.qualification}
        visible={(x) => x.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            d.education[i]!.visible = !d.education[i]!.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.education = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.education.splice(i, 1);
          });
        }}
        renderItem={(x, i) => {
          const set = (f: "qualification" | "institution" | "start" | "end") => (v: string) => {
            edit((d) => {
              d.education[i]![f] = v;
            });
          };
          const e = (f: string) => errors[`/education/${i}/${f}`];
          return (
            <>
              <TextField
                label="Qualification"
                value={x.qualification}
                error={e("qualification")}
                onChange={set("qualification")}
              />
              <TextField
                label="Institution"
                value={x.institution}
                error={e("institution")}
                onChange={set("institution")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Start year"
                  placeholder="YYYY"
                  value={x.start}
                  error={e("start")}
                  onChange={set("start")}
                />
                <TextField
                  label="End year"
                  placeholder="YYYY"
                  value={x.end}
                  error={e("end")}
                  onChange={set("end")}
                />
              </div>
            </>
          );
        }}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            d.education.push({
              id: newId("edu"),
              qualification: "Qualification",
              institution: "Institution",
              start: "",
              end: "",
              visible: true,
            });
          });
        }}
      >
        Add education
      </AddButton>
    </div>
  );
}

export function CertificationsEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <SortableList
        noun="certification"
        items={draft.certifications}
        getId={(x) => x.id}
        getLabel={(x) => x.name}
        visible={(x) => x.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            d.certifications[i]!.visible = !d.certifications[i]!.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.certifications = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.certifications.splice(i, 1);
          });
        }}
        renderItem={(x, i) => {
          const set = (f: "name" | "issuer" | "date" | "url") => (v: string) => {
            edit((d) => {
              d.certifications[i]![f] = v;
            });
          };
          const e = (f: string) => errors[`/certifications/${i}/${f}`];
          return (
            <>
              <TextField label="Name" value={x.name} error={e("name")} onChange={set("name")} />
              <TextField
                label="Issuer"
                value={x.issuer}
                error={e("issuer")}
                onChange={set("issuer")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Date (YYYY-MM)"
                  value={x.date}
                  error={e("date")}
                  onChange={set("date")}
                />
                <TextField
                  label="Credential URL"
                  value={x.url}
                  error={e("url")}
                  onChange={set("url")}
                />
              </div>
            </>
          );
        }}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            d.certifications.push({
              id: newId("cert"),
              name: "Certification",
              issuer: "",
              date: "",
              url: "",
              visible: true,
            });
          });
        }}
      >
        Add certification
      </AddButton>
    </div>
  );
}

export function TestimonialsEditor({ draft, edit, errors }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Only add recommendations you have permission to publish. The section stays hidden while
        empty.
      </p>
      <SortableList
        noun="testimonial"
        items={draft.testimonials}
        getId={(x) => x.id}
        getLabel={(x) => x.author}
        visible={(x) => x.visible}
        onToggleVisible={(i) => {
          edit((d) => {
            d.testimonials[i]!.visible = !d.testimonials[i]!.visible;
          });
        }}
        onReorder={(items) => {
          edit((d) => {
            d.testimonials = items;
          });
        }}
        onDelete={(i) => {
          edit((d) => {
            d.testimonials.splice(i, 1);
          });
        }}
        renderItem={(x, i) => {
          const set = (f: "quote" | "author" | "role" | "url") => (v: string) => {
            edit((d) => {
              d.testimonials[i]![f] = v;
            });
          };
          const e = (f: string) => errors[`/testimonials/${i}/${f}`];
          return (
            <>
              <TextArea label="Quote" value={x.quote} error={e("quote")} onChange={set("quote")} />
              <TextField
                label="Author"
                value={x.author}
                error={e("author")}
                onChange={set("author")}
              />
              <TextField
                label="Role / company"
                value={x.role}
                error={e("role")}
                onChange={set("role")}
              />
              <TextField label="Profile URL" value={x.url} error={e("url")} onChange={set("url")} />
            </>
          );
        }}
      />
      <AddButton
        onClick={() => {
          edit((d) => {
            d.testimonials.push({
              id: newId("rec"),
              quote: "Quote",
              author: "Name",
              role: "",
              url: "",
              visible: true,
            });
          });
        }}
      >
        Add recommendation
      </AddButton>
    </div>
  );
}
