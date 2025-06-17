import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Modal } from '../ui/Modal';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const SettingsMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { theme, setTheme, language, setLanguage, t } = useAppContext();

    const handleSignOut = () => {
        signOut(auth);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mode</label>
                    <div className="flex items-center justify-between mt-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <Sun size={18} className={theme === 'light' ? 'text-cyan-500' : ''}/>
                        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-400'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <Moon size={18} className={theme === 'dark' ? 'text-cyan-500' : ''} />
                    </div>
                </div>
                <div>
                     <label htmlFor="language-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Language</label>
                     <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-sm">
                         <option value="en">English</option>
                         <option value="te">తెలుగు</option>
                     </select>
                </div>
                <div className="pt-4 border-t border-slate-300 dark:border-slate-600">
                     <button onClick={handleSignOut} className="w-full bg-red-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm">
                         <LogOut size={16}/>
                         {t('signOut')}
                     </button>
                </div>
            </div>
        </Modal>
    );
};