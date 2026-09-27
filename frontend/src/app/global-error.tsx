'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
            🛡️
          </div>
          <h2 className="text-xl font-extrabold">Global Threat Matrix Recovery</h2>
          <p className="text-xs text-slate-600 font-mono">
            {error?.message || 'Recovering spatial analytics state...'}
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all"
          >
            Refresh Dashboard Session
          </button>
        </div>
      </body>
    </html>
  );
}
