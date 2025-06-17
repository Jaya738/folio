import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, formatFullInr } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

const GoalsManager = ({ db, userId }: any) => {
    const { t } = useAppContext();
    const [goals, setGoals] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');

    useEffect(() => {
        if (!db || !userId) return;
        const q = query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'goals'));
        const unsubscribe = onSnapshot(q, (s) => setGoals(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsubscribe();
    }, [db, userId]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount || !targetDate) return;
        const data = { name, targetAmount: parseFloat(targetAmount), targetDate };
        if (editingGoal) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'goals', editingGoal.id), data);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, 'goals'), data);
        }
        setIsModalOpen(false);
    };

    const handleDeleteGoal = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'goals', id));
    };
    
    const openModal = (goal: any = null) => {
        setEditingGoal(goal);
        setName(goal ? goal.name : '');
        setTargetAmount(goal ? goal.targetAmount : '');
        setTargetDate(goal ? goal.targetDate : '');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <SectionTitle extraContent={
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <PlusCircle size={20} /> {t('addGoal')}
                </button>
            }>
                {t('myGoals')}
            </SectionTitle>

            {/* Mobile FAB */}
            <button onClick={() => openModal()} className="lg:hidden fixed bottom-6 right-6 bg-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-600 z-40">
                <PlusCircle size={24} />
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? t('edit') + " " + t('goals') : t('addGoal')}>
                <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 items-end">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Goal Name" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" />
                    <input value={targetAmount} type="number" onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount (INR)" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" />
                    <input value={targetDate} type="date" onChange={e => setTargetDate(e.target.value)} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" />
                    <button type="submit" className="bg-cyan-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center mt-4">
                        <PlusCircle className="mr-2"/> {t('save')}
                    </button>
                </form>
            </Modal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.length > 0 ? goals.map(g => (
                    <div key={g.id} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <p className="font-bold text-xl text-slate-900 dark:text-white">{g.name}</p>
                            <p className="text-cyan-500 dark:text-cyan-400 text-lg">{formatFullInr(g.targetAmount)}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Target: {new Date(g.targetDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 self-end mt-4">
                            <button onClick={() => openModal(g)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16}/></button>
                            <button onClick={() => handleDeleteGoal(g.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16}/></button>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4 col-span-full">
                        No goals added yet.
                    </p>
                )}
            </div>
        </div>
    );
};

export default GoalsManager;