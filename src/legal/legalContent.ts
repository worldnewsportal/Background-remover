import type { Language } from '../types/studio';

export interface LegalSectionItem {
  heading: string;
  body: string;
}

export interface LegalDocumentLocale {
  pageTitle: string;
  pageSubtitle: string;
  effectiveLabel: string;
  effectiveDate: string;
  backToStudio: string;
  sharePageBtn: string;
  sharePageCopied: string;
  privacyNav: string;
  termsNav: string;
  privacyTitle: string;
  privacyIntro: string;
  privacySections: LegalSectionItem[];
  termsTitle: string;
  termsIntro: string;
  termsSections: LegalSectionItem[];
  contactHeading: string;
  contactText: string;
}

export const LEGAL_CONTENT: Record<Language, LegalDocumentLocale> = {
  ar: {
    pageTitle: 'سياسة الخصوصية وشروط الاستخدام',
    pageSubtitle:
      'توضح هذه الصفحة كيف يحفظ تطبيق وموقع نور كات ستوديو خصوصية صورك بالكامل عبر المعالجة المحلية داخل جهازك، وشروط استخدام التطبيق ونسخة Android APK.',
    effectiveLabel: 'آخر تحديث',
    effectiveDate: '27 نوفمبر 2026',
    backToStudio: 'العودة إلى الاستوديو',
    sharePageBtn: 'مشاركة الصفحة',
    sharePageCopied: 'تم نسخ الرابط',
    privacyNav: 'سياسة الخصوصية',
    termsNav: 'شروط الاستخدام',
    privacyTitle: 'أولاً: سياسة الخصوصية',
    privacyIntro:
      'صُمم نور كات ستوديو بحيث تعمل محركات الذكاء الاصطناعي الأساسية محلياً داخل متصفحك أو جهاز Android دون الحاجة لإنشاء حساب أو رفع صورك لخوادمنا.',
    privacySections: [
      {
        heading: '١. المعالجة المحلية للصور',
        body: 'عند استخدام المحركين المحليين (RMBG-1.4 / ModNet أو IMG.LY ISNet)، تتم جميع عمليات قراءة الصورة وعزل الخلفية والتعديل والتصدير داخل ذاكرة جهازك فقط عبر WebAssembly وCanvas. لا نقوم بتخزين صورك أو نسخها على أي خادم.',
      },
      {
        heading: '٢. المحرك السحابي الاختياري',
        body: 'إذا اخترت تشغيل المحرك الثالث (not-lain Cloud / ZeroGPU) يدوياً، يتم إرسال الصورة مؤقتاً إلى نقطة المعالجة السحابية العامة لإتمام العزل وإعادتها لجهازك. في حال عدم توفر الخادم السحابي يعود التطبيق تلقائياً للمعالجة المحلية.',
      },
      {
        heading: '٣. التصديرات الأخيرة وتخزين الجلسة',
        body: 'يعرض قسم «التصديرات الأخيرة» آخر 5 صور تم تصديرها داخل ذاكرة الجلسة الحالية فقط لتسهيل إعادة تنزيلها، وتُحذف هذه المراجع تلقائياً بمجرد مسح السجل أو إغلاق التطبيق.',
      },
      {
        heading: '٤. أذونات تطبيق Android APK والتفضيلات المحلية',
        body: 'يستخدم التطبيق التخزين المحلي في المتصفح (localStorage) لحفظ تفضيل اللغة فقط، وذاكرة التخزين المؤقت للـ PWA ليعمل دون إنترنت. على Android، تُفتح ملفات الصور فقط عندما تختارها أنت يدوياً أو تحفظ نتيجة التصدير على جهازك.',
      },
      {
        heading: '٥. الإعلانات والتحليلات والاتصال',
        body: 'لا يتطلب التطبيق تسجيل دخول ولا يجمع أسماء أو أرقام هواتف. في حال تفعيل إعلانات Google AdSense مستقبلاً من قبل مشغّل الموقع، قد يستخدم المزوّد ملفات تعريف الارتباط وفق سياسة Google. لأي استفسار متعلق بالخصوصية يمكنك التواصل عبر البريد الإلكتروني الموضح أدناه.',
      },
    ],
    termsTitle: 'ثانياً: شروط الاستخدام',
    termsIntro:
      'باستخدامك لتطبيق الويب أو نسخة Android APK الخاصة بنور كات ستوديو، فإنك توافق على الشروط التالية:',
    termsSections: [
      {
        heading: '١. حقوق الصور والمحتوى',
        body: 'أنت تحتفظ بكامل ملكيتك وحقوقك القانونية للصور التي تعالجها وتصدّرها عبر الاستوديو، سواء للاستخدام الشخصي أو التجاري. تقع عليك مسؤولية التأكد من امتلاكك حق تعديل الصور التي ترفعها.',
      },
      {
        heading: '٢. الاستخدام المسموح والتوزيع',
        body: 'يُتاح التطبيق والمحركات المدمجة للاستخدام المشروع في التصميم الإبداعي، التجارة الإلكترونية، وصناعة المحتوى. يُحظر استخدام الأداة لإنتاج محتوى ينتهك حقوق الغير أو القوانين المعمول بها.',
      },
      {
        heading: '٣. التوافر والأداء على الأجهزة',
        body: 'تعتمد سرعة المعالجة ودقتها على قدرات المعالج والذاكرة في جهازك ومتصفحك. يُقدّم التطبيق «كما هو» دون ضمان خلوه التام من الأخطاء في جميع المتصفحات أو الأجهزة القديمة.',
      },
      {
        heading: '٤. تحديث الشروط',
        body: 'قد نقوم بتحديث سياسة الخصوصية أو شروط الاستخدام عند إضافة ميزات جديدة أو إصدارات APK محدثة، وسيتم نشر التعديلات مباشرة في هذه الصفحة مع تحديث تاريخ المراجعة.',
      },
    ],
    contactHeading: 'التواصل والدعم',
    contactText: 'لأي استفسار حول الخصوصية أو إصدارات التطبيق الرسمية تواصل معنا على:',
  },

  en: {
    pageTitle: 'Privacy Policy & Terms of Service',
    pageSubtitle:
      'Learn how NoorCut Studio protects your photos with 100% client-side processing and review the terms governing use of the web studio and shareable Android APK.',
    effectiveLabel: 'Last updated',
    effectiveDate: 'November 27, 2026',
    backToStudio: 'Back to Studio',
    sharePageBtn: 'Share Page',
    sharePageCopied: 'Link copied',
    privacyNav: 'Privacy Policy',
    termsNav: 'Terms of Service',
    privacyTitle: '1. Privacy Policy',
    privacyIntro:
      'NoorCut Studio is engineered for privacy-first background removal directly inside your browser or Android device without user accounts or server-side photo storage.',
    privacySections: [
      {
        heading: '1.1 Local On-Device Image Processing',
        body: 'When using the local engines (RMBG-1.4 / ModNet or IMG.LY ISNet), image decoding, neural matting, editing, and export rendering happen entirely inside your device memory via WebAssembly and HTML5 Canvas. Your images are never uploaded to or stored on our servers.',
      },
      {
        heading: '1.2 Optional Cloud Engine Disclosure',
        body: 'If you manually select the optional third engine (not-lain Cloud / ZeroGPU), the active photo is transmitted transiently to the public inference endpoint solely to generate the cutout mask and return the result. If the cloud endpoint is busy, the app falls back to local on-device processing.',
      },
      {
        heading: '1.3 Session-Only Recent Exports',
        body: 'The Recent Exports list keeps up to 5 exported files temporarily in active browser session memory for convenient re-downloading. Clearing Recent Exports or closing the session removes those object references immediately.',
      },
      {
        heading: '1.4 Android APK Permissions & Local Storage',
        body: 'We store only your selected interface language in localStorage and cache static app/model assets via service workers for offline support. On Android APK builds, file access occurs strictly through explicit user selection and device download actions.',
      },
      {
        heading: '1.5 Analytics, Ads & Contact',
        body: 'NoorCut Studio requires no sign-up and collects no personal profile data. If the site operator enables optional Google AdSense slots in configuration, Google advertising cookies may apply under Google policies. Contact us anytime via the support address below.',
      },
    ],
    termsTitle: '2. Terms of Service',
    termsIntro:
      'By accessing the NoorCut Studio web application or installing its official GitHub Release Android APK, you agree to the following terms:',
    termsSections: [
      {
        heading: '2.1 Ownership & Permitted Use',
        body: 'You retain 100% ownership of all images you edit and export, including commercial e-commerce and creator graphics. You are solely responsible for ensuring you have the right to process any source photos you load into the studio.',
      },
      {
        heading: '2.2 Acceptable Conduct',
        body: 'You agree not to use NoorCut Studio to create unlawful, infringing, or harmful material, nor attempt to disrupt external public inference endpoints.',
      },
      {
        heading: '2.3 Service Provided As-Is',
        body: 'Local AI performance depends on device CPU, memory, and WebAssembly support. NoorCut Studio is provided on an "as-is" and "as-available" basis without warranties of uninterrupted operation across all hardware configurations.',
      },
      {
        heading: '2.4 Changes to This Document',
        body: 'We may update this Privacy Policy and Terms of Service as new studio features or APK releases ship. Continued use of the application constitutes acceptance of the updated terms published on this page.',
      },
    ],
    contactHeading: 'Support & Legal Contact',
    contactText: 'Questions regarding privacy, GitHub APK releases, or terms can be sent to:',
  },

  pt: {
    pageTitle: 'Política de Privacidade e Termos de Uso',
    pageSubtitle:
      'Saiba como o NoorCut Studio protege suas imagens com processamento local no dispositivo e conheça os termos de uso do aplicativo web e do APK para Android.',
    effectiveLabel: 'Última atualização',
    effectiveDate: '27 de novembro de 2026',
    backToStudio: 'Voltar ao Estúdio',
    sharePageBtn: 'Compartilhar Página',
    sharePageCopied: 'Link copiado',
    privacyNav: 'Política de Privacidade',
    termsNav: 'Termos de Uso',
    privacyTitle: '1. Política de Privacidade',
    privacyIntro:
      'O NoorCut Studio foi projetado para remover fundos diretamente no navegador ou no Android, sem exigir conta nem armazenar suas fotos em servidores.',
    privacySections: [
      {
        heading: '1.1 Processamento Local no Dispositivo',
        body: 'Nos motores locais (RMBG-1.4 / ModNet e IMG.LY ISNet), toda a leitura, recorte neural e exportação ocorre apenas na memória do seu dispositivo via WebAssembly e Canvas. Suas imagens não são enviadas para nossos servidores.',
      },
      {
        heading: '1.2 Motor em Nuvem Opcional',
        body: 'Se você escolher manualmente o terceiro motor (not-lain Cloud / ZeroGPU), a imagem é enviada temporariamente apenas para gerar o recorte. Caso o endpoint esteja ocupado, o app retorna automaticamente ao processamento local.',
      },
      {
        heading: '1.3 Exportações Recentes da Sessão',
        body: 'A lista de Exportações Recentes mantém até 5 itens temporariamente na memória da sessão ativa para novo download e é limpa ao clicar em Limpar ou fechar a sessão.',
      },
      {
        heading: '1.4 Permissões do APK Android e Cache',
        body: 'Apenas o idioma selecionado é salvo em localStorage, junto ao cache offline PWA para funcionamento sem internet. No Android, os arquivos são acessados somente quando você escolhe ou salva uma imagem.',
      },
      {
        heading: '1.5 Anúncios e Contato',
        body: 'Não coletamos dados de cadastro. Caso o operador ative espaços do Google AdSense, cookies publicitários do Google poderão ser utilizados conforme as políticas do provedor.',
      },
    ],
    termsTitle: '2. Termos de Uso',
    termsIntro:
      'Ao usar o NoorCut Studio na web ou via APK oficial lançado no GitHub, você concorda com os termos abaixo:',
    termsSections: [
      {
        heading: '2.1 Propriedade e Uso Comercial',
        body: 'Você mantém total propriedade sobre suas artes e recortes exportados, inclusive para uso comercial. É sua responsabilidade garantir os direitos sobre as imagens carregadas.',
      },
      {
        heading: '2.2 Uso Aceitável',
        body: 'É proibido utilizar a ferramenta para fins ilícitos ou violação de direitos autorais de terceiros.',
      },
      {
        heading: '2.3 Fornecimento no Estado em que se Encontra',
        body: 'A velocidade do recorte depende do hardware e navegador do usuário. O aplicativo é fornecido sem garantias de disponibilidade contínua.',
      },
      {
        heading: '2.4 Atualizações',
        body: 'Estes termos podem ser atualizados conforme novos recursos ou versões do APK forem lançados nesta página.',
      },
    ],
    contactHeading: 'Contato e Suporte',
    contactText: 'Dúvidas sobre privacidade ou versões do APK podem ser enviadas para:',
  },

  fr: {
    pageTitle: 'Politique de Confidentialité et Conditions d’Utilisation',
    pageSubtitle:
      'Découvrez comment NoorCut Studio protège vos images grâce au traitement 100 % local et consultez les conditions d’utilisation de l’application web et de l’APK Android.',
    effectiveLabel: 'Dernière mise à jour',
    effectiveDate: '27 novembre 2026',
    backToStudio: 'Retour au Studio',
    sharePageBtn: 'Partager la page',
    sharePageCopied: 'Lien copié',
    privacyNav: 'Politique de Confidentialité',
    termsNav: 'Conditions d’Utilisation',
    privacyTitle: '1. Politique de Confidentialité',
    privacyIntro:
      'NoorCut Studio effectue le détourage directement dans votre navigateur ou sur votre appareil Android, sans création de compte ni stockage photo sur serveur.',
    privacySections: [
      {
        heading: '1.1 Traitement local sur l’appareil',
        body: 'Avec les moteurs locaux (RMBG-1.4 / ModNet et IMG.LY ISNet), le décodage, l’inférence IA et l’exportation se déroulent exclusivement dans la mémoire de votre appareil via WebAssembly et Canvas. Vos photos ne sont pas envoyées sur nos serveurs.',
      },
      {
        heading: '1.2 Moteur Cloud optionnel',
        body: 'Si vous sélectionnez manuellement le troisième moteur (not-lain Cloud / ZeroGPU), l’image active est transmise de manière transitoire pour calculer le masque, avec bascule automatique vers le mode local si le service est occupé.',
      },
      {
        heading: '1.3 Exports récents de session',
        body: 'La section Exports récents conserve temporairement jusqu’à 5 fichiers en mémoire de session pour un retéléchargement rapide et s’efface dès que vous videz la liste ou fermez l’application.',
      },
      {
        heading: '1.4 Permissions APK Android et cache local',
        body: 'Seule la préférence de langue est enregistrée dans localStorage, et le cache hors ligne conserve les fichiers de l’application. Sur Android, aucun fichier n’est lu ou écrit sans votre action explicite.',
      },
      {
        heading: '1.5 Publicités et contact',
        body: 'Aucune donnée personnelle de compte n’est collectée. Si l’éditeur active Google AdSense dans la configuration, les cookies publicitaires Google s’appliquent selon leurs règles.',
      },
    ],
    termsTitle: '2. Conditions d’Utilisation',
    termsIntro:
      'En utilisant NoorCut Studio sur le web ou via sa version APK Android publiée sur GitHub Releases, vous acceptez ces conditions :',
    termsSections: [
      {
        heading: '2.1 Propriété des créations',
        body: 'Vous conservez l’intégralité des droits sur les visuels exportés, y compris à des fins commerciales. Vous devez disposer des droits nécessaires sur les images importées.',
      },
      {
        heading: '2.2 Usage conforme',
        body: 'L’application ne doit pas être utilisée pour produire des contenus illicites ou portant atteinte aux droits de tiers.',
      },
      {
        heading: '2.3 Disponibilité et matériel',
        body: 'Les performances dépendent de la mémoire et du processeur de votre appareil. Le service est fourni « en l’état » sans garantie absolue sur tous les appareils.',
      },
      {
        heading: '2.4 Mises à jour',
        body: 'Cette page peut être mise à jour lors des nouvelles versions du studio ou de l’APK.',
      },
    ],
    contactHeading: 'Contact et Support',
    contactText: 'Pour toute question relative à la confidentialité ou aux versions APK :',
  },
};

function isValidLang(value: string | null): value is Language {
  return value === 'ar' || value === 'en' || value === 'pt' || value === 'fr';
}

export function resolveLegalLanguage(search: string, storedLang: string | null): Language {
  const params = new URLSearchParams(search);
  const queryLang = params.get('lang');
  if (isValidLang(queryLang)) {
    return queryLang;
  }
  if (isValidLang(storedLang)) {
    return storedLang;
  }
  return 'ar';
}
