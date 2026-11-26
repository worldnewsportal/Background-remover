export type Language = 'ar' | 'en' | 'pt' | 'fr';

export type EngineId = 'rmbg' | 'imgly' | 'cloud';

export type StudioMode = 'single' | 'batch';

export type ToolTab = 'background' | 'text' | 'effects' | 'brush' | 'adjust' | 'export';

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image' | 'bokeh';

export type AspectPresetId = 'original' | 'square' | 'youtube' | 'reels' | 'passport';

export type ExportFormat = 'png' | 'webp' | 'jpeg';

export type BrushMode = 'erase' | 'restore';

export interface BackgroundSettings {
  type: BackgroundType;
  solidColor: string;
  gradientCss: string;
  gradientStops: [string, string, string];
  customImageUrl: string | null;
  bokehBlur: number;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  fontSize: number; // px relative to 1080px base height
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowBlur: number;
  shadowColor: string;
  rotation: number; // degrees
  placement: 'behind' | 'front';
  opacity: number; // 0..1
}

export interface ColorAdjustments {
  brightness: number; // 50..150 (100 = neutral)
  contrast: number;   // 50..150 (100 = neutral)
  saturation: number; // 0..200 (100 = neutral)
  warmth: number;     // -50..50 (0 = neutral)
}

export interface StickerShadowSettings {
  strokeWidth: number;   // 0..40
  strokeColor: string;
  shadowX: number;       // -60..60
  shadowY: number;       // -60..60
  shadowBlur: number;    // 0..80
  shadowOpacity: number; // 0..1
  shadowColor: string;
}

export interface ExportSettings {
  format: ExportFormat;
  quality: number; // 0.1..1
  aspectPreset: AspectPresetId;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  engineUsed?: EngineId;
  usedFallback?: boolean;
  resultCutoutUrl?: string;
  originalWidth?: number;
  originalHeight?: number;
  errorMessage?: string;
}

export interface EngineProgress {
  stage: 'loading_module' | 'downloading_model' | 'inferring' | 'postprocessing';
  progress: number; // 0..100
  loadedMB?: number;
  totalMB?: number;
  message?: string;
}

export interface CutoutResult {
  maskData: ImageData;
  width: number;
  height: number;
  engineUsed: EngineId;
  usedFallback: boolean;
  fallbackReason?: string;
  durationMs: number;
}
