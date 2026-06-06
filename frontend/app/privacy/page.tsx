import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Gizlilik Politikası
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Son güncellenme: {new Date().toLocaleDateString("tr-TR")}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Giriş
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              SeedHR, kullanıcılarının gizliliğini ve kişisel verilerinin güvenliğini çok önemser. Bu gizlilik politikası,
              platformumuzda hangi bilgileri topladığımızı, nasıl kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Toplanan Bilgiler
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-3">
              SeedHR aşağıdaki bilgileri toplayabilir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Kişisel kimlik bilgileri (adı, soyadı, e-posta, telefon)</li>
              <li>Departman ve pozisyon bilgileri</li>
              <li>İş performansı ve değerlendirme verileri</li>
              <li>İzin ve devamsızlık kayıtları</li>
              <li>Sistem kullanım günlükleri ve erişim bilgileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Verilerin Kullanımı
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Toplanan veriler aşağıdaki amaçlarla kullanılır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mt-3">
              <li>Çalışan yönetimi ve İK işlevlerinin gerçekleştirilmesi</li>
              <li>Performans değerlendirmesi ve geliştirme</li>
              <li>Uyumlu ve yasal mevzuatın sağlanması</li>
              <li>Sistem güvenliği ve kullanım analizi</li>
              <li>İş analitikleri ve raporlama</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Veri Güvenliği
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Kişisel verileriniz ileri teknoloji ile korunmaktadır. Tüm iletişim şifrelenmiş (SSL/TLS) bağlantılar üzerinden
              gerçekleşir. Veriler, yetkili personel tarafından kontrollü ortamlarda saklanır ve erişim sıkı kurallara tabidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Haklarınız
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Kendi kişisel verilerinize erişme, düzeltme veya silme talebinde bulunma hakkına sahipsiniz. Bu haklarınızı
              kullanmak için İK departmanı veya sistem yöneticileriyle iletişime geçebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. İletişim
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Bu gizlilik politikası hakkında herhangi bir sorunuz varsa, lütfen İK departmanı ile iletişime geçin.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
