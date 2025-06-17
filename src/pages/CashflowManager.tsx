import { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, StatCard, formatFullInr } from '../components/ui/Utils';
import { Receipt, PiggyBank } from 'lucide-react';

interface BudgetPerformanceItem {
    id: string;
    name: string;
    category: string;
    spent: number;
    budget: number;
    budgeted: number;
    percentage: number;
    remaining: number;
}

const CashflowManager = ({ budgets, transactions, income, setIncome }: any) => {
    const { t } = useAppContext();
    const [isEditingIncome, setIsEditingIncome] = useState(false);
    const [newIncome, setNewIncome] = useState(income);
    
    useEffect(() => { setNewIncome(income) }, [income]);

    const handleSaveIncome = async () => {
        // Assume setDoc is available from your firebase config
        // await setDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'financials', 'income'), { amount: parseFloat(newIncome) });
        setIncome(parseFloat(newIncome));
        setIsEditingIncome(false);
    };
    
    const monthlyExpenses = useMemo(() => transactions.filter((t: any) => new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum: number, t: any) => sum + t.amount, 0), [transactions]);
    const savings = useMemo(() => income - monthlyExpenses, [income, monthlyExpenses]);

    const expenseByCategory = useMemo(() => {
        const map: { [key: string]: number } = {};
        const currentMonthTxs = transactions.filter((t: any) => new Date(t.date).getMonth() === new Date().getMonth());
        currentMonthTxs.forEach((t: any) => {
            const categoryName = budgets.find((b: any) => b.id === t.categoryId)?.name || 'Uncategorized';
            if (!map[categoryName]) map[categoryName] = 0;
            map[categoryName] += t.amount;
        });
        return Object.entries(map).map(([name, value]) => ({name, value}));
    }, [transactions, budgets]);

    const budgetPerformance = useMemo(() => {
        const currentMonthTxs = transactions.filter((t: any) => new Date(t.date).getMonth() === new Date().getMonth());
        return budgets.map((budget: any) => {
            const spent = currentMonthTxs.filter((t: any) => t.categoryId === budget.id).reduce((sum: number, t: any) => sum + t.amount, 0);
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            return { id: budget.id, name: budget.name, budgeted: budget.amount, spent, remaining, percentage };
        });
    }, [budgets, transactions]);
    
    const PIE_COLORS = ['#06b6d4', '#22c55e', '#f97316', '#eab308', '#8b5cf6', '#ec4899'];
    
    return (
        <div className="space-y-8">
            <SectionTitle>{t('monthlyCashFlow')}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('totalIncome')}</p>
                    {isEditingIncome ? (
                        <div className="flex items-center gap-2 mt-2">
                           <input type="number" value={newIncome} onChange={(e) => setNewIncome(e.target.value)} className="bg-slate-200 dark:bg-slate-700 p-2 rounded-md w-32 text-center text-2xl"/>
                           <button onClick={handleSaveIncome} className="bg-green-500 text-white px-3 py-2 rounded-md">{t('save')}</button>
                        </div>
                    ) : (
                        <p onClick={() => setIsEditingIncome(true)} className="text-green-500 dark:text-green-400 text-3xl font-bold cursor-pointer hover:scale-105">{formatFullInr(income)}</p>
                    )}
                </div>
                <StatCard title={t('expenses')} value={monthlyExpenses} icon={<Receipt size={24}/>} color="bg-red-500/20 text-red-400"/>
                <StatCard title={t('netSavings')} value={savings} icon={<PiggyBank size={24}/>} color="bg-cyan-500/20 text-cyan-400"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('spendingByCategory')}</h3>
                    {expenseByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => entry.name}>
                                    {expenseByCategory.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatFullInr(value)}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate-500 dark:text-slate-400 text-center py-10">No expenses logged this month.</p>}
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('budgetPerformance')}</h3>
                    {budgetPerformance.length > 0 ? (
                        <ul className="space-y-4">
                            {budgetPerformance.map((item: BudgetPerformanceItem) => (
                                <li key={item.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{formatFullInr(item.spent)} / {formatFullInr(item.budgeted)}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className={`${item.percentage > 100 ? 'bg-red-500' : 'bg-cyan-500'} h-2.5 rounded-full`} style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                                    </div>
                                    <p className={`text-xs text-right mt-1 ${item.remaining >= 0 ? 'text-slate-500 dark:text-slate-400' : 'text-red-400'}`}>
                                        {item.remaining >= 0 ? `${formatFullInr(item.remaining)} remaining` : `${formatFullInr(Math.abs(item.remaining))} over`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-slate-500 dark:text-slate-400 text-center py-10">No budgets set for this month.</p>}
                </div>
            </div>
        </div>
    );
};

export default CashflowManager;