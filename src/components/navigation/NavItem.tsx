import React from 'react';
import type { ReactNode } from 'react';

export interface NavItemProps {
  icon: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  children, 
  isExpanded, 
  className = '', 
  ...props 
}) => (
  <button
    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full ${className}`}
    {...props}
  >
    {icon}
    {isExpanded && <span>{children}</span>}
  </button>
); 