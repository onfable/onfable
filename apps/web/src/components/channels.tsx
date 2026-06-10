const CHANNELS = [
  { name: "CLI", status: "live" as const, desc: "Interactive REPL + one-shot runs" },
  { name: "Telegram", status: "soon" as const, desc: "Your agent in your pocket" },
  { name: "Discord", status: "soon" as const, desc: "Agent for your server" },
];

export function Channels() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
        Meet it where you are
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        The terminal is home base. Messaging channels are on the roadmap.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <div
            key={channel.name}
            className={`rounded-xl border p-5 text-center ${
              channel.status === "live"
                ? "border-white/25 bg-card"
                : "border-edge bg-card opacity-55"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="font-medium">{channel.name}</span>
              {channel.status === "live" ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                  Live
                </span>
              ) : (
                <span className="rounded-full border border-edge px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  Coming soon
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">{channel.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
