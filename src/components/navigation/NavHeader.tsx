import React from 'react';
import type { ReactNode } from 'react';

export interface NavHeaderProps {
  children: ReactNode;
  isExpanded: boolean;
}

export const NavHeader: React.FC<NavHeaderProps> = ({ children, isExpanded }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-6 h-6 bg-cyan-500 rounded-lg"></div>
    {isExpanded && <span className="font-bold text-slate-900 dark:text-white">{children}</span>}
  </div>
); 