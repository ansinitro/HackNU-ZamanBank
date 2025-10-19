"use client"
import React, {useState, useMemo} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Target, Calendar, TrendingUp, DollarSign, CheckCircle, Clock, ChevronRight} from 'lucide-react';

const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
    LightTeal: '#B8E6DC',
    DarkTeal: '#1A5F52',
};

// Sample data - replace with actual API call
const sampleAims = [
    {
        id: 1,
        title: 'Emergency Fund',
        description: 'Build a safety net for unexpected expenses',
        target_amount: 10000,
        current_amount: 6500,
        deadline: '2025-03-31T00:00:00Z',
        is_completed: false,
        user_id: 1
    },
    {
        id: 2,
        title: 'Vacation to Europe',
        description: 'Summer trip to Italy and France',
        target_amount: 5000,
        current_amount: 5000,
        deadline: '2025-06-15T00:00:00Z',
        is_completed: true,
        user_id: 1
    },
    {
        id: 3,
        title: 'New Laptop',
        description: 'MacBook Pro for work',
        target_amount: 2500,
        current_amount: 800,
        deadline: '2025-08-01T00:00:00Z',
        is_completed: false,
        user_id: 1
    },
    {
        id: 4,
        title: 'Investment Portfolio',
        description: 'Start investing in index funds',
        target_amount: 15000,
        current_amount: 3200,
        deadline: '2025-12-31T00:00:00Z',
        is_completed: false,
        user_id: 1
    },
];

const FinancialAimsDashboard = ({aims = sampleAims}) => {
    const [selectedAim, setSelectedAim] = useState(null);
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => {
        const total = aims.length;
        const completed = aims.filter(a => a.is_completed).length;
        const totalTarget = aims.reduce((sum, a) => sum + a.target_amount, 0);
        const totalCurrent = aims.reduce((sum, a) => sum + (a.current_amount || 0), 0);
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

        return {total, completed, totalTarget, totalCurrent, overallProgress};
    }, [aims]);

    const filteredAims = useMemo(() => {
        if (filter === 'completed') return aims.filter(a => a.is_completed);
        if (filter === 'active') return aims.filter(a => !a.is_completed);
        return aims;
    }, [aims, filter]);

    const getTimelinePosition = (deadline) => {
        const start = new Date(new Date().getFullYear(), 0, 1);
        const end = new Date(new Date().getFullYear(), 11, 31);
        const target = new Date(deadline);
        const progress = (target - start) / (end - start);
        return Math.max(0, Math.min(100, progress * 100));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getDaysRemaining = (deadline) => {
        const today = new Date();
        const target = new Date(deadline);
        const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${ZamanColors.LightTeal}20, ${ZamanColors.Cloud})`,
            padding: '2rem'
        }}>
            <div style={{maxWidth: '1400px', margin: '0 auto'}}>
                {/* Header */}
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    style={{marginBottom: '2rem'}}
                >
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: ZamanColors.DarkTeal,
                        marginBottom: '0.5rem'
                    }}>
                        Прогресс 2025
                    </h1>
                    <p style={{color: ZamanColors.PersianGreen, fontSize: '1.1rem'}}>
                       Отслеживайте свои финансовые цели в течение всего года
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        {icon: Target, label: 'Total Aims', value: stats.total, color: ZamanColors.PersianGreen},
                        {icon: CheckCircle, label: 'Достигнуто', value: stats.completed, color: ZamanColors.Solar},
                        {
                            icon: DollarSign,
                            label: 'Total Progress',
                            value: formatCurrency(stats.totalCurrent),
                            color: ZamanColors.DarkTeal
                        },
                        {
                            icon: TrendingUp,
                            label: 'Overall Progress',
                            value: `${stats.overallProgress.toFixed(0)}%`,
                            color: ZamanColors.PersianGreen
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{delay: idx * 0.1}}
                            style={{
                                background: ZamanColors.Cloud,
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                border: `2px solid ${ZamanColors.LightTeal}`,
                            }}
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                <div style={{
                                    background: `${stat.color}20`,
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem'
                                }}>
                                    <stat.icon size={24} color={stat.color}/>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: ZamanColors.PersianGreen,
                                        marginBottom: '0.25rem'
                                    }}>
                                        {stat.label}
                                    </div>
                                    <div style={{fontSize: '1.75rem', fontWeight: 'bold', color: ZamanColors.DarkTeal}}>
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
                    {['all', 'active', 'Достигнуто'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: filter === f ? ZamanColors.PersianGreen : ZamanColors.Cloud,
                                color: filter === f ? ZamanColors.Cloud : ZamanColors.DarkTeal,
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textTransform: 'capitalize',
                                boxShadow: filter === f ? '0 4px 12px rgba(45, 154, 134, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Timeline View */}
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    style={{
                        background: ZamanColors.Cloud,
                        borderRadius: '1rem',
                        padding: '2rem',
                        marginBottom: '2rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: `2px solid ${ZamanColors.LightTeal}`,
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
                        <Calendar size={24} color={ZamanColors.PersianGreen}/>
                        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: ZamanColors.DarkTeal}}>
                            2025 Timeline
                        </h2>
                    </div>

                    <div style={{position: 'relative', height: '120px'}}>
                        {/* Timeline bar */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: ZamanColors.LightTeal,
                            borderRadius: '2px',
                        }}/>

                        {/* Month markers */}
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                            <div
                                key={month}
                                style={{
                                    position: 'absolute',
                                    left: `${(idx / 11) * 100}%`,
                                    top: '50%',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    background: ZamanColors.PersianGreen,
                                    borderRadius: '50%',
                                    margin: '0 auto',
                                }}/>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: ZamanColors.DarkTeal,
                                    marginTop: '0.5rem',
                                    textAlign: 'center',
                                }}>
                                    {month}
                                </div>
                            </div>
                        ))}

                        {/* Aims on timeline */}
                        {filteredAims.filter(a => !a.is_completed).map((aim) => (
                            <motion.div
                                key={aim.id}
                                initial={{scale: 0}}
                                animate={{scale: 1}}
                                whileHover={{scale: 1.2}}
                                style={{
                                    position: 'absolute',
                                    left: `${getTimelinePosition(aim.deadline)}%`,
                                    top: '20%',
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedAim(aim)}
                            >
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    background: ZamanColors.Solar,
                                    border: `3px solid ${ZamanColors.PersianGreen}`,
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}/>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Aims Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <AnimatePresence>
                        {filteredAims.map((aim, idx) => {
                            const progress = (aim.current_amount / aim.target_amount) * 100;
                            const daysLeft = getDaysRemaining(aim.deadline);
                            const isOverdue = daysLeft < 0 && !aim.is_completed;

                            return (
                                <motion.div
                                    key={aim.id}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, scale: 0.9}}
                                    transition={{delay: idx * 0.05}}
                                    whileHover={{y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.15)'}}
                                    style={{
                                        background: ZamanColors.Cloud,
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        border: `2px solid ${aim.is_completed ? ZamanColors.Solar : ZamanColors.LightTeal}`,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onClick={() => setSelectedAim(aim)}
                                >
                                    {aim.is_completed && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            background: ZamanColors.Solar,
                                            borderRadius: '50%',
                                            padding: '0.5rem',
                                        }}>
                                            <CheckCircle size={20} color={ZamanColors.DarkTeal}/>
                                        </div>
                                    )}

                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        color: ZamanColors.DarkTeal,
                                        marginBottom: '0.5rem'
                                    }}>
                                        {aim.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: ZamanColors.PersianGreen,
                                        marginBottom: '1rem'
                                    }}>
                                        {aim.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div style={{marginBottom: '1rem'}}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.5rem'
                                        }}>
                      <span style={{fontSize: '0.875rem', color: ZamanColors.DarkTeal, fontWeight: '600'}}>
                        {formatCurrency(aim.current_amount)}
                      </span>
                                            <span style={{fontSize: '0.875rem', color: ZamanColors.PersianGreen}}>
                        {formatCurrency(aim.target_amount)}
                      </span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            background: ZamanColors.LightTeal,
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}>
                                            <motion.div
                                                initial={{width: 0}}
                                                animate={{width: `${Math.min(progress, 100)}%`}}
                                                transition={{duration: 1, delay: idx * 0.1}}
                                                style={{
                                                    height: '100%',
                                                    background: aim.is_completed ? ZamanColors.Solar : ZamanColors.PersianGreen,
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            textAlign: 'right',
                                            marginTop: '0.25rem',
                                            fontSize: '0.75rem',
                                            color: ZamanColors.DarkTeal,
                                            fontWeight: '600'
                                        }}>
                                            {progress.toFixed(0)}%
                                        </div>
                                    </div>

                                    {/* Deadline Info */}
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <Clock size={16} color={isOverdue ? '#ef4444' : ZamanColors.PersianGreen}/>
                                        <span style={{
                                            fontSize: '0.875rem',
                                            color: isOverdue ? '#ef4444' : ZamanColors.DarkTeal
                                        }}>
                      {isOverdue
                          ? `Overdue by ${Math.abs(daysLeft)} days`
                          : aim.is_completed
                              ? 'Достигнуто'
                              : `${daysLeft} days remaining`}
                    </span>
                                    </div>

                                    <ChevronRight
                                        size={20}
                                        color={ZamanColors.PersianGreen}
                                        style={{position: 'absolute', bottom: '1rem', right: '1rem'}}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Detail Modal */}
                <AnimatePresence>
                    {selectedAim && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                zIndex: 50,
                            }}
                            onClick={() => setSelectedAim(null)}
                        >
                            <motion.div
                                initial={{scale: 0.9, y: 20}}
                                animate={{scale: 1, y: 0}}
                                exit={{scale: 0.9, y: 20}}
                                style={{
                                    background: ZamanColors.Cloud,
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    maxWidth: '500px',
                                    width: '100%',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 'bold',
                                    color: ZamanColors.DarkTeal,
                                    marginBottom: '1rem'
                                }}>
                                    {selectedAim.title}
                                </h2>
                                <p style={{color: ZamanColors.PersianGreen, marginBottom: '1.5rem'}}>
                                    {selectedAim.description}
                                </p>

                                <div style={{marginBottom: '1.5rem'}}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <div>
                                            <div style={{fontSize: '0.875rem', color: ZamanColors.PersianGreen}}>Current
                                                Amount
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: ZamanColors.DarkTeal
                                            }}>
                                                {formatCurrency(selectedAim.current_amount)}
                                            </div>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <div style={{fontSize: '0.875rem', color: ZamanColors.PersianGreen}}>Target
                                                Amount
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: ZamanColors.DarkTeal
                                            }}>
                                                {formatCurrency(selectedAim.target_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '1rem',
                                        background: `${ZamanColors.LightTeal}40`,
                                        borderRadius: '0.75rem',
                                        marginBottom: '1rem',
                                    }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: ZamanColors.DarkTeal,
                                            marginBottom: '0.25rem'
                                        }}>
                                            Remaining to Goal
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            color: ZamanColors.PersianGreen
                                        }}>
                                            {formatCurrency(selectedAim.target_amount - selectedAim.current_amount)}
                                        </div>
                                    </div>

                                    <div style={{fontSize: '0.875rem', color: ZamanColors.DarkTeal}}>
                                        <strong>Deadline:</strong> {new Date(selectedAim.deadline).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedAim(null)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: ZamanColors.PersianGreen,
                                        color: ZamanColors.Cloud,
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                    }}
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinancialAimsDashboard;