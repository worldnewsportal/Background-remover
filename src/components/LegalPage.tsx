import { useEffect, useState } from 'react';
import { ArrowLeft, Check, FileText, Share2, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../config';
import type { Language } from '../types/studio';
import { LEGAL_CONTENT, resolveLegalLanguage } from '../legal/legalContent';
import { BrandLogo } from './BrandLogo';

const STORAGE_KEY = 'noorcut_lang';

const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
];

export function LegalPage() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'ar';
    return resolveLegalLanguage(
      window.location.search,
      window.localStorage.getItem(STORAGE_KEY)
    );
  });
  const [copied, setCopied] = useState(false);

  const isRtl = lang === 'ar';
  const doc = LEGAL_CONTENT[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.title = `${doc.pageTitle} — ${BRAND_CONFIG.names[lang]}`;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [doc.pageTitle, isRtl, lang]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${doc.pageTitle} — ${BRAND_CONFIG.names[lang]}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard copy if share sheet dismissed or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] frosted-panel">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6">
          <a
            href="./index.html"
            className="flex min-w-0 items-center gap-2 text-sm sm:text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap"
          >
            <BrandLogo size={24} />
            <span className="truncate">{BRAND_CONFIG.names[lang]}</span>
          </a>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
                    onClick={() => setLang(item.code)}
                    className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-white text-[#111827] shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <a
              href="./index.html"
              aria-label={doc.backToStudio}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-2.5 sm:px-3 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft
                className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{doc.backToStudio}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#0D9488]">
              {doc.effectiveLabel}: {doc.effectiveDate}
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              {doc.pageTitle}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">{doc.pageSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="#privacy"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:border-[#0D9488] transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>{doc.privacyNav}</span>
            </a>
            <a
              href="#terms"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:border-[#0D9488] transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>{doc.termsNav}</span>
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] hover:border-[#0D9488] hover:text-[#111827] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              )}
              <span>{copied ? doc.sharePageCopied : doc.sharePageBtn}</span>
            </button>
          </div>
        </div>

        <section
          id="privacy"
          aria-labelledby="privacy-heading"
          className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-[#0D9488]" aria-hidden="true" />
            <h2 id="privacy-heading" className="text-xl font-bold text-[#111827]">
              {doc.privacyTitle}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">{doc.privacyIntro}</p>

          <div className="mt-6 space-y-5 border-t border-[#E5E7EB] pt-6">
            {doc.privacySections.map((section) => (
              <article key={section.heading}>
                <h3 className="text-sm font-bold text-[#111827]">{section.heading}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563]">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="terms"
          aria-labelledby="terms-heading"
          className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-[#0D9488]" aria-hidden="true" />
            <h2 id="terms-heading" className="text-xl font-bold text-[#111827]">
              {doc.termsTitle}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">{doc.termsIntro}</p>

          <div className="mt-6 space-y-5 border-t border-[#E5E7EB] pt-6">
            {doc.termsSections.map((section) => (
              <article key={section.heading}>
                <h3 className="text-sm font-bold text-[#111827]">{section.heading}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563]">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-sm font-bold text-[#111827]">{doc.contactHeading}</h2>
          <p className="mt-1.5 text-sm text-[#4B5563]">
            {doc.contactText}{' '}
            <a
              href={`mailto:${BRAND_CONFIG.supportEmail}`}
              className="font-semibold text-[#0D9488] underline underline-offset-4"
            >
              {BRAND_CONFIG.supportEmail}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
