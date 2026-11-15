import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Eye,
  RefreshCw,
  MessageSquare,
  Bot,
  ChevronDown,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const INITIAL_MESSAGE = {
  id: 'init-1',
  role: 'assistant',
  content: `Assalam-o-Alaikum! 👗 Welcome to Limelight! I'm your AI Fashion & Personal Shopping Stylist.\n\nMain aapko winter velvet collections, ready to wear kurtis, co-ords, sizing aur store policies mein guide kar sakti hoon. Aaj aap kya dekhna chahte hain?`
};

const QUICK_PROMPTS = [
  '🌟 Winter Velvet suits dikhayein',
  '👗 Trendy Co-Ord Sets under Rs. 6,000',
  '🧵 3-Piece unstitched suits for weddings',
  '📦 Free Shipping & Delivery time kya hai?'
];

export default function ShoppingAssistantWidget({ onAddToCart, onQuickView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history excluding initial greeting
      const history = messages
        .filter(m => m.id !== 'init-1')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Thank you for your message! How else may I assist you?',
        suggestedProducts: data.suggestedProducts || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.warn('AI Assistant error:', err);
      const fallbackMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Assalam-o-Alaikum! Limelight helpline par rabta karne ke liye hamara official WhatsApp **+92 345 7867016** hamesha dastiyab hai. Nationwide orders par **Free Delivery over Rs. 2,490** di ja rahi hai. Aap catalog se koi bhi suit dekh sakte hain!`
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Centered Trigger Pill (Moves to side on click) */}
      {!isOpen && (
        <div className="fixed bottom-[20px] sm:bottom-[25px] left-1/2 -translate-x-1/2 z-40 font-assistant transition-all duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-[10px] bg-[#121212] hover:bg-black text-white px-[18px] sm:px-[22px] py-[11px] sm:py-[12px] rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.35)] border border-[#23ac95]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Limelight AI Fashion Assistant"
            aria-label="Open AI Shopping Assistant"
          >
            <div className="relative">
              <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-[#23ac95] to-[#cec72e] flex items-center justify-center text-black font-bold shadow-sm">
                <Sparkles size={16} className="text-[#121212] animate-pulse" />
              </div>
              <span className="absolute -top-[1px] -right-[1px] w-[8px] h-[8px] bg-emerald-400 rounded-full border border-[#121212] animate-ping" />
              <span className="absolute -top-[1px] -right-[1px] w-[8px] h-[8px] bg-emerald-400 rounded-full border border-[#121212]" />
            </div>

            <div className="text-left flex items-center gap-[6px]">
              <span className="text-[13px] font-bold tracking-wide">
                <span className="text-[#23ac95]">AI</span> Shopping Stylist
              </span>
              <span className="text-[10px] bg-white/10 text-white/80 font-bold px-[6px] py-[1px] rounded-full border border-white/10 hidden sm:inline">
                Ask Anything
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window: Animates and Docks on the Right Side (Leaves Center Screen Open) */}
      {isOpen && (
        <div className="fixed bottom-[20px] sm:bottom-[25px] right-[15px] sm:right-[30px] z-50 animate-slide-side font-assistant">
          <div className="w-[350px] sm:w-[410px] h-[580px] max-h-[82vh] bg-white rounded-[16px] shadow-[0_15px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-[#121212] text-white p-[14px] px-[16px] flex items-center justify-between border-b border-[#262626]">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-tr from-[#23ac95] to-[#cec72e] flex items-center justify-center text-[#121212] font-bold shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-[6px] text-[14px] font-bold">
                    <span className="text-[#23ac95]">LIME</span>
                    <span className="text-[#cec72e]">LIGHT</span>
                    <span className="text-[10px] font-bold bg-white/10 text-white px-[5px] py-[1px] rounded tracking-wider uppercase ml-[2px]">
                      AI Stylist
                    </span>
                  </div>
                  <div className="flex items-center gap-[5px] text-[11px] text-emerald-400">
                    <span className="w-[6px] h-[6px] bg-emerald-400 rounded-full animate-pulse" />
                    <span>Powered by Groq • Pakistani Fashion Expert</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-[4px]">
                {/* Reset Chat */}
                <button
                  onClick={handleReset}
                  className="p-[6px] text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Restart conversation"
                >
                  <RefreshCw size={15} />
                </button>

                {/* Close / Minimize */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-[6px] text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-[14px] space-y-[12px] bg-[#fbfbfb] text-[13px]">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-[12px] rounded-[10px] leading-[20px] shadow-xs ${
                      isAssistant
                        ? 'bg-white text-[#121212] border border-gray-200'
                        : 'bg-[#121212] text-white rounded-br-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{msg.content}</p>

                    {/* Matched / Suggested Products Mini Cards */}
                    {isAssistant && msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-[10px] pt-[10px] border-t border-gray-100 space-y-[8px]">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Recommended Products:
                        </span>
                        {msg.suggestedProducts.map((p) => (
                          <div
                            key={p.id || p.title}
                            className="bg-[#f8f9fa] border border-gray-200 rounded-[6px] p-[8px] flex items-center gap-[10px]"
                          >
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-[46px] h-[58px] object-cover rounded-[3px] shrink-0 border border-gray-200"
                              />
                            ) : (
                              <div className="w-[46px] h-[58px] bg-gray-200 rounded-[3px] shrink-0 flex items-center justify-center text-gray-400">
                                <ShoppingBag size={18} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h5 className="text-[12px] font-bold text-[#121212] truncate">
                                {p.title}
                              </h5>
                              <span className="text-[10px] text-gray-500 block truncate">
                                {p.category || 'Limelight Collection'}
                              </span>
                              <div className="flex items-baseline gap-[6px] mt-[2px]">
                                <span className="text-[12px] font-bold text-[#cf0c1d]">
                                  Rs. {Number(p.price).toLocaleString()}
                                </span>
                                {p.originalPrice && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    Rs. {Number(p.originalPrice).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-[4px] shrink-0">
                              {onAddToCart && (
                                <button
                                  type="button"
                                  onClick={() => onAddToCart(p)}
                                  className="px-[8px] py-[4px] bg-[#121212] hover:bg-black text-white text-[10px] font-bold rounded-[3px] flex items-center gap-[3px] cursor-pointer"
                                  title="Add to Shopping Bag"
                                >
                                  <ShoppingBag size={11} />
                                  <span>Bag</span>
                                </button>
                              )}
                              {onQuickView && (
                                <button
                                  type="button"
                                  onClick={() => onQuickView(p)}
                                  className="px-[8px] py-[4px] bg-white border border-gray-300 hover:bg-gray-100 text-[#121212] text-[10px] font-medium rounded-[3px] flex items-center gap-[3px] cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={11} />
                                  <span>View</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-[6px] text-gray-400 p-[10px] bg-white border border-gray-200 rounded-[10px] w-[80px]">
                <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce" />
                <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-[6px] h-[6px] bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (shown when only initial message exists or on idle) */}
          {messages.length <= 3 && !isTyping && (
            <div className="p-[10px] bg-white border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-[6px]">
                Suggestions:
              </span>
              <div className="flex flex-wrap gap-[6px]">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-[8px] py-[4px] rounded-full transition-all text-left truncate max-w-full cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-[10px] bg-white border-t border-gray-200 flex items-center gap-[8px]"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in English or Roman Urdu..."
              disabled={isTyping}
              className="flex-1 px-[12px] py-[9px] text-[13px] border border-gray-200 rounded-full focus:outline-none focus:border-[#121212] bg-[#f8f9fa] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-[36px] h-[36px] bg-[#121212] hover:bg-black disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    )}
  </>
);
}

