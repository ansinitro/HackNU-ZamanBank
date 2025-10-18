'use client';
import React from 'react';
import type {FinancialAim} from '@/types/financialAims';

type Props = {
    aim: FinancialAim;
    onEdit: (a: FinancialAim) => void;
    onDelete: (id: number) => Promise<void>;
};

export default function AimItem({aim, onEdit, onDelete}: Props) {
    const progress = Math.min(100, Math.round((aim.current_amount / Math.max(1, aim.target_amount)) * 100));


    return (
        <div className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold">{aim.title}</h3>
                <p className="text-sm text-gray-600">{aim.description}</p>
                <div className="mt-2 text-sm">
                    <span className="font-medium">{aim.current_amount.toFixed(2)}</span>
                    {' / '}
                    <span className="text-gray-600">{aim.target_amount.toFixed(2)}</span>
                </div>
                <div className="mt-2 w-64 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{width: `${progress}%`, background: '#EEFE6D'}}/>
                </div>
            </div>


            <div className="flex flex-col gap-2">
                <button onClick={() => onEdit(aim)} className="px-3 py-1 rounded bg-gray-100">
                    Edit
                </button>
                <button
                    onClick={() => onDelete(aim.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}