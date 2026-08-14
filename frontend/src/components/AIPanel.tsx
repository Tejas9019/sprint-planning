import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  MoreHorizontal,
  ChevronLeft,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';
import { aiApi } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIPanelProps {
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onClose }) => {
  const { showToast, tasks, users } = useBoardStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'user',
      text: "How is the current sprint tracking?",
      timestamp: new Date()
    },
    {
      id: 'm2',
      sender: 'ai',
      text: "Here's a quick read on your sprint:\n\n- **Velocity** is steady — completed work is on pace with the last cycle.\n- **In Progress** has a few items clustered near their due dates; consider sequencing them.\n- **Done** is healthy. Ask me to draft release notes or rebalance assignments anytime.",
      timestamp: new Date()
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Analyze sprint velocity",
    "Draft Q3 release notes",
    "Optimize task assignment"
  ];

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiApi.getHistory();
        if (history && history.length > 0) {
          const mapped: Message[] = history.map((h: any) => ({
            id: h.id,
            sender: h.role, // 'user' or 'ai'
            text: h.content,
            timestamp: new Date(h.created_at)
          }));
          setMessages(mapped);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Failed to load AI chat history:", err);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setShowSuggestions(false);

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const taskContext = JSON.stringify(tasks.map(t => {
        const assigneeUser = users.find(u => u.id === t.assigneeId);
        return {
          title: t.title,
          status: t.status,
          priority: t.priority,
          tag: t.tag,
          date: t.date,
          assignee: assigneeUser ? assigneeUser.name : 'Unassigned'
        };
      }));
      
      const res = await aiApi.chat(text, taskContext);
      
      const aiMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: res.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: "Sorry, I am unable to process your request. Please ensure the AI service is running and configured.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render a single line, handling **bold**, `code`, and leading "- " / "1." list markers.
  const renderFormattedText = (text: string, isAI: boolean) => {
    const bullet = /^\s*[-*]\s+/.test(text);
    const numbered = text.match(/^\s*(\d+)\.\s+/);
    const body = bullet ? text.replace(/^\s*[-*]\s+/, '') : numbered ? text.replace(/^\s*\d+\.\s+/, '') : text;

    const parts = body.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    const content = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className={`font-bold ${isAI ? 'text-text-heading dark:text-white' : 'text-white'}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1 py-0.5 rounded bg-bg-tertiary text-[10px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    if (bullet || numbered) {
      return (
        <span className="flex gap-1.5">
          <span className="flex-shrink-0 opacity-70">{numbered ? `${numbered[1]}.` : '•'}</span>
          <span>{content}</span>
        </span>
      );
    }
    return content;
  };

  return (
    <aside aria-label="TrackFlow AI assistant" className="w-80 flex-shrink-0 bg-bg-secondary border-l border-border-primary/50 text-text-primary flex flex-col h-full animate-in slide-in-from-right duration-250 transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-border-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="hover:bg-bg-tertiary p-1 rounded-lg transition-colors text-text-secondary hover:text-text-heading cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 font-semibold text-xs text-text-heading">
            <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
            <span>TrackFlow AI</span>
          </div>
        </div>
        <button
          onClick={() => showToast('More options are coming soon', 'info')}
          aria-label="More options"
          className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg cursor-pointer"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}>
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                isAI ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}>
                {isAI ? <Bot size={13} /> : <UserIcon size={13} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                isAI 
                  ? 'bg-bg-primary/60 border border-border-primary/60 text-text-primary' 
                  : 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
              }`}>
                {msg.text.split('\n').map((paragraph, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {renderFormattedText(paragraph, isAI)}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Suggestion Chips inside the message flow */}
        {showSuggestions && !inputVal.trim() && (
          <div className="space-y-2 mt-2 select-none animate-in fade-in duration-200">
            <span className="text-[10px] text-text-secondary block font-semibold pl-8">Suggestions:</span>
            <div className="flex flex-col gap-1.5 pl-8 pr-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-[10px] bg-bg-primary/50 hover:bg-bg-tertiary border border-border-primary/60 text-text-primary rounded-xl px-3.5 py-2 text-left transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98] truncate"
                >
                  {idx + 1}. {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-bg-primary/60 border border-border-primary/60 rounded-xl px-3 py-2 text-xs text-text-secondary flex items-center gap-1.5 animate-pulse">
              <span>TrackFlow AI is thinking</span>
              <span className="flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-border-primary/30">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="relative bg-bg-primary border border-border-primary rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Message TrackFlow AI..."
            className="w-full bg-transparent outline-none py-3 pl-3 pr-16 text-xs text-text-primary placeholder-text-secondary"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => showToast('Attachments are coming soon', 'info')}
              aria-label="Attach file"
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-tertiary/40 cursor-pointer"
              title="Attach File"
            >
              <Paperclip size={13} />
            </button>
            <button
              type="button"
              onClick={() => showToast('Voice input is coming soon', 'info')}
              aria-label="Voice input"
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-bg-tertiary/40 cursor-pointer"
              title="Voice Input"
            >
              <Mic size={13} />
            </button>
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="Send message"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                inputVal.trim()
                  ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                  : 'text-text-secondary/50 cursor-not-allowed'
              }`}
            >
              <Send size={12} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};
