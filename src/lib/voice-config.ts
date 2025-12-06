export interface Language {
  code: string;
  name: string;
  nativeName: string;
  transcriberLang: string;
  voices: Voice[];
}

export interface Voice {
  id: string;
  name: string;
  provider: 'azure' | '11labs' | 'playht';
  gender: 'male' | 'female';
  description: string;
  recommended?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    transcriberLang: 'nl',
    voices: [
      { id: 'nl-NL-ColetteNeural', name: 'Colette', provider: 'azure', gender: 'female', description: 'Warm, professional Dutch female', recommended: true },
      { id: 'nl-NL-FennaNeural', name: 'Fenna', provider: 'azure', gender: 'female', description: 'Friendly, natural Dutch female' },
      { id: 'nl-NL-MaartenNeural', name: 'Maarten', provider: 'azure', gender: 'male', description: 'Clear, professional Dutch male', recommended: true },
    ]
  },
  {
    code: 'nl-BE',
    name: 'Dutch (Belgium)',
    nativeName: 'Vlaams',
    transcriberLang: 'nl-BE',
    voices: [
      { id: 'nl-BE-DenaNeural', name: 'Dena', provider: 'azure', gender: 'female', description: 'Natural Flemish female', recommended: true },
      { id: 'nl-BE-ArnaudNeural', name: 'Arnaud', provider: 'azure', gender: 'male', description: 'Professional Flemish male' },
    ]
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    transcriberLang: 'en-US',
    voices: [
      { id: 'en-US-AriaNeural', name: 'Aria', provider: 'azure', gender: 'female', description: 'Warm, conversational American', recommended: true },
      { id: 'en-US-JennyNeural', name: 'Jenny', provider: 'azure', gender: 'female', description: 'Friendly, professional female' },
      { id: 'en-US-GuyNeural', name: 'Guy', provider: 'azure', gender: 'male', description: 'Confident, professional male', recommended: true },
      { id: 'rachel', name: 'Rachel', provider: '11labs', gender: 'female', description: 'Premium natural voice (ElevenLabs)' },
      { id: 'adam', name: 'Adam', provider: '11labs', gender: 'male', description: 'Professional confident (ElevenLabs)' },
    ]
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (British)',
    transcriberLang: 'en-GB',
    voices: [
      { id: 'en-GB-SoniaNeural', name: 'Sonia', provider: 'azure', gender: 'female', description: 'Professional British female', recommended: true },
      { id: 'en-GB-RyanNeural', name: 'Ryan', provider: 'azure', gender: 'male', description: 'Confident British male', recommended: true },
    ]
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    transcriberLang: 'de',
    voices: [
      { id: 'de-DE-KatjaNeural', name: 'Katja', provider: 'azure', gender: 'female', description: 'Warm professional German female', recommended: true },
      { id: 'de-DE-ConradNeural', name: 'Conrad', provider: 'azure', gender: 'male', description: 'Clear professional German male', recommended: true },
    ]
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    transcriberLang: 'fr',
    voices: [
      { id: 'fr-FR-DeniseNeural', name: 'Denise', provider: 'azure', gender: 'female', description: 'Elegant French female', recommended: true },
      { id: 'fr-FR-HenriNeural', name: 'Henri', provider: 'azure', gender: 'male', description: 'Professional French male', recommended: true },
    ]
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    transcriberLang: 'es',
    voices: [
      { id: 'es-ES-ElviraNeural', name: 'Elvira', provider: 'azure', gender: 'female', description: 'Warm Spanish female', recommended: true },
      { id: 'es-ES-AlvaroNeural', name: 'Alvaro', provider: 'azure', gender: 'male', description: 'Professional Spanish male', recommended: true },
    ]
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    transcriberLang: 'es-419',
    voices: [
      { id: 'es-MX-DaliaNeural', name: 'Dalia', provider: 'azure', gender: 'female', description: 'Friendly Mexican Spanish female', recommended: true },
      { id: 'es-MX-JorgeNeural', name: 'Jorge', provider: 'azure', gender: 'male', description: 'Professional Mexican Spanish male' },
    ]
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    transcriberLang: 'it',
    voices: [
      { id: 'it-IT-ElsaNeural', name: 'Elsa', provider: 'azure', gender: 'female', description: 'Warm Italian female', recommended: true },
      { id: 'it-IT-DiegoNeural', name: 'Diego', provider: 'azure', gender: 'male', description: 'Professional Italian male', recommended: true },
    ]
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    transcriberLang: 'pt-BR',
    voices: [
      { id: 'pt-BR-FranciscaNeural', name: 'Francisca', provider: 'azure', gender: 'female', description: 'Warm Brazilian female', recommended: true },
      { id: 'pt-BR-AntonioNeural', name: 'Antonio', provider: 'azure', gender: 'male', description: 'Professional Brazilian male', recommended: true },
    ]
  },
  {
    code: 'pl-PL',
    name: 'Polish',
    nativeName: 'Polski',
    transcriberLang: 'pl',
    voices: [
      { id: 'pl-PL-ZofiaNeural', name: 'Zofia', provider: 'azure', gender: 'female', description: 'Warm Polish female', recommended: true },
      { id: 'pl-PL-MarekNeural', name: 'Marek', provider: 'azure', gender: 'male', description: 'Professional Polish male', recommended: true },
    ]
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    transcriberLang: 'ja',
    voices: [
      { id: 'ja-JP-NanamiNeural', name: 'Nanami', provider: 'azure', gender: 'female', description: 'Professional Japanese female', recommended: true },
      { id: 'ja-JP-KeitaNeural', name: 'Keita', provider: 'azure', gender: 'male', description: 'Professional Japanese male', recommended: true },
    ]
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    transcriberLang: 'ko',
    voices: [
      { id: 'ko-KR-SunHiNeural', name: 'SunHi', provider: 'azure', gender: 'female', description: 'Warm Korean female', recommended: true },
      { id: 'ko-KR-InJoonNeural', name: 'InJoon', provider: 'azure', gender: 'male', description: 'Professional Korean male', recommended: true },
    ]
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Mandarin)',
    nativeName: '中文',
    transcriberLang: 'zh-CN',
    voices: [
      { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', provider: 'azure', gender: 'female', description: 'Warm Mandarin female', recommended: true },
      { id: 'zh-CN-YunxiNeural', name: 'Yunxi', provider: 'azure', gender: 'male', description: 'Professional Mandarin male', recommended: true },
    ]
  },
  {
    code: 'tr-TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    transcriberLang: 'tr',
    voices: [
      { id: 'tr-TR-EmelNeural', name: 'Emel', provider: 'azure', gender: 'female', description: 'Warm Turkish female', recommended: true },
      { id: 'tr-TR-AhmetNeural', name: 'Ahmet', provider: 'azure', gender: 'male', description: 'Professional Turkish male', recommended: true },
    ]
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    transcriberLang: 'ru',
    voices: [
      { id: 'ru-RU-SvetlanaNeural', name: 'Svetlana', provider: 'azure', gender: 'female', description: 'Professional Russian female', recommended: true },
      { id: 'ru-RU-DmitryNeural', name: 'Dmitry', provider: 'azure', gender: 'male', description: 'Professional Russian male', recommended: true },
    ]
  },
  {
    code: 'sv-SE',
    name: 'Swedish',
    nativeName: 'Svenska',
    transcriberLang: 'sv',
    voices: [
      { id: 'sv-SE-SofieNeural', name: 'Sofie', provider: 'azure', gender: 'female', description: 'Warm Swedish female', recommended: true },
      { id: 'sv-SE-MattiasNeural', name: 'Mattias', provider: 'azure', gender: 'male', description: 'Professional Swedish male', recommended: true },
    ]
  },
  {
    code: 'da-DK',
    name: 'Danish',
    nativeName: 'Dansk',
    transcriberLang: 'da',
    voices: [
      { id: 'da-DK-ChristelNeural', name: 'Christel', provider: 'azure', gender: 'female', description: 'Warm Danish female', recommended: true },
      { id: 'da-DK-JeppeNeural', name: 'Jeppe', provider: 'azure', gender: 'male', description: 'Professional Danish male', recommended: true },
    ]
  },
  {
    code: 'no-NO',
    name: 'Norwegian',
    nativeName: 'Norsk',
    transcriberLang: 'no',
    voices: [
      { id: 'nb-NO-PernilleNeural', name: 'Pernille', provider: 'azure', gender: 'female', description: 'Warm Norwegian female', recommended: true },
      { id: 'nb-NO-FinnNeural', name: 'Finn', provider: 'azure', gender: 'male', description: 'Professional Norwegian male', recommended: true },
    ]
  },
  {
    code: 'fi-FI',
    name: 'Finnish',
    nativeName: 'Suomi',
    transcriberLang: 'fi',
    voices: [
      { id: 'fi-FI-NooraNeural', name: 'Noora', provider: 'azure', gender: 'female', description: 'Warm Finnish female', recommended: true },
      { id: 'fi-FI-HarriNeural', name: 'Harri', provider: 'azure', gender: 'male', description: 'Professional Finnish male', recommended: true },
    ]
  },
  {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    transcriberLang: 'ar',
    voices: [
      { id: 'ar-SA-ZariyahNeural', name: 'Zariyah', provider: 'azure', gender: 'female', description: 'Professional Arabic female', recommended: true },
      { id: 'ar-SA-HamedNeural', name: 'Hamed', provider: 'azure', gender: 'male', description: 'Professional Arabic male', recommended: true },
    ]
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    transcriberLang: 'hi',
    voices: [
      { id: 'hi-IN-SwaraNeural', name: 'Swara', provider: 'azure', gender: 'female', description: 'Warm Hindi female', recommended: true },
      { id: 'hi-IN-MadhurNeural', name: 'Madhur', provider: 'azure', gender: 'male', description: 'Professional Hindi male', recommended: true },
    ]
  },
];

export const DEFAULT_GREETINGS: Record<string, string> = {
  'nl-NL': 'Hallo, u spreekt met de virtuele assistent van {businessName}. Hoe kan ik u helpen?',
  'nl-BE': 'Goedendag, u spreekt met de virtuele assistent van {businessName}. Hoe kan ik u helpen?',
  'en-US': 'Hello, thank you for calling {businessName}. How can I help you today?',
  'en-GB': 'Hello, thank you for calling {businessName}. How may I assist you today?',
  'de-DE': 'Guten Tag, Sie sprechen mit dem virtuellen Assistenten von {businessName}. Wie kann ich Ihnen helfen?',
  'fr-FR': "Bonjour, vous êtes en contact avec l'assistant virtuel de {businessName}. Comment puis-je vous aider?",
  'es-ES': 'Hola, está hablando con el asistente virtual de {businessName}. ¿En qué puedo ayudarle?',
  'es-MX': 'Hola, está hablando con el asistente virtual de {businessName}. ¿En qué puedo ayudarle?',
  'it-IT': "Buongiorno, sta parlando con l'assistente virtuale di {businessName}. Come posso aiutarla?",
  'pt-BR': 'Olá, você está falando com o assistente virtual da {businessName}. Como posso ajudá-lo?',
  'pl-PL': 'Dzień dobry, mówi wirtualny asystent {businessName}. W czym mogę pomóc?',
  'ja-JP': 'お電話ありがとうございます。{businessName}です。ご用件をお聞かせください。',
  'ko-KR': '안녕하세요, {businessName}입니다. 무엇을 도와드릴까요?',
  'zh-CN': '您好，感谢致电{businessName}。请问有什么可以帮您？',
  'tr-TR': 'Merhaba, {businessName} sanal asistanıyla görüşüyorsunuz. Size nasıl yardımcı olabilirim?',
  'ru-RU': 'Здравствуйте, вы связались с виртуальным ассистентом {businessName}. Чем могу помочь?',
  'sv-SE': 'Hej, du pratar med den virtuella assistenten för {businessName}. Hur kan jag hjälpa dig?',
  'da-DK': 'Hej, du taler med den virtuelle assistent for {businessName}. Hvordan kan jeg hjælpe dig?',
  'no-NO': 'Hei, du snakker med den virtuelle assistenten til {businessName}. Hvordan kan jeg hjelpe deg?',
  'fi-FI': 'Hei, puhut {businessName} virtuaaliassistentin kanssa. Kuinka voin auttaa?',
  'ar-SA': 'مرحباً، أنت تتحدث مع المساعد الافتراضي لـ {businessName}. كيف يمكنني مساعدتك؟',
  'hi-IN': 'नमस्ते, आप {businessName} के वर्चुअल असिस्टेंट से बात कर रहे हैं। मैं आपकी कैसे मदद कर सकता हूं?',
};

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function getRecommendedVoice(language: Language): Voice | undefined {
  return language.voices.find(v => v.recommended) || language.voices[0];
}

export function getDefaultGreeting(languageCode: string, businessName: string): string {
  const template = DEFAULT_GREETINGS[languageCode] || DEFAULT_GREETINGS['en-US'];
  return template.replace('{businessName}', businessName);
}
