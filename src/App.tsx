import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { AppProvider } from './contexts/AppContext';

import { Sidebar } from './components/navigation/Sidebar';
import LoginPage from './components/LoginPage';

// Import all your page components
import Dashboard from './pages/Dashboard';
import NetWorthManager from './pages/NetWorthManager'; // <-- IMPORT THE NEW PAGE
import LendedCashManager from './pages/LendedCashManager';
import BudgetManager from './pages/BudgetManager';
import TransactionsManager from './pages/TransactionsManager';
import CashflowManager from './pages/CashflowManager';
import FamilyManager from './pages/FamilyManager';
import GoalsManager from './pages/GoalsManager';

interface LendedCashItem {
    id: string;
    amount: number;
    date: string;
    expectedReturnDate?: string;
    receiverName: string;
    notes?: string;
}

// This is the main application component that holds the state
const FolioApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  // Data states
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [lendedCash, setLendedCash] = useState<LendedCashItem[]>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Don't fetch data if there's no user
    const userId = user.uid;
    const appId = 'folio-app'; // Use a consistent App ID

    const unsubscribers = [
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'assets')), s => setAssets(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'liabilities')), s => setLiabilities(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'budgets')), s => setBudgets(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'transactions')), s => { const txs=s.docs.map(d=>({id:d.id,...d.data()})); txs.sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime()); setTransactions(txs as any); }),
      onSnapshot(doc(db, 'artifacts', appId, 'users', userId, 'financials', 'income'), d => { if(d.exists()) setIncome(d.data().amount); }),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'family')), s => setFamilyMembers(s.docs.map(d => ({id:d.id,...d.data()})) as any)),
      onSnapshot(query(collection(db, 'artifacts', appId, 'users', userId, 'lendedCash')), s => {
        const items = s.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LendedCashItem[];
        setLendedCash(items);
      })
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
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar 
        user={user}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <main className={`flex-grow transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

// The final entry point that wraps the app with the context provider
export default function App() {
  return (
    <AppProvider>
      <FolioApp />
    </AppProvider>
  );
}