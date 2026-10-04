import React from 'react';
import { X, ShieldAlert, Award, Droplets, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

export function AboutSection({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ocean text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-sky-400">OneAquaHealth IEEE Hackathon 2026</span>
              <h2 className="text-lg font-bold font-sans text-white">About DrainWatch &amp; Project Boundaries</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Persistent Core Disclaimer */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl text-amber-950 space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Official Project Boundaries</span>
            </h4>
            <p className="font-medium text-xs sm:text-sm">
              “DrainWatch is a hackathon prototype. It uses a real weather forecast and simulated starter reports. It supports community readiness by organising reported visible drainage issues. It is not an official flood-warning system, emergency service, complete drainage-asset map, or water-quality assessment.”
            </p>
          </div>

          {/* Hackathon Alignment */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-ocean" />
              <span>Track 6 — Resilience Informatics</span>
            </h3>
            <p>
              Urban drainage infrastructure frequently fails during monsoon cloudbursts due to localized, visible surface obstructions (leaf litter, sediment, refuse) that prevent stormwater from entering culverts.
            </p>
            <p>
              Rather than waiting for surface water to pool into hazardous floods, DrainWatch connects <strong>real location-based precipitation forecasting</strong> from Open-Meteo with <strong>geo-tagged citizen reports</strong> to establish an explainable readiness priority queue before the storm arrives.
            </p>
          </div>

          {/* Photo-Supported Evidence Trust Architecture */}
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sky-950 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-ocean" />
              <span>Photo-Supported Evidence Architecture</span>
            </h4>
            <p className="text-xs leading-relaxed">
              In DrainWatch, photos are termed <strong>photo-supported evidence</strong>, not "proof" or "authentication." Photographs support human and community verification.
            </p>
            <ul className="text-xs space-y-1 list-disc pl-4 text-sky-900">
              <li>
                <strong>Freshness Window (7 Days):</strong> A report photo is considered current only if uploaded within the last 7 days. Older photos show <em>“Photo may be outdated — update requested”</em> and lose evidence bonus points.
              </li>
              <li>
                <strong>Mandatory Evidence for Significant Issues:</strong> Reports marked Moderate or Severe strictly require a photo upload. Text-only reports are only permitted as <em>“Needs photo evidence”</em> and cannot trigger Critical priority or 1 km nearby readiness notices.
              </li>
              <li>
                <strong>Community Asset Mapping:</strong> Mapping a new drainage asset requires at least one timestamped photo with GPS coordinates, labeled <em>“Community-mapped — requires verification.”</em>
              </li>
              <li>
                <strong>Community Confirmation:</strong> A secondary observer can click <em>“Confirm current condition”</em> to endorse status, recording an independent confirmation (<em>“Community-confirmed — independent confirmation recorded”</em>) and setting evidence state to <code>community_confirmed</code>.
              </li>
            </ul>
          </div>

          {/* Transparent Scoring Formula */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Deterministic Priority Engine (Not Black-Box AI)</span>
            </h4>
            <p className="text-xs text-slate-300 font-mono bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              P = Severity + Weather + Age + PhotoEvidence + Confirmation + Vulnerability - Resolution
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <strong className="text-white">Severity:</strong> Partial (+3), Damaged (+5), Blocked (+6), Overflowing (+8)
              </div>
              <div>
                <strong className="text-white">Weather:</strong> Low 0, Moderate (+3), Heavy &gt;20mm (+6)
              </div>
              <div>
                <strong className="text-white">Age:</strong> &lt;24h (0), 1-3d (+1), 4-7d (+2), &gt;7d (+3)
              </div>
              <div>
                <strong className="text-white">Photo Evidence:</strong> Current photo ≤7d (+2), Outdated/None (+0)
              </div>
              <div>
                <strong className="text-white">Confirmation:</strong> Confirmed by 2nd observer / ≥2 confirms (+2)
              </div>
              <div>
                <strong className="text-white">Vulnerability:</strong> Homes/School/Clinic/Path (+2)
              </div>
              <div>
                <strong className="text-white">Resolution:</strong> Resolved (-10), Reported/Verified (-2)
              </div>
              <div>
                <strong className="text-white">Evidence Cap:</strong> Needs-evidence capped at High (max 13)
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Priority levels: Critical (&ge;14), High (10–13), Medium (6–9), Low (&le;5).
            </p>
          </div>

          {/* Safety & Privacy Protocol */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Safe Observation &amp; Privacy Protocol
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li><strong>Photograph from a safe public location:</strong> Never enter underground drains, stormwater conduits, or active floodwater.</li>
              <li><strong>Respect individual privacy:</strong> Avoid photographing identifiable people, private homes, vehicle license plates, or sensitive installations.</li>
              <li><strong>Review support only:</strong> Photo evidence supports community review; it is not official government verification.</li>
              <li>
                In an emergency or for official complaints, contact official municipal bodies directly (DrainWatch is an offline demonstration tool and does not transmit reports to MPBP, JPS, 999, or any authority):
                <ul className="list-circle pl-4 pt-1 space-y-0.5 text-slate-700">
                  <li><strong>Majlis Perbandaran Batu Pahat (MPBP):</strong> 07-434 1045</li>
                  <li><strong>Jabatan Pengairan dan Saliran (JPS) Batu Pahat:</strong> 07-434 1162</li>
                  <li><strong>Emergency Services (Malaysia):</strong> 999</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
