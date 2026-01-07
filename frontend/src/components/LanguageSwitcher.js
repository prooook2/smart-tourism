import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setOpen(false);
    // Change HTML dir for Arabic
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5"
      >
        {i18n.language.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border border-dusk/10 bg-white shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`block w-full px-4 py-2 text-left text-sm ${
                i18n.language === lang.code
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-dusk hover:bg-dusk/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
