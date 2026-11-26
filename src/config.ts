import samplePortrait from './assets/images/sample_portrait_studio_1795717544246.jpg';
import sampleSneaker from './assets/images/sample_product_sneaker_1795717544389.jpg';
import samplePerfume from './assets/images/sample_perfume_bottle_1795717545536.jpg';
import type { Language } from './types/studio';

/**
 * BRAND_CONFIG — Single source of truth for studio branding & flat vector logo.
 * Edit these values to white-label the entire application for your domain.
 */
export const BRAND_CONFIG = {
  names: {
    ar: 'نور كات ستوديو',
    en: 'NoorCut Studio',
    pt: 'NoorCut Studio',
    fr: 'NoorCut Studio',
  } as Record<Language, string>,
  accentColor: '#0D9488',
  slateColor: '#1E293B',
  domain: 'noorcut.studio',
  supportEmail: 'hello@noorcut.studio',
  year: 2026,
};

/**
 * AD_CONFIG — Clean monetization & AdSense slot configuration.
 * Set `enabled: true` and provide your AdSense publisher/slot IDs to activate live ads.
 */
export const AD_CONFIG = {
  enabled: true,
  adsenseClientId: '', // e.g. 'ca-pub-xxxxxxxxxxxxxxxx'
  slots: {
    studioTopBanner: {
      id: 'studio-top-banner',
      adsenseSlotId: '',
      enabled: true,
    },
    landingMidBanner: {
      id: 'landing-mid-banner',
      adsenseSlotId: '',
      enabled: true,
    },
  },
};

export interface SamplePhoto {
  id: string;
  url: string;
  labelKey: 'samplePortrait' | 'sampleSneaker' | 'samplePerfume';
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'portrait',
    url: samplePortrait,
    labelKey: 'samplePortrait',
  },
  {
    id: 'sneaker',
    url: sampleSneaker,
    labelKey: 'sampleSneaker',
  },
  {
    id: 'perfume',
    url: samplePerfume,
    labelKey: 'samplePerfume',
  },
];

export const CANVAS_FONT_FAMILIES = [
  { id: 'Cairo', label: 'Cairo (عربي / EN)' },
  { id: 'Tajawal', label: 'Tajawal (عربي / EN)' },
  { id: 'Readex Pro', label: 'Readex Pro (عربي / EN)' },
  { id: 'Anton', label: 'Anton (Display)' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { id: 'Inter', label: 'Inter' },
  { id: 'Playfair Display', label: 'Playfair Display' },
];

export const SOLID_COLOR_PRESETS = [
  { id: 'amazon-white', color: '#FFFFFF', labelKey: 'presetAmazonWhite' as const },
  { id: 'studio-gray', color: '#F3F4F6', labelKey: 'presetStudioGray' as const },
  { id: 'obsidian', color: '#111827', labelKey: 'presetObsidian' as const },
  { id: 'teal', color: '#0D9488', labelKey: 'presetTeal' as const },
  { id: 'warm-sand', color: '#EAE2D6', labelKey: 'presetWarmSand' as const },
  { id: 'sky-mist', color: '#E0F2FE', labelKey: 'presetSkyMist' as const },
];

export const MESH_GRADIENT_PRESETS: Array<{
  id: string;
  stops: [string, string, string];
  css: string;
}> = [
  {
    id: 'alabaster-sage',
    stops: ['#F8FAFC', '#CCFBF1', '#E2E8F0'],
    css: 'linear-gradient(135deg, #F8FAFC 0%, #CCFBF1 52%, #E2E8F0 100%)',
  },
  {
    id: 'warm-atelier',
    stops: ['#FFFBEB', '#FDE68A', '#F3F4F6'],
    css: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 50%, #F3F4F6 100%)',
  },
  {
    id: 'nordic-slate',
    stops: ['#0F172A', '#1E293B', '#0D9488'],
    css: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0D9488 100%)',
  },
  {
    id: 'coral-studio',
    stops: ['#FFF1F2', '#FECDD3', '#FFE4E6'],
    css: 'linear-gradient(135deg, #FFF1F2 0%, #FECDD3 55%, #FFE4E6 100%)',
  },
  {
    id: 'emerald-editorial',
    stops: ['#064E3B', '#0D9488', '#99F6E4'],
    css: 'linear-gradient(135deg, #064E3B 0%, #0D9488 58%, #99F6E4 100%)',
  },
];
