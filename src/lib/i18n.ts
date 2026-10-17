export const languages = [
  { code: "es", label: "Español" }, { code: "en", label: "English" }, { code: "pt", label: "Português" },
  { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" }, { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" }, { code: "ja", label: "日本語" }, { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" }, { code: "ru", label: "Русский" }, { code: "qu", label: "Runasimi (Quechua)" },
] as const;

type Key = "notebooks" | "calendar" | "pets" | "class" | "groups" | "tools" | "announcements" | "help" | "hello";
const dict: Record<string, Partial<Record<Key, string>>> = {
  es: { notebooks: "Mis cuadernos", calendar: "Mi calendario", pets: "Mis mascotas", class: "Mi clase", groups: "Grupos de trabajo", tools: "Herramientas de aula", announcements: "Tablón de anuncios", help: "Centro de ayuda", hello: "¡Hola" },
  en: { notebooks: "My notebooks", calendar: "My calendar", pets: "My pets", class: "My class", groups: "Work groups", tools: "Classroom tools", announcements: "Announcements", help: "Help center", hello: "Hi" },
  pt: { notebooks: "Meus cadernos", calendar: "Meu calendário", pets: "Meus mascotes", class: "Minha turma", groups: "Grupos de trabalho", tools: "Ferramentas de aula", announcements: "Mural de avisos", help: "Central de ajuda", hello: "Olá" },
  fr: { notebooks: "Mes cahiers", calendar: "Mon calendrier", pets: "Mes compagnons", class: "Ma classe", groups: "Groupes de travail", tools: "Outils de classe", announcements: "Annonces", help: "Centre d'aide", hello: "Bonjour" },
  de: { notebooks: "Meine Hefte", calendar: "Mein Kalender", pets: "Meine Haustiere", class: "Meine Klasse", groups: "Arbeitsgruppen", tools: "Klassenwerkzeuge", announcements: "Pinnwand", help: "Hilfe", hello: "Hallo" },
  it: { notebooks: "I miei quaderni", calendar: "Il mio calendario", pets: "I miei amici", class: "La mia classe", groups: "Gruppi di lavoro", tools: "Strumenti di classe", announcements: "Bacheca", help: "Centro assistenza", hello: "Ciao" },
  zh: { notebooks: "我的笔记本", calendar: "我的日历", pets: "我的宠物", class: "我的班级", groups: "小组", tools: "课堂工具", announcements: "公告栏", help: "帮助中心", hello: "你好" },
  ja: { notebooks: "マイノート", calendar: "カレンダー", pets: "マイペット", class: "マイクラス", groups: "グループ", tools: "教室ツール", announcements: "掲示板", help: "ヘルプ", hello: "こんにちは" },
  ar: { notebooks: "دفاتري", calendar: "تقويمي", pets: "حيواناتي", class: "صفي", groups: "مجموعات العمل", tools: "أدوات الصف", announcements: "لوحة الإعلانات", help: "مركز المساعدة", hello: "مرحبًا" },
  hi: { notebooks: "मेरी नोटबुक", calendar: "मेरा कैलेंडर", pets: "मेरे पालतू", class: "मेरी कक्षा", groups: "समूह", tools: "कक्षा उपकरण", announcements: "सूचना बोर्ड", help: "सहायता केंद्र", hello: "नमस्ते" },
  ru: { notebooks: "Мои тетради", calendar: "Мой календарь", pets: "Мои питомцы", class: "Мой класс", groups: "Рабочие группы", tools: "Инструменты", announcements: "Объявления", help: "Помощь", hello: "Привет" },
  qu: { notebooks: "Qillqanaykuna", calendar: "Pacha unanchana", pets: "Uywaykuna", class: "Yachaywasiy", groups: "Huñukuna", tools: "Llamk'anakuna", announcements: "Willakuykuna", help: "Yanapay", hello: "Allillanchu" },
};
export function t(lang: string, key: Key) {
  return dict[lang]?.[key] ?? dict["es"]![key]!;
}
