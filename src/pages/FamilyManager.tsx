import React, { useState, useEffect, useMemo } from 'react';
import { query, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { SectionTitle } from '../components/ui/Utils';
import { Modal } from '../components/ui/Modal';
import { PlusCircle, Pencil, Trash2, Users2, Building, UserPlus } from 'lucide-react';

const FamilyManager = ({ db, userId }: any) => {
    const { t } = useAppContext();
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [familyType, setFamilyType] = useState('Primary');

    useEffect(() => {
        if (!db || !userId) return;
        const q = query(collection(db, 'artifacts', 'folio-app', 'users', userId, 'family'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFamilyMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [db, userId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !relationship) return;
        const data = { name, relationship, familyType };
        if (editingMember) {
            await updateDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'family', editingMember.id), data);
        } else {
            await addDoc(collection(db, 'artifacts', 'folio-app', 'users', userId, 'family'), data);
        }
        setIsModalOpen(false);
    };

    const openModal = (member: any = null) => {
        setEditingMember(member);
        setName(member ? member.name : '');
        setRelationship(member ? member.relationship : '');
        setFamilyType(member ? member.familyType : 'Primary');
        setIsModalOpen(true);
    };

    const handleDeleteMember = async (id: string) => {
        await deleteDoc(doc(db, 'artifacts', 'folio-app', 'users', userId, 'family', id));
    };

    const primaryFamily = useMemo(() => familyMembers.filter(m => m.familyType === 'Primary'), [familyMembers]);
    const extendedFamily = useMemo(() => familyMembers.filter(m => m.familyType === 'Extended'), [familyMembers]);

    return (
        <div className="space-y-8">
            <SectionTitle extraContent={
                <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 flex items-center gap-2">
                    <UserPlus size={20} /> {t('addMember')}
                </button>
            }>
                {t('manageFamily')}
            </SectionTitle>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? `${t('edit')} Member` : t('addMember')}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" required />
                    <input value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="Relationship" className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md w-full" required />
                    <select value={familyType} onChange={e => setFamilyType(e.target.value)} className="bg-slate-100 dark:bg-slate-700 p-3 w-full rounded-md">
                        <option value="Primary">Primary Family</option>
                        <option value="Extended">Extended Family</option>
                    </select>
                    <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 flex items-center justify-center gap-2 mt-4">
                        <PlusCircle /> {t('save')}
                    </button>
                </form>
            </Modal>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Users2 /> Primary Family</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg"><ul className="space-y-4">{primaryFamily.length > 0 ? primaryFamily.map(m => <li key={m.id} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg"><div><p className="font-bold text-slate-900 dark:text-white">{m.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{m.relationship}</p></div><div className="flex gap-2"><button onClick={() => openModal(m)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button><button onClick={() => handleDeleteMember(m.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16}/></button></div></li>) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No primary family members added.</p>}</ul></div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Building /> Extended Family</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl shadow-lg"><ul className="space-y-4">{extendedFamily.length > 0 ? extendedFamily.map(m => <li key={m.id} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-700/50 p-4 rounded-lg"><div><p className="font-bold text-slate-900 dark:text-white">{m.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{m.relationship}</p></div><div className="flex gap-2"><button onClick={() => openModal(m)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"><Pencil size={16} /></button><button onClick={() => handleDeleteMember(m.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 size={16}/></button></div></li>) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No extended family members added.</p>}</ul></div>
                </div>
            </div>
        </div>
    );
};

export default FamilyManager;