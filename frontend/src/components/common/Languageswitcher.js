import React from 'react';
import { useLanguage } from '../../context/Languagecontext';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 4px' }}>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          background: language === 'en' ? '#c8a951' : 'transparent',
          color: language === 'en' ? '#0f2338' : 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: 16,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('si')}
        style={{
          background: language === 'si' ? '#c8a951' : 'transparent',
          color: language === 'si' ? '#0f2338' : 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: 16,
          padding: '4px 12px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        සිං
      </button>
    </div>
  );
}
