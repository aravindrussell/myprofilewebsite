import { useState, type SubmitEvent } from "react";
import type { PortfolioContent, SectionMeta } from "../../types/profile";
import { SectionShell } from "../components/SectionShell";
import { Reveal } from "../components/Reveal";
import { Icon, type IconName } from "../components/Icon";

type Props = {
  content: PortfolioContent;
  meta: SectionMeta;
  index: number;
  formspreeId: string;
};

type Status = "idle" | "sending" | "sent" | "error";

function ContactForm({ formspreeId }: { formspreeId: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${encodeURIComponent(formspreeId)}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "mt-1.5 block w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-fg placeholder:text-muted focus:border-accent focus:outline-none";

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="space-y-4 card p-6"
      aria-describedby="contact-status"
      data-testid="contact-form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required autoComplete="name" maxLength={120} className={field} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            className={field}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Message
        <textarea name="message" required rows={5} maxLength={4000} className={field} />
      </label>
      {/* Honeypot: hidden from people, filled in by bots; Formspree drops those submissions. */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p id="contact-status" role="status" className="text-sm text-muted">
          {status === "sent" && "Thanks — your message was sent."}
          {status === "error" && "Something went wrong. Please email me directly."}
        </p>
      </div>
    </form>
  );
}

export function Contact({ content, meta, index, formspreeId }: Props) {
  const { profile, contact } = content;
  const { socials } = profile;
  const links: { href: string; label: string; detail: string; icon: IconName }[] = [
    { href: `mailto:${profile.email}`, label: "Email", detail: profile.email, icon: "mail" },
    ...(socials.linkedin
      ? [
          {
            href: socials.linkedin,
            label: "LinkedIn",
            detail: "Connect",
            icon: "linkedin" as const,
          },
        ]
      : []),
    ...(socials.github
      ? [
          {
            href: socials.github,
            label: "GitHub",
            detail: socials.github.replace(/^https?:\/\/(www\.)?/, ""),
            icon: "github" as const,
          },
        ]
      : []),
    ...(socials.naukri
      ? [{ href: socials.naukri, label: "Naukri", detail: "Profile", icon: "external" as const }]
      : []),
    ...(profile.showPhone && profile.phone
      ? [
          {
            href: `tel:${profile.phone.replace(/[^+0-9]/g, "")}`,
            label: "Phone",
            detail: profile.phone,
            icon: "phone" as const,
          },
        ]
      : []),
  ];

  return (
    <SectionShell meta={meta} index={index} lead={contact.message || undefined}>
      <div className={`grid gap-8 ${formspreeId ? "lg:grid-cols-[1fr_1.4fr]" : ""}`}>
        <Reveal>
          <ul className={`grid gap-3 ${formspreeId ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {links.map((l) => {
              const external = l.href.startsWith("http");
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="group flex items-center gap-4 card p-4 transition-colors hover:border-accent"
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent">
                      <Icon name={l.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{l.label}</span>
                      <span className="block truncate font-mono text-xs text-muted">
                        {l.detail}
                      </span>
                    </span>
                    {external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
        {formspreeId && (
          <Reveal delay={0.1}>
            <ContactForm formspreeId={formspreeId} />
          </Reveal>
        )}
      </div>
    </SectionShell>
  );
}
