'use client';

import React, { useState, useEffect } from 'react';
import { Users, ChevronLeft, ChevronRight, Target, TrendingUp, Wallet, Trophy, Circle, Building, Car, GraduationCap, Plane, Shield, Sparkles, Award, Activity } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface SimilarUser {
  user_id: number;
  username?: string;
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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getAimIcon = (title: string) => {
  const icons: { [key: string]: React.ReactElement } = {
    'House': <Building className="w-5 h-5" />,
    'New Car': <Car className="w-5 h-5" />,
    'Education': <GraduationCap className="w-5 h-5" />,
    'Vacation': <Plane className="w-5 h-5" />,
    'Emergency Fund': <Shield className="w-5 h-5" />
  };
  return icons[title] || <Target className="w-5 h-5" />;
};

const getAimColor = (title: string): string => {
  const colors: { [key: string]: string } = {
    'House': ZamanColors.PersianGreen,
    'New Car': '#FF6B6B',
    'Education': '#4ECDC4',
    'Vacation': ZamanColors.Solar,
    'Emergency Fund': ZamanColors.DarkTeal
  };
  return colors[title] || ZamanColors.PersianGreen;
};

// Generate AI-like summary for user
const generateUserSummary = (user: SimilarUser): string => {
  const { profile_summary } = user;
  const { total_balance, savings_rate, num_aims, aims_summary } = profile_summary;
  
  let summary = "";
  
  // Financial strength assessment
  if (total_balance > 8000) {
    summary += "Пользователь с сильной финансовой базой ";
  } else if (total_balance > 5000) {
    summary += "Пользователь со стабильным финансовым положением ";
  } else {
    summary += "Пользователь активно работает над улучшением финансов ";
  }
  
  // Savings behavior
  if (savings_rate > 2) {
    summary += "и впечатляющей дисциплиной накоплений. ";
  } else if (savings_rate > 0.5) {
    summary += "с хорошими привычками сбережений. ";
  } else if (savings_rate > 0) {
    summary += "и начинает формировать финансовую подушку. ";
  } else {
    summary += "в процессе построения стратегии накоплений. ";
  }
  
  // Goals focus
  if (num_aims > 0) {
    const goalTypes = aims_summary.in_progress_aims.map(a => a.title);
    if (goalTypes.includes("House")) {
      summary += "Приоритет: покупка недвижимости. ";
    } else if (goalTypes.includes("Education")) {
      summary += "Фокус на инвестициях в образование. ";
    } else if (goalTypes.includes("Emergency Fund")) {
      summary += "Создание финансовой подушки безопасности. ";
    } else if (goalTypes.includes("Vacation")) {
      summary += "Планирование путешествий и отдыха. ";
    }
    
    // Progress assessment
    const avgProgress = aims_summary.in_progress_aims.reduce((acc, aim) => acc + aim.progress_percent, 0) / aims_summary.in_progress_aims.length;
    if (avgProgress > 5) {
      summary += "Демонстрирует отличный прогресс в достижении целей.";
    } else if (avgProgress > 2) {
      summary += "Стабильно движется к поставленным целям.";
    } else {
      summary += "Только начинает путь к своим финансовым целям.";
    }
  } else {
    summary += "Еще не установил конкретные финансовые цели.";
  }
  
  return summary;
};

export const Similarity: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<number>(3);
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
      if (!response.ok) throw new Error('Не удалось загрузить данные');
      
      const data = await response.json();
      const filtered = (data.similar_users || []).filter((user: SimilarUser) => user.similarity_score > 0.3);
      setSimilarUsers(filtered);
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : similarUsers.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < similarUsers.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: ZamanColors.Cloud }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto" style={{ borderColor: ZamanColors.PersianGreen }}></div>
          <p className="mt-6 text-xl font-medium" style={{ color: ZamanColors.DarkTeal }}>Загрузка похожих пользователей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: ZamanColors.Cloud }}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="p-4 rounded-full bg-red-100 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: ZamanColors.DarkTeal }}>Ошибка загрузки</h2>
          <p className="mb-8 text-lg" style={{ color: ZamanColors.PersianGreen }}>{error}</p>
          <button
            onClick={loadData}
            className="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
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

  if (similarUsers.length === 0) {
    return (
      <div className="min-h-screen p-6" style={{ 
        background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)` 
      }}>
        <div className="max-w-4xl mx-auto">
          <div 
            className="p-6 rounded-2xl shadow-lg mb-6"
            style={{
              background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
              borderBottom: `4px solid ${ZamanColors.Solar}`,
            }}
          >
            <h1 className="text-3xl font-bold mb-2" style={{ color: ZamanColors.Solar }}>
              Похожие пользователи
            </h1>
            <p className="text-sm" style={{ color: ZamanColors.LightTeal }}>
              Пользователь #{currentUserId}
            </p>
          </div>

          <div 
            className="p-12 text-center rounded-2xl shadow-lg"
            style={{
              backgroundColor: ZamanColors.Cloud,
              border: `2px solid ${ZamanColors.LightTeal}`,
            }}
          >
            <Users className="w-20 h-20 mx-auto mb-6 opacity-50" style={{ color: ZamanColors.PersianGreen }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: ZamanColors.DarkTeal }}>
              Не найдено похожих пользователей
            </h3>
            <p className="text-lg" style={{ color: ZamanColors.PersianGreen }}>
              К сожалению, для вашего профиля нет пользователей со сходством выше 30%
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = similarUsers[currentIndex];
  const { aims_summary, total_balance, savings_rate, num_aims } = currentUser.profile_summary;

  // Calculate total amounts
  const totalTargetAmount = aims_summary.in_progress_aims.reduce((sum, aim) => sum + aim.target_amount, 0);
  const totalCurrentAmount = aims_summary.in_progress_aims.reduce((sum, aim) => sum + aim.current_amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  // Prepare Goals Distribution Data for Pie Chart
  const goalsDistribution = aims_summary.in_progress_aims.map(aim => ({
    name: aim.title,
    value: aim.target_amount,
    current: aim.current_amount,
    progress: aim.progress_percent
  }));

  // Prepare Progress Categories for Bar Chart
  const progressCategories = [
    { name: '0-25%', count: 0, color: '#FF6B6B' },
    { name: '26-50%', count: 0, color: '#FFA500' },
    { name: '51-75%', count: 0, color: ZamanColors.Solar },
    { name: '76-100%', count: 0, color: ZamanColors.PersianGreen }
  ];

  aims_summary.in_progress_aims.forEach(aim => {
    if (aim.progress_percent <= 25) progressCategories[0].count++;
    else if (aim.progress_percent <= 50) progressCategories[1].count++;
    else if (aim.progress_percent <= 75) progressCategories[2].count++;
    else progressCategories[3].count++;
  });

  // Radar chart data for comprehensive user profile
  const profileRadarData = [
    { 
      subject: 'Баланс', 
      value: Math.min((total_balance / 10000) * 100, 100),
      fullMark: 100
    },
    { 
      subject: 'Накопления', 
      value: Math.min(savings_rate * 15, 100),
      fullMark: 100
    },
    { 
      subject: 'Активность', 
      value: Math.min((num_aims / 5) * 100, 100),
      fullMark: 100
    },
    { 
      subject: 'Прогресс', 
      value: overallProgress,
      fullMark: 100
    },
    { 
      subject: 'Сходство', 
      value: currentUser.similarity_score * 100,
      fullMark: 100
    }
  ];

  // Individual goal progress data for comparison
  const goalProgressData = aims_summary.in_progress_aims.map(aim => ({
    name: aim.title,
    progress: aim.progress_percent,
    target: 100
  }));

  const COLORS = [ZamanColors.PersianGreen, '#FF6B6B', '#4ECDC4', ZamanColors.Solar, ZamanColors.DarkTeal];

  return (
    <div 
      className="min-h-screen p-4 md:p-6"
      style={{
        background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}15 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div 
          className="p-6 rounded-2xl shadow-lg"
          style={{
            background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
            borderBottom: `4px solid ${ZamanColors.Solar}`,
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: ZamanColors.Solar }}>
                Похожие пользователи
              </h1>
              <p className="text-sm" style={{ color: ZamanColors.LightTeal }}>
                Вы: Пользователь #{currentUserId} • Найдено {similarUsers.length} похожих пользователей (сходство {'>'} 30%)
              </p>
            </div>
            <Users className="w-12 h-12" style={{ color: ZamanColors.Solar }} />
          </div>
        </div>

        {/* Navigation Bar */}
        <div 
          className="p-4 md:p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `2px solid ${ZamanColors.LightTeal}`,
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              className="p-3 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-30"
              style={{
                backgroundColor: ZamanColors.Solar,
                color: ZamanColors.DarkTeal,
              }}
              disabled={similarUsers.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="text-center flex-1">
              <div className="text-lg font-bold mb-2" style={{ color: ZamanColors.DarkTeal }}>
                Похожий пользователь {currentIndex + 1} из {similarUsers.length}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {similarUsers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className="transition-all duration-300 hover:scale-125"
                  >
                    <Circle
                      className={`w-3 h-3 ${index === currentIndex ? 'fill-current' : ''}`}
                      style={{ 
                        color: index === currentIndex ? ZamanColors.PersianGreen : ZamanColors.LightTeal 
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-30"
              style={{
                backgroundColor: ZamanColors.Solar,
                color: ZamanColors.DarkTeal,
              }}
              disabled={similarUsers.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div 
          className="p-6 md:p-8 rounded-2xl shadow-2xl"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `3px solid ${ZamanColors.PersianGreen}`,
          }}
        >
          {/* User Header */}
          <div className="text-center mb-8">
            <div 
              className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})` 
              }}
            >
              <Users className="w-12 h-12" style={{ color: ZamanColors.Solar }} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: ZamanColors.DarkTeal }}>
              Пользователь #{currentUser.user_id}
            </h2>
            <div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold shadow-md mb-4"
              style={{
                backgroundColor: ZamanColors.Solar,
                color: ZamanColors.DarkTeal,
              }}
            >
              <Trophy className="w-5 h-5" />
              Сходство: {(currentUser.similarity_score * 100).toFixed(1)}%
            </div>

            {/* AI Summary */}
            <div 
              className="mt-4 p-5 rounded-xl max-w-3xl mx-auto"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.LightTeal}30, ${ZamanColors.Cloud})`,
                border: `2px solid ${ZamanColors.LightTeal}`,
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: ZamanColors.PersianGreen }} />
                <div className="text-left">
                  <p className="text-sm font-bold mb-2" style={{ color: ZamanColors.PersianGreen }}>
                    Анализ профиля
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: ZamanColors.DarkTeal }}>
                    {generateUserSummary(currentUser)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="p-5 rounded-xl text-center transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.Cloud})`,
                border: `2px solid ${ZamanColors.PersianGreen}`,
              }}
            >
              <Wallet className="w-10 h-10 mx-auto mb-3" style={{ color: ZamanColors.PersianGreen }} />
              <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
                {formatCurrency(total_balance)}
              </div>
              <div className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>Общий баланс</div>
            </div>

            <div 
              className="p-5 rounded-xl text-center transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.Solar}50, ${ZamanColors.Cloud})`,
                border: `2px solid ${ZamanColors.Solar}`,
              }}
            >
              <Target className="w-10 h-10 mx-auto mb-3" style={{ color: ZamanColors.DarkTeal }} />
              <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
                {num_aims}
              </div>
              <div className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>Активных целей</div>
            </div>

            <div 
              className="p-5 rounded-xl text-center transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.LightTeal}80, ${ZamanColors.Cloud})`,
                border: `2px solid ${ZamanColors.LightTeal}`,
              }}
            >
              <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: ZamanColors.PersianGreen }} />
              <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
                {savings_rate.toFixed(1)}%
              </div>
              <div className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>Ставка накоплений</div>
            </div>

            <div 
              className="p-5 rounded-xl text-center transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}20, ${ZamanColors.Cloud})`,
                border: `2px solid ${ZamanColors.PersianGreen}`,
              }}
            >
              <Award className="w-10 h-10 mx-auto mb-3" style={{ color: ZamanColors.Solar }} />
              <div className="text-2xl font-bold mb-1" style={{ color: ZamanColors.DarkTeal }}>
                {overallProgress.toFixed(1)}%
              </div>
              <div className="text-sm font-medium" style={{ color: ZamanColors.DarkTeal }}>Общий прогресс</div>
            </div>
          </div>

          {/* Overall Progress Summary */}
          <div 
            className="mb-8 p-6 rounded-xl"
            style={{
              backgroundColor: `${ZamanColors.LightTeal}20`,
              border: `2px solid ${ZamanColors.LightTeal}`,
            }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
              <Activity className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
              Общая финансовая сводка
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: ZamanColors.Cloud }}>
                <div className="text-sm font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
                  Общая цель
                </div>
                <div className="text-2xl font-bold" style={{ color: ZamanColors.PersianGreen }}>
                  {formatCurrency(totalTargetAmount)}
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: ZamanColors.Cloud }}>
                <div className="text-sm font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
                  Накоплено
                </div>
                <div className="text-2xl font-bold" style={{ color: ZamanColors.DarkTeal }}>
                  {formatCurrency(totalCurrentAmount)}
                </div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: ZamanColors.Cloud }}>
                <div className="text-sm font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
                  Осталось
                </div>
                <div className="text-2xl font-bold" style={{ color: '#FF6B6B' }}>
                  {formatCurrency(totalTargetAmount - totalCurrentAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {aims_summary.in_progress_aims.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Profile Radar Chart */}
              <div 
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: `${ZamanColors.LightTeal}15`,
                  border: `2px solid ${ZamanColors.LightTeal}`,
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                  <Activity className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
                  Профиль пользователя
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={profileRadarData}>
                    <PolarGrid stroke={ZamanColors.LightTeal} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: ZamanColors.DarkTeal, fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: ZamanColors.DarkTeal, fontSize: 10 }} />
                    <Radar 
                      name="Показатели" 
                      dataKey="value" 
                      stroke={ZamanColors.PersianGreen} 
                      fill={ZamanColors.PersianGreen} 
                      fillOpacity={0.6} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Goals Distribution Pie Chart */}
              <div 
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: `${ZamanColors.LightTeal}15`,
                  border: `2px solid ${ZamanColors.LightTeal}`,
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                  <Target className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
                  Распределение целей
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={goalsDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {goalsDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAimColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Goal Progress Comparison */}
              <div 
                className="p-6 rounded-xl lg:col-span-2"
                style={{
                  backgroundColor: `${ZamanColors.LightTeal}15`,
                  border: `2px solid ${ZamanColors.LightTeal}`,
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                  <TrendingUp className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
                  Прогресс по целям
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={goalProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: ZamanColors.DarkTeal, fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: ZamanColors.DarkTeal, fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="progress" fill={ZamanColors.PersianGreen} radius={[8, 8, 0, 0]}>
                      {goalProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAimColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Progress Distribution */}
              {progressCategories.some(cat => cat.count > 0) && (
                <div 
                  className="p-6 rounded-xl lg:col-span-2"
                  style={{
                    backgroundColor: `${ZamanColors.LightTeal}15`,
                    border: `2px solid ${ZamanColors.LightTeal}`,
                  }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
                    <Trophy className="w-5 h-5" style={{ color: ZamanColors.PersianGreen }} />
                    Распределение прогресса
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={progressCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke={`${ZamanColors.LightTeal}60`} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: ZamanColors.DarkTeal, fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fill: ZamanColors.DarkTeal, fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {progressCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Goals Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: ZamanColors.DarkTeal }}>
              <Target className="w-6 h-6" style={{ color: ZamanColors.PersianGreen }} />
              Текущие цели ({aims_summary.in_progress_aims.length})
            </h3>
            
            {aims_summary.in_progress_aims.length === 0 ? (
              <div 
                className="p-12 text-center rounded-xl"
                style={{ backgroundColor: `${ZamanColors.LightTeal}15` }}
              >
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: ZamanColors.PersianGreen }} />
                <p className="text-lg font-medium" style={{ color: ZamanColors.DarkTeal }}>
                  У этого пользователя нет активных целей
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {aims_summary.in_progress_aims.map((aim, index) => (
                  <div 
                    key={index}
                    className="p-5 rounded-xl transition-all duration-300 hover:shadow-xl"
                    style={{ 
                      backgroundColor: ZamanColors.Cloud,
                      border: `3px solid ${ZamanColors.LightTeal}`
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: getAimColor(aim.title) }}
                        >
                          {React.cloneElement(getAimIcon(aim.title), { style: { color: ZamanColors.Cloud } })}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-lg mb-1" style={{ color: ZamanColors.DarkTeal }}>
                            {aim.title}
                          </h5>
                          <p className="text-sm opacity-75" style={{ color: ZamanColors.DarkTeal }}>
                            {aim.description}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: `${ZamanColors.Solar}80`,
                          color: ZamanColors.DarkTeal
                        }}
                      >
                        {aim.progress_percent.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: ZamanColors.DarkTeal }}>
                          Накоплено: {formatCurrency(aim.current_amount)}
                        </span>
                        <span className="font-bold" style={{ color: ZamanColors.PersianGreen }}>
                          Цель: {formatCurrency(aim.target_amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-500" 
                          style={{ 
                            backgroundColor: getAimColor(aim.title),
                            width: `${Math.min(aim.progress_percent, 100)}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-right font-medium" style={{ color: ZamanColors.DarkTeal }}>
                        Осталось: {formatCurrency(aim.target_amount - aim.current_amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Goals Summary */}
            {aims_summary.total_completed > 0 && (
              <div 
                className="mt-6 p-4 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: `${ZamanColors.Solar}40` }}
              >
                <Trophy className="w-8 h-8" style={{ color: ZamanColors.PersianGreen }} />
                <div>
                  <div className="font-bold text-lg" style={{ color: ZamanColors.DarkTeal }}>
                    {aims_summary.total_completed} завершенных целей
                  </div>
                  <div className="text-sm" style={{ color: ZamanColors.DarkTeal }}>
                    Этот пользователь уже достиг {aims_summary.total_completed} целей!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div 
          className="p-6 rounded-xl text-center"
          style={{
            background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.PersianGreen}20)`,
            border: `2px solid ${ZamanColors.Solar}`,
          }}
        >
          <p className="text-base font-medium mb-2" style={{ color: ZamanColors.DarkTeal }}>
            💡 Изучайте финансовые привычки похожих пользователей
          </p>
          <p className="text-sm" style={{ color: ZamanColors.DarkTeal }}>
            Используйте стрелки для просмотра других пользователей со схожим профилем
          </p>
        </div>
      </div>
    </div>
  );
};