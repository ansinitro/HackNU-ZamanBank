import {FinancialAim, FinancialAimCreate, FinancialAimUpdate} from '../types/financialAims';
import {apiFetch} from './api';

export async function fetchAims(): Promise<FinancialAim[]> {
    return apiFetch<FinancialAim[]>('/financial-aims/');
}

export async function createAim(payload: FinancialAimCreate): Promise<FinancialAim> {
    return apiFetch<FinancialAim>('/financial-aims/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateAim(id: number, payload: FinancialAimUpdate): Promise<FinancialAim> {
    return apiFetch<FinancialAim>(`/financial-aims/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function deleteAim(id: number): Promise<void> {
    return apiFetch<void>(`/financial-aims/${id}`, {method: 'DELETE'});
}