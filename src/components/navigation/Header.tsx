import { Menu, Settings } from 'lucide-react';

export const Header = ({ onMenuClick, onSettingsClick }: any) => {
    return (
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <button onClick={onMenuClick} className="p-2">
                <Menu />
            </button>
            <h1 className="text-xl font-bold text-cyan-500">Folio</h1>
            <button onClick={onSettingsClick} className="p-2">
                <Settings />
            </button>
        </header>
    );
};