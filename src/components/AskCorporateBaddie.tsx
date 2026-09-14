import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  Bot, 
  CornerDownRight,
  Database,
  ExternalLink
} from 'lucide-react';
import { GROUNDED_QA_PAIRS } from '../mockData';
import { askGroundedQuestion } from '../services/providerRegistry';

interface AskCorporateBaddieProps {
  onSelectClaim?: (claimId: string) => void;
  /** Citation-style alias for onSelectClaim — receives the raw reference id. */
  onSelectCitation?: (claimId: string) => void;
}

interface MessageEntry {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  referencedClaims?: string[];
  providerName?: string;
  providerStatus?: 'ready' | 'fallback' | 'offline';
  timestamp: string;
}

export const AskCorporateBaddie: React.FC<AskCorporateBaddieProps> = ({
  onSelectClaim,
  onSelectCitation,
}) => {
  const openClaim = onSelectClaim || onSelectCitation;
  const [messages, setMessages] = useState<MessageEntry[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'I can explain what we found, why the recommendation matters, and what evidence supports it. Ask in plain business terms and I will answer with the evidence behind the decision.',
      referencedClaims: ['CLM-017', 'CLM-024', 'CLM-031'],
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = [
    'Why did you recommend Product A?',
    'Show me the evidence for Region South.',
    "What if we don't reduce prices?",
    'Which customers are most at risk?',
    'What would happen if marketing budget increased?',
  ];

  const handleAsk = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: MessageEntry = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
        const result = askGroundedQuestion({
          question: questionText,
          businessContext: 'Corporate decision support investigation',
          availableClaimIds: ['CLM-017', 'CLM-024', 'CLM-026', 'CLM-027', 'CLM-030', 'CLM-031'],
        });

      const agentMsg: MessageEntry = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
          text: result.text,
          referencedClaims: result.referencedClaims,
          providerName: result.providerName,
          providerStatus: result.status,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div id="ask-corporatebaddie-section" className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Ask a question about this decision
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Evidence-backed answers
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask about the recommendation, the evidence behind it, or what would change the decision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Grounded in this investigation</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Quick Decision Prompts */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Good questions to ask</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <span>{prompt}</span>
                <CornerDownRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 min-h-[160px] max-h-[380px] overflow-y-auto p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 border border-slate-700/90 text-slate-200 shadow-sm'
                }`}
              >
                <p>{m.text}</p>

                {m.referencedClaims && m.referencedClaims.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">Evidence Citations:</span>
                    {m.referencedClaims.map((claimId) => (
                      <button
                        key={claimId}
                        type="button"
                        onClick={() => openClaim && openClaim(claimId)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-1"
                      >
                        <span>{claimId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                {m.providerName && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">Answer source</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.providerStatus === 'ready' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                      {m.providerName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Checking the evidence behind this recommendation...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about this investigation (e.g., 'What if we target Region North instead?')..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
