'use client';
import React, {useState, useEffect, useRef} from 'react';
import type {FinancialAimCreate, FinancialAimUpdate, FinancialAim} from '@/types/financialAims';

type Props = {
    initial?: Partial<FinancialAim>;
    onCancel?: () => void;
    onSave: (payload: FinancialAimCreate | FinancialAimUpdate) => Promise<void>;
    savingLabel?: string;
};

export default function AimForm({initial = {}, onCancel, onSave, savingLabel = 'Save'}: Props) {
    const [title, setTitle] = useState(initial.title ?? '');
    const [description, setDescription] = useState(initial.description ?? '');
    const [targetAmount, setTargetAmount] = useState((initial.target_amount ?? 0).toString());
    const [currentAmount, setCurrentAmount] = useState((initial.current_amount ?? 0).toString());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Track if form has been initialized
    const initializedRef = useRef(false);

    useEffect(() => {
        // Only update if this is the first render or if initial.id changes (editing different item)
        if (!initializedRef.current || initial.id !== undefined) {
            setTitle(initial.title ?? '');
            setDescription(initial.description ?? '');
            setTargetAmount((initial.target_amount ?? 0).toString());
            setCurrentAmount((initial.current_amount ?? 0).toString());
            initializedRef.current = true;
        }
    }, [initial.id, initial.title, initial.description, initial.target_amount, initial.current_amount]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const payload: FinancialAimCreate | FinancialAimUpdate = {
            title,
            description,
            target_amount: Number(targetAmount || 0),
            current_amount: Number(currentAmount || 0),
        };

        try {
            setLoading(true);
            await onSave(payload);
        } catch (err: any) {
            setError(err?.body?.detail || err?.body || err?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    value={description ?? ''}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium">Target Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Current Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2"
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-100">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-persianGreen text-black disabled:opacity-60"
                >
                    {loading ? 'Saving...' : savingLabel}
                </button>
            </div>
        </form>
    );
}