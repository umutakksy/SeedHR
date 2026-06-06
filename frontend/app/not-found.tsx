import React from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
            <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
          404
        </h1>

        <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Sayfa Bulunamadı
        </p>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Aradığınız sayfa maalesef bulunamadı. URL'yi kontrol edin veya ana sayfaya dönün.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-block"
          >
            Ana Sayfaya Dön
          </Link>

          <Link
            href="/login"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors inline-block"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
