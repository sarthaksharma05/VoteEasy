export type AppTheme = "Light" | "Dark";

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  deadlines: boolean;
  updates: boolean;
}

export interface IndianLanguageOption {
  value: string;
  label: string;
  nativeLabel: string;
  scriptInstruction: string;
}

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  email: true,
  sms: true,
  deadlines: true,
  updates: false,
};

export const DEFAULT_THEME: AppTheme = "Light";
export const DEFAULT_LANGUAGE = "English";

export const INDIAN_LANGUAGES: IndianLanguageOption[] = [
  { value: "English", label: "English", nativeLabel: "English", scriptInstruction: "English" },
  { value: "Assamese", label: "Assamese", nativeLabel: "অসমীয়া", scriptInstruction: "Assamese script (অসমীয়া লিপি). Do not use Roman transliteration." },
  { value: "Bengali", label: "Bengali", nativeLabel: "বাংলা", scriptInstruction: "Bengali script (বাংলা লিপি). Do not use Roman transliteration." },
  { value: "Bodo", label: "Bodo", nativeLabel: "बड़ो", scriptInstruction: "Devanagari script for Bodo (बड़ो). Do not use Roman transliteration." },
  { value: "Dogri", label: "Dogri", nativeLabel: "डोगरी", scriptInstruction: "Devanagari script for Dogri (डोगरी). Do not use Roman transliteration." },
  { value: "Gujarati", label: "Gujarati", nativeLabel: "ગુજરાતી", scriptInstruction: "Gujarati script (ગુજરાતી લિપિ). Do not use Roman transliteration." },
  { value: "Hindi", label: "Hindi", nativeLabel: "हिंदी", scriptInstruction: "Devanagari script for Hindi (हिंदी). Do not use Roman transliteration." },
  { value: "Kannada", label: "Kannada", nativeLabel: "ಕನ್ನಡ", scriptInstruction: "Kannada script (ಕನ್ನಡ ಲಿಪಿ). Do not use Roman transliteration." },
  { value: "Kashmiri", label: "Kashmiri", nativeLabel: "کٲشُر", scriptInstruction: "Kashmiri Perso-Arabic script (کٲشُر). Do not use Roman transliteration." },
  { value: "Konkani", label: "Konkani", nativeLabel: "कोंकणी", scriptInstruction: "Devanagari script for Konkani (कोंकणी). Do not use Roman transliteration." },
  { value: "Maithili", label: "Maithili", nativeLabel: "मैथिली", scriptInstruction: "Devanagari script for Maithili (मैथिली). Do not use Roman transliteration." },
  { value: "Malayalam", label: "Malayalam", nativeLabel: "മലയാളം", scriptInstruction: "Malayalam script (മലയാളം ലിപി). Do not use Roman transliteration." },
  { value: "Manipuri", label: "Manipuri", nativeLabel: "ꯃꯤꯇꯩꯂꯣꯟ", scriptInstruction: "Meitei Mayek script for Manipuri (ꯃꯤꯇꯩꯂꯣꯟ). Do not use Roman transliteration." },
  { value: "Marathi", label: "Marathi", nativeLabel: "मराठी", scriptInstruction: "Devanagari script for Marathi (मराठी). Do not use Roman transliteration." },
  { value: "Nepali", label: "Nepali", nativeLabel: "नेपाली", scriptInstruction: "Devanagari script for Nepali (नेपाली). Do not use Roman transliteration." },
  { value: "Odia", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", scriptInstruction: "Odia script (ଓଡ଼ିଆ ଲିପି). Do not use Roman transliteration." },
  { value: "Punjabi", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", scriptInstruction: "Gurmukhi script for Punjabi (ਪੰਜਾਬੀ). Do not use Roman transliteration." },
  { value: "Sanskrit", label: "Sanskrit", nativeLabel: "संस्कृत", scriptInstruction: "Devanagari script for Sanskrit (संस्कृत). Do not use Roman transliteration." },
  { value: "Santali", label: "Santali", nativeLabel: "ᱥᱟᱱᱛᱟᱲᱤ", scriptInstruction: "Ol Chiki script for Santali (ᱥᱟᱱᱛᱟᱲᱤ). Do not use Roman transliteration." },
  { value: "Sindhi", label: "Sindhi", nativeLabel: "سنڌي", scriptInstruction: "Sindhi Perso-Arabic script (سنڌي). Do not use Roman transliteration." },
  { value: "Tamil", label: "Tamil", nativeLabel: "தமிழ்", scriptInstruction: "Tamil script (தமிழ் எழுத்து). Do not use Roman transliteration." },
  { value: "Telugu", label: "Telugu", nativeLabel: "తెలుగు", scriptInstruction: "Telugu script (తెలుగు లిపి). Do not use Roman transliteration." },
  { value: "Urdu", label: "Urdu", nativeLabel: "اردو", scriptInstruction: "Urdu Perso-Arabic script (اردو). Do not use Roman transliteration." },
];

export const INDIAN_LANGUAGE_VALUES = new Set(INDIAN_LANGUAGES.map((language) => language.value));

export function getLanguageOption(language: string) {
  return INDIAN_LANGUAGES.find((option) => option.value === language);
}

export function getStoredTheme(theme?: string | null): AppTheme {
  return theme === "Dark" ? "Dark" : "Light";
}

