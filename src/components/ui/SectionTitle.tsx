import React, { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  extraContent?: ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, extraContent }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-l-4 border-cyan-500 pl-4">
      {children}
    </h2>
    {extraContent && <div className="hidden sm:block">{extraContent}</div>}
  </div>
); 