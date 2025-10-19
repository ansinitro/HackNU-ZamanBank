"use client";

import {useEffect, useState} from "react";
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";
import {motion} from "framer-motion";
import {Loader2} from "lucide-react";
import {Card, CardContent} from "@/components/Card";

const ZamanColors = {
    PersianGreen: "#2D9A86",
    Solar: "#EEFE6D",
    Cloud: "#FFFFFF",
    LightTeal: "#B8E6DC",
    DarkTeal: "#1A5F52",
};

interface FinancialAim {
    id: number;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    is_completed: boolean;
}

export default function YearlyAimsChart() {
    const [aims, setAims] = useState<FinancialAim[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const year = new Date().getFullYear();
        fetch(`/api/aims/yearly?year=${year}`)
            .then((res) => res.json())
            .then((data) => {
                setAims(data);
                setLoading(false);
            });
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[${ZamanColors.PersianGreen}]" size={40}/>
            </div>
        );

    const chartData = aims.map((a) => ({
        name: a.title,
        progress: Math.min((a.current_amount / a.target_amount) * 100, 100),
    }));

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="p-6"
        >
            <Card className="bg-[${ZamanColors.Cloud}] shadow-md rounded-2xl">
                <CardContent>
                    <h2 className="text-xl font-bold text-[${ZamanColors.DarkTeal}] mb-4">
                        Your Financial Aims ({new Date().getFullYear()})
                    </h2>
                    {aims.length === 0 ? (
                        <p className="text-gray-500">No aims found for this year.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData} margin={{top: 20, right: 20, left: 0, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis unit="%"/>
                                <Tooltip/>
                                <Bar dataKey="progress" fill={ZamanColors.PersianGreen} radius={[10, 10, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
