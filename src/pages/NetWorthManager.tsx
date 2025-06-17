import { useState, useEffect, useMemo } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../contexts/AppContext';
import { SectionTitle, formatFullInr, CATEGORY_COLORS } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { AssetLiabilityForm } from '../components/forms/AssetLiabilityForm';
import { AccordionItem } from '../components/ui/AccordionItem';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface AssetItem {
    id: string;
    name: string;
    value: number;
    category: string;
    date: string;
    ownership?: string;
}

interface LiabilityItem {
    id: string;
    name: string;
    value: number;
    category: string;
    date: string;
    ownership?: string;
}

interface CategoryData {
    items: (AssetItem | LiabilityItem)[];
    total: number;
}

interface ChartDataPoint {
    name: string;
    [key: string]: string | number;
}

const NetWorthManager = ({ db, userId, familyMembers }: any) => {
    const { t } = useAppContext();
    const [assets, setAssets] = useState<AssetItem[]>([]);
    const [liabilities, setLiabilities] = useState<LiabilityItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AssetItem | LiabilityItem | null>(null);
    const [modalType, setModalType] = useState<'Asset' | 'Liability'>('Asset');

    useEffect(() => {
        if (!db || !userId) return;
        const assetUnsub = onSnapshot(query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'assets')), snap => {
            setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AssetItem[]);
        });
        const liabilityUnsub = onSnapshot(query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'liabilities')), snap => {
            setLiabilities(snap.docs.map(d => ({ id: d.id, ...d.data() })) as LiabilityItem[]);
        });
        return () => { assetUnsub(); liabilityUnsub(); };
    }, [db, userId]);

    const handleSave = async (itemData: Partial<AssetItem | LiabilityItem>) => {
        const collectionName = modalType === 'Asset' ? 'assets' : 'liabilities';
        if (editingItem) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, collectionName, editingItem.id), itemData);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, collectionName), itemData);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = async (id: string, type: 'Asset' | 'Liability') => {
        const collectionName = type === 'Asset' ? 'assets' : 'liabilities';
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, collectionName, id));
    };

    const openModal = (item: AssetItem | LiabilityItem | null = null, type: 'Asset' | 'Liability') => {
        setEditingItem(item);
        setModalType(type);
        setIsModalOpen(true);
    };

    const { groupedAssets, groupedLiabilities } = useMemo(() => {
        const assetsData = assets.reduce((acc, asset) => {
            const category = asset.category || 'Other';
            if (!acc[category]) acc[category] = { items: [], total: 0 };
            acc[category].items.push(asset);
            acc[category].total += asset.value;
            return acc;
        }, {} as { [key: string]: CategoryData });

        const liabilitiesData = liabilities.reduce((acc, liability) => {
            const category = liability.category || 'Other Liability';
            if (!acc[category]) acc[category] = { items: [], total: 0 };
            acc[category].items.push(liability);
            acc[category].total += liability.value;
            return acc;
        }, {} as { [key: string]: CategoryData });
        
        const assetCats = Object.keys(assetsData);
        const liabilityCats = Object.keys(liabilitiesData);
        const allCats = Array.from(new Set([...assetCats, ...liabilityCats]));

        // Two data points: one for assets, one for liabilities
        const assetDataPoint: ChartDataPoint = { name: 'Assets' };
        assetCats.forEach(cat => assetDataPoint[cat] = assetsData[cat].total);
        const liabilityDataPoint: ChartDataPoint = { name: 'Liabilities' };
        liabilityCats.forEach(cat => liabilityDataPoint[cat] = -liabilitiesData[cat].total);

        // For y-axis domain
        const maxA = Math.max(0, ...assetCats.map(cat => assetsData[cat].total));
        const maxL = Math.max(0, ...liabilityCats.map(cat => liabilitiesData[cat].total));
        const maxAbs = Math.max(maxA, maxL) * 1.1;

        return {
            groupedAssets: assetsData,
            groupedLiabilities: liabilitiesData,
            allCategories: allCats,
            chartData: [assetDataPoint, liabilityDataPoint],
            maxAbsValue: maxAbs
        };
    }, [assets, liabilities]);

    return (
        <div className="space-y-8">
            <SectionTitle>Assets & Liabilities</SectionTitle>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingItem ? t('edit') : t('addNew')} ${t(modalType.toLowerCase())}`}>
                <AssetLiabilityForm onSave={handleSave} familyMembers={familyMembers} itemType={modalType} initialData={editingItem} closeModal={() => setIsModalOpen(false)}/>
            </Modal>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Lists Section */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Assets List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-green-500 dark:text-green-400">Assets</h3>
                            <button onClick={() => openModal(null, 'Asset')} className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"><PlusCircle size={16} /> Add Asset</button>
                        </div>
                        <div className="space-y-4">
                            {Object.keys(groupedAssets).length > 0 ? Object.entries(groupedAssets).map(([category, data]) => (
                                <AccordionItem 
                                    key={category} 
                                    color={CATEGORY_COLORS[category] || '#34d399'}
                                    titleContent={
                                        <div className="flex justify-between w-full">
                                            <span>{category}</span>
                                            <span className="font-normal text-slate-500 dark:text-slate-400">{formatFullInr(data.total)}</span>
                                        </div>
                                    }
                                    defaultOpen={true}
                                >
                                    <ul className="space-y-3">{data.items.map((item: AssetItem) => (<li key={item.id} className="flex justify-between items-center"><span className="text-slate-700 dark:text-slate-300">{item.name}</span><div className="flex items-center gap-2"><span className="font-semibold">{formatFullInr(item.value)}</span><button onClick={() => openModal(item, 'Asset')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"><Pencil size={16}/></button><button onClick={() => handleDelete(item.id, 'Asset')} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={16}/></button></div></li>))}</ul>
                                </AccordionItem>
                            )) : <p className="text-center text-slate-500 py-4">No assets added yet.</p>}
                        </div>
                    </div>
                    {/* Liabilities List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-red-500 dark:text-red-400">Liabilities</h3>
                            <button onClick={() => openModal(null, 'Liability')} className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"><PlusCircle size={16} /> Add Liability</button>
                        </div>
                        <div className="space-y-4">
                            {Object.keys(groupedLiabilities).length > 0 ? Object.entries(groupedLiabilities).map(([category, data]) => (
                                <AccordionItem 
                                    key={category} 
                                    color={CATEGORY_COLORS[category] || '#f87171'}
                                    titleContent={
                                        <div className="flex justify-between w-full">
                                            <span>{category}</span>
                                            <span className="font-normal text-slate-500 dark:text-slate-400">{formatFullInr(data.total)}</span>
                                        </div>
                                    }
                                    defaultOpen={true}
                                >
                                    <ul className="space-y-3">{data.items.map((item: LiabilityItem) => (<li key={item.id} className="flex justify-between items-center"><span className="text-slate-700 dark:text-slate-300">{item.name}</span><div className="flex items-center gap-2"><span>{formatFullInr(item.value)}</span><button onClick={() => openModal(item, 'Liability')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"><Pencil size={16}/></button><button onClick={() => handleDelete(item.id, 'Liability')} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={16}/></button></div></li>))}</ul>
                                </AccordionItem>
                            )) : <p className="text-center text-slate-500 py-4">No liabilities added yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetWorthManager;