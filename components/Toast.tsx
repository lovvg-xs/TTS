import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Toast as ToastType } from '../types';
import CloseIcon from './icons/CloseIcon';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => onDismiss(toast.id), 500); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
  }, [isExiting, onDismiss, toast.id]);

  const handleDismiss = () => {
    setIsExiting(true);
  };

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[toast.type];

  return (
    <div
      className={`relative w-full max-w-sm rounded-lg shadow-lg text-white p-4 my-2 overflow-hidden ${bgColor} ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-grow">
          <p className="font-bold capitalize">{toast.type}</p>
          <p className="text-sm">{toast.message}</p>
        </div>
        <button onClick={handleDismiss} className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;