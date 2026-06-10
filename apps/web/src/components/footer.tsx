import { Logo } from "./logo";

const GITHUB_URL = "https://github.com/onfable/onfable";

export function Footer() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <Logo />
        <p className="max-w-md text-sm text-muted">
          Made for people who&apos;d rather type one sentence than twenty
          commands.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a
            href="https://x.com/onfable"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="onfable on X"
            className="transition-colors hover:text-white"
          >
            X / Twitter
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href={`${GITHUB_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Issues
          </a>
          <a
            href={`${GITHUB_URL}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            MIT License
          </a>
        </div>
        <p className="text-xs text-faint">
          © {new Date().getFullYear()} onfable · onfable.xyz
        </p>
      </div>
    </footer>
  );
}
