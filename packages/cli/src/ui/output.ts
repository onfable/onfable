import pc from "picocolors";

export function printToolBanner(name: string, summary: string): void {
  const firstLine = summary.split("\n")[0];
  const clipped = firstLine.length > 80 ? firstLine.slice(0, 80) + "…" : firstLine;
  process.stdout.write(pc.dim(`\n  ⚒ ${name}: ${clipped}\n`));
}

export function printToolResultNote(note: string): void {
  process.stdout.write(pc.dim(`    → ${note}\n`));
}

export function printText(delta: string): void {
  process.stdout.write(delta);
}

export function printError(message: string): void {
  process.stderr.write(pc.red(`\n✖ ${message}\n`));
}

export function printInfo(message: string): void {
  process.stdout.write(pc.dim(`${message}\n`));
}

export function newline(): void {
  process.stdout.write("\n");
}
