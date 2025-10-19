import {useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight, Lightbulb} from 'lucide-react';
import {financialAdvice} from "@/lib/chatApi";

interface AdvicesData {
    advices: string[];
    raw_response: string;
    session_id: string;
    transactions_count: number;
}

interface Transaction {
    id: number;
    amount: number;
    description: string;
    transaction_type: 'deposit' | 'transfer' | 'withdrawal';
    created_at: string;
    updated_at: string;
    user_id: number;
}

export function AdvicesCarousel() {
    const [advices, setAdvices] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransactionIds, setModalTransactionIds] = useState<number[]>([]);
    const [modalTransactions, setModalTransactions] = useState<Transaction[]>([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

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
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % advices.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + advices.length) % advices.length);

    const cleanText = (text: string) => text?.replace(/\*\*/g, '');

    const openModal = async (ids: number[]) => {
        setModalTransactionIds(ids);
        setModalOpen(true);
        setIsModalLoading(true);
        try {
            const txs = await Promise.all(ids.map(async (id) => {
                const res = await fetch(`http://localhost:8000/transactions/${id}`, {
                    headers: {
                        "Authorization" : "Bearer " + localStorage.getItem("access_token")
                    }
                });
                return await res.json() as Transaction;
            }));
            setModalTransactions(txs);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            setModalTransactions([]);
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => setModalOpen(false);

    const parseAdviceText = (text: string) => {
        const pattern = /\(id\s*-\s*([0-9,\s]+)\)/;
        const match = text.match(pattern);
        if (!match) return text;

        const ids = match[1].split(',').map(id => Number(id.trim()));
        const parts = text.split(pattern);

        return (
            <>
                {parts[0]}
                <button
                    onClick={() => openModal(ids)}
                    className="text-blue-600 underline ml-1"
                >
                    Посмотреть
                </button>
                {parts[2]}
            </>
        );
    };

    // ------------------- Рендер -------------------
    if (isLoading) return (
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

    if (advices.length === 0) return (
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
                        {parseAdviceText(cleanText(advices[currentIndex]))}
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

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold mb-4">Детали транзакций</h3>

                        {isModalLoading ? (
                            <p className="text-gray-500">Загрузка транзакций...</p>
                        ) : modalTransactions.length === 0 ? (
                            <p className="text-gray-500">Транзакции не найдены</p>
                        ) : (
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-3 py-1 text-left">ID</th>
                                        <th className="border px-3 py-1 text-left">Описание</th>
                                        <th className="border px-3 py-1 text-left">Сумма</th>
                                        <th className="border px-3 py-1 text-left">Тип</th>
                                        <th className="border px-3 py-1 text-left">Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="border px-3 py-1">{tx.id}</td>
                                            <td className="border px-3 py-1">{tx.description}</td>
                                            <td className="border px-3 py-1">{tx.amount.toFixed(2)}</td>
                                            <td className="border px-3 py-1 capitalize">{tx.transaction_type}</td>
                                            <td className="border px-3 py-1">{new Date(tx.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
