import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PlusCircle } from 'lucide-react';

interface Allocation {
    memberId: string;
    memberName: string;
    percentage: number;
}

export const AssetLiabilityForm = ({ onSave, familyMembers, itemType, initialData, closeModal }: any) => {
    const { t } = useAppContext();
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState('');
    const [ownershipType, setOwnershipType] = useState('sole');
    const [allocations, setAllocations] = useState<Allocation[]>([{ memberId: 'self', memberName: 'Self', percentage: 100 }]);

    const categories = itemType === 'Asset' ? ['Cash', 'Real Estate', 'Stocks', 'Vehicle', 'Other'] : ['Mortgage', 'Car Loan', 'Credit Card', 'Student Loan', 'Other Liability'];

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setValue(initialData.value || '');
            setCategory(initialData.category || '');
            setOwnershipType(initialData.ownership?.type || 'sole');
            setAllocations(initialData.ownership?.allocations || [{ memberId: 'self', memberName: 'Self', percentage: 100 }]);
        } else {
             setName('');
             setValue('');
             setCategory('');
             setOwnershipType('sole');
             setAllocations([{ memberId: 'self', memberName: 'Self', percentage: 100 }]);
        }
    }, [initialData]);

    const handleAllocationChange = (memberId: string, fieldValue: string) => {
        const newAllocations = [...allocations];
        const existingIndex = newAllocations.findIndex(a => a.memberId === memberId);
        if (existingIndex !== -1) {
            newAllocations[existingIndex].percentage = parseFloat(fieldValue) || 0;
        }
        setAllocations(newAllocations);
    };

    const totalPercentage = useMemo(() => allocations.reduce((sum, a) => sum + a.percentage, 0), [allocations]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !value || !category) {
            alert("Please fill all required fields.");
            return;
        }
        if (ownershipType === 'partial' && totalPercentage !== 100) {
            alert("Ownership percentages must add up to 100%.");
            return;
        }
        const ownership = {
            type: ownershipType,
            allocations: ownershipType === 'sole'
                ? [{ memberId: 'self', memberName: 'Self', percentage: 100 }]
                : allocations.map(a => ({ ...a, percentage: a.percentage }))
        };
        const itemData = { name, value: parseFloat(value), category, ownership };
        onSave(itemData);
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder={t('name')} className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md w-full" required/>
                <input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder={`${t('value')} (INR)`} className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md w-full" required/>
                <select value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md h-[40px]" required>
                    <option value="" disabled>Select {t('category')}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="text-slate-500 dark:text-slate-400 mb-2 block">{t('ownershipType')}</label>
                <div className="flex gap-4">
                    <button type="button" onClick={() => setOwnershipType('sole')} className={`py-2 px-4 rounded-md w-full ${ownershipType === 'sole' ? 'bg-cyan-600 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>{t('soleOwnership')}</button>
                    <button type="button" onClick={() => setOwnershipType('partial')} className={`py-2 px-4 rounded-md w-full ${ownershipType === 'partial' ? 'bg-cyan-600 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>{t('partialOwnership')}</button>
                </div>
            </div>
            {ownershipType === 'partial' && (
                <div className="space-y-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{t('allocateOwnership')}</h4>
                    <div className="space-y-2">
                        {[ { id: 'self', name: t('self') }, ...familyMembers ].map((member: any) => {
                            const allocation = allocations.find(a => a.memberId === member.id);
                            const isChecked = !!allocation;
                            return (
                                <div key={member.id} className="grid grid-cols-3 items-center gap-4">
                                    <div className="col-span-2 flex items-center">
                                        <input type="checkbox" id={`cb-${member.id}`} checked={isChecked} onChange={e => handleAllocationChange(member.id, e.target.checked ? '100' : '0')} className="mr-3 h-4 w-4 rounded bg-slate-300 dark:bg-slate-600 text-cyan-500 focus:ring-cyan-600 border-slate-400 dark:border-slate-500" />
                                        <label htmlFor={`cb-${member.id}`} className="text-slate-900 dark:text-white">{member.name}</label>
                                    </div>
                                    {isChecked && <input value={allocation.percentage} onChange={e => handleAllocationChange(member.id, e.target.value)} type="number" placeholder="%" className="bg-slate-300 dark:bg-slate-600 p-2 rounded-md w-full text-center" />}
                                </div>
                            );
                        })}
                    </div>
                    <div className={`text-right font-bold pr-2 ${totalPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
                        {t('total')}: {totalPercentage}%
                    </div>
                </div>
            )}
            <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-600 flex items-center justify-center gap-2 mt-4">
                <PlusCircle /> {t('save')} {t(itemType.toLowerCase())}
            </button>
        </form>
    );
};