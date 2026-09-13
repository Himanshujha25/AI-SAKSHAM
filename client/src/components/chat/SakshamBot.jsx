import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../store/auth';
import { cn } from '../../lib/utils';

const GUEST_CHIPS = ['What does the app do?', 'How does verification work?', 'How do I get started?'];
const USER_CHIPS = ['Summarize my findings', 'Show most critical issue', 'What is my security score?', 'What should I fix first?'];

function fmtTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Lightweight chat markdown: **bold** + "- " bullets + paragraphs.
function renderInline(text, keyBase) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={`${keyBase}-${i}`} className="font-semibold text-slate-900 dark:text-white">{m[1]}</strong>;
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

function BotReply({ content }) {
  const blocks = content.split(/\n{2,}|\n(?=\s*[-•] )/);
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim().length > 0);
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-•] /.test(l));
        if (isList) {
          return (
            <ul key={bi} className="space-y-1.5">
              {lines.map((l, li) => (
                <li key={li} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                  <span>{renderInline(l.replace(/^\s*[-•] /, ''), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={bi}>{renderInline(block.trim(), `${bi}`)}</p>;
      })}
    </div>
  );
}

export function SakshamBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const bottomRef = useRef(null);
  const authed = !!user;
  const identity = authed ? (user?._id || user?.id || user?.email || 'user') : 'guest';

  // Reset stale conversation on login/logout/account-switch so the bot never
  // shows a cached "full visibility" greeting after access is gone (or vice versa).
  const identityRef = useRef(identity);
  useEffect(() => {
    if (identityRef.current !== identity) {
      identityRef.current = identity;
      setMsgs([]);
      setGreeted(false);
    }
  }, [identity]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, busy, open]);

  const clearChat = () => {
    setMsgs([]);
    setGreeted(false);
  };

  const greet = () => {
    if (greeted) return;
    setGreeted(true);
    setMsgs([{
      role: 'assistant',
      content: authed
        ? `Hello ${user?.name || 'Analyst'}! I'm Saksham Bot — I have full visibility into your workspace. Ask me anything about findings, scores, or reports.`
        : 'Hello! I am Saksham Bot. Saksham AI turns authorized security assessments into verified findings and AI-powered reports. Log in to give me access to your workspace data!',
      time: fmtTime(),
    }]);
  };

  const send = async (text) => {
    const clean = (text ?? input).trim();
    if (!clean || busy) return;
    const userMsg = { role: 'user', content: clean.slice(0, 2000), time: fmtTime() };
    const history = [...msgs, userMsg].slice(-9).map((m) => ({ role: m.role, content: m.content }));
    setMsgs((p) => [...p, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const res = await api.post('/chat', { message: clean, history });
      setMsgs((p) => [...p, { role: 'assistant', content: res.data.reply, time: fmtTime() }]);
    } catch (e) {
      setMsgs((p) => [...p, {
        role: 'assistant',
        content: 'Arey, AI abhi thoda busy hai — 30 second me dobara try karo.',
        time: fmtTime(),
      }]);
    } finally {
      setBusy(false);
    }
  };

  const chips = authed ? USER_CHIPS : GUEST_CHIPS;

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="flex h-[480px] w-[330px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#070b16] dark:shadow-2xl dark:shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="flex h-9 items-center rounded-lg bg-white px-1.5 shadow">
                <img src="/Logo.png" alt="Saksham Bot" className="h-6 w-auto object-contain" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold">Saksham Bot <Sparkles size={12} className="text-cyan-500" /></p>
                <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="live-dot relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
                  {authed ? 'Full workspace access' : 'Intro mode · login for full access'}
                </p>
              </div>
              <button onClick={clearChat} title="Clear chat" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
                <Trash2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3.5 dark:bg-transparent">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                    m.role === 'user'
                      ? 'rounded-br-md bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100'
                  )}>
                    <p className="whitespace-pre-wrap">{m.role === 'assistant' ? <BotReply content={m.content} /> : m.content}</p>
                    <p className={cn('mt-1 text-right text-[10px]', m.role === 'user' ? 'opacity-60' : 'text-slate-400')}>{m.time}</p>
                  </div>
                </motion.div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-cyan-500"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-slate-200 px-3 py-2 dark:border-white/10">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    disabled={busy}
                    className="rounded-full border border-slate-300 px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-cyan-400/60 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:text-white"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-white/10"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={authed ? 'Ask anything…' : 'Ask about the platform…'}
                maxLength={2000}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[13px] outline-none transition focus:border-cyan-500 dark:border-white/15 dark:bg-[#0a0f1e] dark:focus:border-cyan-400/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:-translate-y-px disabled:opacity-40 dark:border dark:border-white/[0.14] dark:bg-white/[0.08] dark:text-white dark:backdrop-blur-xl dark:hover:bg-white/[0.12] dark:hover:translate-y-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — flat frosted, no glow */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => { setOpen((o) => !o); greet(); }}
        className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:bg-white/[0.12] hover:border-white/20"
        title="Chat with Saksham Bot"
      >
        {open
          ? <X size={22} className="relative" />
          : <Bot size={25} className="relative" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/15 bg-[#0b1120]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
        )}
      </motion.button>
    </div>
  );
}

export function BotBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-600 ring-1 ring-cyan-400/30 dark:text-cyan-300">
      <Bot size={11} /> Saksham Bot
    </span>
  );
}
