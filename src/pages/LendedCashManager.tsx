import { useState, useEffect, useMemo } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, formatFullInr } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface LendedCashItem {
    id: string;
    amount: number;
    date: string;
    expectedReturnDate?: string;
    receiverName: string;
    notes?: string;
    interestRate?: number;
    interestType?: 'percentage' | 'fixed';
}

const LendedCashManager = ({ db, userId }: any) => {
    const { t } = useAppContext();
    const [loans, setLoans] = useState<LendedCashItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<LendedCashItem | null>(null);
    const [receiverName, setReceiverName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState('');
    const [interestType, setInterestType] = useState<'percentage' | 'fixed'>('percentage');
    const [expectedReturnDate, setExpectedReturnDate] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!db || !userId) return;
        const q = query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'lendedCash'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LendedCashItem[];
            loansData.sort((a, b) => {
                if (a.expectedReturnDate && b.expectedReturnDate) return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
                if (a.expectedReturnDate) return -1;
                if (b.expectedReturnDate) return 1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            setLoans(loansData);
        });
        return () => unsubscribe();
    }, [db, userId]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiverName || !amount || !date) return;
        const loanData = { receiverName, amount: parseFloat(amount), date, interestRate: parseFloat(interestRate) || 0, interestType, expectedReturnDate: expectedReturnDate || null, notes };
        if (editingLoan) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'lendedCash', editingLoan.id), loanData);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, 'lendedCash'), loanData);
        }
        setIsModalOpen(false);
    };

    const openModal = (loan: LendedCashItem | null = null) => {
        setEditingLoan(loan);
        setReceiverName(loan?.receiverName || '');
        setAmount(loan?.amount?.toString() || '');
        setDate(loan?.date || new Date().toISOString().split('T')[0]);
        setInterestRate(loan?.interestRate?.toString() || '');
        setInterestType(loan?.interestType || 'percentage');
        setExpectedReturnDate(loan?.expectedReturnDate || '');
        setNotes(loan?.notes || '');
        setIsModalOpen(true);
    };

    const handleDeleteLoan = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'lendedCash', id));
    };

    const sortedLendedCash = useMemo(() => {
        return [...loans].sort((a, b) => {
            if (a.expectedReturnDate && b.expectedReturnDate) {
                return new Date(a.expectedReturnDate).getTime() - new Date(b.expectedReturnDate).getTime();
            }
            if (a.expectedReturnDate) return -1;
            if (b.expectedReturnDate) return 1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [loans]);

    return (
        <div className="space-y-8">
            <SectionTitle extraContent={
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <PlusCircle size={20} /> {t('addLoan')}
                </button>
            }>
                {t('lendedCash')}
            </SectionTitle>
            
            {/* Mobile FAB */}
            <button onClick={() => openModal()} className="lg:hidden fixed bottom-6 right-6 bg-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-600 z-40">
                <PlusCircle size={24} />
            </button>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLoan ? `${t('edit')} ${t('lendedCash')}` : t('addLoan')}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="Receiver's Name" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" required />
                    <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount (INR)" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" required />
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" required />
                    <div className="flex gap-4">
                        <input value={interestRate} onChange={e => setInterestRate(e.target.value)} type="number" placeholder="Interest Rate" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-l-md w-full" />
                        <select value={interestType} onChange={e => setInterestType(e.target.value as 'percentage' | 'fixed')} className="bg-slate-300 dark:bg-slate-600 p-3 rounded-r-md">
                            <option value="percentage">%</option>
                            <option value="fixed">₹</option>
                        </select>
                    </div>
                    <input value={expectedReturnDate} onChange={e => setExpectedReturnDate(e.target.value)} type="date" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" />
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" />
                    <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 flex items-center justify-center gap-2 mt-4">
                        <PlusCircle /> {t('save')}
                    </button>
                </form>
            </Modal>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <ul className="space-y-4">
                    {sortedLendedCash.length > 0 ? sortedLendedCash.map(loan => (
                        <li key={loan.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                           <div className="mb-2 md:mb-0">
                                <p className="font-bold text-slate-900 dark:text-white">{loan.receiverName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Lended on: {new Date(loan.date).toLocaleDateString()}</p>
                                {loan.expectedReturnDate && <p className="text-sm text-amber-500 dark:text-amber-400">Return by: {new Date(loan.expectedReturnDate).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-center">
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-white">{formatFullInr(loan.amount)}</p>
                                    {loan.interestRate && loan.interestRate > 0 && (
                                        <p className="text-xs text-green-500">
                                            Interest: {loan.interestRate}{loan.interestType === 'percentage' ? '%' : ' ₹'}
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => openModal(loan)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteLoan(loan.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            You haven't logged any lended cash.
                        </p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default LendedCashManager;