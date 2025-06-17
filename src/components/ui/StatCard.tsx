import React, { ReactNode } from 'react';
import { formatFullInr } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
        {formatFullInr(value)}
      </p>
    </div>
  </div>
); 