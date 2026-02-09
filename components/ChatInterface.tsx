
import React, { useRef, useEffect } from 'react';
import { Message, TeacherRole } from '../types';
import { TEACHERS } from '../constants';

interface Props {
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<Props> = ({ messages, isThinking, onSendMessage }) => {
  const [input, setInput] = React.useState('');
  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-5xl drop-shadow-lg">✨</div>
            <h2 className="text-2xl font-bold text-white">OmniTutor Interface</h2>
            <p className="text-slate-400 max-w-sm">
              Our autonomous faculty is ready to guide you. Enter a topic to start your personalized journey.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-tl-none'
            }`}>
              {msg.teacherRole && msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{TEACHERS[msg.teacherRole].avatar}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {TEACHERS[msg.teacherRole].name} • {msg.teacherRole}
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed prose prose-invert prose-slate max-w-none">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Faculty Consulting...</span>
            </div>
          </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950/80 border-t border-slate-800/50 backdrop-blur-md">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder="Describe what you'd like to learn..."
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all disabled:opacity-50 placeholder:text-slate-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all font-semibold active:scale-95"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
