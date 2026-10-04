/**
 * DrainWatch LocalStorage Manager
 * Stores starter reports and all user changes entirely in browser localStorage.
 */

import { SEED_REPORTS } from '../data/seedReports.js';

const STORAGE_KEY = 'drainwatch_reports_v1';

export function getStoredReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
      return SEED_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
    return SEED_REPORTS;
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return SEED_REPORTS;
  }
}

export function saveStoredReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function resetDemoData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
    return [...SEED_REPORTS];
  } catch (err) {
    console.error('Failed to reset demo data:', err);
    return SEED_REPORTS;
  }
}

/**
 * Inserts a preconfigured severe blocked-drain report near homes with a recent timestamp.
 * Guaranteed to produce a Critical score (P >= 14) and cause a visible ranking jump to #1!
 */
export function injectDemoPriorityReport() {
  const current = getStoredReports();

  const demoPriorityItem = {
    id: `dw-demo-critical-${Date.now()}`,
    title: 'Main Bazaar Road Surcharging Culvert',
    latitude: 1.8540,
    longitude: 102.9330,
    issueType: 'overflowing',
    severity: 'severe',
    note: 'DEMO SCENARIO: Severe obstruction and active surcharge at main town intersection box culvert directly fronting residences and shoplots. Impending backflow risk during incoming rain.',
    photoDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#450a0a"/>
        <rect y="220" width="600" height="180" fill="#1c1917"/>
        <circle cx="300" cy="180" r="90" fill="#7f1d1d" stroke="#ef4444" stroke-width="6"/>
        <path d="M 230 200 L 370 200 M 260 160 L 340 160 M 240 240 L 360 240" stroke="#fca5a5" stroke-width="8" stroke-linecap="round"/>
        <rect x="30" y="30" width="300" height="46" rx="8" fill="#991b1b"/>
        <text x="45" y="60" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">CRITICAL SIMULATION REPORT</text>
        <rect x="30" y="330" width="540" height="44" rx="8" fill="#18181b"/>
        <text x="45" y="358" font-family="sans-serif" font-size="14" fill="#ef4444">Heavy blockage near homes &amp; businesses</text>
      </svg>`
    )}`,
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    photoUploadedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    evidenceState: 'community_confirmed',
    confirmations: 3, // multiple confirmations (+2)
    vulnerableNearby: ['homes', 'school', 'pedestrian_route'], // near homes (+2)
    isDemo: true,
    updates: [
      {
        id: `u-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'created',
        note: 'Inserted via Hackathon Demo: Preconfigured critical priority report with current photo evidence and community confirmation.',
      },
    ],
  };

  const updated = [demoPriorityItem, ...current];
  saveStoredReports(updated);
  return { updated, newItem: demoPriorityItem };
}
