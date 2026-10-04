import React, { useState } from 'react';
import {
  X,
  Upload,
  MapPin,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Check,
  Trash2,
  Lock,
  Layers,
  Info,
} from 'lucide-react';
import { SEVERITY_SCORES, SEVERITY_LABELS, VULNERABILITY_LABELS } from '../utils/priorityEngine';

export function ReportModal({
  isOpen,
  onClose,
  onSubmitReport,
  onStartMapPick,
  pickedLocation,
  onUseCurrentLocation,
  locating,
  initialMode = 'issue',
}) {
  if (!isOpen) return null;

  // Mode: 'issue' or 'asset'
  const [submissionMode, setSubmissionMode] = useState(initialMode || 'issue');

  React.useEffect(() => {
    if (initialMode) {
      setSubmissionMode(initialMode);
    }
  }, [initialMode, isOpen]);

  // Form states
  const [title, setTitle] = useState('');
  const [latitude, setLatitude] = useState(pickedLocation?.latitude || 1.8548);
  const [longitude, setLongitude] = useState(pickedLocation?.longitude || 102.9325);
  const [issueType, setIssueType] = useState('blocked');
  const [severity, setSeverity] = useState('moderate');
  const [vulnerabilities, setVulnerabilities] = useState(['homes']);
  const [note, setNote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle vulnerability toggle
  const toggleVulnerability = (key) => {
    setVulnerabilities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Handle client-side photo upload via FileReader
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoDataUrl(event.target.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Check if photo is required based on rules
  const isPhotoRequired =
    submissionMode === 'asset' || severity === 'moderate' || severity === 'severe';

  // Submit report or mapped asset
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Please enter a descriptive landmark or street name.');
      return;
    }

    if (submissionMode === 'asset' && !photoDataUrl) {
      setErrorMessage('A photo is strictly required before a community drainage asset can be mapped.');
      return;
    }

    if ((severity === 'moderate' || severity === 'severe') && !photoDataUrl) {
      setErrorMessage(
        'Photo evidence is required for Moderate and Severe reports. Text-only reports are only permitted for Minor severity as "Needs evidence".'
      );
      return;
    }

    if (!safetyChecked) {
      setErrorMessage('You must confirm the safety observation requirement to submit.');
      return;
    }

    if (!privacyChecked) {
      setErrorMessage('You must acknowledge the privacy guidelines regarding identifiable persons/plates.');
      return;
    }

    const nowIso = new Date().toISOString();

    // Determine evidence state
    let evidenceState = 'photo_submitted';
    if (!photoDataUrl) {
      evidenceState = 'needs_evidence';
    }

    const isAssetMapping = submissionMode === 'asset';

    const newReport = {
      id: isAssetMapping ? `dw-asset-${Date.now()}` : `dw-usr-${Date.now()}`,
      title: title.trim(),
      latitude: Number(Number(latitude).toFixed(5)),
      longitude: Number(Number(longitude).toFixed(5)),
      issueType: isAssetMapping ? 'partial_blockage' : issueType,
      severity: isAssetMapping ? 'minor' : severity,
      note: note.trim() || (isAssetMapping ? 'Community-mapped drainage asset location.' : 'Observed visible drain condition.'),
      photoDataUrl: photoDataUrl || null,
      photoUploadedAt: photoDataUrl ? nowIso : null,
      reportedAt: nowIso,
      status: 'active',
      confirmations: 0,
      vulnerableNearby: vulnerabilities,
      isDemo: false,
      isAsset: isAssetMapping,
      assetLabel: isAssetMapping ? 'Community-mapped — requires verification' : undefined,
      evidenceState,
      updates: [
        {
          id: `u-init-${Date.now()}`,
          timestamp: nowIso,
          action: 'created',
          note: isAssetMapping
            ? 'Drainage asset point mapped with photo-supported evidence. Community-mapped — requires verification.'
            : photoDataUrl
            ? 'Community report submitted with photo-supported evidence.'
            : 'Text-only community report submitted. Marked as "Needs photo evidence".',
        },
      ],
    };

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
                Community Readiness Infrastructure
              </span>
            </div>
            <h2 className="text-lg font-bold font-sans text-white">
              {submissionMode === 'asset' ? 'Map Community Drainage Asset' : 'Report Drainage Issue'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-100/80 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSubmissionMode('issue');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              submissionMode === 'issue'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>Report Drainage Issue</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmissionMode('asset');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              submissionMode === 'asset'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Map Drainage Asset</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Trust & Boundary Notice */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-ocean shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {submissionMode === 'asset'
                  ? 'Community-mapped — requires verification. Photo evidence is mandatory.'
                  : 'Supported by a current community photo — verification may still be needed.'}
              </p>
              <p className="text-[11px] text-sky-800 mt-0.5">
                Photo evidence supports review; it is not official verification or emergency reporting.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Location & Landmark Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {submissionMode === 'asset' ? 'Drainage Asset Name / Landmark *' : 'Location Title / Landmark *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                submissionMode === 'asset'
                  ? 'e.g. Parit Besar Inlet Grating at Jalan Rugayah'
                  : 'e.g. Jalan Rahmat Storm Culvert, Near Pasar'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/40 focus:border-ocean transition"
            />
          </div>

          {/* Location Coordinates & Pick Helpers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Coordinates (Batu Pahat Area)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onStartMapPick}
                  className="text-xs text-ocean hover:text-ocean-light font-semibold flex items-center gap-1 hover:underline"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Tap on map</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    onUseCurrentLocation((loc) => {
                      setLatitude(loc.latitude);
                      setLongitude(loc.longitude);
                    });
                  }}
                  disabled={locating}
                  className="text-xs text-ocean hover:text-ocean-light font-semibold flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locating ? 'Locating...' : 'GPS Location'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Issue Specifics (only in issue mode) */}
          {submissionMode === 'issue' && (
            <>
              {/* Issue Type Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Visible Drainage Issue Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'partial_blockage', label: 'Partial Blockage (+3)', desc: 'Leaves, silt, minor debris' },
                    { id: 'blocked', label: 'Blocked Drain (+6)', desc: 'Clogged culvert, refuse buildup' },
                    { id: 'overflowing', label: 'Overflowing (+8)', desc: 'Surcharging over curb onto street' },
                    { id: 'damaged', label: 'Damaged (+5)', desc: 'Broken grate or collapsed sidewall' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setIssueType(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        issueType === item.id
                          ? 'border-ocean bg-sky-50/80 ring-2 ring-ocean/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Observed Severity Level *
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {severity === 'minor' ? 'Photo optional (Needs evidence)' : 'Photo required'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'minor', label: 'Minor (Needs evidence if no photo)', desc: 'Low evidence allowed' },
                    { id: 'moderate', label: 'Moderate', desc: 'Photo required' },
                    { id: 'severe', label: 'Severe', desc: 'Photo required' },
                  ].map((sev) => (
                    <button
                      type="button"
                      key={sev.id}
                      onClick={() => setSeverity(sev.id)}
                      className={`p-2 text-center rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                        severity === sev.id
                          ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{sev.id}</span>
                      <span className="text-[9px] font-normal opacity-80 mt-0.5">{sev.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Photo-Supported Evidence Upload (Mandatory for Assets and Mod/Severe) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Photo-Supported Evidence {isPhotoRequired ? '(Required *)' : '(Optional for Minor)'}
              </label>
              {isPhotoRequired && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Required
                </span>
              )}
            </div>

            {photoDataUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-48 group">
                <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-navy-900/80 text-sky-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                  Timestamped: {new Date().toLocaleTimeString()}
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-ocean rounded-2xl cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  Select photo evidence from device
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                  {isPhotoRequired
                    ? 'Required: Photo with timestamp & coordinates will be saved locally'
                    : 'If omitted, report will be filed as "Needs photo evidence" (cannot reach Critical)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Privacy & Safety Safeguards Notices */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-ocean" />
              <span>Safety &amp; Privacy Rules for Photo Evidence</span>
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
              <li>
                <strong>Photograph from a safe public location:</strong> Do not enter drains or floodwater.
              </li>
              <li>
                <strong>Avoid identifiable details:</strong> Avoid photographing identifiable people, private homes, vehicle plates, or sensitive locations.
              </li>
              <li>
                <strong>Supports review only:</strong> Photo evidence supports community coordination; it is not official verification.
              </li>
            </ul>
          </div>

          {/* Vulnerability Checkbox Group */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nearby Vulnerable Assets (+2 to priority if any selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'homes', label: 'Residential Homes' },
                { key: 'school', label: 'School / Childcare Center' },
                { key: 'clinic', label: 'Community Clinic / Health Center' },
                { key: 'pedestrian_route', label: 'Key Pedestrian Route / Walkway' },
              ].map((vuln) => {
                const checked = vulnerabilities.includes(vuln.key);
                return (
                  <label
                    key={vuln.key}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      checked
                        ? 'bg-amber-500/10 border-amber-400/80 text-amber-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleVulnerability(vuln.key)}
                      className="rounded text-ocean focus:ring-ocean"
                    />
                    <span>{vuln.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Observation Description
            </label>
            <textarea
              rows={2}
              placeholder="Provide safe visible description (e.g. concrete inlet grating blocked by plastic packaging and sediment)."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/40 focus:border-ocean transition"
            />
          </div>

          {/* Mandatory Checkboxes */}
          <div className="space-y-2">
            {/* Safety Checkbox */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={safetyChecked}
                  onChange={(e) => setSafetyChecked(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-amber-950 leading-snug">
                  I observed this from a safe public location and did not enter a drain or floodwater. *
                </span>
              </label>
            </div>

            {/* Privacy Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="mt-0.5 rounded text-ocean focus:ring-ocean w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 leading-snug">
                  I avoided photographing identifiable people, private homes, vehicle plates, or sensitive locations. *
                </span>
              </label>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!safetyChecked || !privacyChecked || (isPhotoRequired && !photoDataUrl)}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                safetyChecked && privacyChecked && (!isPhotoRequired || photoDataUrl)
                  ? 'bg-ocean hover:bg-ocean-light active:scale-98 shadow-ocean/30 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {submissionMode === 'asset'
                  ? 'Submit Community-Mapped Drainage Asset'
                  : photoDataUrl
                  ? 'Submit Photo-Supported Report'
                  : 'Submit Report (Marked as Needs Evidence)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
