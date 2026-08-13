import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** The signed-in user is represented by this id throughout the chat. */
export const MY_ID = 'me';

export interface ChatMessage {
  id: string;
  conversationId: string; // the contact/member id this DM thread belongs to
  senderId: string; // MY_ID or the contact id
  text: string;
  createdAt: string; // ISO timestamp
}

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

const isoNow = () => new Date().toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

// Canned, friendly replies so a demo conversation feels two-sided.
const REPLIES = [
  "Thanks for flagging that — I'll take a look.",
  'Got it, let me check and get back to you.',
  "Good question! I'll confirm and update you shortly.",
  'Sure, happy to help with that.',
  'Makes sense 👍 I’ll follow up on the board.',
];

interface ChatState {
  messages: ChatMessage[];
  reads: Record<string, string>; // conversationId -> last-read ISO timestamp
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
}

const seedMessages: ChatMessage[] = [
  { id: genId(), conversationId: 'mb1', senderId: 'mb1', text: 'Hey! Did you get a chance to look at the sprint board?', createdAt: minutesAgo(140) },
  { id: genId(), conversationId: 'mb1', senderId: MY_ID, text: 'Yes, reviewing now — looks solid 👍', createdAt: minutesAgo(120) },
  { id: genId(), conversationId: 'mb2', senderId: 'mb2', text: 'Quick doubt: where do member invites get sent from?', createdAt: minutesAgo(35) },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: seedMessages,
      reads: { mb1: minutesAgo(110) },

      sendMessage: (conversationId, text) => {
        const body = text.trim();
        if (!body) return;
        const mine: ChatMessage = { id: genId(), conversationId, senderId: MY_ID, text: body, createdAt: isoNow() };
        set((s) => ({
          messages: [...s.messages, mine],
          reads: { ...s.reads, [conversationId]: isoNow() },
        }));

        // Simulated reply from the contact so the thread feels alive (no backend yet).
        const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        setTimeout(() => {
          set((s) => ({
            messages: [
              ...s.messages,
              { id: genId(), conversationId, senderId: conversationId, text: reply, createdAt: isoNow() },
            ],
          }));
        }, 1200 + Math.floor(Math.random() * 800));
      },

      markRead: (conversationId) =>
        set((s) => ({ reads: { ...s.reads, [conversationId]: isoNow() } })),
    }),
    { name: 'chat-storage' }
  )
);

/** Unread count for a single conversation. */
export const unreadFor = (state: ChatState, conversationId: string) => {
  const since = state.reads[conversationId] ?? '';
  return state.messages.filter(
    (m) => m.conversationId === conversationId && m.senderId !== MY_ID && m.createdAt > since
  ).length;
};

/** Total unread across all conversations. */
export const totalUnread = (state: ChatState) => {
  const convos = new Set(state.messages.map((m) => m.conversationId));
  let total = 0;
  convos.forEach((id) => (total += unreadFor(state, id)));
  return total;
};
