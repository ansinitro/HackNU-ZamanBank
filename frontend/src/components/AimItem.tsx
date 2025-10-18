'use client';
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { FinancialAim } from '@/types/financialAims';

type Props = {
  aim: FinancialAim;
  onEdit: (a: FinancialAim) => void;
  onDelete: (id: number) => Promise<void>;
  onUpdate?: (a: FinancialAim) => void;
};

export default function AimItem({ aim, onEdit, onDelete, onUpdate }: Props) {
  const [currentAim, setCurrentAim] = useState(aim);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'increase' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // ✅ Determine completion but persist once reached
  const progress = Math.min(
    100,
    Math.round((currentAim.current_amount / Math.max(1, currentAim.target_amount)) * 100)
  );

  const isCompleted = currentAim.is_completed || progress >= 100;

  // ✅ Fetch updated aim info from backend
  async function refreshAim(id: number) {
    try {
      const res = await fetch(`http://localhost:8000/financial-aim/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch updated aim data');
      const updated = await res.json();
      // preserve completed status forever
      updated.is_completed = updated.is_completed || currentAim.is_completed || progress >= 100;
      setCurrentAim(updated);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      console.error('Error refreshing aim:', err);
    }
  }

  // ✅ Perform transaction (deposit / withdraw) with optimistic update
  async function handleTransaction(
    type: 'deposit' | 'withdrawal',
    amount: number
  ) {
    try {
      setLoading(true);

      // 🔥 Optimistic update
      setCurrentAim((prev) => {
        const updatedAmount =
          type === 'deposit'
            ? prev.current_amount + amount
            : Math.max(0, prev.current_amount - amount);

        // if it was completed once, never unmark it
        const completed = prev.is_completed || progress >= 100;

        return {
          ...prev,
          current_amount: updatedAmount,
          is_completed: completed,
        };
      });

      // ✅ Send transaction to backend
      const res = await fetch('http://localhost:8000/financial-transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aim_id: currentAim.id,
          transaction_type: type,
          amount,
        }),
      });

      if (res.ok) {
        await refreshAim(currentAim.id);
      } else {
        console.error(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowModal(false);
      setAmount('');
      setModalType(null);
    }
  }

  async function handleConfirm() {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (modalType === 'increase') {
      await handleTransaction('deposit', numAmount);
    } else if (modalType === 'withdraw') {
      await handleTransaction('withdrawal', numAmount);
    }
  }

  async function handleDeleteClick() {
    if (!confirm('Delete this aim?')) return;
    await onDelete(currentAim.id);
  }

  return (
    <div
      className={`bg-white p-4 rounded shadow relative transition-all ${
        isCompleted ? 'ring-2 ring-green-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {currentAim.title}
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle size={18} /> Completed 🎯
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">{currentAim.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(currentAim)}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">
            {currentAim.current_amount.toFixed(2)}
          </span>
          <span className="text-gray-600">
            {currentAim.target_amount.toFixed(2)}
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-yellow-400'
            }`}
            style={{ width: `${isCompleted ? 100 : progress}%` }}
          />
        </div>

        <div className="text-right text-xs text-gray-500 mt-1">
          {isCompleted ? '100%' : `${progress}%`}
        </div>
      </div>

      {/* If completed show withdrawable money */}
      {isCompleted && (
        <div className="mt-3 text-center text-sm text-green-700 font-medium">
          Available to withdraw: {currentAim.current_amount.toFixed(2)} 💰
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => {
            setModalType('withdraw');
            setShowModal(true);
          }}
          className="w-40 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          disabled={loading}
        >
          Withdraw
        </button>
        
        <button
          onClick={() => {
            setModalType('increase');
            setShowModal(true);
          }}
          className="w-40 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          disabled={loading || isCompleted} // cannot add more after complete
        >
          Closer To Goal
        </button>
      </div>

      {/* Amount Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-3">
              {modalType === 'increase' ? 'Add Amount' : 'Withdraw Amount'}
            </h2>

            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter amount"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setAmount('');
                }}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
