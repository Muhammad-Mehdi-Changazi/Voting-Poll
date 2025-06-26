// src/components/PollIcon.tsx
import React from 'react';

const PollIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 64 64"
      fill="none"
      className="animate-fade-in"
    >
      <rect x="10" y="40" width="8" height="14" rx="1" fill="#ffffff" className="animate-grow delay-100" />
      <rect x="24" y="30" width="8" height="24" rx="1" fill="#ffffff" className="animate-grow delay-200" />
      <rect x="38" y="20" width="8" height="34" rx="1" fill="#ffffff" className="animate-grow delay-300" />
      <rect x="52" y="10" width="8" height="44" rx="1" fill="#ffffff" className="animate-grow delay-400" />
    </svg>
  );
};

export default PollIcon;
