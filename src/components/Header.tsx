import { Upload } from 'lucide-react';
import { BRAND_CONFIG } from '../config';
import type { Language, StudioMode } from '../types/studio';
import type { TranslationDictionary } from '../i18n/translations';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  t: TranslationDictionary;
  onSelectMode: (mode: StudioMode) => void;
  onTriggerUpload: () => void;
}

const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
];

export function Header({
  lang,
  onChangeLang,
  t,
  onSelectMode,
  onTriggerUpload,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] frosted-panel">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 sm:gap-4 lg:gap-8 px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Flat 2D Logo + Single-Line Brand Title */}
        <a
          href="#studio-workspace"
          className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0D9488] rounded-md"
        >
          <BrandLogo size={26} />
          <span>{BRAND_CONFIG.names[lang]}</span>
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]">
          <a
            href="#studio-workspace"
            onClick={() => onSelectMode('single')}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navStudio}
          </a>
          <a
            href="#studio-workspace"
            onClick={() => onSelectMode('batch')}
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navBatch}
          </a>
          <a
            href="#capabilities"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navFeatures}
          </a>
          <a
            href="#faq"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navFaq}
          </a>
        </nav>

        {/* Zone 3: Language Switcher + Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] p-0.5"
            role="group"
            aria-label="Language"
          >
            {LANGUAGES.map((item) => {
              const active = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onChangeLang(item.code)}
                  className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {item.code === 'ar' ? (
                    <>
                      <span className="sm:hidden">AR</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </button>
              );
            })}
          </div>

          <PWAInstallButton t={t} />

          <button
            type="button"
            onClick={onTriggerUpload}
            aria-label={t.ctaUpload}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#0D9488] px-2.5 sm:px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]"
          >
            <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t.ctaUpload}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
