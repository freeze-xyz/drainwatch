import {
  calculatePriorityScore,
  getPhotoFreshness,
  SEVERITY_SCORES,
  WEATHER_SCORES,
  EVIDENCE_STATES,
  ISSUE_CATEGORIES,
  getReportTags,
} from './src/utils/priorityEngine.js';
import { SEED_REPORTS } from './src/data/seedReports.js';
import { getRainStatus } from './src/api/weather.js';
import { calculateDistanceKm } from './src/utils/formatters.js';
import {
  generateInboxMessages,
  INBOX_FORMULA_TEXT,
  INBOX_DISCLAIMER_TEXT,
  SAFETY_DIRECTIVE_TEXT,
  ADVISORY_LABEL_TEXT,
} from './src/utils/inboxEngine.js';

console.log('--- RUNNING DRAINWATCH STORMWATER & LITTER TRUST SUITE ---');

// 1. Verify Seed Data & Evidence States
console.log(`\n[Test 1] Verifying Seed Data (${SEED_REPORTS.length} reports):`);
if (SEED_REPORTS.length !== 9) {
  throw new Error(`Expected exactly 9 seed reports, got ${SEED_REPORTS.length}`);
}

const expectedTitles = [
  'Community Park Drain',
  'Riverside Walk Inlet',
  'Market Lane Culvert',
  'Campus Access Drain',
  'Housing Area Storm Drain',
  'Pasar Malam Street Litter Hotspot',
  'Jalan Rahmat Bulk Waste Dumping',
  'Simpang Rantai Outfall Runoff',
  'Taman Maju Low-Lying Ponding',
];

SEED_REPORTS.forEach((report, i) => {
  console.log(` - Checking Report #${i + 1}: ${report.title} [Evidence: ${report.evidenceState}] [Type: ${report.issueType}]`);
  if (!expectedTitles.includes(report.title)) {
    throw new Error(`Unexpected title: ${report.title}`);
  }
  if (!report.id || !report.latitude || !report.longitude || !report.issueType || !report.severity) {
    throw new Error(`Missing required fields on ${report.title}`);
  }
  if (!report.evidenceState || !EVIDENCE_STATES[report.evidenceState]) {
    throw new Error(`Invalid or missing evidenceState on ${report.title}`);
  }
});
console.log('✓ Seed data & evidence states verified successfully.');

// 2. Verify Photo Freshness (7-day rule)
console.log('\n[Test 2] Verifying Photo Freshness Logic (7-day threshold):');
const freshDate = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(); // 3 days ago
const outdatedDate = new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(); // 9 days ago

const freshEval = getPhotoFreshness(freshDate);
console.log(` - Fresh photo (3d): isFresh=${freshEval.isFresh}, label="${freshEval.label}"`);
if (!freshEval.isFresh) throw new Error('Photo from 3 days ago must be fresh');

const outdatedEval = getPhotoFreshness(outdatedDate);
console.log(` - Outdated photo (9d): isFresh=${outdatedEval.isFresh}, label="${outdatedEval.label}"`);
if (outdatedEval.isFresh) throw new Error('Photo from 9 days ago must be outdated');
if (!outdatedEval.label.includes('Photo may be outdated — update requested')) {
  throw new Error('Outdated photo must show "Photo may be outdated — update requested"');
}
console.log('✓ 7-day photo freshness verified successfully.');

// 3. Verify Distance Calculation & 1 km Notice Eligibility
console.log('\n[Test 3] Verifying Distance & 1 km Readiness Notice Eligibility:');
// Batu Pahat center: 1.8548, 102.9325
// Riverside Walk Inlet: 1.8495, 102.9280 (~0.77 km away)
const distRiverside = calculateDistanceKm(1.8548, 102.9325, 1.8495, 102.9280);
console.log(` - Distance to Riverside Walk Inlet: ${distRiverside} km`);
if (distRiverside > 1.0) throw new Error('Riverside Walk Inlet should be within 1.0 km of demo center');

const riversideReport = SEED_REPORTS.find((r) => r.title === 'Riverside Walk Inlet');
const riversideEval = calculatePriorityScore(riversideReport, 'moderate');
console.log(` - Riverside Walk Inlet notice eligibility: ${riversideEval.eligibleForNearbyNotice}`);
if (!riversideEval.eligibleForNearbyNotice) {
  throw new Error('Riverside Walk Inlet (current photo + confirmed) must be eligible for 1 km notice');
}

// Community Park Drain has no photo (needs_evidence), must NOT be eligible for 1 km notice
const parkReport = SEED_REPORTS.find((r) => r.title === 'Community Park Drain');
const parkEval = calculatePriorityScore(parkReport, 'moderate');
console.log(` - Community Park Drain notice eligibility: ${parkEval.eligibleForNearbyNotice}`);
if (parkEval.eligibleForNearbyNotice) {
  throw new Error('Needs-evidence report must NOT be eligible for 1 km notice');
}
console.log('✓ 1 km readiness notice eligibility verified successfully.');

// 4. Verify Critical Capping for "Needs Evidence" Reports
console.log('\n[Test 4] Verifying Critical Capping for "needs_evidence":');
const severeTextOnlyReport = {
  id: 'test-no-photo',
  title: 'Severe Unverified Surcharge',
  issueType: 'overflowing', // 8
  severity: 'severe',
  reportedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  photoDataUrl: null, // No photo
  evidenceState: 'needs_evidence',
  confirmations: 2, // 2
  vulnerableNearby: ['homes', 'school'], // 2
  status: 'active',
};
// In heavy rain (+6): raw sum = 8 + 6 + 0 + 0 (no photo) + 2 (confirms) + 2 (vuln) = 18!
// BUT since evidenceState is 'needs_evidence', score must be capped at 13 (High) and level cannot be Critical!
const cappedEval = calculatePriorityScore(severeTextOnlyReport, 'heavy');
console.log(` - Raw theoretical score 18 capped to: Score=${cappedEval.score}, Level=${cappedEval.level}`);
if (cappedEval.score >= 14 || cappedEval.level === 'critical') {
  throw new Error(`needs_evidence report must NOT reach Critical! Got score ${cappedEval.score} ${cappedEval.level}`);
}
if (cappedEval.level !== 'high' || cappedEval.score !== 13) {
  throw new Error(`Expected score 13 and level high, got ${cappedEval.score} ${cappedEval.level}`);
}
console.log('✓ Low-evidence Critical cap verified successfully.');

// 5. Verify Photo Evidence Points (+2) and Community Confirmation (+2)
console.log('\n[Test 5] Verifying Evidence Scoring Points:');
const photoReport = {
  id: 'test-photo',
  title: 'Photo Supported Drain',
  issueType: 'blocked', // 6
  severity: 'moderate',
  reportedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day -> +1
  photoDataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
  photoUploadedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day (Fresh) -> +2
  evidenceState: 'photo_submitted',
  confirmations: 0,
  vulnerableNearby: [],
  status: 'active',
};
const evalPhoto = calculatePriorityScore(photoReport, 'low'); // 6 (blocked) + 0 (low rain) + 1 (age) + 2 (photo) + 0 (conf) = 9
console.log(` - Photo report score: ${evalPhoto.score}`);
if (evalPhoto.score !== 9) throw new Error(`Expected score 9, got ${evalPhoto.score}`);

// Confirming condition sets community_confirmed -> +2
const evalConfirmed = calculatePriorityScore(
  { ...photoReport, evidenceState: 'community_confirmed', confirmations: 1 },
  'low'
); // 9 + 2 (confirmed) = 11
console.log(` - Community confirmed report score: ${evalConfirmed.score}`);
if (evalConfirmed.score !== 11) throw new Error(`Expected score 11, got ${evalConfirmed.score}`);

// 6. Verify 6 Issue Categories and Report Tags
console.log('\n[Test 6] Verifying 6 Integrated Issue Categories & Ecosystem Tags:');
const requiredCategories = [
  'drainage_blockage',
  'litter_hotspot',
  'illegal_dumping',
  'suspected_discharge',
  'standing_water',
  'damaged_asset',
];
requiredCategories.forEach((catKey) => {
  if (!ISSUE_CATEGORIES[catKey]) {
    throw new Error(`Missing issue category: ${catKey}`);
  }
  console.log(` - Category verified: ${catKey} -> "${ISSUE_CATEGORIES[catKey].label}"`);
});

const dumpingReport = SEED_REPORTS.find((r) => r.issueType === 'illegal_dumping');
const dumpingTags = getReportTags(dumpingReport, 'moderate');
console.log(` - Illegal dumping tags: ${JSON.stringify(dumpingTags)}`);
if (!dumpingTags.includes('Runoff pollution risk') || !dumpingTags.includes('Potential freshwater ecosystem impact')) {
  throw new Error('Dumping report must contain pollution and ecosystem impact tags');
}
console.log('✓ 6 issue categories and ecosystem tags verified successfully.');

// 7. Verify Heavy Rain Debris Mobilization Elevation
console.log('\n[Test 7] Verifying Heavy Rain Debris Mobilization Elevation:');
const litterItem = {
  id: 'test-litter-elevation',
  title: 'Test Street Litter Hotspot',
  issueType: 'litter_hotspot',
  severity: 'moderate', // 5
  reportedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  photoDataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
  photoUploadedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  evidenceState: 'photo_submitted',
  confirmations: 0,
  vulnerableNearby: [],
  status: 'active',
};

// In moderate rain: score = 5 (litter) + 3 (moderate) + 0 (age) + 2 (photo) = 10
const evalMod = calculatePriorityScore(litterItem, 'moderate');
console.log(` - Litter in Moderate rain: score=${evalMod.score}, isElevated=${evalMod.isElevatedDebrisRisk}`);
if (evalMod.score !== 10) throw new Error(`Expected score 10 in moderate rain, got ${evalMod.score}`);
if (evalMod.isElevatedDebrisRisk) throw new Error('Debris mobilization elevation should not fire in moderate rain');

// In heavy rain: score = 5 (litter) + 6 (heavy) + 0 (age) + 2 (photo) + 2 (mobilization) = 15!
const evalHeavy = calculatePriorityScore(litterItem, 'heavy');
console.log(` - Litter in Heavy rain: score=${evalHeavy.score}, isElevated=${evalHeavy.isElevatedDebrisRisk}`);
if (evalHeavy.score !== 15) throw new Error(`Expected score 15 in heavy rain, got ${evalHeavy.score}`);
if (!evalHeavy.isElevatedDebrisRisk) throw new Error('Debris mobilization must elevate in heavy rain');

const mobilizationBreakdown = evalHeavy.breakdown.find((b) => b.factor === 'Waterway Debris Mobilization');
if (!mobilizationBreakdown) throw new Error('Missing Waterway Debris Mobilization factor in breakdown');
if (!mobilizationBreakdown.detail.includes('Heavy rain can mobilize debris into drainage systems and connected urban waterways.')) {
  throw new Error('Debris breakdown must include "Heavy rain can mobilize debris into drainage systems and connected urban waterways."');
}
console.log(` - Factor detail: "${mobilizationBreakdown.detail}"`);
console.log('✓ Heavy Rain debris mobilization elevation verified successfully.');

// 8. Verify In-App Explainable Readiness Inbox Engine
console.log('\n[Test 8] Verifying In-App Explainable Readiness Inbox Engine:');
const demoLocation = { latitude: 1.8548, longitude: 102.9325, name: 'Batu Pahat' };
const heavyWeather = { status: 'heavy', rain24h: 34.2, precipitation24h: 34.2 };

const inboxMsgs = generateInboxMessages(SEED_REPORTS, heavyWeather, demoLocation, []);
console.log(` - Total inbox messages generated: ${inboxMsgs.length}`);

// Requirement 4: At least 2 seeded demo messages under Heavy Rain
const readinessNotices = inboxMsgs.filter((m) => m.type === 'readiness_notice');
const freshwaterUpdates = inboxMsgs.filter((m) => m.type === 'freshwater_update');
const resolutionUpdates = inboxMsgs.filter((m) => m.type === 'resolution_update');

console.log(` - Community Readiness Messages: ${readinessNotices.length}`);
console.log(` - Freshwater Protection Updates: ${freshwaterUpdates.length}`);
console.log(` - Resolution Updates: ${resolutionUpdates.length}`);

if (readinessNotices.length < 1) {
  throw new Error('Inbox must include at least 1 Community Readiness Message under Heavy Rain');
}
if (freshwaterUpdates.length < 1) {
  throw new Error('Inbox must include at least 1 Freshwater Protection Update under Heavy Rain');
}

// Check first Readiness Notice
const topReadiness = readinessNotices[0];
console.log(` - Top Readiness Notice: "${topReadiness.title}" (Relevance=${topReadiness.relevanceScore})`);
if (!topReadiness.signals || topReadiness.signals.length === 0) {
  throw new Error('Top readiness message must include signals array for "Why this message?"');
}

// Check first Freshwater Update
const topFreshwater = freshwaterUpdates[0];
console.log(` - Top Freshwater Update: "${topFreshwater.title}" (Relevance=${topFreshwater.relevanceScore})`);
if (!topFreshwater.signals || topFreshwater.signals.length === 0) {
  throw new Error('Top freshwater message must include signals array for "Why this message?"');
}

// Requirement 9: Resolved reports show resolution update and no active readiness notice
const resolvedMsg = inboxMsgs.find((m) => m.reportId === 'dw-bp-005');
if (!resolvedMsg) {
  throw new Error('Expected resolved seed report dw-bp-005 to generate an inbox message');
}
if (resolvedMsg.type !== 'resolution_update') {
  throw new Error(`Resolved report must be type 'resolution_update', got '${resolvedMsg.type}'`);
}
if (!resolvedMsg.isResolvedNotice) {
  throw new Error('Resolved message must have isResolvedNotice=true');
}
console.log(` - Resolved Report dw-bp-005: correctly categorized as "${resolvedMsg.typeName}"`);

// Requirement 6 & 7: Check safe suggested actions and text
inboxMsgs.forEach((msg) => {
  const hasSafety = msg.suggestedActions.some((a) => a.includes('Do not enter drains, floodwater, moving water, or unsafe roads'));
  if (!hasSafety) {
    throw new Error(`Message ${msg.id} missing required safety action directive`);
  }
});
console.log(' - Safety directive verified in suggested actions for all messages');

// Formula text verification
if (!INBOX_FORMULA_TEXT.includes('Inbox relevance = weather trigger + nearby unresolved issue + priority')) {
  throw new Error('INBOX_FORMULA_TEXT does not match required formula');
}
if (!INBOX_DISCLAIMER_TEXT.includes('Readiness Assistant uses transparent prototype rules')) {
  throw new Error('INBOX_DISCLAIMER_TEXT does not match required disclaimer');
}
if (ADVISORY_LABEL_TEXT !== 'Advisory prototype — not an official flood or water-quality warning') {
  throw new Error('ADVISORY_LABEL_TEXT does not match exact required advisory label');
}
console.log('✓ In-App Explainable Readiness Inbox Engine verified successfully.');

console.log('\n✓ ALL 8/8 STORMWATER, LITTER & INBOX TRUST TESTS PASSED WITH 100% SUCCESS!\n');
