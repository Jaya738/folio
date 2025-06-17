import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, formatFullInr } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const TransactionsManager = ({ db, userId, budgets, transactions }: any) => {
    const { t } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<any | null>(null);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !date || !categoryId) return;
        const data = { name, amount: parseFloat(amount), date, categoryId };
        if (editingTx) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'transactions', editingTx.id), data);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, 'transactions'), data);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'transactions', id));
    };

    const openModal = (tx: any = null) => {
        setEditingTx(tx);
        setName(tx ? tx.name : '');
        setAmount(tx ? tx.amount : '');
        setDate(tx ? tx.date : new Date().toISOString().split('T')[0]);
        setCategoryId(tx ? tx.categoryId : '');
        setIsModalOpen(true);
    };

    const getCategoryName = (id: string) => budgets.find((b: any) => b.id === id)?.name || 'Uncategorized';

    return (
        <div className="space-y-8">
            <SectionTitle extraContent={
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <PlusCircle size={20} /> {t('logExpense')}
                </button>
            }>
                {t('allExpenses')}
            </SectionTitle>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTx ? `${t('edit')} ${t('expenses')}` : t('logExpense')}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Expense Name" className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md"/>
                    <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount (INR)" className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md"/>
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md"/>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md">
                        <option value="" disabled>Select Category</option>
                        {budgets.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-4 text-slate-600 dark:text-slate-300">{t('cancel')}</button>
                        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">{t('save')}</button>
                    </div>
                </form>
            </Modal>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <ul className="space-y-4">
                    {transactions.length > 0 ? transactions.map((t: any) => (
                        <li key={t.id} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{getCategoryName(t.categoryId)} on {new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">{formatFullInr(t.amount)}</span>
                                <button onClick={() => openModal(t)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">No expenses logged yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default TransactionsManager;