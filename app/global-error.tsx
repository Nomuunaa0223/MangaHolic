"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="m-0 bg-[#0b0b12]">
        <main className="flex min-h-screen items-center justify-center px-6 text-white">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="text-sm uppercase tracking-[0.24em] text-red-200/80">
              Global Error
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
              App ashiglahad aldaa garlaa
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Site deer tootsooloogui server aldaa garсан baina. Reset hiigeed
              dahin oroldoj bolno.
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-2xl bg-[#ff3341] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff4754]"
            >
              Dahiad oroldoh
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
