"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b12] px-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="text-sm uppercase tracking-[0.24em] text-red-200/80">
          Site Error
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
          Page load hiij chadsangui
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/65">
          Server deer aldaa garсан baina. Database holbolt, environment
          variable, esvel runtime log-iig shalgah shaardlagatai baij magadgui.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-[#ff3341] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff4754]"
        >
          Dahiad oroldoh
        </button>
      </div>
    </main>
  );
}
