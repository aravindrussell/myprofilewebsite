import { Icon } from "./Icon";

export function Footer({ name, resumeHref }: { name: string; resumeHref: string }) {
  return (
    <footer className="border-t border-line py-10">
      <div className="container-page flex flex-col items-start justify-between gap-4 text-sm text-muted sm:flex-row sm:items-center">
        <p className="font-mono">
          © {new Date().getFullYear()} {name} <span className="text-accent">·</span> all checks
          passed
        </p>
        <div className="flex gap-5">
          <a href={resumeHref} className="hover:text-fg" target="_blank" rel="noopener">
            Resume (PDF)
          </a>
          <a href="#hero" className="inline-flex items-center gap-1 hover:text-fg">
            Back to top <Icon name="arrowUp" width={14} height={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
