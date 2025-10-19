"use client";

import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/Card";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import {motion} from "framer-motion";
import {ChevronDown, ChevronUp, Loader2} from "lucide-react";
import {apiFetch} from "@/lib/api";
import {load} from "next/dist/compiled/@edge-runtime/primitives/load";

const ZamanColors = {
    PersianGreen: "#2D9A86",
    Solar: "#EEFE6D",
    Cloud: "#FFFFFF",
    LightTeal: "#B8E6DC",
    DarkTeal: "#1A5F52",
};

interface Transaction {
    id: number;
    amount: number;
    transaction_type: string;
    created_at: string;
}

interface FinancialAim {
    id: number;
    title: string;
    description?: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    is_completed: boolean;
    transactions: Transaction[];
}

export default function AimsDashboard() {
    const [aims, setAims] = useState<FinancialAim[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedAim, setExpandedAim] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await apiFetch("/financial-aims/with-transactions")
                setAims(res);
                setLoading(false);
            } catch (e) {
                console.error(JSON.stringify(e))
            }
        }
        loadData()
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[${ZamanColors.PersianGreen}]" size={40}/>
            </div>
        );

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.6}}
            className="p-6 space-y-6"
        >
            <h1 className="text-2xl font-bold text-[${ZamanColors.DarkTeal}] mb-4">
                Financial Aims Dashboard
            </h1>

            {aims.map((aim) => {
                const progress = Math.min((aim.current_amount / aim.target_amount) * 100, 100);
                const txData = aim.transactions
                    .map((t) => ({
                        date: new Date(t.created_at).toLocaleDateString(),
                        amount: t.amount,
                        type: t.transaction_type,
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return (
                    <Card key={aim.id} className="bg-[${ZamanColors.Cloud}]">
                        <CardContent>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedAim(expandedAim === aim.id ? null : aim.id)}
                            >
                                <div>
                                    <h2 className="text-lg font-semibold text-[${ZamanColors.DarkTeal}]">
                                        {aim.title}
                                    </h2>
                                    <p className="text-sm text-gray-600">{aim.description}</p>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full"
                                            style={{
                                                width: `${progress}%`,
                                                backgroundColor: ZamanColors.PersianGreen,
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm mt-1 text-gray-700">
                                        {aim.current_amount.toFixed(2)} / {aim.target_amount.toFixed(2)} KZT
                                    </p>
                                </div>
                                {expandedAim === aim.id ? <ChevronUp/> : <ChevronDown/>}
                            </div>

                            {expandedAim === aim.id && (
                                <motion.div
                                    initial={{opacity: 0, height: 0}}
                                    animate={{opacity: 1, height: "auto"}}
                                    transition={{duration: 0.4}}
                                    className="mt-4"
                                >
                                    {txData.length === 0 ? (
                                        <p className="text-gray-500">No transactions yet.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <ComposedChart data={txData}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="date"/>
                                                <YAxis/>
                                                <Tooltip/>
                                                <Bar dataKey="amount" barSize={20} fill={ZamanColors.LightTeal}/>
                                                <Line
                                                    type="monotone"
                                                    dataKey="amount"
                                                    stroke={ZamanColors.PersianGreen}
                                                    strokeWidth={2}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    )}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </motion.div>
    );
}
