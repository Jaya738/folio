import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, formatFullInr } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const BudgetManager = ({ db, userId, budgets }: any) => {
    const { t } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        const data = { name, amount: parseFloat(amount) };
        if (editingBudget) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'budgets', editingBudget.id), data);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, 'budgets'), data);
        }
        setIsModalOpen(false);
    };

    const openModal = (budget: any = null) => {
        setEditingBudget(budget);
        setName(budget ? budget.name : '');
        setAmount(budget ? budget.amount : '');
        setIsModalOpen(true);
    };
    
    const handleDeleteBudget = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'budgets', id));
    };

    return (
        <div className="space-y-8">
            <SectionTitle extraContent={
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <PlusCircle size={20} /> {t('newBudget')}
                </button>
            }>
                {t('monthlyBudgets')}
            </SectionTitle>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? `${t('edit')} ${t('budgets')}` : `${t('addNew')} ${t('budgets')}`}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md" />
                    <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Budget (INR)" className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-4 text-slate-600 dark:text-slate-300">{t('cancel')}</button>
                        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg">{t('save')}</button>
                    </div>
                </form>
            </Modal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.length > 0 ? budgets.map((b: any) => (
                    <div key={b.id} className="bg-slate-100 dark:bg-slate-800 p-5 rounded-xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-lg">{b.name}</p>
                                <p className="font-semibold text-cyan-600 dark:text-cyan-400 text-xl">{formatFullInr(b.amount)}</p>
                            </div>
                            <div className="flex">
                                <button onClick={() => openModal(b)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteBudget(b.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-8 col-span-full">Create your first budget category.</p>
                )}
            </div>
        </div>
    );
};

export default BudgetManager;