'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, BarChart3, Wallet, Loader2, PieChart as PieChartIcon, Sparkles, Trophy, Zap, Heart, Circle, Building, Car, GraduationCap, Plane, Shield } from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';

const ZamanColors = {
  PersianGreen: '#2D9A86',
  Solar: '#EEFE6D',
  Cloud: '#FFFFFF',
  LightTeal: '#B8E6DC',
  DarkTeal: '#1A5F52',
};

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

// ============= Similar Users Overview =============
const SimilarUsersOverview: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
  const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);
  
  const stats = {
    totalUsers: filteredUsers.length,
    avgSavingsRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / filteredUsers.length,
    avgCompletionRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / filteredUsers.length,
    avgBalance: filteredUsers.reduce((acc, user) => acc + user.profile_summary.total_balance, 0) / filteredUsers.length,
    totalAims: filteredUsers.reduce((acc, user) => acc + user.profile_summary.aims_summary.total_in_progress, 0)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={<Users className="w-5 h-5" />}
        value={stats.totalUsers}
        label="Похожих пользователей"
        color={ZamanColors.PersianGreen}
      />
      <StatCard 
        icon={<TrendingUp className="w-5 h-5" />}
        value={`${stats.avgSavingsRate.toFixed(1)}%`}
        label="Средняя ставка сбережений"
        color={ZamanColors.Solar}
      />
      <StatCard 
        icon={<Target className="w-5 h-5" />}
        value={stats.totalAims}
        label="Всего активных целей"
        color={ZamanColors.PersianGreen}
      />
      <StatCard 
        icon={<Wallet className="w-5 h-5" />}
        value={formatCurrency(stats.avgBalance)}
        label="Средний баланс"
        color={ZamanColors.Solar}
      />
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color: string }> = ({ 
  icon, value, label, color 
}) => (
  <div 
    className="p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
    style={{
      background: `linear-gradient(135deg, ${color}15, ${ZamanColors.Cloud} 100%)`,
      border: `2px solid ${color}40`,
    }}
  >
    <div 
      className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      {React.cloneElement(icon as React.ReactElement, { style: { color: ZamanColors.Cloud } })}
    </div>
    <div className="text-xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>{value}</div>
    <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>{label}</div>
  </div>
);

// ============= Popular Aims Analysis =============
const PopularAimsAnalysis: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
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
        avgProgress: 0,
        totalTarget: 0,
        totalCurrent: 0,
        users: []
      };
    }
    acc[aim.title].count++;
    acc[aim.title].totalProgress += aim.progress_percent;
    acc[aim.title].totalTarget += aim.target_amount;
    acc[aim.title].totalCurrent += aim.current_amount;
    acc[aim.title].users.push(aim.username);
    return acc;
  }, {} as any);

  const popularAims = Object.values(aimGroups)
    .map((aim: any) => ({
      ...aim,
      avgProgress: aim.totalProgress / aim.count,
      popularity: (aim.count / filteredUsers.length) * 100
    }))
    .sort((a: any, b: any) => b.popularity - a.popularity);

  const getAimIcon = (title: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      'House': <Building className="w-4 h-4" />,
      'New Car': <Car className="w-4 h-4" />,
      'Education': <GraduationCap className="w-4 h-4" />,
      'Vacation': <Plane className="w-4 h-4" />,
      'Emergency Fund': <Shield className="w-4 h-4" />
    };
    return icons[title] || <Target className="w-4 h-4" />;
  };

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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Aims List */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm" style={{ color: ZamanColors.DarkTeal }}>Самые популярные цели</h4>
          {popularAims.slice(0, 4).map((aim: any, index) => (
            <div 
              key={aim.title}
              className="p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md"
              style={{ 
                backgroundColor: `${ZamanColors.LightTeal}15`,
                borderLeftColor: ZamanColors.PersianGreen
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: ZamanColors.PersianGreen }}
                  >
                    {React.cloneElement(getAimIcon(aim.title), { style: { color: ZamanColors.Cloud } })}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm" style={{ color: ZamanColors.DarkTeal }}>{aim.title}</h5>
                    <p className="text-xs opacity-75" style={{ color: ZamanColors.DarkTeal }}>{aim.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: ZamanColors.PersianGreen }}>
                    {aim.popularity.toFixed(0)}%
                  </div>
                  <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>{aim.count} пользователей</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: ZamanColors.DarkTeal }}>Средний прогресс:</span>
                  <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>
                    {aim.avgProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: ZamanColors.PersianGreen,
                      width: `${aim.avgProgress}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aims Distribution Chart */}
        <div>
          <h4 className="font-bold text-sm mb-4" style={{ color: ZamanColors.DarkTeal }}>Распределение целей</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={popularAims.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ title, popularity }) => `${title}: ${popularity.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="popularity"
              >
                {popularAims.slice(0, 6).map((entry: any, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={[
                      ZamanColors.PersianGreen,
                      ZamanColors.Solar,
                      ZamanColors.LightTeal,
                      ZamanColors.DarkTeal,
                      '#2D9A86',
                      '#1A5F52'
                    ][index % 6]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Популярность']}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============= Financial Tendencies =============
const FinancialTendencies: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
  const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);
  
  const tendencies = {
    savingsRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.savings_rate, 0) / filteredUsers.length,
    avgAimsPerUser: filteredUsers.reduce((acc, user) => acc + user.profile_summary.num_aims, 0) / filteredUsers.length,
    totalBalance: filteredUsers.reduce((acc, user) => acc + user.profile_summary.total_balance, 0) / filteredUsers.length,
    completionRate: filteredUsers.reduce((acc, user) => acc + user.profile_summary.completion_rate, 0) / filteredUsers.length
  };

  const tendencyData = [
    { name: 'Ставка сбережений', value: tendencies.savingsRate, max: 10 },
    { name: 'Целей на пользователя', value: tendencies.avgAimsPerUser, max: 5 },
    { name: 'Выполнение целей', value: tendencies.completionRate, max: 100 },
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
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ZamanColors.PersianGreen }} />
        Финансовые тенденции похожих пользователей
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Bars */}
        <div className="space-y-4">
          {tendencyData.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: ZamanColors.DarkTeal }}>{item.name}</span>
                <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>
                  {item.name === 'Ставка сбережений' ? `${item.value.toFixed(1)}%` : 
                   item.name === 'Целей на пользователя' ? item.value.toFixed(1) :
                   `${item.value.toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{ 
                    backgroundColor: ZamanColors.PersianGreen,
                    width: `${(item.value / item.max) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${ZamanColors.LightTeal}20` }}>
            <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.PersianGreen }}>
              {formatCurrency(tendencies.totalBalance)}
            </div>
            <div className="text-sm" style={{ color: ZamanColors.DarkTeal }}>Средний баланс</div>
          </div>
          
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${ZamanColors.Solar}40` }}>
            <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
              {filteredUsers.length}
            </div>
            <div className="text-sm" style={{ color: ZamanColors.DarkTeal }}>Пользователей в анализе</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= Progress Insights =============
const ProgressInsights: React.FC<{ similarUsers: SimilarUser[] }> = ({ similarUsers }) => {
  const filteredUsers = similarUsers.filter(user => user.similarity_score > 0.5);
  
  const allAims = filteredUsers.flatMap(user => 
    user.profile_summary.aims_summary.in_progress_aims
  );

  const progressRanges = [
    { range: '0-20%', count: 0, color: ZamanColors.Solar },
    { range: '21-40%', count: 0, color: ZamanColors.LightTeal },
    { range: '41-60%', count: 0, color: ZamanColors.PersianGreen },
    { range: '61-80%', count: 0, color: ZamanColors.DarkTeal },
    { range: '81-100%', count: 0, color: '#1A5F52' }
  ];

  allAims.forEach(aim => {
    if (aim.progress_percent <= 20) progressRanges[0].count++;
    else if (aim.progress_percent <= 40) progressRanges[1].count++;
    else if (aim.progress_percent <= 60) progressRanges[2].count++;
    else if (aim.progress_percent <= 80) progressRanges[3].count++;
    else progressRanges[4].count++;
  });

  const totalAims = allAims.length;

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
        Прогресс достижения целей
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progressRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
              <XAxis 
                dataKey="range" 
                tick={{fontSize: 12, fill: ZamanColors.DarkTeal}}
              />
              <YAxis 
                tick={{fontSize: 12, fill: ZamanColors.DarkTeal}}
              />
              <Tooltip />
              <Bar 
                dataKey="count" 
                name="Количество целей"
                radius={[4, 4, 0, 0]}
              >
                {progressRanges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Details */}
        <div className="space-y-3">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${ZamanColors.LightTeal}20` }}>
            <div className="text-3xl font-bold mb-1" style={{ color: ZamanColors.PersianGreen }}>
              {totalAims}
            </div>
            <div className="text-sm" style={{ color: ZamanColors.DarkTeal }}>Всего активных целей</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {progressRanges.map((range, index) => (
              <div 
                key={range.range}
                className="p-3 rounded-lg text-center transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: `${range.color}20`,
                  border: `1px solid ${range.color}40`
                }}
              >
                <div className="text-lg font-bold mb-1" style={{ color: range.color }}>
                  {range.count}
                </div>
                <div className="text-xs" style={{ color: ZamanColors.DarkTeal }}>
                  {range.range}
                </div>
                <div className="text-xs mt-1" style={{ color: ZamanColors.DarkTeal }}>
                  {((range.count / totalAims) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= Main Component =============
export const Similarity: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number>(1);
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
      
      const response = await fetch(`http://localhost:8000/similarity/find-similar/${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch similar users');
      
      const data = await response.json();
      setSimilarUsers(data.similar_users || []);
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
          <p className="mt-4 text-lg" style={{ color: ZamanColors.DarkTeal }}>Анализируем похожих пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
      className="p-3 sm:p-6 space-y-6 min-h-screen"
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
              Аналитика похожих пользователей
            </h1>
            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: ZamanColors.LightTeal }}>
              Изучите цели и финансовые привычки пользователей со схожим профилем
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
            Анализ для пользователя:
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
            {filteredUsers.length} пользователей со сходством {'>'}50%
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div 
          className="p-8 text-center rounded-xl shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `1px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: ZamanColors.PersianGreen }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>
            Не найдено похожих пользователей
          </h3>
          <p style={{ color: ZamanColors.PersianGreen }}>
            Попробуйте выбрать другого пользователя для анализа
          </p>
        </div>
      ) : (
        <>
          <SimilarUsersOverview similarUsers={similarUsers} />
          <PopularAimsAnalysis similarUsers={similarUsers} />
          <FinancialTendencies similarUsers={similarUsers} />
          <ProgressInsights similarUsers={similarUsers} />

          {/* Motivation Footer */}
          <div 
            className="p-6 rounded-xl sm:rounded-2xl text-center"
            style={{
              background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.PersianGreen}20)`,
              border: `2px solid ${ZamanColors.Solar}`,
            }}
          >
            <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: ZamanColors.PersianGreen }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>
              Вы не одиноки в своих целях!
            </h3>
            <p className="text-sm mb-3" style={{ color: ZamanColors.DarkTeal }}>
              {filteredUsers.length} пользователей разделяют ваши финансовые aspirations. <br />
              Вместе двигайтесь к успеху!
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <span style={{ color: ZamanColors.PersianGreen }}>🏠 Дом</span>
              <span style={{ color: ZamanColors.PersianGreen }}>🚗 Автомобиль</span>
              <span style={{ color: ZamanColors.PersianGreen }}>🎓 Образование</span>
              <span style={{ color: ZamanColors.PersianGreen }}>✈️ Отпуск</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};