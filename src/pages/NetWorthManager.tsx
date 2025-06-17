import { useState, useEffect, useMemo } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../contexts/AppContext';
import { SectionTitle, formatFullInr, CATEGORY_COLORS } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { AssetLiabilityForm } from '../components/forms/AssetLiabilityForm';
import { AccordionItem } from '../components/ui/AccordionItem';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ReferenceLine } from 'recharts';

const NetWorthManager = ({ db, userId, familyMembers }: any) => {
    const { t } = useAppContext();
    const [assets, setAssets] = useState<any[]>([]);
    const [liabilities, setLiabilities] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [modalType, setModalType] = useState<'Asset' | 'Liability'>('Asset');

    useEffect(() => {
        if (!db || !userId) return;
        const assetUnsub = onSnapshot(query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'assets')), snap => {
            setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const liabilityUnsub = onSnapshot(query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'liabilities')), snap => {
            setLiabilities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => { assetUnsub(); liabilityUnsub(); };
    }, [db, userId]);

    const handleSave = async (itemData: any) => {
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

    const openModal = (item: any = null, type: 'Asset' | 'Liability') => {
        setEditingItem(item);
        setModalType(type);
        setIsModalOpen(true);
    };

    const { groupedAssets, groupedLiabilities, chartData, maxAbsValue } = useMemo(() => {
        const assetsData = assets.reduce((acc, asset) => {
            const category = asset.category || 'Other';
            if (!acc[category]) acc[category] = { items: [], total: 0 };
            acc[category].items.push(asset);
            acc[category].total += asset.value;
            return acc;
        }, {} as { [key: string]: { items: any[], total: number } });

        const liabilitiesData = liabilities.reduce((acc, liability) => {
            const category = liability.category || 'Other Liability';
            if (!acc[category]) acc[category] = { items: [], total: 0 };
            acc[category].items.push(liability);
            acc[category].total += liability.value;
            return acc;
        }, {} as { [key: string]: { items: any[], total: number } });
        
        const dataPoint: any = { name: 'Composition' };
        Object.entries(assetsData).forEach(([category, data]) => dataPoint[category] = data.total);
        Object.entries(liabilitiesData).forEach(([category, data]) => dataPoint[category] = -data.total);

        const totalAssets = Object.values(assetsData).reduce((sum, cat) => sum + cat.total, 0);
        const totalLiabilities = Object.values(liabilitiesData).reduce((sum, cat) => sum + cat.total, 0);

        return { 
            groupedAssets: assetsData, 
            groupedLiabilities: liabilitiesData, 
            chartData: [dataPoint],
            maxAbsValue: Math.max(totalAssets, totalLiabilities) * 1.1 // Add 10% padding
        };
    }, [assets, liabilities]);
    
    const allCategories = useMemo(() => [...Object.keys(groupedAssets), ...Object.keys(groupedLiabilities)], [groupedAssets, groupedLiabilities]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          const data = payload[0];
          return (
            <div className="bg-slate-700 text-white p-2 rounded-md shadow-lg opacity-90">
              <p className="font-bold">{`${data.name}: ${formatFullInr(Math.abs(data.value))}`}</p>
            </div>
          );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <SectionTitle>Assets & Liabilities</SectionTitle>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingItem ? t('edit') : t('addNew')} ${t(modalType.toLowerCase())}`}>
                <AssetLiabilityForm onSave={handleSave} familyMembers={familyMembers} itemType={modalType} initialData={editingItem} closeModal={() => setIsModalOpen(false)}/>
            </Modal>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4">Net Worth Composition</h3>
                <ResponsiveContainer width="100%" height={150 + allCategories.length * 30}>
                    <BarChart layout="vertical" data={chartData} stackOffset="sign" margin={{ top: 20, right: 120, left: 20, bottom: 20 }}>
                        <XAxis type="number" hide domain={[-maxAbsValue, maxAbsValue]} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                        <ReferenceLine x={0} strokeWidth={2} stroke="#64748b" label={{ value: 'Net Worth', position: 'insideTop', fill: '#64748b' }} />
                        {allCategories.map(cat => (
                            <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat] || '#8884d8'} minPointSize={25}>
                                <LabelList 
                                    dataKey={cat} 
                                    position="right" 
                                    formatter={(value: number) => value !== 0 ? cat : ''} 
                                    style={{ fill: '#9ca3af', fontWeight: '500' }}
                                />
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-green-500 dark:text-green-400">Assets</h3>
                        <button onClick={() => openModal(null, 'Asset')} className="bg-green-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 flex items-center gap-2 text-sm"><PlusCircle size={16} /> Add Asset</button>
                    </div>
                    <div className="space-y-4">
                         {Object.keys(groupedAssets).length > 0 ? Object.entries(groupedAssets).map(([category, data]) => (
                            <AccordionItem key={category} color={CATEGORY_COLORS[category] || '#34d399'} titleContent={<div className="flex justify-between w-full"><span>{category}</span><span className="font-normal text-slate-500 dark:text-slate-400">{formatFullInr(data.total)}</span></div>}>
                                <ul className="space-y-3">{data.items.map((item: any) => (<li key={item.id} className="flex justify-between items-center"><span className="text-slate-700 dark:text-slate-300">{item.name}</span><div className="flex items-center gap-2"><span className="font-semibold">{formatFullInr(item.value)}</span><button onClick={() => openModal(item, 'Asset')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"><Pencil size={16}/></button><button onClick={() => handleDelete(item.id, 'Asset')} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={16}/></button></div></li>))}</ul>
                            </AccordionItem>
                        )) : <p className="text-center text-slate-500 py-4">No assets added yet.</p>}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-red-500 dark:text-red-400">Liabilities</h3>
                        <button onClick={() => openModal(null, 'Liability')} className="bg-red-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm"><PlusCircle size={16} /> Add Liability</button>
                    </div>
                    <div className="space-y-4">
                         {Object.keys(groupedLiabilities).length > 0 ? Object.entries(groupedLiabilities).map(([category, data]) => (
                            <AccordionItem key={category} color={CATEGORY_COLORS[category] || '#f87171'} titleContent={<div className="flex justify-between w-full"><span>{category}</span><span className="font-normal text-slate-500 dark:text-slate-400">{formatFullInr(data.total)}</span></div>}>
                                 <ul className="space-y-3">{data.items.map((item: any) => (<li key={item.id} className="flex justify-between items-center"><span className="text-slate-700 dark:text-slate-300">{item.name}</span><div className="flex items-center gap-2"><span>{formatFullInr(item.value)}</span><button onClick={() => openModal(item, 'Liability')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"><Pencil size={16}/></button><button onClick={() => handleDelete(item.id, 'Liability')} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={16}/></button></div></li>))}</ul>
                            </AccordionItem>
                        )) : <p className="text-center text-slate-500 py-4">No liabilities added yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetWorthManager;