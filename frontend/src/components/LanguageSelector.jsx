import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="relative">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-transparent py-1 pl-2 pr-6 text-sm font-normal text-textSecondary  cursor-pointer focus:outline-none"
            >
                <option value="en-US">🇺🇸 EN-US</option>
                <option value="en-IN">🇮🇳 EN-IN</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
