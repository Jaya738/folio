import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { AppProvider } from './contexts/AppContext';

import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import LoginPage from './components/LoginPage'; 

// Page components
import Dashboard from './pages/Dashboard';
import NetWorthManager from './pages/NetWorthManager';
import LendedCashManager from './pages/LendedCashManager';
import BudgetManager from './pages/BudgetManager';
import TransactionsManager from './pages/TransactionsManager';
import CashflowManager from './pages/CashflowManager';
import FamilyManager from './pages/FamilyManager';
import GoalsManager from './pages/GoalsManager';
import { SettingsMenu } from './components/navigation/SettingsMenu';

const FolioApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Data states
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [lendedCash, setLendedCash] = useState([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userId = user.uid;
    const appId = 'folio-app';

    const unsubscribers = [
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'assets')), s => setAssets(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'liabilities')), s => setLiabilities(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'budgets')), s => setBudgets(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'transactions')), s => { const txs=s.docs.map(d=>({id:d.id,...d.data()})); txs.sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime()); setTransactions(txs as any); }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', userId, 'financials', 'income'), d => { 
        if(d.exists()) setIncome(d.data().amount); 
      }),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'family')), s => 
        setFamilyMembers(s.docs.map(d => ({id:d.id,...d.data()})) as any)
      ),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'lendedCash')), s => 
        setLendedCash(s.docs.map(d => ({id:d.id,...d.data()})) as any)
      )
    ];
    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  const renderView = () => {
    if (!user) return null;
    switch (currentView) {
        case 'dashboard': return <Dashboard assets={assets} liabilities={liabilities} transactions={transactions} lendedCash={lendedCash} setView={setCurrentView} />;
        case 'networth': return <NetWorthManager db={db} userId={user.uid} familyMembers={familyMembers} />;
        case 'lended': return <LendedCashManager db={db} userId={user.uid} />;
        case 'budget': return <BudgetManager db={db} userId={user.uid} budgets={budgets} />;
        case 'transactions': return <TransactionsManager db={db} userId={user.uid} budgets={budgets} transactions={transactions}/>;
        case 'cashflow': return <CashflowManager db={db} userId={user.uid} budgets={budgets} transactions={transactions} income={income} setIncome={setIncome}/>;
        case 'family': return <FamilyManager db={db} userId={user.uid} />;
        case 'goals': return <GoalsManager db={db} userId={user.uid} />;
        default: return <Dashboard assets={assets} liabilities={liabilities} transactions={transactions} lendedCash={lendedCash} setView={setCurrentView} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen">
        <div className="lg:flex">
            <Sidebar 
                user={user}
                isDesktopExpanded={isDesktopExpanded}
                setIsDesktopExpanded={setIsDesktopExpanded}
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
                currentView={currentView}
                onViewChange={setCurrentView}
            />
            <div className="flex-1 flex flex-col">
                <Header 
                    onMenuClick={() => setIsMobileMenuOpen(true)} 
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />
                <main className={`flex-grow transition-all duration-300 lg:ml-20 ${isDesktopExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
                    <div className="p-4 sm:p-6 lg:p-8">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
        <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <FolioApp />
    </AppProvider>
  );
}