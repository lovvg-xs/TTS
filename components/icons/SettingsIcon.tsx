
import type { FC, SVGProps } from 'react';

const SettingsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-1.007 1.11-.962a8.97 8.97 0 0 1 5.71 5.71c.046.55-.412 1.02-.962 1.11l-4.21 1.256c-.527.158-1.04.158-1.568 0L9.594 9.656c-.55-.162-.938-.768-.788-1.326a5.25 5.25 0 0 1 3.32-3.32c.558-.15.964.23.788.788l-1.256 4.21c-.158.527-.158 1.04 0 1.568l1.256 4.21c.15.558-.23.964-.788.788a5.25 5.25 0 0 1-3.32-3.32c-.15-.558.23-.964.788-.788l4.21-1.256a8.97 8.97 0 0 1-5.71-5.71c-.046-.55.412-1.02.962-1.11Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
    />
  </svg>
);

export default SettingsIcon;