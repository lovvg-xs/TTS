import { useRef } from 'react';
import type { FC } from 'react';

interface TextAreaInputProps {
  text: string;
  setText: (text: string) => void;
  disabled: boolean;
}

const TextAreaInput: FC<TextAreaInputProps> = ({ text, setText, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileText = e.target?.result as string;
        setText(fileText);
      };
      reader.readAsText(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type, paste, or upload text here..."
        className="w-full flex-grow bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 p-4 rounded-t-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
        disabled={disabled}
      />
      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-b-lg flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
        <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
            {new Intl.NumberFormat().format(text.length)} characters
        </span>
        <div>
            <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt"
            className="hidden"
            disabled={disabled}
            />
            <button
            onClick={handleUploadClick}
            disabled={disabled}
            className="text-sm font-medium text-brand-500 hover:text-brand-600 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
            Upload .txt file
            </button>
        </div>
      </div>
    </div>
  );
};

export default TextAreaInput;