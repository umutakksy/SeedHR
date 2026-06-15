import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Erişim Reddedildi
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Maalesef, bu sayfaya erişme izniniz bulunmamaktadır. Daha fazla bilgi için yöneticiye başvurun.
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-800 dark:text-red-300">
            <span className="font-semibold">Neden?</span> Erişmek istediğiniz sayfa yalnızca belirli roller için kullanılabilir.
            Gerekli izinlere sahip değilseniz, İK departmanı ile iletişime geçin.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-block"
          >
            Anasayfaya Dön
          </Link>

          <a
            href="mailto:seedhrms@outlook.com"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors inline-block"
          >
            İK İletişimi
          </a>
        </div>
      </div>
    </div>
  );
}
