'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, BarChart3, Wallet, Loader2, PieChart as PieChartIcon, Sparkles, Trophy, Zap, Heart } from 'lucide-react';
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
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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

const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

// ============= Motivation Card =============
const MotivationCard: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
  const avgSimilarSavings = similarUsers.length > 0 
    ? similarUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / similarUsers.length 
    : 0;

  const avgSimilarCompletion = similarUsers.length > 0
    ? similarUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / similarUsers.length
    : 0;

  const yourPerformance = profile.savings_rate > avgSimilarSavings ? 'better' : 
                         profile.savings_rate < avgSimilarSavings ? 'improving' : 'similar';

  const motivationMessages = {
    better: {
      title: "Отличные результаты!",
      message: "Ваши показатели сбережений выше, чем у похожих пользователей. Продолжайте в том же духе!",
      icon: <Trophy className="w-6 h-6" />,
      color: ZamanColors.PersianGreen
    },
    improving: {
      title: "Есть куда стремиться!",
      message: "Похожие пользователи откладывают больше. Маленькие шаги приведут к большим результатам!",
      icon: <Zap className="w-6 h-6" />,
      color: ZamanColors.Solar
    },
    similar: {
      title: "Стабильный прогресс!",
      message: "Ваши финансовые привычки соответствуют ожиданиям. Продолжайте двигаться к целям!",
      icon: <TrendingUp className="w-6 h-6" />,
      color: ZamanColors.LightTeal
    }
  };

  const motivation = motivationMessages[yourPerformance];

  return (
    <div 
      className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${motivation.color}20, ${ZamanColors.Cloud} 100%)`,
        border: `2px solid ${motivation.color}40`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: motivation.color }}
        >
          {motivation.icon}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
            {motivation.title}
          </h2>
          <p className="text-sm" style={{ color: ZamanColors.PersianGreen }}>
            {motivation.message}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.PersianGreen }}>
            {profile.savings_rate.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>Ваша ставка</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
            {avgSimilarSavings.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>Средняя у других</div>
        </div>
      </div>
    </div>
  );
};

// ============= Financial Habits Comparison =============
const HabitsComparison: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
  const avgSimilar = {
    savingsRate: similarUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / similarUsers.length,
    completionRate: similarUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / similarUsers.length,
    numAims: similarUsers.reduce((acc, user) => acc + user.profile_summary.num_aims, 0) / similarUsers.length,
    avgTransaction: similarUsers.reduce((acc, user) => acc + user.profile_summary.total_balance / (user.profile_summary.num_transactions || 1), 0) / similarUsers.length
  };

  const comparisonData = [
    { habit: 'Ставка сбережений', you: profile.savings_rate, similar: avgSimilar.savingsRate },
    { habit: 'Выполнение целей', you: profile.completion_rate, similar: avgSimilar.completionRate },
    { habit: 'Активные цели', you: profile.num_aims, similar: avgSimilar.numAims },
    { habit: 'Средняя операция', you: profile.avg_transaction_amount, similar: avgSimilar.avgTransaction },
  ];

  return (
    <div 
      className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
      style={{
        backgroundColor: ZamanColors.Cloud,
        border: `1px solid ${ZamanColors.LightTeal}`,
      }}
    >
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
        Сравнение финансовых привычек
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonData}>
          <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
          <XAxis 
            dataKey="habit" 
            tick={{fontSize: 12, fill: ZamanColors.DarkTeal}}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{fontSize: 12, fill: ZamanColors.DarkTeal}}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'you') return [typeof value === 'number' ? value.toFixed(1) : value, 'Ваши показатели'];
              if (name === 'similar') return [typeof value === 'number' ? value.toFixed(1) : value, 'Средние показатели'];
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
            name="Средние показатели"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============= Goals Inspiration =============
const GoalsInspiration: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
  // Extract all aims from similar users
  const allAims = similarUsers.flatMap(user => 
    user.profile_summary.aims_summary.in_progress_aims.map(aim => ({
      ...aim,
      username: user.username
    }))
  );

  // Get top 5 most common goals
  const goalCounts = allAims.reduce((acc, aim) => {
    acc[aim.title] = (acc[aim.title] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGoals = Object.entries(goalCounts)
    .map(([title, count]) => ({ title, count, percentage: (count / similarUsers.length) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const completedAims = similarUsers.flatMap(user =>
    user.profile_summary.aims_summary.completed_aims.map(aim => ({
      ...aim,
      username: user.username
    }))
  );

  return (
    <div className="space-y-6">
      {/* Popular Goals */}
      <div 
        className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
        style={{
          backgroundColor: ZamanColors.Cloud,
          border: `1px solid ${ZamanColors.LightTeal}`,
        }}
      >
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
          <Target className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
          Популярные цели среди похожих пользователей
        </h3>
        <div className="space-y-3">
          {topGoals.map((goal, index) => (
            <div key={goal.title} className="flex items-center justify-between p-3 rounded-lg" 
              style={{ backgroundColor: `${ZamanColors.LightTeal}20` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: ZamanColors.PersianGreen }}>
                  {index + 1}
                </div>
                <span className="font-medium" style={{ color: ZamanColors.DarkTeal }}>{goal.title}</span>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: ZamanColors.PersianGreen }}>
                  {goal.percentage.toFixed(0)}%
                </div>
                <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>
                  {goal.count} пользователей
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      {completedAims.length > 0 && (
        <div 
          className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `1px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
            Достигнутые цели
          </h3>
          <div className="space-y-3">
            {completedAims.slice(0, 3).map((aim, index) => (
              <div key={index} className="p-3 rounded-lg border-l-4" 
                style={{ 
                  backgroundColor: `${ZamanColors.Solar}20`,
                  borderLeftColor: ZamanColors.PersianGreen
                }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold" style={{ color: ZamanColors.DarkTeal }}>{aim.title}</h4>
                  <div className="px-2 py-1 rounded-full text-xs font-bold" 
                    style={{ backgroundColor: ZamanColors.PersianGreen, color: ZamanColors.Cloud }}>
                    Достигнуто
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: ZamanColors.DarkTeal }}>{aim.description}</p>
                <div className="flex justify-between text-xs">
                  <span style={{ color: ZamanColors.PersianGreen }}>{formatCurrency(aim.target_amount)}</span>
                  <span style={{ color: ZamanColors.DarkTeal }}>100% выполнено</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============= Savings Radar Chart =============
const SavingsRadar: React.FC<{ profile: Profile; similarUsers: SimilarUser[] }> = ({ profile, similarUsers }) => {
  const avgSimilar = {
    savingsRate: similarUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / similarUsers.length,
    completionRate: similarUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / similarUsers.length,
    balanceGrowth: similarUsers.reduce((acc, user) => acc + user.profile_summary.total_balance, 0) / similarUsers.length / 1000,
    aimProgress: similarUsers.reduce((acc, user) => {
      const aims = user.profile_summary.aims_summary.in_progress_aims;
      return acc + (aims.reduce((sum, aim) => sum + aim.progress_percent, 0) / (aims.length || 1));
    }, 0) / similarUsers.length
  };

  const radarData = [
    { subject: 'Ставка сбережений', you: profile.savings_rate, similar: avgSimilar.savingsRate, fullMark: 100 },
    { subject: 'Выполнение целей', you: profile.completion_rate, similar: avgSimilar.completionRate, fullMark: 100 },
    { subject: 'Прогресс целей', you: profile.avg_aim_progress, similar: avgSimilar.aimProgress, fullMark: 100 },
    { subject: 'Рост баланса', you: profile.total_balance / 1000, similar: avgSimilar.balanceGrowth, fullMark: Math.max(profile.total_balance / 1000, avgSimilar.balanceGrowth) * 1.2 },
    { subject: 'Активность', you: profile.transaction_frequency, similar: similarUsers.reduce((acc, user) => acc + user.profile_summary.num_transactions, 0) / similarUsers.length, fullMark: 50 },
  ];

  return (
    <div 
      className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg"
      style={{
        backgroundColor: ZamanColors.Cloud,
        border: `1px solid ${ZamanColors.LightTeal}`,
      }}
    >
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
        Сравнение финансовых показателей
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: ZamanColors.DarkTeal }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
          <Radar name="Ваши показатели" dataKey="you" stroke={ZamanColors.PersianGreen} fill={ZamanColors.PersianGreen} fillOpacity={0.6} />
          <Radar name="Средние показатели" dataKey="similar" stroke={ZamanColors.Solar} fill={ZamanColors.Solar} fillOpacity={0.6} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
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
  const [activeTab, setActiveTab] = useState<'habits' | 'goals' | 'progress'>('habits');

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

  const tabs = [
    { id: 'habits' as const, label: 'Финансовые привычки', icon: BarChart3 },
    { id: 'goals' as const, label: 'Цели и мотивация', icon: Target },
    { id: 'progress' as const, label: 'Ваш прогресс', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: ZamanColors.Cloud }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: ZamanColors.PersianGreen }}></div>
          <p className="mt-4 text-lg" style={{ color: ZamanColors.DarkTeal }}>Загружаем вашу финансовую аналитику...</p>
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
              Сравните свои финансовые привычки с похожими пользователями
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
            Найдено {similarUsers.length} похожих пользователей
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

      <MotivationCard profile={profile} similarUsers={similarUsers} />

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
          {tabs.map(({ id, label, icon: Icon }) => (
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
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-6 space-y-6">
          {activeTab === 'habits' && (
            <>
              <HabitsComparison profile={profile} similarUsers={similarUsers} />
              <SavingsRadar profile={profile} similarUsers={similarUsers} />
            </>
          )}
          
          {activeTab === 'goals' && (
            <GoalsInspiration similarUsers={similarUsers} />
          )}
          
          {activeTab === 'progress' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: ZamanColors.PersianGreen }}>
                <Heart className="w-10 h-10" style={{ color: ZamanColors.Solar }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>
                Вы на правильном пути!
              </h3>
              <p className="text-lg mb-4" style={{ color: ZamanColors.PersianGreen }}>
                Ваш прогресс: {profile.completion_rate}% целей выполнено
              </p>
              <div className="max-w-md mx-auto p-4 rounded-xl" 
                style={{ backgroundColor: ZamanColors.LightTeal }}>
                <p className="text-sm" style={{ color: ZamanColors.DarkTeal }}>
                  Похожие пользователи в среднем выполняют {
                    (similarUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / similarUsers.length).toFixed(1)
                  }% своих целей
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .flex::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};