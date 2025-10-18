'use client';
import React, {JSX, useEffect, useState} from 'react';
import AimForm from './AimForm';
import AimItem from './AimItem';
import type {FinancialAim, FinancialAimCreate, FinancialAimUpdate} from '@/types/financialAims';
import * as api from '../lib/financialAimsApi';

export default function AimList(): JSX.Element {
    const [aims, setAims] = useState<FinancialAim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<FinancialAim | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.fetchAims()
            .then((data) => mounted && setAims(data))
            .catch((err) => {
                if (mounted) {
                    // Properly extract error message
                    const errorMsg = typeof err?.body === 'string'
                        ? err.body
                        : err?.body?.detail
                        || err?.message
                        || JSON.stringify(err?.body)
                        || 'Failed to load aims';
                    setError(errorMsg);
                }
            })
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, []);

    async function handleCreate(payload: FinancialAimCreate) {
        try {
            const created = await api.createAim(payload);
            setAims((s) => [created, ...s]);
            setCreating(false);
        } catch (err: any) {
            // Let AimForm handle the error
            throw err;
        }
    }

    async function handleUpdate(payload: FinancialAimUpdate) {
        if (!editing) return;
        try {
            const updated = await api.updateAim(editing.id, payload);
            setAims((s) => s.map((a) => (a.id === updated.id ? updated : a)));
            setEditing(null);
        } catch (err: any) {
            // Let AimForm handle the error
            throw err;
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this aim?')) return;
        try {
            await api.deleteAim(id);
            setAims((s) => s.filter((a) => a.id !== id));
        } catch (err: any) {
            const errorMsg = typeof err?.body === 'string'
                ? err.body
                : err?.body?.detail
                || err?.message
                || 'Failed to delete aim';
            alert(`Error: ${errorMsg}`);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Personal Aims</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCreating((s) => !s)}
                        className="px-4 py-2 rounded bg-black    text-white"
                    >
                        {creating ? 'Close' : 'Create Aim'}
                    </button>
                </div>
            </div>

            {creating && (
                <AimForm
                    onCancel={() => setCreating(false)}
                    onSave={handleCreate}
                    savingLabel="Create"
                />
            )}

            {editing && (
                <AimForm
                    initial={editing}
                    onCancel={() => setEditing(null)}
                    onSave={handleUpdate}
                    savingLabel="Update"
                />
            )}

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}

            <div className="grid gap-4">
                {aims.length === 0 && !loading ? (
                    <div className="text-gray-600">No aims yet. Create your first financial aim.</div>
                ) : (
                    aims.map((a) => (
                        <AimItem key={a.id} aim={a} onEdit={(aim) => setEditing(aim)} onDelete={handleDelete}/>
                    ))
                )}
            </div>
        </div>
    );
}