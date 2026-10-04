import {
  calculatePriorityScore,
  getPhotoFreshness,
  SEVERITY_SCORES,
  WEATHER_SCORES,
  EVIDENCE_STATES,
} from './src/utils/priorityEngine.js';
import { SEED_REPORTS } from './src/data/seedReports.js';
import { getRainStatus } from './src/api/weather.js';
import { calculateDistanceKm } from './src/utils/formatters.js';

console.log('--- RUNNING DRAINWATCH PHOTO EVIDENCE TRUST SUITE ---');

// 1. Verify Seed Data & Evidence States
console.log(`\n[Test 1] Verifying Seed Data (${SEED_REPORTS.length} reports):`);
if (SEED_REPORTS.length !== 5) {
  throw new Error(`Expected exactly 5 seed reports, got ${SEED_REPORTS.length}`);
}

const expectedTitles = [
  'Community Park Drain',
  'Riverside Walk Inlet',
  'Market Lane Culvert',
  'Campus Access Drain',
  'Housing Area Storm Drain',
];

SEED_REPORTS.forEach((report, i) => {
  console.log(` - Checking Report #${i + 1}: ${report.title} [Evidence: ${report.evidenceState}]`);
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

console.log('\n✓ ALL PHOTO EVIDENCE TRUST TESTS PASSED WITH 100% SUCCESS!\n');
