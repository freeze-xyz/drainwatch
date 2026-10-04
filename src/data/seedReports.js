/**
 * Starter Seed Reports for DrainWatch with Photo-Supported Evidence States
 * Location: Batu Pahat, Johor, Malaysia (Demo Dataset)
 *
 * IMPORTANT PRODUCT BOUNDARIES:
 * "Demo workspace — simulated citizen reports. Location points are illustrative."
 * Do not claim these are real reports or real drainage assets.
 */

// Helper to generate clean, lightweight SVG data URLs for illustrative visual previews
function createIllustrativePhotoSvg(title, type, color1 = '#1e293b', color2 = '#0284c7') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#cbd5e1" />
        <stop offset="60%" stop-color="#94a3b8" />
        <stop offset="100%" stop-color="#64748b" />
      </linearGradient>
      <linearGradient id="drainGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="#0f172a" />
      </drainGrad>
      <pattern id="gratePattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 0 10 L 20 10" stroke="#334155" stroke-width="3" />
        <path d="M 10 0 L 10 20" stroke="#475569" stroke-width="2" />
      </pattern>
    </defs>
    <!-- Background curb & road -->
    <rect width="600" height="240" fill="url(#skyGrad)"/>
    <rect y="220" width="600" height="180" fill="#334155"/>
    <rect y="200" width="600" height="30" fill="#cbd5e1"/>
    <!-- Drain opening / inlet -->
    <rect x="120" y="220" width="360" height="130" rx="8" fill="url(#drainGrad)" stroke="#1e293b" stroke-width="4"/>
    <rect x="135" y="235" width="330" height="100" fill="url(#gratePattern)" opacity="0.8"/>
    <!-- Water / blockage effect -->
    <path d="M 140 280 Q 220 260 300 285 T 460 270 L 460 330 L 140 330 Z" fill="${color2}" opacity="0.85"/>
    <!-- Illustrative badge -->
    <rect x="20" y="20" width="280" height="44" rx="8" fill="rgba(15,23,42,0.85)"/>
    <text x="32" y="48" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">PHOTO-SUPPORTED EVIDENCE</text>
    <!-- Caption -->
    <rect x="20" y="340" width="560" height="42" rx="6" fill="rgba(15,23,42,0.9)"/>
    <text x="35" y="366" font-family="system-ui, sans-serif" font-size="14" fill="#f8fafc">${title} — ${type}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SEED_REPORTS = [
  {
    id: 'dw-bp-001',
    title: 'Community Park Drain',
    latitude: 1.8592,
    longitude: 102.9380,
    issueType: 'partial_blockage',
    severity: 'minor',
    note: 'Initial text observation: fallen leaves along pedestrian curb. Awaiting community photo-supported evidence.',
    photoDataUrl: null, // Text-only: needs_evidence
    photoUploadedAt: null,
    reportedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    status: 'active',
    evidenceState: 'needs_evidence',
    confirmations: 1,
    vulnerableNearby: ['pedestrian_route'],
    isDemo: true,
    updates: [
      {
        id: 'u-001-1',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        action: 'created',
        note: 'Text observation logged by park walker. Marked as "Needs photo evidence".',
      },
    ],
  },
  {
    id: 'dw-bp-002',
    title: 'Riverside Walk Inlet',
    latitude: 1.8495,
    longitude: 102.9280,
    issueType: 'overflowing',
    severity: 'severe',
    note: 'Riverwalk outflow culvert surcharging during high tide and rain; water backing up onto public footpath adjacent to residential row.',
    photoDataUrl: createIllustrativePhotoSvg('Riverside Walk Inlet', 'Surcharging drain inlet', '#1e293b', '#0284c7'),
    photoUploadedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago (Fresh)
    reportedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'active',
    evidenceState: 'community_confirmed',
    confirmations: 2,
    vulnerableNearby: ['homes', 'pedestrian_route'],
    isDemo: true,
    updates: [
      {
        id: 'u-002-1',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        action: 'created',
        note: 'Initial report logged with timestamped photo taken safely from road bank.',
      },
      {
        id: 'u-002-2',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        action: 'confirmed',
        note: 'Second observer confirmed current condition from public walkway.',
      },
    ],
  },
  {
    id: 'dw-bp-003',
    title: 'Market Lane Culvert',
    latitude: 1.8530,
    longitude: 102.9345,
    issueType: 'blocked',
    severity: 'severe',
    note: 'Deep commercial box drain heavily obstructed by discarded wooden crates, cardboard packaging, and sediment build-up.',
    photoDataUrl: createIllustrativePhotoSvg('Market Lane Culvert', 'Heavily blocked box culvert', '#0f172a', '#ea580c'),
    photoUploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago (Fresh <= 7d)
    reportedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: 'reported',
    evidenceState: 'photo_submitted',
    confirmations: 1,
    vulnerableNearby: ['homes', 'school'],
    isDemo: true,
    updates: [
      {
        id: 'u-003-1',
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        action: 'created',
        note: 'Photo-supported report submitted by local merchant.',
      },
      {
        id: 'u-003-2',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        action: 'reported',
        note: 'Marked as reported by the user (simulated record; not transmitted to authorities).',
      },
    ],
  },
  {
    id: 'dw-bp-004',
    title: 'Campus Access Drain',
    latitude: 1.8570,
    longitude: 102.9450,
    issueType: 'damaged',
    severity: 'moderate',
    note: 'Collapsed concrete side-wall and broken steel grating restricting channel cross-sectional flow. Photo uploaded 9 days ago.',
    photoDataUrl: createIllustrativePhotoSvg('Campus Access Drain', 'Damaged concrete wall & grate', '#1e293b', '#64748b'),
    photoUploadedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), // 9 days ago (> 7d Outdated)
    reportedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    status: 'verified',
    evidenceState: 'coordinator_verified',
    confirmations: 2,
    vulnerableNearby: ['school', 'pedestrian_route'],
    isDemo: true,
    updates: [
      {
        id: 'u-004-1',
        timestamp: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        action: 'created',
        note: 'Logged by student commuter with photo documentation.',
      },
      {
        id: 'u-004-2',
        timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        action: 'verified',
        note: 'Community coordinator safely inspected curb damage and flagged for maintenance.',
      },
    ],
  },
  {
    id: 'dw-bp-005',
    title: 'Housing Area Storm Drain',
    latitude: 1.8450,
    longitude: 102.9390,
    issueType: 'partial_blockage',
    severity: 'minor',
    note: 'Moderate garden clippings caught against the secondary silt trap. Cleared by neighborhood gotong-royong.',
    photoDataUrl: createIllustrativePhotoSvg('Housing Area Storm Drain', 'Resolved minor silt trap issue', '#0f172a', '#10b981'),
    photoUploadedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'resolved',
    evidenceState: 'resolved',
    confirmations: 1,
    vulnerableNearby: ['homes'],
    isDemo: true,
    updates: [
      {
        id: 'u-005-1',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        action: 'created',
        note: 'Logged by homeowner with photo.',
      },
      {
        id: 'u-005-2',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        action: 'resolved',
        note: 'Neighborhood voluntary team safely cleared surface clippings from street level.',
      },
    ],
  },
];
