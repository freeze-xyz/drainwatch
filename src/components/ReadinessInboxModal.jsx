import React, { useState } from 'react';
import {
  Inbox,
  X,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Droplets,
  ShieldCheck,
  Radio,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  INBOX_FORMULA_TEXT,
  INBOX_DISCLAIMER_TEXT,
  SAFETY_DIRECTIVE_TEXT,
  ADVISORY_LABEL_TEXT,
} from '../utils/inboxEngine';

export function ReadinessInboxModal({
  isOpen,
  onClose,
  messages = [],
  onSelectReport,
  onMarkAllAsRead,
  onMarkAsRead,
  weather,
  selectedLocation,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'readiness_notice' | 'freshwater_update' | 'resolution_update'
  const [expandedSignals, setExpandedSignals] = useState({});
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (!isOpen) return null;

  const toggleExpand = (id) => {
    setExpandedSignals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'all') return true;
    return msg.type === activeTab;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 mt-0.5">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-sans tracking-tight">
                  Community Readiness Messages
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent, personalized readiness triage for{' '}
                <span className="font-semibold text-slate-700">{selectedLocation?.name || 'Batu Pahat'}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* "How it decides" Explainable Rule Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-indigo-50/60 border-b border-indigo-100">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>How it decides:</span>
              <span className="font-mono text-[11px] font-semibold text-indigo-700 hidden md:inline truncate">
                {INBOX_FORMULA_TEXT}
              </span>
              {showFormulaDetails ? (
                <ChevronUp className="w-3.5 h-3.5 text-indigo-500 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500 ml-1" />
              )}
            </button>

            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider bg-indigo-100/70 px-2 py-0.5 rounded-md shrink-0">
              Rules-Based
            </span>
          </div>

          {/* Expanded formula explainer */}
          {showFormulaDetails && (
            <div className="mt-2.5 p-3 rounded-2xl bg-white border border-indigo-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
              <p className="font-semibold text-indigo-950">
                Inbox relevance = weather trigger + nearby unresolved issue + priority + evidence freshness + community confirmation − resolved status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="space-y-1">
                  <div>• <strong className="text-slate-800">Weather trigger:</strong> Elevated (+6) under Heavy Rain (&gt;20 mm) due to acute runoff.</div>
                  <div>• <strong className="text-slate-800">Nearby unresolved issue:</strong> Prioritized if within 1.0 km demo readiness radius (+5).</div>
                  <div>• <strong className="text-slate-800">Priority:</strong> Scaled proportionally from deterministic priority engine (P-score).</div>
                </div>
                <div className="space-y-1">
                  <div>• <strong className="text-slate-800">Evidence freshness:</strong> Current photo uploads (&le;7d) add +2 trust points.</div>
                  <div>• <strong className="text-slate-800">Community confirmation:</strong> Independent verifications add +2.</div>
                  <div>• <strong className="text-slate-800">Resolved status:</strong> Deducts 10 points to clear active notices into informational archives.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: `All (${messages.length})` },
              {
                id: 'readiness_notice',
                label: `Readiness (${messages.filter((m) => m.type === 'readiness_notice').length})`,
              },
              {
                id: 'freshwater_update',
                label: `Freshwater (${messages.filter((m) => m.type === 'freshwater_update').length})`,
              },
              {
                id: 'resolution_update',
                label: `Resolved (${messages.filter((m) => m.type === 'resolution_update').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition text-xs ${
                  activeTab === tab.id
                    ? 'bg-navy-900 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="sm:hidden text-[11px] font-semibold text-indigo-700 underline shrink-0"
            >
              Mark read
            </button>
          )}
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Inbox className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No messages in this category</p>
              <p className="text-xs text-slate-400">
                Switch weather scenarios in Demo Tools to observe active readiness triage.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isExpanded = !!expandedSignals[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    msg.isRead
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-sky-50/40 border-sky-200 shadow-xs ring-1 ring-sky-300/40'
                  }`}
                  onClick={() => {
                    if (!msg.isRead && onMarkAsRead) {
                      onMarkAsRead(msg.id);
                    }
                  }}
                >
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${msg.badgeColor}`}
                      >
                        {msg.typeName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{msg.time}</span>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Unread"></span>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Relevance Score: {msg.relevanceScore}
                    </span>
                  </div>

                  {/* Title & Personalized Explanation */}
                  <h3 className="text-sm font-bold text-slate-900 font-sans">{msg.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{msg.summary}</p>

                  {/* Expandable "Why this message?" Section */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(msg.id);
                      }}
                      className="text-xs font-bold text-ocean hover:text-ocean-light flex items-center gap-1 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-ocean" />
                      <span>Why this message?</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-0.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 animate-fadeIn text-[11px] text-slate-700">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                          Evaluated Decision Signals:
                        </span>
                        {msg.signals.map((sig, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-ocean font-bold">•</span>
                            <span>{sig}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Safe Suggested Actions */}
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-300/80 rounded-xl text-xs text-amber-950 space-y-1.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 block">
                      Suggested Safe Community Actions:
                    </span>
                    <ul className="space-y-1 text-[11px] leading-relaxed font-medium">
                      {msg.suggestedActions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-700 font-bold shrink-0">→</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Bottom Actions & Prototype Label */}
                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg inline-block self-start">
                      {ADVISORY_LABEL_TEXT}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onMarkAsRead) onMarkAsRead(msg.id);
                        if (onSelectReport && msg.report) {
                          onSelectReport(msg.report);
                          onClose();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-navy-900 hover:bg-ocean rounded-xl transition shadow-xs self-start sm:self-auto"
                    >
                      <span>Inspect Report Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Disclaimer (Requirement 7) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {INBOX_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
}
