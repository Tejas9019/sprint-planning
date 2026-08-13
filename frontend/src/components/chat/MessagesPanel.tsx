import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Send, ChevronLeft, X, Search } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { useChatStore, MY_ID } from '../../store/chatStore';
import { useContactsStore, type Member } from '../../store/contactsStore';

interface MessagesPanelProps {
  onClose: () => void;
}

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ onClose }) => {
  const { messages, reads, sendMessage, markRead } = useChatStore();
  const { members } = useContactsStore();

  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // People you can message: active teammates.
  const contacts = useMemo(() => members.filter((m) => m.status === 'active'), [members]);
  const openContact = contacts.find((c) => c.id === openId) ?? null;

  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((contact: Member) => {
        const msgs = messages
          .filter((m) => m.conversationId === contact.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const last = msgs[msgs.length - 1];
        const unread = messages.filter(
          (m) => m.conversationId === contact.id && m.senderId !== MY_ID && m.createdAt > (reads[contact.id] ?? '')
        ).length;
        return { contact, last, unread };
      })
      .sort((a, b) => (b.last?.createdAt ?? '').localeCompare(a.last?.createdAt ?? ''));
  }, [contacts, messages, reads, query]);

  const thread = useMemo(
    () =>
      openId
        ? messages.filter((m) => m.conversationId === openId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : [],
    [messages, openId]
  );

  // Mark read on open and whenever new messages arrive in the open thread.
  useEffect(() => {
    if (openId) markRead(openId);
  }, [openId, thread.length, markRead]);

  useEffect(() => {
    if (openId) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, openId]);

  const handleSend = () => {
    if (!openId || !input.trim()) return;
    sendMessage(openId, input);
    setInput('');
  };

  return (
    <aside
      aria-label="Messages"
      className="w-80 flex-shrink-0 bg-bg-secondary border-l border-border-primary/50 text-text-primary flex flex-col h-full animate-in slide-in-from-right duration-200 transition-colors"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {openContact ? (
            <>
              <IconButton label="Back to conversations" size="sm" onClick={() => setOpenId(null)}>
                <ChevronLeft size={16} />
              </IconButton>
              <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold">
                {initials(openContact.name)}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-text-heading">{openContact.name}</p>
                <p className="text-[10px] text-text-secondary">{openContact.role} · {openContact.department}</p>
              </div>
            </>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-sm text-text-heading">
              <MessageSquare size={15} className="text-purple-600 dark:text-purple-400" /> Messages
            </span>
          )}
        </div>
        <IconButton label="Close messages" size="sm" onClick={onClose}>
          <X size={15} />
        </IconButton>
      </div>

      {openContact ? (
        /* ── Conversation thread ── */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label={`Conversation with ${openContact.name}`}>
            {thread.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-text-secondary select-none px-6">
                <MessageSquare size={26} className="text-text-secondary/50" />
                <p className="text-xs">Say hi or ask <strong>{openContact.name.split(' ')[0]}</strong> a question.</p>
              </div>
            )}
            {thread.map((m) => {
              const mine = m.senderId === MY_ID;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      mine
                        ? 'bg-purple-600 text-white rounded-br-sm'
                        : 'bg-bg-primary border border-border-primary/60 text-text-primary rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-text-secondary/70 mt-0.5 px-1">{timeLabel(m.createdAt)}</span>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-border-primary/30">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative bg-bg-primary border border-border-primary rounded-xl focus-within:border-purple-500/50 transition-colors"
            >
              <label htmlFor="chat-input" className="sr-only">Message {openContact.name}</label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${openContact.name.split(' ')[0]}…`}
                className="w-full bg-transparent outline-none py-2.5 pl-3 pr-11 text-xs text-text-primary placeholder-text-secondary"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                  input.trim() ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95' : 'text-text-secondary/50 cursor-not-allowed'
                }`}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </>
      ) : (
        /* ── Conversation list ── */
        <>
          <div className="p-3 border-b border-border-primary/20">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <label htmlFor="chat-search" className="sr-only">Search people</label>
              <input
                id="chat-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people…"
                className="w-full bg-bg-primary border border-border-primary focus:border-purple-500/40 rounded-lg py-2 pl-8 pr-3 text-xs outline-none text-text-primary transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-xs select-none">No teammates to message yet.</div>
            )}
            {conversations.map(({ contact, last, unread }) => (
              <button
                key={contact.id}
                onClick={() => setOpenId(contact.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-tertiary/40 transition-colors cursor-pointer border-b border-border-primary/20"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                    {initials(contact.name)}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unread > 0 ? 'font-bold text-text-heading' : 'font-semibold text-text-primary'}`}>{contact.name}</p>
                    {last && <span className="text-[9px] text-text-secondary flex-shrink-0">{timeLabel(last.createdAt)}</span>}
                  </div>
                  <p className={`text-[11px] truncate ${unread > 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {last ? `${last.senderId === MY_ID ? 'You: ' : ''}${last.text}` : `${contact.role} · ${contact.department}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
};
