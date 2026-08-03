import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'svenskaspraket_admin_lang';

export function useAdminLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['sv', 'en', 'ar'].includes(saved) && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  function setAdminLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  return { adminLang: i18n.language, setAdminLang };
}

export default function AdminRtl({ children }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    const lng = i18n.language;
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);
  return children;
}
