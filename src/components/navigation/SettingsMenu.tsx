import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAppContext } from '../../context/AppContext';
import { Settings, Sun, Moon, LogOut } from 'lucide-react';

export const SettingsMenu = () => {
    const { theme, setTheme, language, setLanguage, t } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = () => {
        signOut(auth);
    };

    return (
        <div className="relative mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-center p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
                <Settings size={22} />
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-56 right-0 bg-white dark:bg-slate-700 rounded-lg shadow-2xl p-4 border border-slate-200 dark:border-slate-600">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Mode</label>
                            <div className="flex items-center justify-between mt-1">
                                <Sun size={18} className={theme === 'light' ? 'text-cyan-500' : ''}/>
                                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-400'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <Moon size={18} className={theme === 'dark' ? 'text-cyan-500' : ''} />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="language-select" className="text-sm font-semibold">Language</label>
                             <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 w-full bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-md p-2 text-sm">
                                 <option value="en">English</option>
                                 <option value="te">తెలుగు</option>
                             </select>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                             <button onClick={handleSignOut} className="w-full bg-red-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm">
                                 <LogOut size={16}/>
                                 {t('signOut')}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};