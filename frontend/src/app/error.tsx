'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <h2 className="text-xl font-extrabold">CYBER-PREDICT 360 System Notice</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-mono">
          {error?.message || 'A transient UI state error occurred while rendering modules.'}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          🔄 Reset Module & Recover State
        </button>
      </div>
    </div>
  );
}
