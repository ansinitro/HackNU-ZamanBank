'use client';

import React, {useState, useEffect} from 'react';
import {ArrowDownCircle, ArrowUpCircle, AlertCircle, Loader2, Wallet, BarChart3, List} from 'lucide-react';
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
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-green-600"/>
            <h2 className="text-lg font-semibold">Итоги</h2>
        </div>

        <div className="space-y-2 text-sm">
            <div className="flex justify-between text-green-700 font-medium">
        <span className="flex items-center gap-1">
          <ArrowUpCircle className="w-4 h-4"/>
          Income
        </span>
                <span>${formatCurrency(summary.income)}</span>
            </div>

            <div className="flex justify-between text-red-600 font-medium">
        <span className="flex items-center gap-1">
          <ArrowDownCircle className="w-4 h-4"/>
          Expense
        </span>
                <span>${formatCurrency(summary.expense)}</span>
            </div>

            <div
                className={`flex justify-between text-base font-semibold mt-3 ${
                    summary.balance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
            >
                <span>Net Balance</span>
                <span>${formatCurrency(summary.balance)}</span>
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
            <div
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin mb-2"/>
                <p className="text-gray-500">Loading transactions...</p>
            </div>
        );
    }

    if (!transactions?.length) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-400 mt-1">Start tracking your income and expenses!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600"/>
                Все транзакции
            </h2>

            <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-green-600 text-white">
                    <th className="p-2 border border-green-600 text-left">Date</th>
                    <th className="p-2 border border-green-600 text-left">Description</th>
                    <th className="p-2 border border-green-600 text-left">Type</th>
                    <th className="p-2 border border-green-600 text-right">Amount</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-2">{formatDate(t.created_at)}</td>
                        <td className="p-2">{t.description}</td>
                        <td
                            className={`p-2 font-medium flex items-center gap-1 ${
                                t.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {t.transaction_type === 'deposit' ? (
                                <ArrowUpCircle className="w-4 h-4"/>
                            ) : (
                                <ArrowDownCircle className="w-4 h-4"/>
                            )}
                            {t.transaction_type}
                        </td>
                        <td className="p-2 text-right font-semibold">
                            ${formatCurrency(t.amount)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// ============= Charts Tab =============
const ChartsTab: React.FC<{ transactions: Transaction[]; summary: TransactionSummary }> = ({transactions, summary}) => {
    // Prepare data for pie chart
    const pieData = [
        {name: 'Депозит', value: summary.income, color: '#16a34a'},
        {name: 'Потрачено', value: summary.expense, color: '#dc2626'},
    ];

    // Prepare data for daily transactions chart
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

    // Prepare data for transaction type breakdown
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

    return (
        <div className="space-y-6">
            {/* Income vs Expense Pie Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600"/>
                    Income vs Expense Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color}/>
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${formatCurrency(value)}`}/>
                        <Legend/>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Transactions Line Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600"/>
                    Daily Transactions Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="date" tick={{fontSize: 12}}/>
                        <YAxis tick={{fontSize: 12}}/>
                        <Tooltip formatter={(value: number) => `$${formatCurrency(value)}`}/>
                        <Legend/>
                        <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} name="Income"/>
                        <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} name="Expense"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Transaction Type Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600"/>
                    Transaction Type Breakdown
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="type" tick={{fontSize: 12}}/>
                        <YAxis tick={{fontSize: 12}}/>
                        <Tooltip formatter={(value: number) => `$${formatCurrency(value)}`}/>
                        <Legend/>
                        <Bar dataKey="amount" fill="#16a34a" name="Total Amount"/>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    {typeData.map((item) => (
                        <div key={item.type} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{item.type}</p>
                            <p className="text-xl font-bold text-green-600">{item.count}</p>
                            <p className="text-xs text-gray-500">${formatCurrency(item.amount)}</p>
                        </div>
                    ))}
                </div>
            </div>
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
                const res = await financialAdvice()
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


    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-green-600 flex items-center gap-2">
                    <Wallet className="w-6 h-6"/>
                    Выписка
                </h1>
            </div>

            {error && (
                <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5"/>
                    {error}
                </div>
            )}

            {!error && <SummaryCard summary={summary}/>}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                            activeTab === 'transactions'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <List className="w-5 h-5"/>
                        Транзакции
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                            activeTab === 'charts'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5"/>
                        Статистика
                    </button>
                    <button
                        onClick={() => setActiveTab('advices')}
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                            activeTab === 'advices'
                                    ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5"/>
                       Советы для
                    </button>
                </div>

                <div className="p-5">
                    {activeTab === 'transactions' ? (
                        <TransactionsTable transactions={transactions} loading={loading}/>
                    ) : (
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-gray-500 animate-spin mb-2"/>
                                <p className="text-gray-500">Loading charts...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 font-medium">No data to display</p>
                                <p className="text-sm text-gray-400 mt-1">Add some transactions to see charts!</p>
                            </div>
                        ) : (
                            <ChartsTab transactions={transactions} summary={summary}/>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}