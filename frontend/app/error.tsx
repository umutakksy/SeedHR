"use client";

import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Oops! Bir Hata Oluştu
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Beklemediğimiz bir sorun oluştu. Lütfen sayfayı yenilemek veya geri dönmek için aşağıdaki butona tıklayın.
        </p>

        {error.message && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
            <p className="text-sm text-red-800 dark:text-red-300">
              <span className="font-semibold">Hata Detayı:</span> {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Yeniden Dene
          </button>

          <a
            href="/"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  );
}
