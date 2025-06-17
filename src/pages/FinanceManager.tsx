import { useState, useEffect, useCallback, useMemo } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle, formatFullInr } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { AssetLiabilityForm } from '../components/forms/AssetLiabilityForm';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface FinanceItem {
    id: string;
    value: number;
    name: string;
    category: string;
    date: string;
    ownership?: {
        type: string;
        allocations: Array<{
            memberId: string;
            memberName: string;
            percentage: number;
        }>;
    };
}

export const FinanceManager = ({ db, userId, itemType, collectionName, familyMembers }: any) => {
    const { t } = useAppContext();
    const [data, setData] = useState<FinanceItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    useEffect(() => {
        if (!db || !userId) return;
        const q = query(collection(db, 'artifacts', 'folio-app', 'users', userId, collectionName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FinanceItem[];
            setData(items);
        });
        return () => unsubscribe();
    }, [db, userId, collectionName]);

    const handleSave = async (itemData: any) => {
        if (editingItem) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, collectionName, editingItem.id), itemData);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, collectionName), itemData);
        }
        setIsModalOpen(false);
    };

    const openModal = (item: any = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = useCallback(async (itemId: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, collectionName, itemId));
    }, [db, userId, collectionName]);

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    return (
        <div className="space-y-8">
            <SectionTitle
                extraContent={
                    <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                        <PlusCircle size={20} /> {t('add')} {t(itemType === 'Asset' ? 'assets' : 'liabilities')}
                    </button>
                }
            >
                {t(itemType === 'Asset' ? 'myAssets' : 'myLiabilities')}
            </SectionTitle>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingItem ? t('edit') : t('addNew')} ${t(itemType.toLowerCase())}`}>
                <AssetLiabilityForm
                    onSave={handleSave}
                    familyMembers={familyMembers}
                    itemType={itemType}
                    initialData={editingItem}
                    closeModal={() => setIsModalOpen(false)}
                />
            </Modal>

            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <ul className="space-y-4">
                    {sortedData.length > 0 ? sortedData.map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <div>
                                <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-slate-500 dark:text-slate-400 block">{item.category}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.ownership?.type === 'sole' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                        {item.ownership?.type === 'sole' ? t('soleOwnership') : t('partialOwnership')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">{formatFullInr(item.value)}</span>
                                <button onClick={() => openModal(item)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            No {itemType.toLowerCase()}s added yet.
                        </p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default FinanceManager;