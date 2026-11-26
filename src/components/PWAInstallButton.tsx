import { useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { TranslationDictionary } from '../i18n/translations';

interface PWAInstallButtonProps {
  t: TranslationDictionary;
}

export function PWAInstallButton({ t }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label={t.installAppBtn}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D9488] bg-[#0D9488]/8 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0D9488] hover:bg-[#0D9488]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">{t.installAppBtn}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label={t.installIosBtn}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="h-3.5 w-3.5 text-[#0D9488] shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{t.installIosBtn}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <h3 id="ios-install-title" className="text-base font-bold text-[#111827]">
                {t.iosGuideTitle}
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-[#4B5563]">
                <li className="flex items-center gap-2">
                  <Share className="h-4 w-4 text-[#0D9488] shrink-0" aria-hidden="true" />
                  <span>{t.iosGuideStep1}</span>
                </li>
                <li>{t.iosGuideStep2}</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#1E293B] py-2.5 text-xs font-semibold text-white hover:bg-[#0F172A] transition-colors cursor-pointer"
              >
                {t.closeLabel}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
