'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, BarChart3, Wallet, Loader2, PieChart as PieChartIcon, Sparkles, Trophy, Zap, Heart, Circle } from 'lucide-react';
import {
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
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
    LightTeal: '#B8E6DC',
    DarkTeal: '#1A5F52',
};

interface Profile {
    user_id: number;
    username: string;
    total_balance: number;
    num_accounts: number;
    avg_account_age_days: number;
    total_transactions: number;
    total_deposit: number;
    total_withdrawal: number;
    avg_transaction_amount: number;
    transaction_frequency: number;
    num_aims: number;
    total_target_amount: number;
    total_current_amount: number;
    completion_rate: number;
    avg_aim_progress: number;
    num_completed_aims: number;
    savings_rate: number;
    net_flow: number;
}

interface SimilarUser {
    user_id: number;
    username: string;
    similarity_score: number;
    profile_summary: {
        total_balance: number;
        num_transactions: number;
        num_aims: number;
        savings_rate: number;
        completion_rate: number;
        three_month_summary: {
            income: number;
            outcome: number;
            net: number;
        };
        aims_summary: {
            completed_aims: any[];
            in_progress_aims: Array<{
                title: string;
                description: string;
                target_amount: number;
                current_amount: number;
                progress_percent: number;
            }>;
            total_completed: number;
            total_in_progress: number;
        };
    };
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
};

// ============= Similarity Overview =============
const SimilarityOverview: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

    const avgSimilar = {
        savingsRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / filteredUsers.length,
        completionRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / filteredUsers.length,
        numAims: filteredUsers.reduce((acc, user) => acc + user.profile_summary.num_aims, 0) / filteredUsers.length,
        totalBalance: filteredUsers.reduce((acc, user) => acc + user.profile_summary.total_balance, 0) / filteredUsers.length
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Your Profile */}
            <div
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
                style={{
                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.Cloud} 100%)`,
                    border: `2px solid ${ZamanColors.PersianGreen}40`,
                }}
            >
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                    Ваш профиль
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Ставка сбережений</span>
                        <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>{profile.savings_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Выполнение целей</span>
                        <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>{profile.completion_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Активные цели</span>
                        <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>{profile.num_aims}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Общий баланс</span>
                        <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>{formatCurrency(profile.total_balance)}</span>
                    </div>
                </div>
            </div>

            {/* Similar Users Average */}
            <div
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
                style={{
                    background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.Cloud} 100%)`,
                    border: `2px solid ${ZamanColors.Solar}`,
                }}
            >
<h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
  Похожие пользователи (сходство &gt;50%)
</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Средняя ставка сбережений</span>
                        <span className="font-bold" style={{ color: ZamanColors.DarkTeal }}>{avgSimilar.savingsRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Среднее выполнение целей</span>
                        <span className="font-bold" style={{ color: ZamanColors.DarkTeal }}>{avgSimilar.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Среднее количество целей</span>
                        <span className="font-bold" style={{ color: ZamanColors.DarkTeal }}>{avgSimilar.numAims.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span style={{ color: ZamanColors.DarkTeal }}>Средний баланс</span>
                        <span className="font-bold" style={{ color: ZamanColors.DarkTeal }}>{formatCurrency(avgSimilar.totalBalance)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============= Popular Aims =============
const PopularAims: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

    // Get all aims from similar users
    const allAims = filteredUsers.flatMap(user =>
        user.profile_summary.aims_summary.in_progress_aims.map(aim => ({
            ...aim,
            username: user.username,
            similarity: user.similarity_score
        }))
    );

    // Group aims by title and calculate statistics
    const aimGroups = allAims.reduce((acc, aim) => {
        if (!acc[aim.title]) {
            acc[aim.title] = {
                title: aim.title,
                description: aim.description,
                count: 0,
                totalProgress: 0,
                totalTarget: 0,
                users: []
            };
        }
        acc[aim.title].count++;
        acc[aim.title].totalProgress += aim.progress_percent;
        acc[aim.title].totalTarget += aim.target_amount;
        acc[aim.title].users.push(aim.username);
        return acc;
    }, {} as any);

    const popularAims = Object.values(aimGroups)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 6);

    return (
        <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
            style={{
                backgroundColor: ZamanColors.Cloud,
                border: `1px solid ${ZamanColors.LightTeal}`,
            }}
        >
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                <Target className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                Популярные цели среди похожих пользователей
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularAims.map((aim: any, index) => (
                    <div
                        key={aim.title}
                        className="p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md"
                        style={{
                            backgroundColor: `${ZamanColors.LightTeal}15`,
                            borderLeftColor: ZamanColors.PersianGreen
                        }}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-sm flex-1" style={{ color: ZamanColors.DarkTeal }}>
                                {aim.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                                <Users className="w-3 h-3" style={{ color: ZamanColors.PersianGreen }} />
                                <span className="text-xs font-bold" style={{ color: ZamanColors.PersianGreen }}>
                                    {aim.count}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs mb-3 opacity-75" style={{ color: ZamanColors.DarkTeal }}>
                            {aim.description}
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span style={{ color: ZamanColors.DarkTeal }}>Средний прогресс:</span>
                                <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>
                                    {(aim.totalProgress / aim.count).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full"
                                    style={{
                                        backgroundColor: ZamanColors.PersianGreen,
                                        width: `${(aim.totalProgress / aim.count)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============= Financial Trends =============
const FinancialTrends: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

    const comparisonData = [
        {
            category: 'Ставка сбережений',
            you: profile.savings_rate,
            similar: filteredUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / filteredUsers.length
        },
        {
            category: 'Выполнение целей',
            you: profile.completion_rate,
            similar: filteredUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / filteredUsers.length
        },
        {
            category: 'Количество целей',
            you: profile.num_aims,
            similar: filteredUsers.reduce((acc, user) => acc + user.profile_summary.num_aims, 0) / filteredUsers.length
        },
        {
            category: 'Прогресс целей',
            you: profile.avg_aim_progress,
            similar: filteredUsers.reduce((acc, user) => {
                const aims = user.profile_summary.aims_summary.in_progress_aims;
                return acc + (aims.reduce((sum, aim) => sum + aim.progress_percent, 0) / (aims.length || 1));
            }, 0) / filteredUsers.length
        }
    ];

    return (
        <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
            style={{
                backgroundColor: ZamanColors.Cloud,
                border: `1px solid ${ZamanColors.LightTeal}`,
            }}
        >
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                Сравнение финансовых показателей
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                    <XAxis
                        dataKey="category"
                        tick={{ fontSize: 12, fill: ZamanColors.DarkTeal }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: ZamanColors.DarkTeal }}
                    />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === 'you') return [`${value.toFixed(1)}%`, 'Ваши показатели'];
                            if (name === 'similar') return [`${value.toFixed(1)}%`, 'Средние показатели похожих пользователей'];
                            return [value, name];
                        }}
                        contentStyle={{
                            backgroundColor: ZamanColors.Cloud,
                            border: `1px solid ${ZamanColors.LightTeal}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                        dataKey="you"
                        fill={ZamanColors.PersianGreen}
                        name="Ваши показатели"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="similar"
                        fill={ZamanColors.Solar}
                        name="Средние показатели похожих пользователей"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// ============= Progress Distribution =============
const ProgressDistribution: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

    const progressRanges = [
        { range: '0-20%', count: 0 },
        { range: '21-40%', count: 0 },
        { range: '41-60%', count: 0 },
        { range: '61-80%', count: 0 },
        { range: '81-100%', count: 0 }
    ];

    filteredUsers.forEach(user => {
        user.profile_summary.aims_summary.in_progress_aims.forEach(aim => {
            if (aim.progress_percent <= 20) progressRanges[0].count++;
            else if (aim.progress_percent <= 40) progressRanges[1].count++;
            else if (aim.progress_percent <= 60) progressRanges[2].count++;
            else if (aim.progress_percent <= 80) progressRanges[3].count++;
            else progressRanges[4].count++;
        });
    });

    return (
        <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
            style={{
                backgroundColor: ZamanColors.Cloud,
                border: `1px solid ${ZamanColors.LightTeal}`,
            }}
        >
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
                Распределение прогресса целей
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={progressRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                    <XAxis
                        dataKey="range"
                        tick={{ fontSize: 12, fill: ZamanColors.DarkTeal }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: ZamanColors.DarkTeal }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: ZamanColors.Cloud,
                            border: `1px solid ${ZamanColors.LightTeal}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                    />
                    <Bar
                        dataKey="count"
                        fill={ZamanColors.PersianGreen}
                        name="Количество целей"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                {progressRanges.map((range, index) => (
                    <div key={range.range} className="p-2 rounded-lg" style={{ backgroundColor: `${ZamanColors.LightTeal}30` }}>
                        <div className="text-sm font-bold" style={{ color: ZamanColors.PersianGreen }}>{range.count}</div>
                        <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>{range.range}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============= Similarity Insights =============
const SimilarityInsights: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

    const totalAims = filteredUsers.reduce((acc, user) => acc + user.profile_summary.aims_summary.total_in_progress, 0);
    const avgSavings = filteredUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / filteredUsers.length;

    const insights = [
        {
            icon: <Target className="w-5 h-5" />,
            title: "Активные цели",
            value: `${totalAims} целей`,
            description: `среди ${filteredUsers.length} похожих пользователей`
        },
        {
            icon: <TrendingUp className="w-5 h-5" />,
            title: "Средняя ставка сбережений",
            value: `${avgSavings.toFixed(1)}%`,
            description: "у похожих пользователей"
        },
        {
            icon: <Circle className="w-5 h-5" />,
            title: "Сходство профилей",
            value: `${filteredUsers.length} пользователей`,
            description: "имеют сходство >50% с вами"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
                <div
                    key={index}
                    className="p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
                    style={{
                        background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}15, ${ZamanColors.Solar}20)`,
                        border: `1px solid ${ZamanColors.LightTeal}`,
                    }}
                >
                    <div
                        className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: ZamanColors.PersianGreen }}
                    >
                        {React.cloneElement(insight.icon, { style: { color: ZamanColors.Cloud } })}
                    </div>
                    <h4 className="font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>{insight.title}</h4>
                    <div className="text-lg font-bold mb-1" style={{ color: ZamanColors.PersianGreen }}>{insight.value}</div>
                    <div className="text-xs opacity-75" style={{ color: ZamanColors.DarkTeal }}>{insight.description}</div>
                </div>
            ))}
        </div>
    );
};

// ============= Main Component =============
export const Similarity: React.FC = () => {
    const [currentUserId, setCurrentUserId] = useState<number>(1);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [currentUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [profileData, similarData] = await Promise.all([
                fetch(`http://localhost:8000/similarity/profile/${currentUserId}`).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch profile');
                    return res.json();
                }),
                fetch(`http://localhost:8000/similarity/find-similar/${currentUserId}`).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch similar users');
                    return res.json();
                })
            ]);

            setProfile(profileData);
            setSimilarUsers(similarData.similar_users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: ZamanColors.Cloud }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: ZamanColors.PersianGreen }}></div>
                    <p className="mt-4 text-lg" style={{ color: ZamanColors.DarkTeal }}>Загружаем сравнительную аналитику...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen p-6" style={{ backgroundColor: ZamanColors.Cloud }}>
                <div className="max-w-4xl mx-auto text-center py-12">
                    <div className="p-4 rounded-full bg-red-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>Ошибка загрузки</h2>
                    <p className="mb-6" style={{ color: ZamanColors.PersianGreen }}>{error}</p>
                    <button
                        onClick={loadData}
                        className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: ZamanColors.Solar,
                            color: ZamanColors.DarkTeal,
                        }}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);

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
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: ZamanColors.DarkTeal }} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold" style={{ color: ZamanColors.Solar }}>
                            Сравнительная аналитика
                        </h1>
                        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: ZamanColors.LightTeal }}>
                            Сравнение с пользователями со сходством более 50%
                        </p>
                    </div>
                </div>
            </div>

            {/* User Selection */}
            <div
                className="p-4 rounded-xl shadow-lg"
                style={{
                    backgroundColor: ZamanColors.Cloud,
                    border: `1px solid ${ZamanColors.LightTeal}`,
                }}
            >
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>
                        Просмотр профиля:
                    </label>
                    <select
                        value={currentUserId}
                        onChange={(e) => setCurrentUserId(parseInt(e.target.value))}
                        className="px-4 py-2 rounded-lg border-2 focus:outline-none"
                        style={{
                            borderColor: ZamanColors.LightTeal,
                            backgroundColor: ZamanColors.Cloud,
                            color: ZamanColors.DarkTeal,
                        }}
                    >
                        {[1, 2, 3, 4, 5].map(id => (
                            <option key={id} value={id}>Пользователь {id}</option>
                        ))}
                    </select>
                    <div className="ml-auto text-sm" style={{ color: ZamanColors.PersianGreen }}>
                        {filteredUsers.length} пользователей со сходством {'>'} 50%
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
                    <span className="text-xs sm:text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>{error}</span>
                </div>
            )}

            <SimilarityInsights profile={profile} similarUsers={similarUsers} />

            <SimilarityOverview profile={profile} similarUsers={similarUsers} />

            <PopularAims similarUsers={similarUsers} />

            <FinancialTrends profile={profile} similarUsers={similarUsers} />

            <ProgressDistribution similarUsers={similarUsers} />

            {/* Motivation Footer */}
            {filteredUsers.length > 0 && (
                <div
                    className="p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center"
                    style={{
                        background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.PersianGreen}20)`,
                        border: `2px solid ${ZamanColors.Solar}`,
                    }}
                >
                    <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: ZamanColors.PersianGreen }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>
                        Вы в хорошей компании!
                    </h3>
                    <p className="text-sm" style={{ color: ZamanColors.DarkTeal }}>
                        {filteredUsers.length} пользователей имеют схожие финансовые привычки с вами. <br />
                        Вместе вы можете достичь большего!
                    </p>
                </div>
            )}
        </div>
    );
};