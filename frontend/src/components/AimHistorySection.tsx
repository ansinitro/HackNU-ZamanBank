import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";
import { FinancialTx } from "@/types/financialAims";
import { FinancialTxTable } from "@/components/FinancialTxList";

const ZamanColors = {
  PersianGreen: "#2D9A86",
  Solar: "#EEFE6D",
  Cloud: "#FFFFFF",
  LightTeal: "#B8E6DC",
  DarkTeal: "#1A5F52",
};

interface AimHistorySectionProps {
  transactions: FinancialTx[];
  loading: boolean;
  onClose: () => void;
}

export const AimHistorySection: React.FC<AimHistorySectionProps> = ({
  transactions,
  loading,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-4 sm:p-6 rounded-2xl w-[90%] sm:w-[600px] max-h-[80vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()} // prevent close on inner click
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ color: ZamanColors.PersianGreen }}
          >
            Transaction History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        <FinancialTxTable transactions={transactions} loading={loading} />
      </motion.div>
    </div>
  );
};
