"use client";
import {useState} from 'react';
import {
    Filter, Calendar, Tag, DollarSign, TrendingUp, TrendingDown, X, Search,
    RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import {FilterParams} from "@/types/transactions";
import {TransactionsDateFilter} from "@/components/DateRangeSelector";

// Zaman Color DNA
const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
    LightTeal: '#B8E6DC',
    DarkTeal: '#1A5F52',
};

interface TransactionFilterFormProps {
    onFilterChange: (filters: FilterParams) => void;
    categories?: string[];
    loading?: boolean;
}

export default function TransactionFilterForm({
                                                  onFilterChange,
                                                  categories = [],
                                                  loading = false
                                              }: TransactionFilterFormProps) {
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [category, setCategory] = useState('');
    const [transactionType, setTransactionType] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleFilter = () => {
        const filters: FilterParams = {
            category: category || undefined,
            type: transactionType !== 'all' ? transactionType : undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        };

        onFilterChange(filters);
    };

    const handleReset = () => {
        setCategory('');
        setTransactionType('all');
        setDateFrom('');
        setDateTo('');
        onFilterChange({});
    };

    const hasActiveFilters = category || transactionType !== 'all' || dateFrom || dateTo
    const activeFilterCount = [category, transactionType !== 'all', dateFrom, dateTo].filter(Boolean).length;

    return (
        <div
            className="rounded-2xl shadow-xl mb-6 overflow-hidden"
            style={{
                backgroundColor: ZamanColors.Cloud,
                border: `2px solid ${ZamanColors.Solar}30`,
            }}
        >
            {/* Filter Header - Collapsible */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
                className="w-full p-4 sm:p-6 flex items-center justify-between transition-all duration-300 hover:bg-opacity-50 disabled:opacity-50"
                style={{
                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}10, ${ZamanColors.Solar}10)`,
                }}
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className="p-2 sm:p-3 rounded-xl"
                        style={{
                            backgroundColor: `${ZamanColors.PersianGreen}20`,
                        }}
                    >
                        <Filter
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            style={{color: ZamanColors.PersianGreen}}
                        />
                    </div>
                    <div className="text-left">
                        <h2
                            className="text-lg sm:text-xl font-bold"
                            style={{color: ZamanColors.PersianGreen}}
                        >
                            Filter Transactions
                        </h2>
                        {hasActiveFilters && (
                            <p className="text-xs sm:text-sm" style={{color: ZamanColors.DarkTeal}}>
                                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                // e.stopPropagation();
                                handleReset();
                            }}
                            disabled={loading}
                            className="p-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                            style={{
                                backgroundColor: `${ZamanColors.Solar}40`,
                                color: ZamanColors.PersianGreen,
                            }}
                            title="Reset filters"
                        >
                            <RefreshCw size={16} className="sm:w-5 sm:h-5"/>
                        </button>
                    )}

                    {showFilters ? (
                        <ChevronUp className="w-5 h-5" style={{color: ZamanColors.PersianGreen}}/>
                    ) : (
                        <ChevronDown className="w-5 h-5" style={{color: ZamanColors.PersianGreen}}/>
                    )}
                </div>
            </button>

            {/* Filter Form */}
            {showFilters && (
                <div className="p-4 sm:p-6 border-t" style={{borderColor: `${ZamanColors.Solar}30`}}>
                    <div className="space-y-4 sm:space-y-5">
                        {/* Transaction Type */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                                   style={{color: ZamanColors.PersianGreen}}>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="sm:w-4 sm:h-4"/>
                                    Transaction Type
                                </div>
                            </label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {[
                                    {value: 'all', label: 'All', icon: DollarSign},
                                    {value: 'deposit', label: 'Income', icon: TrendingUp},
                                    {value: 'withdrawal', label: 'Expense', icon: TrendingDown},
                                ].map(({value, label, icon: Icon}) => (
                                    <button
                                        key={value}
                                        onClick={() => setTransactionType(value)}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                                        style={{
                                            backgroundColor: transactionType === value
                                                ? ZamanColors.PersianGreen
                                                : `${ZamanColors.PersianGreen}10`,
                                            color: transactionType === value
                                                ? ZamanColors.Solar
                                                : ZamanColors.PersianGreen,
                                            border: `2px solid ${transactionType === value ? ZamanColors.Solar : 'transparent'}`,
                                            boxShadow: transactionType === value ? `0 4px 12px ${ZamanColors.PersianGreen}20` : 'none',
                                        }}
                                    >
                                        <Icon size={14} className="sm:w-4 sm:h-4"/>
                                        <span className="hidden sm:inline">{label}</span>
                                        <span
                                            className="sm:hidden">{label === 'Income' ? 'In' : label === 'Expense' ? 'Out' : 'All'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category & Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-xs sm:text-sm font-semibold mb-2"
                                       style={{color: ZamanColors.PersianGreen}}>
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} className="sm:w-4 sm:h-4"/>
                                        Category
                                    </div>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={loading}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl outline-none transition-all duration-300 appearance-none cursor-pointer text-sm disabled:opacity-50"
                                        style={{
                                            backgroundColor: ZamanColors.Cloud,
                                            border: `2px solid ${category ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`}`,
                                            color: ZamanColors.PersianGreen,
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232D9A86' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 12px center',
                                            paddingRight: '40px',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = ZamanColors.Solar;
                                            e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = category ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date Range */}
                            {/*<div>*/}
                            {/*  <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: ZamanColors.PersianGreen }}>*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*      <Calendar size={14} className="sm:w-4 sm:h-4" />*/}
                            {/*      Date Range*/}
                            {/*    </div>*/}
                            {/*  </label>*/}
                            {/*  <div className="flex gap-2">*/}
                            {/*    <input*/}
                            {/*      type="date"*/}
                            {/*      value={dateFrom}*/}
                            {/*      onChange={(e) => setDateFrom(e.target.value)}*/}
                            {/*      max={dateTo || undefined}*/}
                            {/*      disabled={loading}*/}
                            {/*      className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl outline-none transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"*/}
                            {/*      style={{*/}
                            {/*        backgroundColor: ZamanColors.Cloud,*/}
                            {/*        border: `2px solid ${dateFrom ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`}`,*/}
                            {/*        color: ZamanColors.PersianGreen,*/}
                            {/*      }}*/}
                            {/*      onFocus={(e) => {*/}
                            {/*        e.target.style.borderColor = ZamanColors.Solar;*/}
                            {/*        e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;*/}
                            {/*      }}*/}
                            {/*      onBlur={(e) => {*/}
                            {/*        e.target.style.borderColor = dateFrom ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`;*/}
                            {/*        e.target.style.boxShadow = 'none';*/}
                            {/*      }}*/}
                            {/*    />*/}
                            {/*    <input*/}
                            {/*      type="date"*/}
                            {/*      value={dateTo}*/}
                            {/*      onChange={(e) => setDateTo(e.target.value)}*/}
                            {/*      min={dateFrom || undefined}*/}
                            {/*      disabled={loading}*/}
                            {/*      className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl outline-none transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"*/}
                            {/*      style={{*/}
                            {/*        backgroundColor: ZamanColors.Cloud,*/}
                            {/*        border: `2px solid ${dateTo ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`}`,*/}
                            {/*        color: ZamanColors.PersianGreen,*/}
                            {/*      }}*/}
                            {/*      onFocus={(e) => {*/}
                            {/*        e.target.style.borderColor = ZamanColors.Solar;*/}
                            {/*        e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;*/}
                            {/*      }}*/}
                            {/*      onBlur={(e) => {*/}
                            {/*        e.target.style.borderColor = dateTo ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`;*/}
                            {/*        e.target.style.boxShadow = 'none';*/}
                            {/*      }}*/}
                            {/*    />*/}
                            {/*  </div>*/}
                            {/*</div>*/}

                            <TransactionsDateFilter
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                setDateFrom={setDateFrom}
                                setDateTo={setDateTo}
                                loading={loading}
                                onFilterChange={() => onFilterChange({dateTo, dateFrom})}
                            />

                        </div>
                        {/* Apply Button */}
                        <button
                            onClick={handleFilter}
                            disabled={loading}
                            className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                            style={{
                                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.PersianGreen}dd)`,
                                color: ZamanColors.Solar,
                                boxShadow: `0 8px 24px ${ZamanColors.PersianGreen}40`,
                            }}
                        >
                            {/* Solar hover effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background: `linear-gradient(135deg, ${ZamanColors.Solar}20, transparent)`,
                                }}
                            />

                            <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Filtering...
                    </>
                ) : (
                    <>
                        <Search size={18} className="sm:w-5 sm:h-5"/>
                        Apply Filters
                    </>
                )}
              </span>
                        </button>

                        {/* Active Filters Indicator */}
                        {hasActiveFilters && !loading && (
                            <div
                                className="p-3 sm:p-4 rounded-xl flex items-center gap-2"
                                style={{
                                    backgroundColor: `${ZamanColors.Solar}20`,
                                    border: `1px solid ${ZamanColors.Solar}40`,
                                }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{backgroundColor: ZamanColors.PersianGreen}}
                                />
                                <span
                                    className="text-xs sm:text-sm font-medium"
                                    style={{color: ZamanColors.PersianGreen}}
                                >
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''} applied
                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    opacity: 0.5;
                }

                input::placeholder {
                    color: ${ZamanColors.PersianGreen}40;
                }

                select option {
                    padding: 12px;
                }

                /* Date input styling */
                input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0.6;
                    cursor: pointer;
                }

                input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}