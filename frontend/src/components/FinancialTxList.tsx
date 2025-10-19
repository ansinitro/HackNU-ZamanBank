import React from "react";
import { FinancialTx } from "@/types/financialAims";

const ZamanColors = {
  PersianGreen: "#2D9A86",
  Solar: "#EEFE6D",
  Cloud: "#FFFFFF",
  LightTeal: "#B8E6DC",
  DarkTeal: "#1A5F52",
};

export const FinancialTxTable: React.FC<{
  transactions: FinancialTx[];
  loading: boolean;
}> = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 text-sm text-gray-500">
        Loading transactions...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6 text-sm">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr
            style={{
              backgroundColor: `${ZamanColors.PersianGreen}10`,
              color: ZamanColors.DarkTeal,
            }}
          >
            <th className="px-2 sm:px-3 py-2 text-left font-semibold">Date</th>
            <th className="px-2 sm:px-3 py-2 text-left font-semibold">
              Type
            </th>

            <th className="px-2 sm:px-3 py-2 text-right font-semibold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr
              key={tx.id || i}
              className={`border-b last:border-none ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 whitespace-nowrap">
                {new Date(tx.created_at).toLocaleDateString()}
              </td>
              <td className="px-2 sm:px-3 py-1.5 sm:py-2 capitalize text-gray-700">
                {tx.transaction_type}
              </td>

              <td
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-right font-medium"
                style={{
                  color:
                    tx.transaction_type === "deposit"
                      ? ZamanColors.PersianGreen
                      : "#E85C5C",
                }}
              >
                {tx.amount.toLocaleString()} ₸
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
