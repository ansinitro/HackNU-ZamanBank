import {FinancialTx} from "@/types/financialAims";
import {apiFetch} from "@/lib/api";

export async function loadAimTx(id: number): Promise<FinancialTx[]> {
    return apiFetch<FinancialTx[]>("/financial-transaction/" + id)
}
