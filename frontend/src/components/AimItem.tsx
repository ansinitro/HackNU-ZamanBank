'use client';
import React, {useState, useEffect} from 'react';
import {CheckCircle, TrendingUp, DollarSign, Edit, Trash2, InfoIcon} from 'lucide-react';
import {motion} from 'framer-motion';
import type {FinancialAim, FinancialTx} from '@/types/financialAims';
import {loadAimTx} from "@/lib/financialTxApi";
import {AimHistorySection} from "@/components/AimHistorySection";

const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
    LightTeal: '#B8E6DC',
    DarkTeal: '#1A5F52',
};

type Props = {
    aim: FinancialAim;
    onEdit: (a: FinancialAim) => void;
    onDelete: (id: number) => Promise<void>;
    onAction: (id: number, type: 'withdrawal' | 'deposit', amount?: number) => Promise<void>;
};

export default function AimItem({aim, onEdit, onDelete, onAction}: Props) {
    const [currentAim, setCurrentAim] = useState(aim);
    const [showModal, setShowModal] = useState(false);
    const [showTxModal, setShowTxModal] = useState(false);
    const [modalType, setModalType] = useState<'increase' | 'withdrawal' | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [aimTxs, setAimTxs] = useState<FinancialTx[]>([])

    useEffect(() => {
        setCurrentAim(aim);
    }, [aim]);

    const progress = Math.min(
        100,
        Math.round((currentAim.current_amount / Math.max(1, currentAim.target_amount)) * 100)
    );

    const isCompleted = currentAim.is_completed || progress >= 100;

    async function handleConfirm() {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            if (modalType === 'increase') {
                await onAction(currentAim.id, 'deposit', numAmount);
            } else if (modalType === 'withdrawal') {
                await onAction(currentAim.id, 'withdrawal', numAmount);
            }
        } catch (err) {
            console.error('Transaction error:', err);
            alert('Transaction failed. Please try again.');
        } finally {
            setLoading(false);
            setShowModal(false);
            setAmount('');
            setModalType(null);
        }
    }

    async function handleDeleteClick() {
        if (!confirm('Are you sure you want to delete this aim?')) return;

        try {
            await onDelete(currentAim.id);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete aim. Please try again.');
        }
    }

    const handleHistoryClick = async () => {
        setShowTxModal(true)
        const aimTxs = await loadAimTx(aim.id);
        setAimTxs(aimTxs)
    }

    const cardStyle = isCompleted
        ? {
            background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.LightTeal}20 100%)`,
            borderColor: ZamanColors.PersianGreen,
            boxShadow: `0 8px 20px -4px ${ZamanColors.PersianGreen}40`,
        }
        : {
            background: `linear-gradient(135deg, ${ZamanColors.Cloud} 0%, ${ZamanColors.Solar}15 100%)`,
            borderColor: ZamanColors.LightTeal,
            boxShadow: `0 4px 12px -2px rgba(0, 0, 0, 0.1)`,
        };

    return (
        <>
            <motion.div
                initial={{opacity: 0, y: 20, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                transition={{duration: 0.4, ease: 'easeOut'}}
                whileHover={{y: -4, transition: {duration: 0.2}}}
                className={`relative p-4 sm:p-6 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    isCompleted ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                    ...cardStyle,
                    border: `2px solid ${cardStyle.borderColor}`,
                    boxShadow: cardStyle.boxShadow,
                    ...(isCompleted && {ringColor: ZamanColors.PersianGreen}),
                }}
            >
                {isCompleted && (
                    <div
                        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl rounded-full"
                        style={{background: `radial-gradient(circle, ${ZamanColors.PersianGreen}, transparent)`}}
                    />
                )}

                {/* Header Section */}
                <div className="relative z-10 mb-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold mb-1 break-words"
                                style={{color: ZamanColors.DarkTeal}}>
                                {currentAim.title}
                            </h3>
                            {isCompleted && (
                                <motion.span
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${ZamanColors.PersianGreen}20`,
                                        color: ZamanColors.PersianGreen
                                    }}
                                >
                                    <CheckCircle size={14} className="sm:w-4 sm:h-4"/> Completed 🎉
                                </motion.span>
                            )}
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => {
                                    handleHistoryClick()
                                }}
                                className="p-2 sm:px-3 sm:py-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all"
                                style={{
                                    backgroundColor: ZamanColors.Cloud,
                                    color: ZamanColors.LightTeal,
                                    border: `2px solid ${ZamanColors.PersianGreen}`
                                }}
                                aria-label="History"
                            >
                                <InfoIcon size={16} className="sm:w-5 sm:h-5"/>
                            </motion.button>
                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => onEdit(currentAim)}
                                className="p-2 sm:px-3 sm:py-2 rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all"
                                style={{
                                    backgroundColor: ZamanColors.Cloud,
                                    color: ZamanColors.PersianGreen,
                                    border: `2px solid ${ZamanColors.PersianGreen}`
                                }}
                                aria-label="Edit aim"
                            >
                                <Edit size={16} className="sm:w-5 sm:h-5"/>
                            </motion.button>

                            <motion.button
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={handleDeleteClick}
                                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-sm hover:shadow-md transition-all"
                                aria-label="Delete aim"
                            >
                                <Trash2 size={16} className="sm:w-5 sm:h-5"/>
                            </motion.button>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {currentAim.description}
                    </p>
                </div>

                {/* Progress Info */}
                <div
                    className="relative z-10 flex items-center gap-3 sm:gap-4 mb-3 p-3 rounded-xl"
                    style={{backgroundColor: `${ZamanColors.LightTeal}20`}}
                >
                    <DollarSign size={18} className="sm:w-5 sm:h-5 flex-shrink-0"
                                style={{color: ZamanColors.PersianGreen}}/>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-600">Progress</span>
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${ZamanColors.Solar}50`,
                                    color: ZamanColors.DarkTeal
                                }}
                            >
                {isCompleted ? '100%' : `${progress}%`}
              </span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base font-bold"
                             style={{color: ZamanColors.DarkTeal}}>
                            <span className="truncate">${currentAim.current_amount.toFixed(2)}</span>
                            <span
                                className="text-gray-500 flex-shrink-0 ml-2">/ ${currentAim.target_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative z-10 mb-4">
                    <div
                        className="w-full rounded-full h-2.5 sm:h-3 overflow-hidden relative"
                        style={{backgroundColor: `${ZamanColors.LightTeal}30`}}
                    >
                        <motion.div
                            initial={{width: 0}}
                            animate={{width: `${isCompleted ? 100 : progress}%`}}
                            transition={{duration: 1, ease: 'easeOut', delay: 0.2}}
                            className="h-full rounded-full relative overflow-hidden"
                            style={{
                                background: `linear-gradient(90deg, ${ZamanColors.PersianGreen}, ${ZamanColors.Solar})`,
                            }}
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s infinite',
                                }}
                            />
                        </motion.div>
                    </div>
                </div>

                {showTxModal && (
                    <AimHistorySection
                        transactions={aimTxs}
                        loading={loading}
                        onClose={() => setShowTxModal(false)}
                    />
                )}

                {/* Completion Message */}
                {isCompleted && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-4 text-center p-2.5 sm:p-3 rounded-xl font-semibold text-sm sm:text-base"
                        style={{
                            backgroundColor: `${ZamanColors.PersianGreen}15`,
                            color: ZamanColors.PersianGreen
                        }}
                    >
                        💰 Available: ${currentAim.current_amount.toFixed(2)}
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => {
                            setModalType('withdrawal');
                            setShowModal(true);
                        }}
                        disabled={loading}
                        className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 font-semibold text-sm hover:from-rose-600 hover:to-red-700 flex items-center justify-center gap-2"
                    >
                        <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]"/>
                        Withdraw
                    </motion.button>

                    <motion.button
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => {
                            setModalType('increase');
                            setShowModal(true);
                        }}
                        disabled={loading || isCompleted}
                        className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-xl text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 font-semibold text-sm flex items-center justify-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                        }}
                    >
                        <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]"/>
                        <span className="hidden sm:inline">Closer to Goal</span>
                        <span className="sm:hidden">Add Funds</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Modal */}
            {showModal && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
                    onClick={() => {
                        if (!loading) {
                            setShowModal(false);
                            setAmount('');
                            setModalType(null);
                        }
                    }}
                >
                    <motion.div
                        initial={{scale: 0.9, opacity: 0, y: 20}}
                        animate={{scale: 1, opacity: 1, y: 0}}
                        transition={{duration: 0.3, ease: 'easeOut'}}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-2xl p-5 sm:p-7 shadow-2xl w-full max-w-md border-2 mx-4"
                        style={{
                            backgroundColor: ZamanColors.Cloud,
                            borderColor: ZamanColors.PersianGreen,
                        }}
                    >
                        <h2
                            className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2"
                            style={{color: ZamanColors.DarkTeal}}
                        >
                            {modalType === 'increase' ? (
                                <>
                                    <TrendingUp size={20} className="sm:w-6 sm:h-6"
                                                style={{color: ZamanColors.PersianGreen}}/>
                                    Add Amount
                                </>
                            ) : (
                                <>
                                    <DollarSign size={20} className="sm:w-6 sm:h-6"
                                                style={{color: ZamanColors.PersianGreen}}/>
                                    Withdraw Amount
                                </>
                            )}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            {modalType === 'increase'
                                ? 'Enter the amount you want to add to this goal'
                                : 'Enter the amount you want to withdraw'}
                        </p>

                        <div className="relative mb-5 sm:mb-6">
                            <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-bold"
                                style={{color: ZamanColors.PersianGreen}}
                            >
                                $
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loading) {
                                        handleConfirm();
                                    }
                                }}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 rounded-xl text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    borderColor: ZamanColors.LightTeal,
                                    color: ZamanColors.DarkTeal,
                                }}
                                placeholder="0.00"
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={() => {
                                    setShowModal(false);
                                    setAmount('');
                                    setModalType(null);
                                }}
                                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm border-2 transition-all order-2 sm:order-1"
                                style={{
                                    backgroundColor: ZamanColors.Cloud,
                                    borderColor: ZamanColors.LightTeal,
                                    color: ZamanColors.DarkTeal,
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={handleConfirm}
                                disabled={loading}
                                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 order-1 sm:order-2"
                                style={{
                                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.DarkTeal})`,
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                    <div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        style={{animation: 'spin 1s linear infinite'}}
                    />
                    Processing...
                  </span>
                                ) : (
                                    'Confirm'
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}