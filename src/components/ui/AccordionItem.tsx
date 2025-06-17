import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const AccordionItem = ({ titleContent, color, children, defaultOpen = false }: { titleContent: React.ReactNode, color: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const borderStyle = {
        borderLeftColor: color,
    };

    return (
        <div 
            className="bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border-l-4" 
            style={borderStyle}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-900 dark:text-white"
            >
                {/* Use titleContent directly */}
                {titleContent}
                <ChevronDown
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    {children}
                </div>
            </div>
        </div>
    );
};