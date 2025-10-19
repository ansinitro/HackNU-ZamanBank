'use client';

import React, {useState, useEffect} from 'react';
import {ArrowDownCircle, ArrowUpCircle, AlertCircle, Loader2, Wallet, BarChart3, List, Goal, TrendingUp, TrendingDown} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {apiFetch} from "@/lib/api";
import {useUser} from "@/hooks/useUser";
import {financialAdvice} from "@/lib/chatApi";
import {AdvicesCarousel} from "@/components/AdvicesCarousel";

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

// ============= Types =============
interface Transaction {
    id: number;
    amount: number;
    description: string;
    transaction_type: 'deposit' | 'transfer' | 'withdrawal';
    created_at: string;
    updated_at: string;
    user_id: number;
}

interface TransactionSummary {
    income: number;
    expense: number;
    balance: number;
}

// ============= Utility Functions =============
const formatCurrency = (amount: number): string =>
    amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString(undefined, {day: '2-digit', month: 'short', year: 'numeric'});

// ============= Summary Card =============
const SummaryCard: React.FC<{ summary: TransactionSummary }> = ({summary}) => (
    <div 
        className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
        style={{
            background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}20 100%)`,
            border: `2px solid ${ZamanColors.LightTeal}`,
        }}
    >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div 
                className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                style={{
                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                    boxShadow: `0 4px 12px ${ZamanColors.PersianGreen}40`,
                }}
            >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: ZamanColors.Solar }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
                Финансовая сводка
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Income */}
            <div 
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
                style={{
                    backgroundColor: `${ZamanColors.PersianGreen}15`,
                    border: `1px solid ${ZamanColors.PersianGreen}40`,
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                    <span className="text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                        Доход
                    </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: ZamanColors.PersianGreen }}>
                    ${formatCurrency(summary.income)}
                </p>
            </div>

            {/* Expense */}
            <div 
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
                style={{
                    backgroundColor: `${ZamanColors.Solar}60`,
                    border: `1px solid ${ZamanColors.Solar}`,
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.DarkTeal }} />
                    <span className="text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                        Расход
                    </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: ZamanColors.DarkTeal }}>
                    ${formatCurrency(summary.expense)}
                </p>
            </div>

            {/* Balance */}
            <div 
                className="p-3 sm:p-4 rounded-lg sm:rounded-xl"
                style={{
                    background: summary.balance >= 0 
                        ? `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.Solar}40)`
                        : `linear-gradient(135deg, ${ZamanColors.Solar}80, #FFF59D)`,
                    border: `2px solid ${summary.balance >= 0 ? ZamanColors.PersianGreen : ZamanColors.Solar}`,
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.DarkTeal }} />
                    <span className="text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                        Баланс
                    </span>
                </div>
                <p 
                    className="text-xl sm:text-2xl font-bold truncate"
                    style={{ 
                        color: summary.balance >= 0 ? ZamanColors.PersianGreen : ZamanColors.DarkTeal 
                    }}
                >
                    ${formatCurrency(summary.balance)}
                </p>
            </div>
        </div>
    </div>
);

// ============= Transactions Table =============
const TransactionsTable: React.FC<{ transactions: Transaction[]; loading: boolean }> = ({
    transactions,
    loading,
}) => {
    if (loading) {
        return (
            <div className="p-8 sm:p-12 rounded-xl sm:rounded-2xl shadow-sm flex flex-col items-center justify-center"
                style={{ backgroundColor: ZamanColors.Cloud }}
            >
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mb-2 sm:mb-3" style={{ color: ZamanColors.PersianGreen }} />
                <p className="text-sm sm:text-base font-medium" style={{ color: ZamanColors.DarkTeal }}>Загрузка транзакций...</p>
            </div>
        );
    }

    if (!transactions?.length) {
        return (
            <div 
                className="p-8 sm:p-12 rounded-xl sm:rounded-2xl shadow-sm text-center"
                style={{ 
                    backgroundColor: ZamanColors.Cloud,
                    border: `1px solid ${ZamanColors.LightTeal}`,
                }}
            >
                <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${ZamanColors.LightTeal}, ${ZamanColors.PersianGreen}30)`,
                    }}
                >
                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ZamanColors.PersianGreen }} />
                </div>
                <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: ZamanColors.DarkTeal }}>
                    Пока нет транзакций
                </p>
                <p className="text-xs sm:text-sm" style={{ color: ZamanColors.PersianGreen }}>
                    Начните отслеживать свои доходы и расходы!
                </p>
            </div>
        );
    }

    return (
        <div 
            className="rounded-xl sm:rounded-2xl shadow-sm overflow-hidden"
            style={{ 
                backgroundColor: ZamanColors.Cloud,
                border: `1px solid ${ZamanColors.LightTeal}`,
            }}
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                        <tr 
                            style={{
                                background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                            }}
                        >
                            <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold" style={{ color: ZamanColors.Solar }}>
                                Дата
                            </th>
                            <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold" style={{ color: ZamanColors.Solar }}>
                                Описание
                            </th>
                            <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold" style={{ color: ZamanColors.Solar }}>
                                Тип
                            </th>
                            <th className="p-3 sm:p-4 text-right text-xs sm:text-sm font-semibold" style={{ color: ZamanColors.Solar }}>
                                Сумма
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, index) => (
                            <tr 
                                key={t.id} 
                                className="transition-all duration-200"
                                style={{
                                    borderBottom: `1px solid ${ZamanColors.LightTeal}30`,
                                    backgroundColor: index % 2 === 0 ? ZamanColors.Cloud : `${ZamanColors.LightTeal}10`,
                                }}
                            >
                                <td className="p-3 sm:p-4 text-xs sm:text-sm" style={{ color: ZamanColors.DarkTeal }}>
                                    {formatDate(t.created_at)}
                                </td>
                                <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                                    {t.description}
                                </td>
                                <td className="p-3 sm:p-4">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div 
                                            className="p-0.5 sm:p-1 rounded"
                                            style={{
                                                backgroundColor: t.transaction_type === 'deposit' 
                                                    ? `${ZamanColors.PersianGreen}20` 
                                                    : `${ZamanColors.Solar}80`,
                                            }}
                                        >
                                            {t.transaction_type === 'deposit' ? (
                                                <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: ZamanColors.PersianGreen }} />
                                            ) : (
                                                <ArrowDownCircle className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: ZamanColors.DarkTeal }} />
                                            )}
                                        </div>
                                        <span 
                                            className="text-xs sm:text-sm font-medium capitalize"
                                            style={{
                                                color: t.transaction_type === 'deposit' 
                                                    ? ZamanColors.PersianGreen 
                                                    : ZamanColors.DarkTeal,
                                            }}
                                        >
                                            {t.transaction_type}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3 sm:p-4 text-right text-xs sm:text-sm font-bold" style={{ color: ZamanColors.DarkTeal }}>
                                    ${formatCurrency(t.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ============= Charts Tab =============
const ChartsTab: React.FC<{ transactions: Transaction[]; summary: TransactionSummary }> = ({transactions, summary}) => {
    const pieData = [
        {name: 'Депозит', value: summary.income, color: ZamanColors.PersianGreen},
        {name: 'Потрачено', value: summary.expense, color: ZamanColors.Solar},
    ];

    const dailyData = transactions.reduce((acc, t) => {
        const date = formatDate(t.created_at);
        const existing = acc.find(item => item.date === date);

        if (existing) {
            if (t.transaction_type === 'deposit') {
                existing.income += t.amount;
            } else {
                existing.expense += t.amount;
            }
        } else {
            acc.push({
                date,
                income: t.transaction_type === 'deposit' ? t.amount : 0,
                expense: t.transaction_type !== 'deposit' ? t.amount : 0,
            });
        }
        return acc;
    }, [] as Array<{ date: string; income: number; expense: number }>);

    const typeData = [
        {
            type: 'Deposit',
            count: transactions.filter(t => t.transaction_type === 'deposit').length,
            amount: summary.income,
        },
        {
            type: 'Withdrawal',
            count: transactions.filter(t => t.transaction_type === 'withdrawal').length,
            amount: transactions.filter(t => t.transaction_type === 'withdrawal').reduce((a, b) => a + b.amount, 0),
        },
        {
            type: 'Transfer',
            count: transactions.filter(t => t.transaction_type === 'transfer').length,
            amount: transactions.filter(t => t.transaction_type === 'transfer').reduce((a, b) => a + b.amount, 0),
        },
    ];

    const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div 
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
            style={{
                backgroundColor: ZamanColors.Cloud,
                border: `1px solid ${ZamanColors.LightTeal}`,
            }}
        >
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                {title}
            </h3>
            {children}
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Income vs Expense Pie Chart */}
            <ChartCard title="Распределение доходов и расходов">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color}/>
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${formatCurrency(value)}`}/>
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Daily Transactions Line Chart */}
            <ChartCard title="Динамика ежедневных транзакций">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                        <XAxis dataKey="date" tick={{fontSize: 10, fill: ZamanColors.DarkTeal}} angle={-45} textAnchor="end" height={60} />
                        <YAxis tick={{fontSize: 10, fill: ZamanColors.DarkTeal}}/>
                        <Tooltip 
                            formatter={(value: number) => `$${formatCurrency(value)}`}
                            contentStyle={{
                                backgroundColor: ZamanColors.Cloud,
                                border: `1px solid ${ZamanColors.LightTeal}`,
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="income" stroke={ZamanColors.PersianGreen} strokeWidth={2} name="Доход"/>
                        <Line type="monotone" dataKey="expense" stroke={ZamanColors.DarkTeal} strokeWidth={2} name="Расход"/>
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Transaction Type Breakdown */}
            <ChartCard title="Разбивка по типам транзакций">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                        <XAxis dataKey="type" tick={{fontSize: 10, fill: ZamanColors.DarkTeal}}/>
                        <YAxis tick={{fontSize: 10, fill: ZamanColors.DarkTeal}}/>
                        <Tooltip 
                            formatter={(value: number) => `$${formatCurrency(value)}`}
                            contentStyle={{
                                backgroundColor: ZamanColors.Cloud,
                                border: `1px solid ${ZamanColors.LightTeal}`,
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="amount" fill={ZamanColors.PersianGreen} name="Общая сумма" radius={[8, 8, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                    {typeData.map((item) => (
                        <div 
                            key={item.type} 
                            className="p-3 sm:p-4 rounded-lg sm:rounded-xl text-center transition-all duration-300 hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${ZamanColors.LightTeal}40, ${ZamanColors.Solar}40)`,
                                border: `1px solid ${ZamanColors.LightTeal}`,
                            }}
                        >
                            <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: ZamanColors.DarkTeal }}>
                                {item.type}
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1" style={{ color: ZamanColors.PersianGreen }}>
                                {item.count}
                            </p>
                            <p className="text-xs font-medium truncate" style={{ color: ZamanColors.DarkTeal }}>
                                ${formatCurrency(item.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </ChartCard>
        </div>
    );
};

// ============= Main Page =============
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transactions' | 'charts' | 'advices'>('transactions');
    const [summary, setSummary] = useState<TransactionSummary>({
        income: 0,
        expense: 0,
        balance: 0,
    });

    const {user} = useUser();

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiFetch<Transaction[]>('/transactions');

                setTransactions(data);

                const income = data.filter((t) => t.transaction_type === 'deposit').reduce((a, b) => a + b.amount, 0);
                const expense = data.filter((t) => t.transaction_type !== 'deposit').reduce((a, b) => a + b.amount, 0);
                setSummary({
                    income,
                    expense,
                    balance: user?.bank_account.balance || 0,
                });
            } catch (err) {
                console.error('Error loading transactions:', err);
                setError('Failed to load transactions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user]);

    const tabs = [
        { id: 'transactions' as const, label: 'Транзакции', icon: List, shortLabel: 'Список' },
        { id: 'charts' as const, label: 'Статистика', icon: BarChart3, shortLabel: 'Графики' },
        { id: 'advices' as const, label: 'Советы', icon: Goal, shortLabel: 'Советы' },
    ];

    return (
        <div 
            className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen"
            style={{
                background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)`,
            }}
        >
            {/* Header */}
            <div 
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
                style={{
                    background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                    borderBottom: `3px sm:4px solid ${ZamanColors.Solar}`,
                }}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <div 
                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
                        style={{
                            backgroundColor: `${ZamanColors.Solar}90`,
                        }}
                    >
                        <Wallet className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ZamanColors.DarkTeal }} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold" style={{ color: ZamanColors.Solar }}>
                            Финансовая выписка
                        </h1>
                        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: ZamanColors.LightTeal }}>
                            Управляйте транзакциями
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div 
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${ZamanColors.Solar}80, #FFF59D)`,
                        border: `2px solid ${ZamanColors.Solar}`,
                    }}
                >
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{ color: ZamanColors.DarkTeal }} />
                    <span className="text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>{error}</span>
                </div>
            )}

            {!error && <SummaryCard summary={summary}/>}

            {/* Tabs */}
            <div 
                className="rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
                style={{ 
                    backgroundColor: ZamanColors.Cloud,
                    border: `1px solid ${ZamanColors.LightTeal}`,
                }}
            >
                <div 
                    className="flex overflow-x-auto"
                    style={{
                        borderBottom: `2px solid ${ZamanColors.LightTeal}`,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {tabs.map(({ id, label, icon: Icon, shortLabel }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-base transition-all duration-300 whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start"
                            style={{
                                background: activeTab === id
                                    ? `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`
                                    : ZamanColors.Cloud,
                                color: activeTab === id ? ZamanColors.Solar : ZamanColors.DarkTeal,
                                borderBottom: activeTab === id ? `3px solid ${ZamanColors.Solar}` : 'none',
                            }}
                        >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline">{label}</span>
                            <span className="xs:hidden">{shortLabel}</span>
                        </button>
                    ))}
                </div>

                <div className="p-3 sm:p-6">
                    {activeTab === 'transactions' ? (
                        <TransactionsTable transactions={transactions} loading={loading}/>
                    ) : activeTab === 'charts' ? (
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mb-2 sm:mb-3" style={{ color: ZamanColors.PersianGreen }} />
                                <p className="text-sm sm:text-base font-medium" style={{ color: ZamanColors.DarkTeal }}>Загрузка графиков...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: ZamanColors.DarkTeal }}>
                                    Нет данных
                                </p>
                                <p className="text-xs sm:text-sm" style={{ color: ZamanColors.PersianGreen }}>
                                    Добавьте транзакции!
                                </p>
                            </div>
                        ) : (
                            <ChartsTab transactions={transactions} summary={summary}/>
                        )
                    ) : activeTab === 'advices' ? (
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mb-2 sm:mb-3" style={{ color: ZamanColors.PersianGreen }} />
                                <p className="text-sm sm:text-base font-medium" style={{ color: ZamanColors.DarkTeal }}>Загрузка советов...</p>
                            </div>
                        ) : (
                            <AdvicesCarousel/>
                        )
                    ) : null}
                </div>
            </div>

            <style jsx>{`
                .flex::-webkit-scrollbar {
                    display: none;
                }
                
                @media (min-width: 360px) {
                    .xs\\:inline {
                        display: inline;
                    }
                    .xs\\:hidden {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}