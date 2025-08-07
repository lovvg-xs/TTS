
import type { FC } from 'react';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onSettingsClick: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ onSettingsClick, isAuthenticated, onLogout }) => {
  return (
    <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
        Advanced <span className="text-brand-500">TTS</span>
      </h1>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <ThemeToggle />
        <button
          onClick={onSettingsClick}
          className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Open Settings"
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="hidden sm:block font-medium">Settings</span>
        </button>
        {isAuthenticated && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Logout"
          >
            <LogoutIcon className="w-6 h-6" />
            <span className="hidden sm:block font-medium">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;