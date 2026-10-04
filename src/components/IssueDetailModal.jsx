import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  CheckCircle,
  ThumbsUp,
  Send,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  CloudRain,
  ExternalLink,
  History,
  CheckCircle2,
  RefreshCw,
  Camera,
  Lock,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  calculatePriorityScore,
  SEVERITY_LABELS,
  VULNERABILITY_LABELS,
  EVIDENCE_STATES,
} from '../utils/priorityEngine';
import { formatCoordinates, formatDateTime, formatRelativeTime } from '../utils/formatters';

export function IssueDetailModal({ report, weather, onClose, onUpdateReport }) {
  if (!report) return null;

  const [confirming, setConfirming] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const evaluation = calculatePriorityScore(report, weather.status);
  const evidenceMeta = evaluation.evidenceMeta;
  const photoFreshness = evaluation.photoFreshness;

  // Handle "Confirm current condition" (Second observer simulation)
  const handleConfirmCondition = () => {
    setConfirming(true);
    const newCount = (report.confirmations || 0) + 1;
    const nowIso = new Date().toISOString();

    const updateEntry = {
      id: `u-conf-${Date.now()}`,
      timestamp: nowIso,
      action: 'confirmed',
      note: `Community-confirmed — independent confirmation recorded (Confirmation #${newCount}).`,
    };

    onUpdateReport(report.id, {
      confirmations: newCount,
      evidenceState: 'community_confirmed',
      updates: [updateEntry, ...(report.updates || [])],
    });

    setTimeout(() => setConfirming(false), 300);
  };

  // Handle Status transitions: 'reported' or 'resolved' or 'active'
  const handleStatusChange = (newStatus, noteText) => {
    setUpdatingStatus(true);
    const nowIso = new Date().toISOString();

    const updateEntry = {
      id: `u-${Date.now()}`,
      timestamp: nowIso,
      action: newStatus,
      note: noteText,
    };

    onUpdateReport(report.id, {
      status: newStatus,
      evidenceState: newStatus === 'resolved' ? 'resolved' : report.evidenceState,
      updates: [updateEntry, ...(report.updates || [])],
    });

    setTimeout(() => setUpdatingStatus(false), 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Drainage Issue &amp; Evidence Review
              </span>
              {report.isDemo && (
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Illustrative Demo Location
                </span>
              )}
              {report.assetLabel && (
                <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full">
                  {report.assetLabel}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-white leading-tight">
              {report.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Photo Documentation with Freshness Status */}
          <div className="space-y-2">
            {report.photoDataUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 sm:max-h-64 flex items-center justify-center">
                <img
                  src={report.photoDataUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 font-mono">
                  <Camera className="w-3 h-3 text-sky-300" />
                  <span>Photo-Supported Evidence</span>
                </span>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50/80 border-2 border-dashed border-amber-300 text-center text-amber-900 text-xs space-y-1">
                <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="font-bold">Text-only submission — Needs photo evidence</p>
                <p className="text-[11px] text-amber-700">
                  This report was filed without photo evidence. In accordance with trust rules, it cannot reach Critical priority or trigger 1 km nearby readiness notices until photo-supported evidence is uploaded.
                </p>
              </div>
            )}

            {/* Photo Freshness Banner */}
            {report.photoDataUrl && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  photoFreshness.isFresh
                    ? 'bg-sky-50 text-sky-900 border-sky-200'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-sky-600" />
                  <span className="font-semibold">{photoFreshness.label}</span>
                </div>
                {!photoFreshness.isFresh && (
                  <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    7d Threshold Exceeded
                  </span>
                )}
              </div>
            )}

            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Evidence State Badge */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-2xs ${evidenceMeta.colorClass}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evidenceMeta.dotColor }}></span>
                <span>{evidenceMeta.badgeLabel}</span>
              </span>

              {/* Priority Badge */}
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border uppercase tracking-wider ${evaluation.badgeColor}`}>
                Priority {evaluation.level} (P={evaluation.score})
              </span>

              {/* Status Badge */}
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                Status: {report.status}
              </span>

              {/* Issue Type */}
              <span className="text-xs font-medium px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                Type: {SEVERITY_LABELS[report.issueType] || report.issueType}
              </span>

              {/* 1km Notice Eligibility Chip */}
              {evaluation.eligibleForNearbyNotice ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-600 animate-pulse" />
                  <span>Eligible for 1 km readiness notice</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                  {evaluation.isNeedsEvidence
                    ? '1 km notice restricted (Needs photo evidence)'
                    : report.status === 'resolved'
                    ? 'Resolved (Inactive)'
                    : '1 km notice restricted (Photo outdated)'}
                </span>
              )}
            </div>
          </div>

          {/* Location & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ocean shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Coordinates:</span>
                <p className="font-mono text-slate-600 mt-0.5">
                  {formatCoordinates(report.latitude, report.longitude)}
                </p>
                <p className="text-[11px] text-slate-400">Batu Pahat Municipal Sector</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Reported:</span>
                <p className="text-slate-600 mt-0.5">{formatDateTime(report.reportedAt)}</p>
                <p className="text-[11px] text-slate-400">({formatRelativeTime(report.reportedAt)})</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CloudRain className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Forecast Context:</span>
                <p className="text-slate-600 mt-0.5">
                  {weather.precipitation24h} mm / 24h ({weather.status.toUpperCase()})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ThumbsUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Community Confirmations:</span>
                <p className="text-slate-600 mt-0.5">
                  {report.confirmations || 0} independent confirmation(s)
                </p>
              </div>
            </div>
          </div>

          {/* Observer Notes */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Observer Description
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              "{report.note || 'No notes provided.'}"
            </p>
          </div>

          {/* Vulnerability indicators */}
          {report.vulnerableNearby?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Nearby Community Context
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {report.vulnerableNearby.map((v) => (
                  <span
                    key={v}
                    className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {VULNERABILITY_LABELS[v] || v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transparent Explainable Priority Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Explainable Priority Score Breakdown
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  P = Severity + Weather + Age + PhotoEvidence + Confirmation + Vulnerability - Resolution
                </p>
              </div>
              <span className="text-xl font-black text-white px-3 py-1 rounded-xl bg-white/10 border border-white/20">
                P = {evaluation.score}
              </span>
            </div>

            {/* Breakdown table pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {evaluation.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between"
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {item.factor}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-slate-200 truncate pr-1" title={item.detail}>
                      {item.detail}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold shrink-0 ${
                        item.value > 0 ? 'text-sky-300' : item.value < 0 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {item.value > 0 ? `+${item.value}` : item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-sky-300">Exact rule calculation: </span>
              {evaluation.summaryString}
            </div>
          </div>

          {/* Why this needs attention */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1">
            <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-ocean" />
              <span>Why This Needs Attention</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {evaluation.attentionParagraph}
            </p>
          </div>

          {/* Safety & Privacy Notice Container */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Safe Follow-Up Actions &amp; Privacy Rules</span>
            </h4>
            <ul className="text-xs text-amber-950 space-y-1 list-disc pl-4">
              <li>
                <strong>Photograph from a safe public location:</strong> Do not enter drains or floodwater.
              </li>
              <li>
                <strong>Privacy protection:</strong> Avoid photographing identifiable people, private homes, vehicle plates, or sensitive locations where possible.
              </li>
              <li>
                <strong>Review support only:</strong> Photo evidence supports review; it is not official verification.
              </li>
              <li>
                <strong>Report dangerous issues:</strong> Residents should report urgent hazards directly to official municipal maintenance (such as Majlis Perbandaran Batu Pahat - MPBP); DrainWatch does not transmit data to any authority.
              </li>
            </ul>
          </div>

          {/* Interactive Community Actions */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Take Community Action
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Community Confirmation by Second Observer */}
              <button
                onClick={handleConfirmCondition}
                disabled={confirming}
                className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-300 transition active:scale-95 text-center"
                title="Confirm and endorse current condition as a secondary community observer"
              >
                <ThumbsUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Confirm Current Condition</span>
              </button>

              {/* Marked as reported by user */}
              <button
                onClick={() =>
                  handleStatusChange(
                    'reported',
                    'Marked as reported by the user (record logged locally; not transmitted to authorities).'
                  )
                }
                disabled={updatingStatus || report.status === 'reported'}
                className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 transition active:scale-95 text-center"
              >
                <Send className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Marked as reported by user</span>
              </button>

              {/* Resolved / Reopen */}
              {report.status !== 'resolved' ? (
                <button
                  onClick={() =>
                    handleStatusChange('resolved', 'Issue marked resolved by community/maintenance team.')
                  }
                  disabled={updatingStatus}
                  className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95 text-center"
                >
                  <CheckCircle className="w-4 h-4 text-white shrink-0" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleStatusChange('active', 'Issue reopened by community coordinator.')
                  }
                  disabled={updatingStatus}
                  className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition text-center"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Reopen Issue</span>
                </button>
              )}
            </div>
          </div>

          {/* Audit Trail / Timeline */}
          {report.updates?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>Evidence &amp; Update Timeline</span>
              </h4>
              <div className="space-y-2">
                {report.updates.map((u) => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-ocean shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-800 font-medium">{u.note}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTime(u.timestamp)} • Action: {u.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
