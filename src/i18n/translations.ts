import type { Language } from '../types/studio';

export interface TranslationDictionary {
  // Navigation & Header
  navStudio: string;
  navBatch: string;
  navFeatures: string;
  navFaq: string;
  ctaUpload: string;

  // Hero / Workspace Intro
  heroTitle: string;
  heroSubtitle: string;
  modeSingle: string;
  modeBatch: string;

  // Engines
  engineLabel: string;
  engineRmbgName: string;
  engineRmbgDesc: string;
  engineImglyName: string;
  engineImglyDesc: string;
  engineCloudName: string;
  engineCloudDesc: string;

  // Progress & Status
  aiInitializingFirstTime: string;
  aiProcessing: string;
  aiFallbackNotice: string;
  aiCloudTimeoutNotice: string;
  aiCompletedIn: string;
  aiReadyPrompt: string;
  dropzoneTitle: string;
  dropzoneHint: string;
  chooseSample: string;
  samplePortrait: string;
  sampleSneaker: string;
  samplePerfume: string;

  // Canvas Controls
  beforeLabel: string;
  afterLabel: string;
  compareModeSplit: string;
  compareModeEdited: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  undoLabel: string;
  redoLabel: string;
  reprocessCutout: string;
  replaceImage: string;

  // Tool Tabs
  tabBackground: string;
  tabText: string;
  tabEffects: string;
  tabBrush: string;
  tabAdjust: string;
  tabExport: string;

  // Background Studio
  bgTypeTransparent: string;
  bgTypeSolid: string;
  bgTypeGradient: string;
  bgTypeImage: string;
  bgTypeBokeh: string;
  presetAmazonWhite: string;
  presetStudioGray: string;
  presetObsidian: string;
  presetTeal: string;
  presetWarmSand: string;
  presetSkyMist: string;
  customColorLabel: string;
  uploadBgImage: string;
  bokehIntensity: string;
  bokehHint: string;

  // Text Behind Subject
  addTextBtn: string;
  defaultTextContent: string;
  textPlacementBehind: string;
  textPlacementFront: string;
  textContentLabel: string;
  textFontLabel: string;
  textSizeLabel: string;
  textColorLabel: string;
  textStrokeColorLabel: string;
  textStrokeWidthLabel: string;
  textRotationLabel: string;
  textOpacityLabel: string;
  deleteLayer: string;
  dragTextHint: string;

  // Effects (Sticker Border & Shadow)
  stickerBorderTitle: string;
  stickerWidthLabel: string;
  stickerColorLabel: string;
  dropShadowTitle: string;
  shadowXLabel: string;
  shadowYLabel: string;
  shadowBlurLabel: string;
  shadowOpacityLabel: string;
  shadowColorLabel: string;

  // Magic Brush
  brushModeErase: string;
  brushModeRestore: string;
  brushSizeLabel: string;
  brushHint: string;
  resetMaskBtn: string;

  // Color Adjustments
  adjustTargetSubject: string;
  adjustTargetBg: string;
  brightnessLabel: string;
  contrastLabel: string;
  saturationLabel: string;
  warmthLabel: string;
  resetAdjustments: string;

  // Export & Aspect Ratio
  aspectRatioLabel: string;
  aspectOriginal: string;
  aspectSquare: string;
  aspectYoutube: string;
  aspectReels: string;
  aspectPassport: string;
  exportFormatLabel: string;
  exportQualityLabel: string;
  estimatedSizeLabel: string;
  downloadImageBtn: string;

  // Bulk Batch Mode
  batchDropTitle: string;
  batchDropHint: string;
  batchAddSamples: string;
  batchStartBtn: string;
  batchProcessingBtn: string;
  batchClearBtn: string;
  batchDownloadZipBtn: string;
  batchGlobalBgLabel: string;
  batchGlobalRatioLabel: string;
  batchWatermarkLabel: string;
  batchWatermarkPlaceholder: string;
  batchStatusQueued: string;
  batchStatusProcessing: string;
  batchStatusDone: string;
  batchStatusError: string;
  batchDownloadSingle: string;
  batchCountLabel: string;

  // Monetization Slot
  adSlotLabel: string;

  // SEO Capabilities & FAQ
  featuresHeading: string;
  featuresSubheading: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  enginesCompareTitle: string;
  faqHeading: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
  faq3Q: string;
  faq3A: string;
  faq4Q: string;
  faq4A: string;
  footerPrivacyNote: string;
  footerRights: string;

  // PWA & Mobile
  installAppBtn: string;
  installIosBtn: string;
  iosGuideTitle: string;
  iosGuideStep1: string;
  iosGuideStep2: string;
  closeLabel: string;
  offlineNotice: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  ar: {
    navStudio: 'استوديو التصميم',
    navBatch: 'المعالجة الدفعية',
    navFeatures: 'المميزات',
    navFaq: 'الأسئلة الشائعة',
    ctaUpload: 'رفع صورة',

    heroTitle: 'إزالة الخلفية بالذكاء الاصطناعي واستوديو التصميم الإبداعي',
    heroSubtitle:
      'معالجة فورية 100% داخل متصفحك بدون رفع صورك لخوادم خارجية، مع دعم تعديل الطبقات، النص خلف العنصر، وضغط وتصدير ZIP.',
    modeSingle: 'استوديو صورة واحدة',
    modeBatch: 'المعالجة الدفعية (50+ صورة)',

    engineLabel: 'محرك الذكاء الاصطناعي',
    engineRmbgName: 'RMBG-1.4 / ModNet (محلي ذكي)',
    engineRmbgDesc: 'الأفضل دقةً وأماناً — يعمل محلياً مجاناً للأبد عبر WebAssembly',
    engineImglyName: 'IMG.LY ISNet (استوديو محلي)',
    engineImglyDesc: 'قص حواف الشعر والمنتجات بدقة عالية على جهازك مباشرة',
    engineCloudName: 'not-lain سحابي (ZeroGPU)',
    engineCloudDesc: 'معالجة سحابية فائقة مع تحويل تلقائي ذكي للمحرك المحلي عند الضغط',

    aiInitializingFirstTime:
      'جاري تهيئة محرك الذكاء الاصطناعي لأول مرة فقط - يعمل مجاناً للأبد...',
    aiProcessing: 'جاري تحليل الحواف وعزل العنصر بالذكاء الاصطناعي...',
    aiFallbackNotice: 'تم إكمال العزل تلقائياً باستخدام المحرك المحلي البديل بنجاح.',
    aiCloudTimeoutNotice:
      'الخادم السحابي مشغول حالياً — تم التحويل تلقائياً للمحرك المحلي وإكمال الصورة بنجاح.',
    aiCompletedIn: 'اكتمل العزل خلال',
    aiReadyPrompt: 'اختر صورة جاهزة أو اسحب صورتك هنا للبدء فوراً',
    dropzoneTitle: 'اسحب وأفلت صورة هنا، أو انقر للاختيار',
    dropzoneHint: 'يدعم JPG, PNG, WebP, AVIF حتى دقة 4K',
    chooseSample: 'أو جرّب فوراً بإحدى صور الاستوديو:',
    samplePortrait: 'بورتريه استوديو',
    sampleSneaker: 'منتج حذاء رياضي',
    samplePerfume: 'زجاجة عطر فاخرة',

    beforeLabel: 'الأصل',
    afterLabel: 'بعد العزل',
    compareModeSplit: 'مقارنة السحب',
    compareModeEdited: 'وضع التصميم الكامل',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    zoomReset: 'ملاءمة الشاشة',
    undoLabel: 'تراجع',
    redoLabel: 'إعادة',
    reprocessCutout: 'إعادة العزل بالمحرك المحدد',
    replaceImage: 'تغيير الصورة',

    tabBackground: 'الخلفية',
    tabText: 'النصوص',
    tabEffects: 'الحدود والظل',
    tabBrush: 'الفرشاة السحرية',
    tabAdjust: 'الألوان',
    tabExport: 'المقاس والتصدير',

    bgTypeTransparent: 'شفافة',
    bgTypeSolid: 'لون صلب',
    bgTypeGradient: 'تدرج لوني',
    bgTypeImage: 'صورة مخصصة',
    bgTypeBokeh: 'ضبابية DSLR',
    presetAmazonWhite: 'أبيض أمازون',
    presetStudioGray: 'رمادي استوديو',
    presetObsidian: 'أسود داكن',
    presetTeal: 'زمردي',
    presetWarmSand: 'رملي دافئ',
    presetSkyMist: 'سماوي ناعم',
    customColorLabel: 'لون مخصص',
    uploadBgImage: 'رفع صورة خلفية',
    bokehIntensity: 'قوة ضبابية العدسة (Bokeh)',
    bokehHint: 'يُبقي العنصر حاداً ويضيف عزل عدسة احترافي على الخلفية الأصلية.',

    addTextBtn: 'إضافة طبقة نص جديدة',
    defaultTextContent: 'تصميم احترافي',
    textPlacementBehind: 'النص خلف العنصر',
    textPlacementFront: 'أمام العنصر',
    textContentLabel: 'محتوى النص',
    textFontLabel: 'نوع الخط',
    textSizeLabel: 'حجم الخط',
    textColorLabel: 'لون النص',
    textStrokeColorLabel: 'لون التحديد',
    textStrokeWidthLabel: 'سمك التحديد',
    textRotationLabel: 'الدوران',
    textOpacityLabel: 'الشفافية',
    deleteLayer: 'حذف الطبقة',
    dragTextHint: 'اسحب النص مباشرة فوق لوحة التصميم لتغيير موضعه.',

    stickerBorderTitle: 'إطار الملصق (Sticker Outline)',
    stickerWidthLabel: 'سمك الإطار',
    stickerColorLabel: 'لون الإطار',
    dropShadowTitle: 'الظل الواقعي (Drop Shadow)',
    shadowXLabel: 'الإزاحة الأفقية (X)',
    shadowYLabel: 'الإزاحة العمودية (Y)',
    shadowBlurLabel: 'نعومة الظل',
    shadowOpacityLabel: 'شفافية الظل',
    shadowColorLabel: 'لون الظل',

    brushModeErase: 'مسح من القناع',
    brushModeRestore: 'استعادة الأصل',
    brushSizeLabel: 'حجم الفرشاة',
    brushHint: 'ارسم مباشرة على الصورة لتعديل الحواف بدقة مع دعم التراجع Ctrl+Z.',
    resetMaskBtn: 'استرجاع قناع الذكاء الاصطناعي',

    adjustTargetSubject: 'العنصر المعزول',
    adjustTargetBg: 'الخلفية',
    brightnessLabel: 'السطوع',
    contrastLabel: 'التباين',
    saturationLabel: 'التشبع',
    warmthLabel: 'الدفء اللوني',
    resetAdjustments: 'إعادة ضبط الألوان',

    aspectRatioLabel: 'مقاسات التجارة الإلكترونية والسوشيال',
    aspectOriginal: 'الأصلي',
    aspectSquare: 'متجر / أمازون (1:1)',
    aspectYoutube: 'صورة يوتيوب (16:9)',
    aspectReels: 'ريلز / تيك توك (9:16)',
    aspectPassport: 'صورة شخصية (3.5×4.5)',
    exportFormatLabel: 'صيغة الملف',
    exportQualityLabel: 'جودة الضغط',
    estimatedSizeLabel: 'الحجم التقديري',
    downloadImageBtn: 'تحميل التصميم الآن',

    batchDropTitle: 'اسحب عشرات الصور دفعة واحدة للمعالجة الجماعية',
    batchDropHint: 'معالجة تسلسلية تحافظ على ذاكرة المتصفح وتدعم حتى 50+ صورة',
    batchAddSamples: 'تجربة بمجموعة الصور الجاهزة',
    batchStartBtn: 'بدء المعالجة الدفعية',
    batchProcessingBtn: 'جاري معالجة الصور...',
    batchClearBtn: 'مسح القائمة',
    batchDownloadZipBtn: 'تحميل الكل كملف ZIP',
    batchGlobalBgLabel: 'خلفية موحدة لجميع الصور',
    batchGlobalRatioLabel: 'مقاس موحد',
    batchWatermarkLabel: 'علامة مائية نصية موحدة (اختياري)',
    batchWatermarkPlaceholder: 'مثال: اسم متجرك',
    batchStatusQueued: 'في الانتظار',
    batchStatusProcessing: 'جاري العزل',
    batchStatusDone: 'جاهز',
    batchStatusError: 'تعذر العزل',
    batchDownloadSingle: 'تحميل',
    batchCountLabel: 'صورة في القائمة',

    adSlotLabel: 'مساحة إعلانية مخصصة (AdSense)',

    featuresHeading: 'استوديو متكامل يجمع قوة الذكاء الاصطناعي ومرونة التصميم',
    featuresSubheading:
      'صُمم للعمل بالكامل في المتصفح وعلى الاستضافات المشتركة بدون أي خوادم أو اشتراكات شهرية.',
    feat1Title: '01. ثلاثة محركات ذكاء اصطناعي',
    feat1Desc:
      'محرك RMBG-1.4 المحلي كخيار أساسي فائق الدقة، مع محرك IMG.LY ISNet ومحرك not-lain السحابي مع تحويل تلقائي ذكي.',
    feat2Title: '02. النص خلف العنصر وضبابية DSLR',
    feat2Desc:
      'أنشئ صور يوتيوب وبوسترات عربية باحترافية عبر وضع الخطوط خلف الشخص أو تطبيق عزل عدسة الكاميرا.',
    feat3Title: '03. معالجة دفعية وتصدير ZIP',
    feat3Desc:
      'ارفع عشرات صور المنتجات دفعة واحدة، طبّق خلفية أمازون البيضاء أو علامتك المائية، وحمّل الكل بملف ZIP.',
    feat4Title: '04. فرشاة سحرية وتنقيح غير متلف',
    feat4Desc:
      'عدّل أي تفصيل دقيق على القناع بالمسح أو الاستعادة مع سجل تراجع فوري وإطارات ملصقات وظلال واقعية.',
    enginesCompareTitle: 'مقارنة المحركات المدمجة',
    faqHeading: 'الأسئلة الشائعة',
    faq1Q: 'هل تُرفع صوري إلى خوادم خارجية؟',
    faq1A:
      'في المحركين المحليين (RMBG-1.4 و IMG.LY ISNet)، تتم المعالجة 100% داخل ذاكرة متصفحك ولا تغادر صورك جهازك إطلاقاً. المحرك السحابي الثالث اختياري بالكامل.',
    faq2Q: 'لماذا يستغرق التشغيل الأول بضع ثوانٍ إضافية؟',
    faq2A:
      'عند استخدام المحرك المحلي لأول مرة، يقوم المتصفح بتنزيل أوزان الشبكة العصبية وحفظها في ذاكرة المتصفح الدائمة، وبعدها تعمل جميع الصور بسرعة فائقة دون إعادة تحميل.',
    faq3Q: 'هل يعمل المشروع مباشرة على استضافة مشتركة مثل Hostinger؟',
    faq3A:
      'نعم، يتم بناء الموقع كملفات ثابتة بالكامل مع ملف .htaccess جاهز لتفعيل ترويسات العزل المتعدد ومسارات WASM دون الحاجة إلى Node.js أو سيرفر خلفي.',
    faq4Q: 'ما هي صيغ الصور والمقاسات المدعومة للتصدير؟',
    faq4A:
      'يمكنك الاستيراد بصيغ JPG وPNG وWebP وAVIF والتصدير بصيغ PNG الشفافة أو WebP أو JPG مع مقاسات أمازون 1:1 ويوتيوب 16:9 وريلز 9:16 والصور الشخصية.',
    footerPrivacyNote: 'معالجة محلية تحفظ خصوصية صورك بالكامل.',
    footerRights: 'جميع الحقوق محفوظة.',

    installAppBtn: 'تثبيت التطبيق',
    installIosBtn: 'تثبيت على iOS',
    iosGuideTitle: 'التثبيت على iPhone / iPad',
    iosGuideStep1: '١. اضغط على زر المشاركة (Share) في شريط Safari.',
    iosGuideStep2: '٢. مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).',
    closeLabel: 'إغلاق',
    offlineNotice: 'وضع عدم الاتصال — يعمل التطبيق باستخدام الملفات المحفوظة.',
  },

  en: {
    navStudio: 'Studio Editor',
    navBatch: 'Bulk Batch',
    navFeatures: 'Capabilities',
    navFaq: 'FAQ',
    ctaUpload: 'Upload Photo',

    heroTitle: 'AI Background Remover & Creative Photo Studio',
    heroSubtitle:
      '100% client-side neural matting in your browser with multi-layer editing, text behind subject, DSLR bokeh, and bulk ZIP export.',
    modeSingle: 'Single Studio',
    modeBatch: 'Bulk Batch (50+ Photos)',

    engineLabel: 'AI Matting Engine',
    engineRmbgName: 'RMBG-1.4 / ModNet (Smart Local)',
    engineRmbgDesc: 'Best accuracy & privacy — runs locally forever via WebAssembly',
    engineImglyName: 'IMG.LY ISNet (Local Studio)',
    engineImglyDesc: 'Precision hair & product edge matting directly on your device',
    engineCloudName: 'not-lain Cloud (ZeroGPU)',
    engineCloudDesc: 'Ultra cloud inference with automatic local fallback if busy',

    aiInitializingFirstTime:
      'Initializing local AI engine for the first time — cached permanently for free use...',
    aiProcessing: 'Running neural edge matting on your photo...',
    aiFallbackNotice: 'Seamlessly completed cutout using the local fallback engine.',
    aiCloudTimeoutNotice:
      'Cloud GPU space was busy — automatically switched to local AI and finished your cutout.',
    aiCompletedIn: 'Cutout ready in',
    aiReadyPrompt: 'Pick a studio sample or drop your image here to start immediately',
    dropzoneTitle: 'Drag & drop an image here, or click to browse',
    dropzoneHint: 'Supports JPG, PNG, WebP, AVIF up to 4K resolution',
    chooseSample: 'Or try instantly with a studio sample:',
    samplePortrait: 'Studio Portrait',
    sampleSneaker: 'Product Sneaker',
    samplePerfume: 'Luxury Perfume',

    beforeLabel: 'Original',
    afterLabel: 'Cutout',
    compareModeSplit: 'Split Compare',
    compareModeEdited: 'Full Studio View',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomReset: 'Fit View',
    undoLabel: 'Undo',
    redoLabel: 'Redo',
    reprocessCutout: 'Re-run Selected Engine',
    replaceImage: 'Change Image',

    tabBackground: 'Background',
    tabText: 'Typography',
    tabEffects: 'Sticker & Shadow',
    tabBrush: 'Magic Brush',
    tabAdjust: 'Color Grade',
    tabExport: 'Resize & Export',

    bgTypeTransparent: 'Transparent',
    bgTypeSolid: 'Solid Color',
    bgTypeGradient: 'Mesh Gradient',
    bgTypeImage: 'Custom Photo',
    bgTypeBokeh: 'DSLR Bokeh',
    presetAmazonWhite: 'Amazon White',
    presetStudioGray: 'Studio Gray',
    presetObsidian: 'Obsidian',
    presetTeal: 'Studio Teal',
    presetWarmSand: 'Warm Sand',
    presetSkyMist: 'Sky Mist',
    customColorLabel: 'Custom Hex Color',
    uploadBgImage: 'Upload Background Image',
    bokehIntensity: 'DSLR Lens Blur (Bokeh)',
    bokehHint: 'Keeps the cutout razor-sharp while blurring the original background.',

    addTextBtn: 'Add Text Layer',
    defaultTextContent: 'CREATIVE STUDIO',
    textPlacementBehind: 'Behind Subject',
    textPlacementFront: 'In Front',
    textContentLabel: 'Text Content',
    textFontLabel: 'Font Family',
    textSizeLabel: 'Font Size',
    textColorLabel: 'Fill Color',
    textStrokeColorLabel: 'Outline Color',
    textStrokeWidthLabel: 'Outline Width',
    textRotationLabel: 'Rotation',
    textOpacityLabel: 'Opacity',
    deleteLayer: 'Delete Layer',
    dragTextHint: 'Drag text directly on the canvas to position it anywhere.',

    stickerBorderTitle: 'YouTube Sticker Border',
    stickerWidthLabel: 'Border Width',
    stickerColorLabel: 'Border Color',
    dropShadowTitle: 'Studio Drop Shadow',
    shadowXLabel: 'Horizontal Offset (X)',
    shadowYLabel: 'Vertical Offset (Y)',
    shadowBlurLabel: 'Softness Blur',
    shadowOpacityLabel: 'Shadow Opacity',
    shadowColorLabel: 'Shadow Color',

    brushModeErase: 'Erase Mask',
    brushModeRestore: 'Restore Original',
    brushSizeLabel: 'Brush Size',
    brushHint: 'Paint directly on the canvas to refine edges with full Ctrl+Z undo.',
    resetMaskBtn: 'Reset to AI Mask',

    adjustTargetSubject: 'Subject Cutout',
    adjustTargetBg: 'Background',
    brightnessLabel: 'Brightness',
    contrastLabel: 'Contrast',
    saturationLabel: 'Saturation',
    warmthLabel: 'Warmth',
    resetAdjustments: 'Reset Adjustments',

    aspectRatioLabel: 'E-Commerce & Social Presets',
    aspectOriginal: 'Original',
    aspectSquare: 'Store / Amazon (1:1)',
    aspectYoutube: 'YouTube (16:9)',
    aspectReels: 'Reels / TikTok (9:16)',
    aspectPassport: 'ID / Passport (3.5×4.5)',
    exportFormatLabel: 'Output Format',
    exportQualityLabel: 'Compression Quality',
    estimatedSizeLabel: 'Estimated Size',
    downloadImageBtn: 'Download Composition',

    batchDropTitle: 'Drop dozens of photos for bulk background removal',
    batchDropHint: 'Sequential RAM-safe queue supporting 50+ images at once',
    batchAddSamples: 'Load Studio Sample Set',
    batchStartBtn: 'Process All Images',
    batchProcessingBtn: 'Processing Queue...',
    batchClearBtn: 'Clear Queue',
    batchDownloadZipBtn: 'Download All as ZIP',
    batchGlobalBgLabel: 'Global Background Color',
    batchGlobalRatioLabel: 'Global Aspect Ratio',
    batchWatermarkLabel: 'Global Text Watermark (Optional)',
    batchWatermarkPlaceholder: 'e.g. Your Store Name',
    batchStatusQueued: 'Queued',
    batchStatusProcessing: 'Matting',
    batchStatusDone: 'Done',
    batchStatusError: 'Failed',
    batchDownloadSingle: 'Download',
    batchCountLabel: 'images in queue',

    adSlotLabel: 'Sponsored / AdSense Ready Slot',

    featuresHeading: 'Everything Needed for E-Commerce & Creator Thumbnails',
    featuresSubheading:
      'Engineered to run directly in modern browsers and standard static shared hosting without servers or API keys.',
    feat1Title: '01. Triple AI Matting Architecture',
    feat1Desc:
      'Switch between local RMBG-1.4, IMG.LY ISNet, and cloud ZeroGPU with automatic failover so cutouts never stall.',
    feat2Title: '02. Text Behind Subject & DSLR Bokeh',
    feat2Desc:
      'Place bold Arabic or Latin typography behind the cutout person or blur distracting photo backgrounds cleanly.',
    feat3Title: '03. Bulk Queue & 1-Click ZIP',
    feat3Desc:
      'Process dozens of product shots sequentially, standardize Amazon white backgrounds, and export a single ZIP archive.',
    feat4Title: '04. Non-Destructive Brush & Outlines',
    feat4Desc:
      'Touch up fine details with Erase/Restore brush strokes, add sticker outlines, and export in PNG, WebP, or JPG.',
    enginesCompareTitle: 'Built-in AI Engine Comparison',
    faqHeading: 'Frequently Asked Questions',
    faq1Q: 'Are my photos uploaded to external servers?',
    faq1A:
      'With both local engines (RMBG-1.4 and IMG.LY ISNet), inference runs 100% inside your browser memory. Your images never leave your device.',
    faq2Q: 'Why does the first image take a few extra seconds?',
    faq2A:
      'On first use, the browser downloads and caches the neural network weights locally. Every subsequent image runs significantly faster.',
    faq3Q: 'Can I host this on shared hosting like Hostinger public_html?',
    faq3A:
      'Yes. Production builds output static assets plus a pre-configured .htaccess with COOP/COEP headers and WASM MIME rules.',
    faq4Q: 'Which formats and marketplace presets are included?',
    faq4A:
      'Import JPG, PNG, WebP, or AVIF and export with 1:1 Amazon Square, 16:9 YouTube Thumbnail, 9:16 Reels, or 3.5x4.5 ID presets.',
    footerPrivacyNote: '100% client-side processing keeps your photos private.',
    footerRights: 'All rights reserved.',

    installAppBtn: 'Install App',
    installIosBtn: 'Install on iOS',
    iosGuideTitle: 'Install on iPhone / iPad',
    iosGuideStep1: '1. Tap the Share button in Safari toolbar.',
    iosGuideStep2: '2. Scroll down and tap Add to Home Screen.',
    closeLabel: 'Close',
    offlineNotice: 'Offline Mode — Cached app files are active.',
  },

  pt: {
    navStudio: 'Estúdio',
    navBatch: 'Lote em Massa',
    navFeatures: 'Recursos',
    navFaq: 'Perguntas',
    ctaUpload: 'Enviar Foto',

    heroTitle: 'Removedor de Fundo com IA e Estúdio Criativo',
    heroSubtitle:
      'Recorte neural 100% no navegador sem servidores, com texto atrás do objeto, desfoque DSLR, contorno adesivo e exportação em ZIP.',
    modeSingle: 'Estúdio Individual',
    modeBatch: 'Lote em Massa (50+ Fotos)',

    engineLabel: 'Motor de IA',
    engineRmbgName: 'RMBG-1.4 / ModNet (Local Inteligente)',
    engineRmbgDesc: 'Máxima precisão e privacidade — roda localmente via WebAssembly',
    engineImglyName: 'IMG.LY ISNet (Estúdio Local)',
    engineImglyDesc: 'Recorte detalhado de cabelos e produtos direto no dispositivo',
    engineCloudName: 'not-lain Nuvem (ZeroGPU)',
    engineCloudDesc: 'Inferência na nuvem com fallback automático para IA local',

    aiInitializingFirstTime:
      'Inicializando motor de IA local pela primeira vez — salvo em cache gratuitamente...',
    aiProcessing: 'Recortando bordas com rede neural...',
    aiFallbackNotice: 'Recorte concluído automaticamente pelo motor local alternativo.',
    aiCloudTimeoutNotice:
      'Servidor em nuvem ocupado — alternado automaticamente para IA local com sucesso.',
    aiCompletedIn: 'Concluído em',
    aiReadyPrompt: 'Escolha uma foto de exemplo ou solte sua imagem aqui',
    dropzoneTitle: 'Arraste e solte uma imagem aqui ou clique para escolher',
    dropzoneHint: 'Suporta JPG, PNG, WebP e AVIF até resolução 4K',
    chooseSample: 'Ou teste agora com uma foto de estúdio:',
    samplePortrait: 'Retrato Estúdio',
    sampleSneaker: 'Tênis Produto',
    samplePerfume: 'Perfume Luxo',

    beforeLabel: 'Original',
    afterLabel: 'Recortada',
    compareModeSplit: 'Comparar Divisão',
    compareModeEdited: 'Visualização Completa',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
    zoomReset: 'Ajustar Tela',
    undoLabel: 'Desfazer',
    redoLabel: 'Refazer',
    reprocessCutout: 'Reprocessar Recorte',
    replaceImage: 'Trocar Imagem',

    tabBackground: 'Fundo',
    tabText: 'Texto',
    tabEffects: 'Contorno e Sombra',
    tabBrush: 'Pincel Mágico',
    tabAdjust: 'Cores',
    tabExport: 'Tamanho e Exportar',

    bgTypeTransparent: 'Transparente',
    bgTypeSolid: 'Cor Sólida',
    bgTypeGradient: 'Gradiente',
    bgTypeImage: 'Imagem Própria',
    bgTypeBokeh: 'Bokeh DSLR',
    presetAmazonWhite: 'Branco Loja',
    presetStudioGray: 'Cinza Estúdio',
    presetObsidian: 'Obsidiana',
    presetTeal: 'Esmeralda',
    presetWarmSand: 'Areia Quente',
    presetSkyMist: 'Névoa Azul',
    customColorLabel: 'Cor Personalizada',
    uploadBgImage: 'Enviar Imagem de Fundo',
    bokehIntensity: 'Intensidade do Desfoque DSLR',
    bokehHint: 'Mantém o assunto nítido enquanto desfoca o fundo original.',

    addTextBtn: 'Adicionar Camada de Texto',
    defaultTextContent: 'ESTÚDIO CRIATIVO',
    textPlacementBehind: 'Atrás do Objeto',
    textPlacementFront: 'Na Frente',
    textContentLabel: 'Texto',
    textFontLabel: 'Fonte',
    textSizeLabel: 'Tamanho',
    textColorLabel: 'Cor do Texto',
    textStrokeColorLabel: 'Cor do Contorno',
    textStrokeWidthLabel: 'Espessura do Contorno',
    textRotationLabel: 'Rotação',
    textOpacityLabel: 'Opacidade',
    deleteLayer: 'Excluir Camada',
    dragTextHint: 'Arraste o texto diretamente na tela para posicioná-lo.',

    stickerBorderTitle: 'Borda Estilo Adesivo (YouTube)',
    stickerWidthLabel: 'Largura da Borda',
    stickerColorLabel: 'Cor da Borda',
    dropShadowTitle: 'Sombra Realista',
    shadowXLabel: 'Deslocamento X',
    shadowYLabel: 'Deslocamento Y',
    shadowBlurLabel: 'Suavidade',
    shadowOpacityLabel: 'Opacidade da Sombra',
    shadowColorLabel: 'Cor da Sombra',

    brushModeErase: 'Apagar Máscara',
    brushModeRestore: 'Restaurar Original',
    brushSizeLabel: 'Tamanho do Pincel',
    brushHint: 'Pinte na imagem para refinar detalhes com histórico Ctrl+Z.',
    resetMaskBtn: 'Restaurar Máscara da IA',

    adjustTargetSubject: 'Assunto Recortado',
    adjustTargetBg: 'Fundo',
    brightnessLabel: 'Brilho',
    contrastLabel: 'Contraste',
    saturationLabel: 'Saturação',
    warmthLabel: 'Temperatura',
    resetAdjustments: 'Resetar Cores',

    aspectRatioLabel: 'Formatos para E-commerce e Redes',
    aspectOriginal: 'Original',
    aspectSquare: 'Loja / Amazon (1:1)',
    aspectYoutube: 'YouTube (16:9)',
    aspectReels: 'Reels / TikTok (9:16)',
    aspectPassport: 'Documento (3.5×4.5)',
    exportFormatLabel: 'Formato',
    exportQualityLabel: 'Qualidade',
    estimatedSizeLabel: 'Tamanho Estimado',
    downloadImageBtn: 'Baixar Arte Final',

    batchDropTitle: 'Solte dezenas de imagens para recorte em lote',
    batchDropHint: 'Fila sequencial segura para memória com suporte a 50+ fotos',
    batchAddSamples: 'Carregar Fotos de Exemplo',
    batchStartBtn: 'Processar Todas',
    batchProcessingBtn: 'Processando Fila...',
    batchClearBtn: 'Limpar Fila',
    batchDownloadZipBtn: 'Baixar Tudo em ZIP',
    batchGlobalBgLabel: 'Fundo Padrão do Lote',
    batchGlobalRatioLabel: 'Proporção Padrão',
    batchWatermarkLabel: 'Marca d’Água de Texto (Opcional)',
    batchWatermarkPlaceholder: 'Ex: Sua Loja',
    batchStatusQueued: 'Na fila',
    batchStatusProcessing: 'Recortando',
    batchStatusDone: 'Pronto',
    batchStatusError: 'Erro',
    batchDownloadSingle: 'Baixar',
    batchCountLabel: 'imagens na fila',

    adSlotLabel: 'Espaço Publicitário (AdSense)',

    featuresHeading: 'Estúdio Completo para E-commerce e Criadores',
    featuresSubheading:
      'Projetado para funcionar 100% no navegador e em hospedagens compartilhadas sem backend ou chaves pagas.',
    feat1Title: '01. Sistema Triplo de IA',
    feat1Desc:
      'Alterne entre RMBG-1.4 local, IMG.LY ISNet e nuvem ZeroGPU com fallback automático contínuo.',
    feat2Title: '02. Texto Atrás do Sujeito e Bokeh',
    feat2Desc:
      'Posicione títulos marcantes atrás da pessoa recortada ou aplique desfoque de lente DSLR.',
    feat3Title: '03. Processamento em Lote e ZIP',
    feat3Desc:
      'Processe dezenas de produtos em fila, aplique fundo branco uniforme e baixe tudo em um único ZIP.',
    feat4Title: '04. Pincel Mágico e Contorno Adesivo',
    feat4Desc:
      'Ajuste a máscara manualmente com Apagar/Restaurar, adicione bordas estilo YouTube e sombras realistas.',
    enginesCompareTitle: 'Comparação dos Motores Integrados',
    faqHeading: 'Perguntas Frequentes',
    faq1Q: 'Minhas fotos são enviadas para servidores externos?',
    faq1A:
      'Nos dois motores locais (RMBG-1.4 e IMG.LY ISNet), tudo roda dentro da memória do seu navegador. Nenhuma imagem sai do seu aparelho.',
    faq2Q: 'Por que o primeiro recorte demora alguns segundos extras?',
    faq2A:
      'Na primeira execução, o navegador baixa e armazena os pesos do modelo em cache permanente. As próximas fotos são muito mais rápidas.',
    faq3Q: 'Funciona direto em hospedagem compartilhada como Hostinger?',
    faq3A:
      'Sim, o build gera arquivos estáticos completos com .htaccess pronto para cabeçalhos COOP/COEP e MIME de WebAssembly.',
    faq4Q: 'Quais formatos e proporções são suportados?',
    faq4A:
      'Importe JPG, PNG, WebP ou AVIF e exporte em PNG transparente, WebP ou JPG nas medidas 1:1, 16:9, 9:16 e 3.5×4.5.',
    footerPrivacyNote: 'Processamento local que preserva 100% da sua privacidade.',
    footerRights: 'Todos os direitos reservados.',

    installAppBtn: 'Instalar App',
    installIosBtn: 'Instalar no iOS',
    iosGuideTitle: 'Instalar no iPhone / iPad',
    iosGuideStep1: '1. Toque no botão Compartilhar na barra do Safari.',
    iosGuideStep2: '2. Role para baixo e toque em Adicionar à Tela de Início.',
    closeLabel: 'Fechar',
    offlineNotice: 'Modo Offline — Arquivos em cache ativos.',
  },

  fr: {
    navStudio: 'Studio Photo',
    navBatch: 'Traitement par lot',
    navFeatures: 'Fonctionnalités',
    navFaq: 'FAQ',
    ctaUpload: 'Importer',

    heroTitle: 'Suppression d’Arrière-Plan IA & Studio Photo Créatif',
    heroSubtitle:
      'Détourage neuronal 100% dans votre navigateur sans serveur, avec texte derrière le sujet, flou DSLR, contour sticker et export ZIP.',
    modeSingle: 'Studio Unique',
    modeBatch: 'Traitement par lot (50+)',

    engineLabel: 'Moteur IA',
    engineRmbgName: 'RMBG-1.4 / ModNet (Local Intelligent)',
    engineRmbgDesc: 'Précision et confidentialité maximales — 100% WebAssembly local',
    engineImglyName: 'IMG.LY ISNet (Studio Local)',
    engineImglyDesc: 'Détourage fin des cheveux et produits directement sur votre appareil',
    engineCloudName: 'not-lain Cloud (ZeroGPU)',
    engineCloudDesc: 'Inférence cloud rapide avec bascule locale automatique si saturé',

    aiInitializingFirstTime:
      'Initialisation du moteur IA local pour la première fois — mis en cache gratuitement...',
    aiProcessing: 'Détourage neuronal en cours...',
    aiFallbackNotice: 'Détourage terminé automatiquement avec le moteur local de secours.',
    aiCloudTimeoutNotice:
      'Le serveur cloud était occupé — basculement automatique vers l’IA locale réussi.',
    aiCompletedIn: 'Terminé en',
    aiReadyPrompt: 'Choisissez un exemple ou déposez votre photo ici pour commencer',
    dropzoneTitle: 'Glissez-déposez une image ici ou cliquez pour parcourir',
    dropzoneHint: 'Prend en charge JPG, PNG, WebP, AVIF jusqu’à la 4K',
    chooseSample: 'Ou essayez instantanément avec une image studio :',
    samplePortrait: 'Portrait Studio',
    sampleSneaker: 'Basket Produit',
    samplePerfume: 'Parfum Luxe',

    beforeLabel: 'Original',
    afterLabel: 'Détouré',
    compareModeSplit: 'Comparaison',
    compareModeEdited: 'Vue Studio',
    zoomIn: 'Zoom +',
    zoomOut: 'Zoom -',
    zoomReset: 'Ajuster',
    undoLabel: 'Annuler',
    redoLabel: 'Rétablir',
    reprocessCutout: 'Relancer le détourage',
    replaceImage: 'Changer l’image',

    tabBackground: 'Arrière-plan',
    tabText: 'Typographie',
    tabEffects: 'Contour & Ombre',
    tabBrush: 'Pinceau Magique',
    tabAdjust: 'Couleurs',
    tabExport: 'Format & Export',

    bgTypeTransparent: 'Transparent',
    bgTypeSolid: 'Couleur unie',
    bgTypeGradient: 'Dégradé',
    bgTypeImage: 'Image perso',
    bgTypeBokeh: 'Bokeh DSLR',
    presetAmazonWhite: 'Blanc Boutique',
    presetStudioGray: 'Gris Studio',
    presetObsidian: 'Obsidienne',
    presetTeal: 'Émeraude',
    presetWarmSand: 'Sable Chaud',
    presetSkyMist: 'Brume Bleue',
    customColorLabel: 'Couleur personnalisée',
    uploadBgImage: 'Importer un fond',
    bokehIntensity: 'Intensité du flou DSLR',
    bokehHint: 'Garde le sujet net tout en floutant l’arrière-plan d’origine.',

    addTextBtn: 'Ajouter un calque texte',
    defaultTextContent: 'STUDIO CRÉATIF',
    textPlacementBehind: 'Derrière le sujet',
    textPlacementFront: 'Devant',
    textContentLabel: 'Texte',
    textFontLabel: 'Police',
    textSizeLabel: 'Taille',
    textColorLabel: 'Couleur',
    textStrokeColorLabel: 'Couleur contour',
    textStrokeWidthLabel: 'Épaisseur contour',
    textRotationLabel: 'Rotation',
    textOpacityLabel: 'Opacité',
    deleteLayer: 'Supprimer le calque',
    dragTextHint: 'Faites glisser le texte directement sur le canevas.',

    stickerBorderTitle: 'Bordure Sticker (YouTube)',
    stickerWidthLabel: 'Épaisseur',
    stickerColorLabel: 'Couleur',
    dropShadowTitle: 'Ombre Studio Réaliste',
    shadowXLabel: 'Décalage X',
    shadowYLabel: 'Décalage Y',
    shadowBlurLabel: 'Adoucissement',
    shadowOpacityLabel: 'Opacité ombre',
    shadowColorLabel: 'Couleur ombre',

    brushModeErase: 'Effacer masque',
    brushModeRestore: 'Restaurer original',
    brushSizeLabel: 'Taille du pinceau',
    brushHint: 'Peignez directement sur l’image avec historique Ctrl+Z.',
    resetMaskBtn: 'Réinitialiser le masque IA',

    adjustTargetSubject: 'Sujet détouré',
    adjustTargetBg: 'Arrière-plan',
    brightnessLabel: 'Luminosité',
    contrastLabel: 'Contraste',
    saturationLabel: 'Saturation',
    warmthLabel: 'Chaleur',
    resetAdjustments: 'Réinitialiser',

    aspectRatioLabel: 'Formats E-commerce & Réseaux',
    aspectOriginal: 'Original',
    aspectSquare: 'Boutique / Amazon (1:1)',
    aspectYoutube: 'YouTube (16:9)',
    aspectReels: 'Reels / TikTok (9:16)',
    aspectPassport: 'Identité (3.5×4.5)',
    exportFormatLabel: 'Format de sortie',
    exportQualityLabel: 'Qualité',
    estimatedSizeLabel: 'Taille estimée',
    downloadImageBtn: 'Télécharger le rendu',

    batchDropTitle: 'Déposez des dizaines d’images pour le traitement par lot',
    batchDropHint: 'File séquentielle optimisée mémoire jusqu’à 50+ photos',
    batchAddSamples: 'Charger les exemples studio',
    batchStartBtn: 'Lancer le lot',
    batchProcessingBtn: 'Traitement en cours...',
    batchClearBtn: 'Vider la liste',
    batchDownloadZipBtn: 'Tout télécharger en ZIP',
    batchGlobalBgLabel: 'Arrière-plan global',
    batchGlobalRatioLabel: 'Format global',
    batchWatermarkLabel: 'Filigrane texte global (Optionnel)',
    batchWatermarkPlaceholder: 'Ex : Nom de boutique',
    batchStatusQueued: 'En attente',
    batchStatusProcessing: 'Détourage',
    batchStatusDone: 'Prêt',
    batchStatusError: 'Échec',
    batchDownloadSingle: 'Télécharger',
    batchCountLabel: 'images dans la file',

    adSlotLabel: 'Emplacement publicitaire (AdSense)',

    featuresHeading: 'Un studio complet pour le e-commerce et les créateurs',
    featuresSubheading:
      'Conçu pour fonctionner dans le navigateur et sur hébergement mutualisé sans backend ni clé API payante.',
    feat1Title: '01. Triple Architecture IA',
    feat1Desc:
      'Basculez entre RMBG-1.4 local, IMG.LY ISNet et Cloud ZeroGPU avec repli local automatique.',
    feat2Title: '02. Texte derrière le sujet & Bokeh DSLR',
    feat2Desc:
      'Placez une typographie audacieuse derrière la personne détourée ou ajoutez un flou d’objectif naturel.',
    feat3Title: '03. File par lot & Archive ZIP',
    feat3Desc:
      'Traitez vos fiches produits en série sur fond blanc et téléchargez tout en un seul fichier ZIP.',
    feat4Title: '04. Pinceau magique & Contours sticker',
    feat4Desc:
      'Affinez le masque au pixel près, ajoutez des bordures sticker et exportez en PNG, WebP ou JPG.',
    enginesCompareTitle: 'Comparatif des moteurs intégrés',
    faqHeading: 'Questions fréquentes',
    faq1Q: 'Mes photos sont-elles envoyées vers un serveur externe ?',
    faq1A:
      'Avec les deux moteurs locaux (RMBG-1.4 et IMG.LY ISNet), tout s’exécute dans votre navigateur. Vos photos ne quittent jamais votre appareil.',
    faq2Q: 'Pourquoi la première image prend-elle quelques secondes de plus ?',
    faq2A:
      'Au premier lancement, le navigateur télécharge et met en cache les poids du modèle neuronal. Les images suivantes sont quasi instantanées.',
    faq3Q: 'Le site fonctionne-t-il sur un hébergement mutualisé type Hostinger ?',
    faq3A:
      'Oui, le build génère des fichiers statiques complets accompagnés d’un .htaccess préconfiguré pour COOP/COEP et WebAssembly.',
    faq4Q: 'Quels formats et dimensions sont pris en charge ?',
    faq4A:
      'Importez JPG, PNG, WebP ou AVIF et exportez en PNG transparent, WebP ou JPG aux ratios 1:1, 16:9, 9:16 et 3.5×4.5.',
    footerPrivacyNote: 'Traitement local respectant strictement votre vie privée.',
    footerRights: 'Tous droits réservés.',

    installAppBtn: 'Installer l’app',
    installIosBtn: 'Installer sur iOS',
    iosGuideTitle: 'Installer sur iPhone / iPad',
    iosGuideStep1: '1. Appuyez sur le bouton Partager dans la barre Safari.',
    iosGuideStep2: '2. Faites défiler et choisissez Sur l’écran d’accueil.',
    closeLabel: 'Fermer',
    offlineNotice: 'Mode hors ligne — Fichiers en cache actifs.',
  },
};
