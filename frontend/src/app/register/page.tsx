"use client";
import {useEffect, useState} from 'react';
import {Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles} from 'lucide-react';
import {apiFetch} from "@/lib/api";

const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
};

export default function RegisterPage() {
    const [iin, setIIn] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Generate floating dots only on the client after mount to avoid SSR hydration mismatch
    const [dots, setDots] = useState<Array<{
        width: string;
        height: string;
        left: string;
        top: string;
        opacity: number;
        animationDelay: string;
        animationDuration: string
    }>>([]);

    useEffect(() => {
        const generated = Array.from({length: 20}).map(() => {
            const width = Math.random() * 8 + 4 + 'px';
            const height = Math.random() * 8 + 4 + 'px';
            const left = Math.random() * 100 + '%';
            const top = Math.random() * 100 + '%';
            const opacity = Math.random() * 0.3 + 0.1;
            const animationDelay = Math.random() * 5 + 's';
            const animationDuration = Math.random() * 10 + 10 + 's';
            return {width, height, left, top, opacity, animationDelay, animationDuration};
        });
        setDots(generated);
    }, []);

    const handleSubmit = async () => {
        setIsLoading(true);

        const registerData = {email, password, iin};

        try {
            const data = await apiFetch("/auth/signup", {
                method: 'POST',
                body: JSON.stringify(registerData),
            })

            localStorage.setItem("access_token", data.access_token)

            window.location.href = '/profile'
        } catch
            (error) {
            console.error('Login error:', error);
            alert('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && email && password) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Persian Solar Day Background - All three colors working together */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${ZamanColors.PersianGreen} 0%, ${ZamanColors.PersianGreen}dd 50%, ${ZamanColors.PersianGreen}bb 100%)`,
                }}
            />

            {/* Solar accent patterns - Creating warmth and movement */}
            <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{backgroundColor: ZamanColors.Solar}}
            />
            <div
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20"
                style={{backgroundColor: ZamanColors.Solar}}
            />

            {/* Floating Solar dots - Brand recognition pattern (client-only to avoid hydration mismatch) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
                {dots.map((dot, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full animate-float"
                        style={{
                            backgroundColor: ZamanColors.Solar,
                            width: dot.width,
                            height: dot.height,
                            left: dot.left,
                            top: dot.top,
                            opacity: dot.opacity,
                            animationDelay: dot.animationDelay,
                            animationDuration: dot.animationDuration,
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand Header - Persian Solar combination */}
                <div className="text-center mb-8">
                    <div
                        className="inline-block p-1 rounded-full mb-4 shadow-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${ZamanColors.Solar}, ${ZamanColors.Cloud})`,
                        }}
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${ZamanColors.PersianGreen}, ${ZamanColors.PersianGreen}dd)`,
                            }}
                        >
                            {/* Solar accent in logo */}
                            <div
                                className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-30"
                                style={{backgroundColor: ZamanColors.Solar}}
                            />
                            <span
                                className="text-4xl font-bold relative z-10"
                                style={{color: ZamanColors.Solar}}
                            >
                Z
              </span>
                        </div>
                    </div>

                    <h1
                        className="text-4xl font-bold mb-2"
                        style={{color: ZamanColors.Cloud}}
                    >
                        Zaman Bank
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles
                            size={16}
                            style={{color: ZamanColors.Solar}}
                        />
                        <p
                            className="text-sm font-medium"
                            style={{color: ZamanColors.Solar}}
                        >
                            Your Financial Assistant
                        </p>
                        <Sparkles
                            size={16}
                            style={{color: ZamanColors.Solar}}
                        />
                    </div>
                </div>

                {/* Login Card - Cloud (transparency) with Persian-Solar accents */}
                <div
                    className="rounded-3xl shadow-2xl p-8 backdrop-blur-sm"
                    style={{
                        background: `linear-gradient(to bottom, ${ZamanColors.Cloud}, ${ZamanColors.Cloud}f5)`,
                        border: `2px solid ${ZamanColors.Solar}40`,
                    }}
                >
                    {/* Card header with Solar accent */}
                    <div className="relative mb-6">
                        <div
                            className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
                            style={{backgroundColor: ZamanColors.Solar}}
                        />
                        <h2
                            className="text-2xl font-bold text-center pt-2"
                            style={{color: ZamanColors.PersianGreen}}
                        >
                            U r Welcome
                        </h2>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="iin"
                                className="block text-sm font-semibold mb-2"
                                style={{color: ZamanColors.PersianGreen}}
                            >
                                IIN
                            </label>
                            <div className="relative group">
                                <div
                                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300"
                                >
                                    <Mail
                                        className="h-5 w-5 transition-colors duration-300"
                                        style={{color: ZamanColors.PersianGreen}}
                                    />
                                </div>
                                <input
                                    id="iin"
                                    type="text"
                                    value={iin}
                                    onChange={(e) => setIIn(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="block w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-300"
                                    style={{
                                        backgroundColor: ZamanColors.Cloud,
                                        border: `2px solid ${ZamanColors.PersianGreen}20`,
                                        color: ZamanColors.PersianGreen,
                                    }}
                                    placeholder="051112220303"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = ZamanColors.Solar;
                                        e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = `${ZamanColors.PersianGreen}20`;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold mb-2"
                                style={{color: ZamanColors.PersianGreen}}
                            >
                                Email
                            </label>
                            <div className="relative group">
                                <div
                                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300"
                                >
                                    <Mail
                                        className="h-5 w-5 transition-colors duration-300"
                                        style={{color: ZamanColors.PersianGreen}}
                                    />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="block w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-300"
                                    style={{
                                        backgroundColor: ZamanColors.Cloud,
                                        border: `2px solid ${ZamanColors.PersianGreen}20`,
                                        color: ZamanColors.PersianGreen,
                                    }}
                                    placeholder="your@email.com"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = ZamanColors.Solar;
                                        e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = `${ZamanColors.PersianGreen}20`;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Input - Persian Day combination */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold mb-2"
                                style={{color: ZamanColors.PersianGreen}}
                            >
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock
                                        className="h-5 w-5"
                                        style={{color: ZamanColors.PersianGreen}}
                                    />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="block w-full pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all duration-300"
                                    style={{
                                        backgroundColor: ZamanColors.Cloud,
                                        border: `2px solid ${ZamanColors.PersianGreen}20`,
                                        color: ZamanColors.PersianGreen,
                                    }}
                                    placeholder="••••••••"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = ZamanColors.Solar;
                                        e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = `${ZamanColors.PersianGreen}20`;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-transform duration-300 hover:scale-110"
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            className="h-5 w-5"
                                            style={{color: ZamanColors.PersianGreen}}
                                        />
                                    ) : (
                                        <Eye
                                            className="h-5 w-5"
                                            style={{color: ZamanColors.PersianGreen}}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password - Persian Solar */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-2 cursor-pointer"
                                    style={{
                                        accentColor: ZamanColors.PersianGreen,
                                    }}
                                />
                                <span
                                    className="ml-2 text-sm font-medium group-hover:underline"
                                    style={{color: ZamanColors.PersianGreen}}
                                >
                  Remember me
                </span>
                            </label>

                        </div>

                        {/* Login Button - Persian Solar Day combination (all colors) */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !email || !password}
                            className="w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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

                            <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                        Logging in...
                    </>
                ) : (
                    <>
                        Register
                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"/>
                    </>
                )}
              </span>
                        </button>
                    </div>

                    {/* Sign Up Link - Persian Solar */}
                    <div className="mt-6 pt-6 border-t" style={{borderColor: `${ZamanColors.Solar}30`}}>
                        <p className="text-sm text-center" style={{color: ZamanColors.PersianGreen}}>
                            Already have an account?{' '}
                            <a
                                href="/login"
                                className="font-bold hover:underline transition-all duration-300 inline-flex items-center gap-1"
                                style={{color: ZamanColors.PersianGreen}}
                            >
                                Login
                                <ArrowRight size={14}/>
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer - Solar Day combination */}
                <div className="mt-6 text-center">
                    <div
                        className="inline-block px-6 py-2 rounded-full backdrop-blur-sm"
                        style={{
                            background: `linear-gradient(135deg, ${ZamanColors.Solar}40, ${ZamanColors.Cloud}20)`,
                            border: `1px solid ${ZamanColors.Solar}60`,
                        }}
                    >
                        <p
                            className="text-xs font-medium"
                            style={{color: ZamanColors.Cloud}}
                        >
                            © 2025 Zaman Bank. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    25% {
                        transform: translateY(-20px) translateX(10px);
                    }
                    50% {
                        transform: translateY(-10px) translateX(-10px);
                    }
                    75% {
                        transform: translateY(-30px) translateX(5px);
                    }
                }

                .animate-float {
                    animation: float 15s infinite ease-in-out;
                }

                input::placeholder {
                    color: ${ZamanColors.PersianGreen}60;
                }

                input:focus::placeholder {
                    color: ${ZamanColors.PersianGreen}40;
                }
            `}</style>
        </div>
    );
}