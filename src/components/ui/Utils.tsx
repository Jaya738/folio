import React from 'react';

export const formatInr = (value: number): string => { 
    if (isNaN(value)) return '₹0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
    return `₹${value.toFixed(0)}`; 
};

export const formatFullInr = (value: number): string => { 
    if (isNaN(value)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

export const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{formatFullInr(value)}</p>
        </div>
    </div>
);

export const SectionTitle = ({ children, extraContent }: { children: React.ReactNode, extraContent?: React.ReactNode }) => (
    <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-l-4 border-cyan-500 pl-4">{children}</h2>
        {extraContent && <div className="hidden sm:block">{extraContent}</div>}
    </div>
);

export const CATEGORY_COLORS: { [key: string]: string } = {
    // Assets - Aqua/Teal theme
    'Cash': '#0d9488', // teal-600
    'Real Estate': '#14b8a6', // teal-500
    'Stocks': '#2dd4bf', // teal-400
    'Vehicle': '#5eead4', // teal-300
    'Lended Cash': '#99f6e4', // teal-200
    'Other': '#ccfbf1', // teal-100

    // Liabilities - Grey theme
    'Mortgage': '#4b5563', // gray-600
    'Car Loan': '#6b7280', // gray-500
    'Credit Card': '#9ca3af', // gray-400
    'Student Loan': '#d1d5db', // gray-300
    'Other Liability': '#e5e7eb' // gray-200
};