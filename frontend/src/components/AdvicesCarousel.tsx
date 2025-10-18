import {useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight, Lightbulb} from 'lucide-react';
import {apiFetch} from "@/lib/api";
import {financialAdvice} from "@/lib/chatApi";

interface AdvicesData {
    advices: string[];
    raw_response: string;
    session_id: string;
    transactions_count: number;
}

export function AdvicesCarousel() {
    const [advices, setAdvices] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAdvices = async () => {
            try {
                setIsLoading(true);
                const res = await financialAdvice() as AdvicesData;
                setAdvices(res.advices);
            } catch (error) {
                console.error('Failed to load advices:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAdvices();
    }, []); // Empty dependency array - only run once on mount

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % advices.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + advices.length) % advices.length);
    };

    // Function to clean markdown formatting
    const cleanText = (text: string) => {
        return text?.replace(/\*\*/g, '');
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-green-600 mr-3"/>
                    <h2 className="text-2xl font-bold text-gray-800">Финансовые Советы</h2>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 min-h-[300px] flex items-center justify-center">
                    <p className="text-gray-500">Загрузка советов...</p>
                </div>
            </div>
        );
    }

    if (advices.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-green-600 mr-3"/>
                    <h2 className="text-2xl font-bold text-gray-800">Финансовые Советы</h2>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 min-h-[300px] flex items-center justify-center">
                    <p className="text-gray-500">Нет доступных советов</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-green-600 mr-3"/>
                <h2 className="text-2xl font-bold text-gray-800">Финансовые Советы</h2>
            </div>

            <div className="relative bg-white rounded-xl shadow-lg p-8 min-h-[300px]">
                {/* Advice Card */}
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4">
                        <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                            Совет {currentIndex + 1} из {advices.length}
                        </span>
                    </div>

                    <p className="text-gray-700 text-lg leading-relaxed text-center max-w-2xl">
                        {cleanText(advices[currentIndex])}
                    </p>
                </div>

                {/* Navigation Buttons */}
                {advices.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-md transition-all"
                            aria-label="Previous advice"
                        >
                            <ChevronLeft className="w-6 h-6"/>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-md transition-all"
                            aria-label="Next advice"
                        >
                            <ChevronRight className="w-6 h-6"/>
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {advices.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {advices.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'bg-green-600 w-8'
                                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to advice ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}