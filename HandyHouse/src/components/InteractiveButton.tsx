'use client';

import React from 'react';

export default function InteractiveButton({ 
  children, 
  className, 
  alertMsg 
}: { 
  children: React.ReactNode;
  className?: string;
  alertMsg: string;
}) {
  return (
    <button 
      type="button"
      className={className} 
      onClick={(e) => { 
        e.preventDefault(); 
        alert(alertMsg); 
      }}
    >
      {children}
    </button>
  );
}
