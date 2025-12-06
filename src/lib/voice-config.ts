// ElevenLabs Premium Multilingual Voices
// All voices support 29 languages using eleven_multilingual_v2 model

export interface Voice {
  id: string;
  name: string;
  provider: '11labs';
  gender: 'male' | 'female';
  description: string;
  recommended?: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  transcriberLang: string;
}

// Premium ElevenLabs voices - all work in 29 languages
export const ELEVENLABS_VOICES: Voice[] = [
  // FEMALE VOICES
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    provider: '11labs',
    gender: 'female',
    description: 'Warm, soft, professional - ideal for healthcare',
    recommended: true,
  },
  {
    id: '9BWtsMINqrJLrRacOk9x',
    name: 'Aria',
    provider: '11labs',
    gender: 'female',
    description: 'Expressive, calm with mature quality',
  },
  {
    id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    provider: '11labs',
    gender: 'female',
    description: 'Expressive, youthful and engaging',
  },
  {
    id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    provider: '11labs',
    gender: 'female',
    description: 'Warm, professional alto voice',
  },
  {
    id: 'pFZP5JQG7iQjIQuC4Bku',
    name: 'Lily',
    provider: '11labs',
    gender: 'female',
    description: 'Warm British clarity, velvety tone',
  },
  {
    id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    provider: '11labs',
    gender: 'female',
    description: 'Seductive, Swedish accent',
  },
  
  // MALE VOICES
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    provider: '11labs',
    gender: 'male',
    description: 'Deep, resonant, professional - ideal for business',
    recommended: true,
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    provider: '11labs',
    gender: 'male',
    description: 'Authoritative, broadcast quality',
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    provider: '11labs',
    gender: 'male',
    description: 'Warm British, captivating storyteller',
  },
  {
    id: 'cjVigY5qzO86Huf0OWal',
    name: 'Eric',
    provider: '11labs',
    gender: 'male',
    description: 'Smooth friendly tenor, great for agents',
  },
  {
    id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    provider: '11labs',
    gender: 'male',
    description: 'Articulate, young adult energy',
  },
  {
    id: 'iP95p4xoKVk53GoZ742B',
    name: 'Chris',
    provider: '11labs',
    gender: 'male',
    description: 'Casual, conversational American',
  },
];

// Supported languages for transcription
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', transcriberLang: 'nl' },
  { code: 'nl-BE', name: 'Dutch (Belgium)', nativeName: 'Vlaams', transcriberLang: 'nl-BE' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', transcriberLang: 'en-US' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (British)', transcriberLang: 'en-GB' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', transcriberLang: 'de' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', transcriberLang: 'fr' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', transcriberLang: 'es' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', transcriberLang: 'es-419' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', transcriberLang: 'it' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', transcriberLang: 'pt-BR' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', transcriberLang: 'pl' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', transcriberLang: 'ja' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', transcriberLang: 'ko' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', nativeName: '中文', transcriberLang: 'zh-CN' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', transcriberLang: 'tr' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', transcriberLang: 'ru' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', transcriberLang: 'sv' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', transcriberLang: 'da' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', transcriberLang: 'no' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', transcriberLang: 'fi' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', transcriberLang: 'ar' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', transcriberLang: 'hi' },
];

// Default greetings per language
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

// Utility functions
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function getVoiceById(id: string): Voice | undefined {
  return ELEVENLABS_VOICES.find((voice) => voice.id === id);
}

export function getRecommendedVoice(gender?: 'male' | 'female'): Voice {
  const filtered = gender 
    ? ELEVENLABS_VOICES.filter(v => v.gender === gender && v.recommended)
    : ELEVENLABS_VOICES.filter(v => v.recommended);
  return filtered[0] || ELEVENLABS_VOICES[0];
}

export function getVoicesByGender(gender: 'male' | 'female'): Voice[] {
  return ELEVENLABS_VOICES.filter(v => v.gender === gender);
}

export function getDefaultGreeting(languageCode: string, businessName: string): string {
  const template = DEFAULT_GREETINGS[languageCode] || DEFAULT_GREETINGS['en-US'];
  return template.replace('{businessName}', businessName || 'our clinic');
}

// For backward compatibility
export function migrateOldVoiceId(oldId: string): string {
  const migrations: Record<string, string> = {
    // Dutch Azure voices -> ElevenLabs
    'nl-NL-ColetteNeural': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'nl-NL-FennaNeural': '9BWtsMINqrJLrRacOk9x', // Aria
    'nl-NL-MaartenNeural': 'nPczCjzI2devNBz1zQrb', // Brian
    // English Azure voices -> ElevenLabs
    'en-US-AriaNeural': '9BWtsMINqrJLrRacOk9x', // Aria
    'en-US-JennyNeural': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'en-US-GuyNeural': 'nPczCjzI2devNBz1zQrb', // Brian
    'en-GB-SoniaNeural': 'pFZP5JQG7iQjIQuC4Bku', // Lily
    // German Azure voices -> ElevenLabs
    'de-DE-KatjaNeural': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'de-DE-ConradNeural': 'onwK4e9ZLuTAKqWW03F9', // Daniel
    // French Azure voices -> ElevenLabs
    'fr-FR-DeniseNeural': 'XrExE9yKIg1WjnnlVkGX', // Matilda
    'fr-FR-HenriNeural': 'JBFqnCBsd6RMkjVDRZzb', // George
    // Legacy ElevenLabs IDs
    'rachel': 'EXAVITQu4vr4xnSDxMaL',
    'adam': 'nPczCjzI2devNBz1zQrb',
    'bella': 'cgSgspJ2msm6clMCkdW9',
    'josh': 'TX3LPaxmHKxFdv7VOQHJ',
  };
  
  return migrations[oldId] || oldId;
}
