'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Wallet, 
  CreditCard, 
  Edit3, 
  Save, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Shield,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bank_account: {
    id: number;
    account_number: string;
    balance: number;
    created_at: string;
  };
}

interface ProfileStats {
  totalTransactions: number;
  activeAims: number;
  memberSince: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editedData, setEditedData] = useState({
    username: '',
    email: '',
  });

  const [stats, setStats] = useState<ProfileStats>({
    totalTransactions: 0,
    activeAims: 0,
    memberSince: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserProfile>('/users/me');
      setUser(data);
      setEditedData({
        username: data.username,
        email: data.email,
      });

      // Mock stats - replace with actual API calls
      setStats({
        totalTransactions: Math.floor(Math.random() * 100) + 10,
        activeAims: Math.floor(Math.random() * 5) + 1,
        memberSince: new Date(data.bank_account.created_at).toLocaleDateString('ru-RU', {
          month: 'long',
          year: 'numeric',
        }),
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Не удалось загрузить профиль. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user state
      if (user) {
        setUser({
          ...user,
          username: editedData.username,
          email: editedData.email,
        });
      }
      
      setSuccess('Профиль успешно обновлен!');
      setEditMode(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Не удалось сохранить изменения. Попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedData({
        username: user.username,
        email: user.email,
      });
    }
    setEditMode(false);
    setError(null);
  };

  const formatCurrency = (amount: number): string =>
    amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)`,
        }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: ZamanColors.PersianGreen }} />
          <p className="text-lg font-medium" style={{ color: ZamanColors.DarkTeal }}>
            Загрузка профиля...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)`,
        }}
      >
        <div 
          className="p-8 rounded-2xl text-center shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `2px solid ${ZamanColors.Solar}`,
          }}
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: ZamanColors.DarkTeal }} />
          <p className="text-lg font-semibold mb-2" style={{ color: ZamanColors.DarkTeal }}>
            Профиль не найден
          </p>
          <p className="text-sm" style={{ color: ZamanColors.PersianGreen }}>
            Попробуйте войти снова
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6 space-y-6"
      style={{
        background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)`,
      }}
    >
      {/* Header */}
      <div 
        className="p-6 rounded-2xl shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
        }}
      >
        {/* Decorative circles */}
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: ZamanColors.Solar }}
        />
        <div 
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: ZamanColors.Solar }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
              }}
            >
              <User className="w-10 h-10" style={{ color: ZamanColors.DarkTeal }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: ZamanColors.Solar }}>
                {user.username}
              </h1>
              <p className="text-sm" style={{ color: ZamanColors.LightTeal }}>
                Личный кабинет
              </p>
            </div>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
                color: ZamanColors.DarkTeal,
                boxShadow: `0 4px 12px ${ZamanColors.Solar}40`,
              }}
            >
              <Edit3 className="w-5 h-5" />
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div 
          className="p-4 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-top"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.LightTeal}40)`,
            border: `2px solid ${ZamanColors.PersianGreen}`,
          }}
        >
          <CheckCircle className="w-6 h-6" style={{ color: ZamanColors.PersianGreen }} />
          <span className="font-medium" style={{ color: ZamanColors.DarkTeal }}>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          className="p-4 rounded-xl flex items-center gap-3 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Solar}80, #FFF59D)`,
            border: `2px solid ${ZamanColors.Solar}`,
          }}
        >
          <AlertCircle className="w-6 h-6" style={{ color: ZamanColors.DarkTeal }} />
          <span className="font-medium" style={{ color: ZamanColors.DarkTeal }}>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.LightTeal}40)`,
            border: `2px solid ${ZamanColors.PersianGreen}`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${ZamanColors.PersianGreen}30`,
              }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: ZamanColors.PersianGreen }} />
            </div>
            <span className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
              Транзакций
            </span>
          </div>
          <p className="text-4xl font-bold" style={{ color: ZamanColors.PersianGreen }}>
            {stats.totalTransactions}
          </p>
        </div>

        <div 
          className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Solar}60, #FFF59D40)`,
            border: `2px solid ${ZamanColors.Solar}`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${ZamanColors.Solar}80`,
              }}
            >
              <Award className="w-6 h-6" style={{ color: ZamanColors.DarkTeal }} />
            </div>
            <span className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
              Активных целей
            </span>
          </div>
          <p className="text-4xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
            {stats.activeAims}
          </p>
        </div>

        <div 
          className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Cloud}, ${ZamanColors.LightTeal}30)`,
            border: `2px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-3 rounded-xl"
              style={{
                backgroundColor: `${ZamanColors.LightTeal}`,
              }}
            >
              <Calendar className="w-6 h-6" style={{ color: ZamanColors.PersianGreen }} />
            </div>
            <span className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
              С нами с
            </span>
          </div>
          <p className="text-xl font-bold" style={{ color: ZamanColors.PersianGreen }}>
            {stats.memberSince}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `1px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
              }}
            >
              <Shield className="w-6 h-6" style={{ color: ZamanColors.Solar }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
              Личная информация
            </h2>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
                <User className="w-4 h-4" style={{ color: ZamanColors.PersianGreen }} />
                Имя пользователя
              </label>
              <input
                type="text"
                value={editedData.username}
                onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: editMode ? ZamanColors.Cloud : `${ZamanColors.LightTeal}20`,
                  border: `2px solid ${editMode ? ZamanColors.PersianGreen : ZamanColors.LightTeal}`,
                  color: ZamanColors.DarkTeal,
                  cursor: editMode ? 'text' : 'not-allowed',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
                <Mail className="w-4 h-4" style={{ color: ZamanColors.PersianGreen }} />
                Email
              </label>
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: editMode ? ZamanColors.Cloud : `${ZamanColors.LightTeal}20`,
                  border: `2px solid ${editMode ? ZamanColors.PersianGreen : ZamanColors.LightTeal}`,
                  color: ZamanColors.DarkTeal,
                  cursor: editMode ? 'text' : 'not-allowed',
                }}
              />
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                    color: ZamanColors.Solar,
                    boxShadow: `0 4px 12px ${ZamanColors.PersianGreen}40`,
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Сохранить
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${ZamanColors.Solar}80, #FFF59D)`,
                    color: ZamanColors.DarkTeal,
                  }}
                >
                  <X className="w-5 h-5" />
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bank Account Information */}
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `1px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.Solar}, #FFF59D)`,
              }}
            >
              <Wallet className="w-6 h-6" style={{ color: ZamanColors.DarkTeal }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
              Банковский счет
            </h2>
          </div>

          <div className="space-y-6">
            {/* Account Number */}
            <div 
              className="p-5 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.LightTeal}30, ${ZamanColors.Solar}30)`,
                border: `1px solid ${ZamanColors.LightTeal}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
                <span className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                  Номер счета
                </span>
              </div>
              <p className="text-2xl font-bold tracking-wider" style={{ color: ZamanColors.DarkTeal }}>
                {user.bank_account.account_number}
              </p>
            </div>

            {/* Balance */}
            <div 
              className="p-6 rounded-xl text-center"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                boxShadow: `0 8px 24px ${ZamanColors.PersianGreen}40`,
              }}
            >
              <p className="text-sm mb-2" style={{ color: ZamanColors.LightTeal }}>
                Доступный баланс
              </p>
              <p className="text-5xl font-bold" style={{ color: ZamanColors.Solar }}>
                ${formatCurrency(user.bank_account.balance)}
              </p>
            </div>

            {/* Account Info */}
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: `${ZamanColors.LightTeal}20`,
                border: `1px solid ${ZamanColors.LightTeal}`,
              }}
            >
              <p className="text-xs mb-1" style={{ color: ZamanColors.PersianGreen }}>
                ID счета
              </p>
              <p className="font-mono font-semibold" style={{ color: ZamanColors.DarkTeal }}>
                #{user.bank_account.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}