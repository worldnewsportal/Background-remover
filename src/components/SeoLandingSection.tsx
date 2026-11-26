import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BRAND_CONFIG } from '../config';
import type { TranslationDictionary } from '../i18n/translations';
import type { Language } from '../types/studio';

interface SeoLandingSectionProps {
  t: TranslationDictionary;
  lang: Language;
}

export function SeoLandingSection({ t, lang }: SeoLandingSectionProps) {
  const [openFaq, setOpenFaq] = useState<number>(0);

  const features = [
    { title: t.feat1Title, desc: t.feat1Desc },
    { title: t.feat2Title, desc: t.feat2Desc },
    { title: t.feat3Title, desc: t.feat3Desc },
    { title: t.feat4Title, desc: t.feat4Desc },
  ];

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <>
      <section
        id="capabilities"
        className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 border-t border-[#E5E7EB]"
      >
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance">
            {t.featuresHeading}
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#4B5563]">
            {t.featuresSubheading}
          </p>
        </div>

        {/* Asymmetric editorial grid without repetitive nested cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 border-t border-[#E5E7EB] pt-8">
          {features.map((feat) => (
            <article key={feat.title} className="space-y-2">
              <h3 className="text-base font-bold text-[#111827]">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-[#4B5563]">{feat.desc}</p>
            </article>
          ))}
        </div>

        {/* Triple-Engine Comparison */}
        <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="text-base font-bold text-[#111827]">{t.enginesCompareTitle}</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#E5E7EB] pt-5">
            <div>
              <p className="text-sm font-bold text-[#0D9488]">{t.engineRmbgName}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">{t.engineRmbgDesc}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">{t.engineImglyName}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">{t.engineImglyDesc}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">{t.engineCloudName}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">{t.engineCloudDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section
        id="faq"
        className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 border-t border-[#E5E7EB]"
      >
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{t.faqHeading}</h2>
        <div className="mt-6 divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
          {faqs.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#4B5563] transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {open && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-[#4B5563]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8 text-xs text-[#4B5563]">
          <div className="flex items-center gap-2 font-semibold text-[#111827]">
            <span>{BRAND_CONFIG.names[lang]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-normal text-[#4B5563]">{t.footerPrivacyNote}</span>
          </div>
          <div className="flex items-center gap-3 tabular-nums">
            <span>{BRAND_CONFIG.supportEmail}</span>
            <span aria-hidden="true">·</span>
            <span>
              © {BRAND_CONFIG.year} {BRAND_CONFIG.names[lang]}. {t.footerRights}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
