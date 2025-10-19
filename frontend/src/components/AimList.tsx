'use client';
import React, { JSX, useEffect, useState } from 'react';
import AimForm from './AimForm';
import AimItem from './AimItem';
import type { FinancialAim, FinancialAimCreate, FinancialAimUpdate } from '@/types/financialAims';
import * as api from '../lib/financialAimsApi';

// 🎨 ZAMAN COLOR DNA
const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

export default function AimList(): JSX.Element {
  const [aims, setAims] = useState<FinancialAim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FinancialAim | null>(null);
  const [creating, setCreating] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);

  const [showInProgress, setShowInProgress] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // Load aims
  useEffect(() => {
    let mounted = true;
    
    const loadAims = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.fetchAims();
        if (mounted) {
          setAims(data);
        }
      } catch (err: any) {
        if (mounted) {
          const errorMsg =
            typeof err?.body === 'string'
              ? err.body
              : err?.body?.detail ||
                err?.message ||
                JSON.stringify(err?.body) ||
                'Failed to load aims. Please check your connection.';
          setError(errorMsg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAims();

    return () => {
      mounted = false;
    };
  }, []);

  // Load motivation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const loadMotivation = async () => {
      try {
        const res = await fetch('http://localhost:8000/chat/motivation', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data?.motivation) {
            setMotivation(data.motivation);
          }
        }
      } catch (err) {
        console.error('Motivation fetch error:', err);
        // Don't show error to user - motivation is optional
      }
    };

    loadMotivation();
  }, []);

  async function handleCreate(payload: FinancialAimCreate) {
    try {
      const created = await api.createAim(payload);
      setAims((prev) => [created, ...prev]);
      setCreating(false);
    } catch (err: any) {
      console.error('Create error:', err);
      alert('Failed to create aim. Please try again.');
    }
  }

  async function handleUpdate(payload: FinancialAimUpdate) {
    if (!editing) return;
    
    try {
      const updated = await api.updateAim(editing.id, payload);
      setAims((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditing(null);
    } catch (err: any) {
      console.error('Update error:', err);
      alert('Failed to update aim. Please try again.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteAim(id);
      setAims((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error('Delete error:', err);
      throw err; // Re-throw so AimItem can handle it
    }
  }

  async function handleAction(id: number, type: 'withdrawal' | 'deposit', amount?: number) {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch('http://localhost:8000/financial-transaction/', {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Transaction failed');
      }

      // Fetch updated aim
      const updatedRes = await fetch(`http://localhost:8000/financial-aims/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (updatedRes.ok) {
        const updated = await updatedRes.json();
        setAims((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
    } catch (err: any) {
      console.error('Transaction error:', err);
      throw err; // Re-throw so AimItem can handle it
    }
  }

  const inProgressAims = aims.filter((a) => !a.is_completed);
  const completedAims = aims.filter((a) => a.is_completed);

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Motivation Banner */}
      {motivation && (
        <div
          className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 shadow-lg text-sm sm:text-base font-medium backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.LightTeal}30)`,
            borderColor: ZamanColors.PersianGreen,
            color: ZamanColors.DarkTeal,
          }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">💡</span>
            <p className="flex-1 leading-relaxed text-sm sm:text-base">{motivation}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <h2 
          className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
          }}
        >
          Personal Aims
        </h2>
        <button
          onClick={() => setCreating((prev) => !prev)}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
          style={{
            backgroundColor: creating ? ZamanColors.Cloud : ZamanColors.Solar,
            color: ZamanColors.PersianGreen,
            border: `2px solid ${ZamanColors.PersianGreen}`,
          }}
        >
          {creating ? '✕ Cancel' : '+ Create Aim'}
        </button>
      </div>

      {/* Forms */}
      {creating && (
        <div style={{ animation: 'fade-in 0.3s ease-out' }}>
          <AimForm
            onCancel={() => setCreating(false)}
            onSave={handleCreate}
            savingLabel="Create"
          />
        </div>
      )}

      {editing && (
        <div style={{ animation: 'fade-in 0.3s ease-out' }}>
          <AimForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={handleUpdate}
            savingLabel="Update"
          />
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div 
          className="flex items-center justify-center p-6 sm:p-8 rounded-xl sm:rounded-2xl"
          style={{ backgroundColor: `${ZamanColors.LightTeal}30` }}
        >
          <div 
            className="rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-t-transparent" 
            style={{ 
              borderColor: ZamanColors.PersianGreen,
              animation: 'spin 1s linear infinite',
            }}
          />
          <span className="ml-2 sm:ml-3 text-sm sm:text-base font-medium" style={{ color: ZamanColors.PersianGreen }}>
            Loading aims...
          </span>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-red-400 bg-red-50 text-red-700 font-medium">
          <div className="flex items-start gap-2">
            <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1 text-sm sm:text-base">Error Loading Aims</p>
              <p className="text-xs sm:text-sm break-words">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show sections only if not loading and no error */}
      {!loading && !error && (
        <>
          {/* In Progress Section */}
          <div
            className="border-2 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            style={{ 
              borderColor: ZamanColors.PersianGreen,
              backgroundColor: 'transparent',
            }}
          >
            <button
              onClick={() => setShowInProgress((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-300 hover:brightness-95"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                color: ZamanColors.Cloud,
              }}
            >
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🎯</span>
                <span className="truncate">
                  In Progress 
                  <span className="hidden xs:inline"> ({inProgressAims.length})</span>
                  <span className="xs:hidden text-sm ml-1">({inProgressAims.length})</span>
                </span>
              </span>
              <span 
                className="text-xl sm:text-2xl transition-transform duration-300 flex-shrink-0" 
                style={{ transform: showInProgress ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </button>
            {showInProgress && (
              <div className="p-3 sm:p-6 grid gap-3 sm:gap-4" style={{ backgroundColor: `${ZamanColors.Cloud}95` }}>
                {inProgressAims.length === 0 ? (
                  <div 
                    className="text-center py-6 sm:py-8 rounded-lg sm:rounded-xl px-4"
                    style={{ 
                      backgroundColor: `${ZamanColors.Solar}20`,
                      color: ZamanColors.PersianGreen,
                    }}
                  >
                    <p className="text-base sm:text-lg font-medium">No active aims yet.</p>
                    <p className="text-xs sm:text-sm mt-2 opacity-75">Create your first financial goal to get started!</p>
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

          {/* Completed Section */}
          <div
            className="border-2 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            style={{ 
              borderColor: ZamanColors.Solar,
              backgroundColor: 'transparent',
            }}
          >
            <button
              onClick={() => setShowCompleted((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-300 hover:brightness-95"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
                color: ZamanColors.PersianGreen,
              }}
            >
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">✅</span>
                <span className="truncate">
                  Completed
                  <span className="hidden xs:inline"> ({completedAims.length})</span>
                  <span className="xs:hidden text-sm ml-1">({completedAims.length})</span>
                </span>
              </span>
              <span 
                className="text-xl sm:text-2xl transition-transform duration-300 flex-shrink-0" 
                style={{ transform: showCompleted ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </button>
            {showCompleted && (
              <div className="p-3 sm:p-6 grid gap-3 sm:gap-4" style={{ backgroundColor: `${ZamanColors.Cloud}95` }}>
                {completedAims.length === 0 ? (
                  <div 
                    className="text-center py-6 sm:py-8 rounded-lg sm:rounded-xl px-4"
                    style={{ 
                      backgroundColor: `${ZamanColors.LightTeal}20`,
                      color: ZamanColors.PersianGreen,
                    }}
                  >
                    <p className="text-base sm:text-lg font-medium">No completed aims yet.</p>
                    <p className="text-xs sm:text-sm mt-2 opacity-75">Keep working towards your goals!</p>
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
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Extra small breakpoint for very small phones */
        @media (min-width: 360px) {
          .xs\:inline {
            display: inline;
          }
          .xs\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}