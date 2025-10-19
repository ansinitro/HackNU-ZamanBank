export interface FinancialAim {
    id: number;
    user_id: number;
    title: string;
    description?: string | null;
    target_amount: number;
    current_amount: number;
}

export type FinancialAimCreate = Omit<FinancialAim, 'id' | 'user_id'>;
export type FinancialAimUpdate = Partial<FinancialAimCreate>;

export type FinancialTx = {
    amount: number,
    transaction_type: string,
    id: number,
    created_at: string,
    bank_account_id: number
}