import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 overflow-hidden">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          language === 'hi'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
};

export default LanguageSwitcher;

