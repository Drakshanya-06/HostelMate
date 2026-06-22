import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-sidebar :bg-surface transition-colors"
            title="Toggle Theme"
        >
            {theme === 'light' ?
                <Moon className="w-5 h-5 text-textSecondary " /> :
                <Sun className="w-5 h-5 text-yellow-400" />
            }
        </button>
    );
};

export default ThemeToggle;
