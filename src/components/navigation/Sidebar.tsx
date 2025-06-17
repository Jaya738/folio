import { useAppContext } from '../../context/AppContext';
import { SettingsMenu } from './SettingsMenu';
import { Home, Receipt, PiggyBank, Repeat, Landmark, Handshake, Users, Target, ArrowLeftToLine, ArrowRightToLine, X } from 'lucide-react';

const NavItem = ({ icon, children, isExpanded, className = '', ...props }: any) => (
    <button {...props} className={`flex items-center py-3 rounded-lg w-full text-left transition-colors duration-200 group ${isExpanded ? 'px-4' : 'px-0 justify-center'} ${className}`}>
        {icon}
        <span className={`whitespace-nowrap ml-4 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>{isExpanded ? children : null}</span>
    </button>
);

const NavHeader = ({ children, isExpanded }: any) => (
    <p className={`px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-1 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
        {isExpanded ? children : null}
    </p>
);


export const Sidebar = ({ user, isDesktopExpanded, setIsDesktopExpanded, isMobileOpen, setIsMobileOpen, currentView, onViewChange }: any) => {
    const { t } = useAppContext();

    const handleViewChange = (view: string) => {
        onViewChange(view);
        setIsMobileOpen(false); // Close mobile menu on navigation
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
            ></div>

            <aside className={`fixed top-0 left-0 h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 flex flex-col border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 z-40 ${isDesktopExpanded ? 'w-64' : 'w-20'} lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center mb-4">
                    {/* Desktop Toggle */}
                    <button onClick={() => setIsDesktopExpanded(!isDesktopExpanded)} className="p-2 ml-auto hidden lg:block hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                        {isDesktopExpanded ? <ArrowLeftToLine size={20}/> : <ArrowRightToLine size={20} />}
                    </button>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsMobileOpen(false)} className="p-2 ml-auto lg:hidden hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                
                <h1 className={`text-xl font-bold text-slate-900 dark:text-white overflow-hidden transition-all duration-300 mb-4 ${isDesktopExpanded ? 'w-full ml-3' : 'w-0 lg:w-full lg:ml-0 lg:text-center'}`}>Folio</h1>

                <nav className="flex-grow space-y-1">
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('dashboard')} className={currentView === 'dashboard' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Home size={22}/>}>{t('dashboard')}</NavItem>
                    <NavHeader isExpanded={isDesktopExpanded}>{t('spending')}</NavHeader>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('transactions')} className={currentView === 'transactions' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Receipt size={22}/>}>{t('expenses')}</NavItem>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('budget')} className={currentView === 'budget' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<PiggyBank size={22}/>}>{t('budgets')}</NavItem>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('cashflow')} className={currentView === 'cashflow' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Repeat size={22}/>}>{t('cashFlow')}</NavItem>
                    <NavHeader isExpanded={isDesktopExpanded}>{t('netWorth')}</NavHeader>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('networth')} className={currentView === 'networth' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Landmark size={22}/>}>{t('assets')} & {t('liabilities')}</NavItem>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('lended')} className={currentView === 'lended' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Handshake size={22}/>}>{t('lended')}</NavItem>
                    <NavHeader isExpanded={isDesktopExpanded}>{t('planning')}</NavHeader>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('family')} className={currentView === 'family' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Users size={22}/>}>{t('family')}</NavItem>
                    <NavItem isExpanded={isDesktopExpanded} onClick={() => handleViewChange('goals')} className={currentView === 'goals' ? 'bg-cyan-500 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} icon={<Target size={22}/>}>{t('goals')}</NavItem>
                </nav>
                
                <SettingsMenu isOpen={false} onClose={function (): void {
                    throw new Error('Function not implemented.');
                } } />
                
                <div className={`text-xs text-slate-500 p-2 break-all transition-opacity ${isDesktopExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="font-semibold mb-1">User ID:</p>
                    <p>{user?.uid}</p>
                </div>
            </aside>
        </>
    );
};