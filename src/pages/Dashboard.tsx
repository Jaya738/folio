import { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { formatInr, formatFullInr, StatCard, SectionTitle, CATEGORY_COLORS } from '../components/ui/Utils';
import { Landmark, ShieldCheck, Ban, ShoppingCart, Receipt, PiggyBank, Repeat, Target } from 'lucide-react';

const Dashboard = ({ assets, liabilities, transactions, lendedCash, setView }: any) => {
    const { t, theme } = useAppContext();
    const [dashboardView, setDashboardView] = useState('family');

    const calculatePersonalShare = (item: any) => {
        if (item.receiverName) return item.amount;
        if (!item.ownership || !item.ownership.allocations) return item.value;
        const selfAllocation = item.ownership.allocations.find((a: any) => a.memberId === 'self');
        if (selfAllocation && selfAllocation.percentage) return item.value * (parseFloat(selfAllocation.percentage) / 100);
        return 0;
    };

    const totalAssets = useMemo(() => {
        const physicalAssetsValue = assets.reduce((sum: number, asset: any) => sum + (dashboardView === 'personal' ? calculatePersonalShare(asset) : asset.value), 0);
        const lendedCashValue = lendedCash.reduce((sum: number, loan: any) => sum + loan.amount, 0);
        return physicalAssetsValue + lendedCashValue;
    }, [assets, lendedCash, dashboardView]);

    const totalLiabilities = useMemo(() => {
        return liabilities.reduce((sum: number, liability: any) => sum + (dashboardView === 'personal' ? calculatePersonalShare(liability) : liability.value), 0);
    }, [liabilities, dashboardView]);
    
    const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities]);
    const monthlyExpenses = useMemo(() => { const today = new Date(); return transactions.filter((t: any) => { const d = new Date(t.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).reduce((sum: number, t: any) => sum + t.amount, 0);}, [transactions]);
    
    const stackedChartData = useMemo(() => {
        const categories: { [key: string]: { name: string, Assets: number, Liabilities: number } } = {};
        const processItems = (items: any[], type: 'Assets' | 'Liabilities') => {
            items.forEach(item => {
                const category = item.category || (item.receiverName ? 'Lended Cash' : 'Other');
                const value = dashboardView === 'personal' ? calculatePersonalShare(item) : (item.value || item.amount);
                if (!categories[category]) categories[category] = { name: category, Assets: 0, Liabilities: 0 };
                categories[category][type] += value;
            });
        };
        processItems([...assets, ...lendedCash], 'Assets');
        processItems(liabilities, 'Liabilities');
        
        const chartData = Object.values(categories);
        const assetData: any = { name: t('assets') };
        const liabilityData: any = { name: t('liabilities') };
        chartData.forEach(d => {
            assetData[d.name] = d.Assets;
            liabilityData[d.name] = d.Liabilities;
        });

        return { data: [assetData, liabilityData], categories: Object.keys(categories) };
    }, [assets, liabilities, lendedCash, dashboardView, t]);

    const ViewToggle = () => (
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex items-center space-x-1">
            <button onClick={() => setDashboardView('personal')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors w-full flex items-center justify-center gap-2 ${dashboardView === 'personal' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Personal</button>
            <button onClick={() => setDashboardView('family')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors w-full flex items-center justify-center gap-2 ${dashboardView === 'family' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Family</button>
        </div>
    );

    const QuickActionButton = ({ icon, label, onClick }: any) => (
        <button onClick={onClick} className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            <div className="p-3 bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 rounded-full">{icon}</div>
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );
    
    return (
        <div className="flex flex-col gap-8">
            <SectionTitle extraContent={<ViewToggle />}>{dashboardView === 'personal' ? t('personalOverview') : t('familyOverview')}</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('assetsVsLiabilities')}</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={stackedChartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barGap={50}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#6b7280'} />
                                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#6b7280'} tickFormatter={formatInr} />
                                <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.3)' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' }} formatter={(value: number, name: string) => [formatFullInr(value), name]} />
                                <Legend />
                                {stackedChartData.categories.map((category: string) => (<Bar key={category} dataKey={category} stackId="a" fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#8884d8'} radius={[4, 4, 0, 0]} />))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <StatCard title={t('totalAssets')} value={totalAssets} icon={<Landmark size={24} />} color="bg-green-500/20 text-green-400" />
                    <StatCard title={t('totalLiabilities')} value={totalLiabilities} icon={<Ban size={24} />} color="bg-red-500/20 text-red-400" />
                    <StatCard title={t('netWorth')} value={netWorth} icon={<ShieldCheck size={24} />} color="bg-cyan-500/20 text-cyan-400" />
                    <StatCard title={t('thisMonthsSpending')} value={monthlyExpenses} icon={<ShoppingCart size={24} />} color="bg-amber-500/20 text-amber-400" />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-4 text-center">{t('quickActions')}</h3>
                <div className="flex justify-around items-center p-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl">
                    <QuickActionButton icon={<Receipt size={20}/>} label={t('addExpense')} onClick={() => setView('transactions')} />
                    <QuickActionButton icon={<PiggyBank size={20}/>} label={t('budgets')} onClick={() => setView('budget')} />
                    <QuickActionButton icon={<Repeat size={20}/>} label={t('cashFlow')} onClick={() => setView('cashflow')} />
                    <QuickActionButton icon={<Target size={20}/>} label={t('goals')} onClick={() => setView('goals')} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;