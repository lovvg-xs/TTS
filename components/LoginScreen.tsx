import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import Spinner from './Spinner';

interface LoginScreenProps {
  onLogin: (user: string, pass: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const LoginScreen: FC<LoginScreenProps> = ({ onLogin, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-wide">
                Advanced <span className="text-brand-500">TTS</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Please log in to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {error && (
             <div className="bg-red-200 dark:bg-red-800/50 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6 text-center" role="alert">
                <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;