import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useRtl(lang) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lng = lang || i18n.language;
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    if (lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);
}

export default function RtlLayout({ lang, children }) {
  useRtl(lang);
  return children;
}
