'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

// ============= Types =============
interface BankAccount {
  id: number;
  account_number: string;
  balance: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  bank_account: BankAccount;
}

// ============= Hook =============
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<User>('/users/me/');
      setUser(data);
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError('Failed to load user information.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refresh: fetchUser,
    logout,
    isAuthenticated: !!user,
  };
}
