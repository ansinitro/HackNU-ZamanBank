'use client';
import React, { JSX, useEffect, useState } from 'react';
import AimForm from './AimForm';
import AimItem from './AimItem';
import type {
  FinancialAim,
  FinancialAimCreate,
  FinancialAimUpdate,
} from '@/types/financialAims';
import * as api from '../lib/financialAimsApi';

export default function AimList(): JSX.Element {
  // 🎨 Define Zaman brand colors locally
  const zamanColors = {
    persianGreen: '#2D9A86',
    solar: '#EEFE6D',
    cloud: '#FFFFFF',
    black: '#111111',
    gray: '#B0B0B0',
  };

  // 🧠 React states
  const [aims, setAims] = useState<FinancialAim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FinancialAim | null>(null);
  const [creating, setCreating] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);

  // 🔽 collapsible sections
  const [showInProgress, setShowInProgress] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // 🟢 Load aims
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .fetchAims()
      .then((data) => mounted && setAims(data))
      .catch((err) => {
        if (mounted) {
          const errorMsg =
            typeof err?.body === 'string'
              ? err.body
              : err?.body?.detail ||
                err?.message ||
                JSON.stringify(err?.body) ||
                'Failed to load aims';
          setError(errorMsg);
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // 💬 Fetch motivation only once
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
    if (!token) return;

    fetch('http://localhost:8000/chat/motivation', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.motivation) setMotivation(data.motivation);
      })
      .catch((err) => console.error('Motivation fetch error:', err));
  }, []);

  // 🟣 Create
  async function handleCreate(payload: FinancialAimCreate) {
    try {
      const created = await api.createAim(payload);
      setAims((s) => [created, ...s]);
      setCreating(false);
    } catch (err: any) {
      console.error('Create error:', err);
    }
  }

  // 🟠 Update
  async function handleUpdate(payload: FinancialAimUpdate) {
    if (!editing) return;
    try {
      const updated = await api.updateAim(editing.id, payload);
      setAims((s) => s.map((a) => (a.id === updated.id ? updated : a)));
      setEditing(null);
    } catch (err: any) {
      console.error('Update error:', err);
    }
  }

  // 🔴 Delete
  async function handleDelete(id: number) {
    if (!confirm('Delete this aim?')) return;
    try {
      await api.deleteAim(id);
      setAims((s) => s.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
    }
  }

  // 🟢 Withdraw or Close Goal — updates instantly
  async function handleAction(
    id: number,
    type: 'withdraw' | 'close',
    amount?: number
  ) {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/financial-transaction/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aim_id: id,
          transaction_type: type,
          amount: amount ?? 0,
        }),
      });

      if (!res.ok) throw new Error('Transaction failed');

      // 🧠 Fetch updated aim immediately
      const updated = await fetch(`http://localhost:8000/financial-aim/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      setAims((s) => s.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Transaction error:', err);
    }
  }

  // ✳️ Split aims
  const inProgressAims = aims.filter((a) => !a.is_completed);
  const completedAims = aims.filter((a) => a.is_completed);

  // 💅 CSS vars for local color use
  const colorVars = {
    '--persianGreen': zamanColors.persianGreen,
    '--solar': zamanColors.solar,
    '--cloud': zamanColors.cloud,
    '--black': zamanColors.black,
    '--gray': zamanColors.gray,
  } as React.CSSProperties;

  return (
    <div className="space-y-6" style={colorVars}>
      {/* 🌟 Motivation */}
      {motivation && (
        <div
          className="p-4 rounded-lg border shadow-sm text-sm font-medium"
          style={{
            background: `linear-gradient(to right, var(--persianGreen), var(--solar), var(--cloud))`,
            borderColor: 'var(--persianGreen)',
            color: 'var(--black)',
          }}
        >
          💡 {motivation}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--black)' }}>
          Personal Aims
        </h2>
        <button
          onClick={() => setCreating((s) => !s)}
          className="px-4 py-2 rounded-lg text-white shadow transition"
          style={{
            backgroundColor: 'var(--persianGreen)',
          }}
        >
          {creating ? 'Close' : 'Create Aim'}
        </button>
      </div>

      {/* Forms */}
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

      {/* Loading / Error */}
      {loading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* 🎯 In Progress */}
      <div
        className="border rounded-lg shadow-sm overflow-hidden"
        style={{ borderColor: 'var(--gray)' }}
      >
        <button
          onClick={() => setShowInProgress((s) => !s)}
          className="w-full flex justify-between items-center px-4 py-2 transition"
          style={{
            backgroundColor: 'rgba(238, 254, 109, 0.4)',
            color: 'var(--black)',
          }}
        >
          <span className="font-semibold">
            🎯 In Progress ({inProgressAims.length})
          </span>
          <span>{showInProgress ? '▲' : '▼'}</span>
        </button>

        {showInProgress && (
          <div className="p-4 grid gap-3">
            {inProgressAims.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--gray)' }}>
                No active aims yet.
              </div>
            ) : (
              inProgressAims.map((a) => (
                <AimItem
                  key={a.id}
                  aim={a}
                  onEdit={(aim) => setEditing(aim)}
                  onDelete={handleDelete}
                  onAction={handleAction}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ✅ Completed */}
      <div
        className="border rounded-lg shadow-sm overflow-hidden"
        style={{ borderColor: 'var(--gray)' }}
      >
        <button
          onClick={() => setShowCompleted((s) => !s)}
          className="w-full flex justify-between items-center px-4 py-2 transition"
          style={{
            backgroundColor: 'rgba(45, 154, 134, 0.25)',
            color: 'var(--black)',
          }}
        >
          <span className="font-semibold">
            ✅ Completed ({completedAims.length})
          </span>
          <span>{showCompleted ? '▲' : '▼'}</span>
        </button>

        {showCompleted && (
          <div className="p-4 grid gap-3">
            {completedAims.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--gray)' }}>
                No completed aims yet.
              </div>
            ) : (
              completedAims.map((a) => (
                <AimItem
                  key={a.id}
                  aim={a}
                  onEdit={(aim) => setEditing(aim)}
                  onDelete={handleDelete}
                  onAction={handleAction}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
