import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Mic, Goal, TrendingUp, Heart } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [financialGoal, setFinancialGoal] = useState({
    goal_name: '',
    target_amount: '',
    current_amount: '',
    timeline_months: '',
    goal_type: 'apartment'
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: inputMessage,
        session_id: sessionId
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert('Audio recording not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      // Implement recording logic here
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement stop recording and send to backend logic here
  };

  const calculateGoal = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/calculate-goal', {
        ...financialGoal,
        target_amount: parseFloat(financialGoal.target_amount),
        current_amount: parseFloat(financialGoal.current_amount),
        timeline_months: parseInt(financialGoal.timeline_months)
      });
      alert(`Ежемесячные накопления: ${response.data.monthly_saving} тенге`);
    } catch (error) {
      console.error('Error calculating goal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Zaman Bank Assistant</h1>
                <p className="text-sm text-gray-600">Ваш персональный финансовый помощник</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Send size={18} />
                <span>Чат</span>
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'goals' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Goal size={18} />
                <span>Цели</span>
              </button>
              <button
                onClick={() => setActiveTab('stress')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'stress' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart size={18} />
                <span>Анти-стресс</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Send size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Начните разговор с вашим финансовым помощником</p>
                  <p className="text-sm">Спросите о финансовых целях, продуктах банка или получите совет</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-3/4 rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Задайте вопрос о финансах, целях или продуктах банка..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Send size={20} />
                  <span>Отправить</span>
                </button>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    isRecording
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Mic size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Goal Calculator */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <Goal className="text-green-500" />
                <span>Финансовая цель</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип цели
                  </label>
                  <select
                    value={financialGoal.goal_type}
                    onChange={(e) => setFinancialGoal({...financialGoal, goal_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="apartment">Квартира</option>
                    <option value="education">Образование</option>
                    <option value="purchase">Крупная покупка</option>
                    <option value="travel">Путешествие</option>
                    <option value="operation">Операция</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название цели
                  </label>
                  <input
                    type="text"
                    value={financialGoal.goal_name}
                    onChange={(e) => setFinancialGoal({...financialGoal, goal_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: Квартира в Астане"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Целевая сумма (₸)
                    </label>
                    <input
                      type="number"
                      value={financialGoal.target_amount}
                      onChange={(e) => setFinancialGoal({...financialGoal, target_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Текущие накопления (₸)
                    </label>
                    <input
                      type="number"
                      value={financialGoal.current_amount}
                      onChange={(e) => setFinancialGoal({...financialGoal, current_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок достижения (месяцев)
                  </label>
                  <input
                    type="number"
                    value={financialGoal.timeline_months}
                    onChange={(e) => setFinancialGoal({...financialGoal, timeline_months: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={calculateGoal}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Рассчитать план
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <TrendingUp className="text-blue-500" />
                <span>Советы по накоплениям</span>
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Правило 50/30/20</h3>
                  <p className="text-sm text-blue-700">
                    50% на necessities, 30% на wants, 20% на savings
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Автоматические переводы</h3>
                  <p className="text-sm text-green-700">
                    Настройте автоматическое пополнение накопительного счета
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Микросбережения</h3>
                  <p className="text-sm text-purple-700">
                    Откладывайте небольшие суммы ежедневно
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Heart className="text-red-500" />
              <span>Альтернативы шопингу от стресса</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Медитация",
                  description: "5-10 минут глубокого дыхания",
                  emoji: "🧘"
                },
                {
                  title: "Прогулка",
                  description: "30 минут на свежем воздухе",
                  emoji: "🚶"
                },
                {
                  title: "Чтение",
                  description: "Книги из онлайн-библиотеки",
                  emoji: "📚"
                },
                {
                  title: "Творчество",
                  description: "Рисование, музыка, рукоделие",
                  emoji: "🎨"
                },
                {
                  title: "Спорт",
                  description: "Бесплатные тренировки дома",
                  emoji: "💪"
                },
                {
                  title: "Волонтерство",
                  description: "Помощь другим - помощь себе",
                  emoji: "🤝"
                }
              ].map((tip, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{tip.emoji}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}