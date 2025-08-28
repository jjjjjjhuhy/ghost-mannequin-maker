import React from 'react';

export const CropIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 22h14a2 2 0 002-2V8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v14a2 2 0 002 2h10" />
  </svg>
);
