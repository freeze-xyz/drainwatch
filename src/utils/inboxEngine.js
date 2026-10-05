/**
 * DrainWatch In-App Explainable Readiness Inbox Engine
 *
 * Demonstrates transparent, personalized readiness triage for the selected demo location.
 * Uses deterministic client-side rules based on:
 *   Inbox relevance = weather trigger + nearby unresolved issue + priority
 *                     + evidence freshness + community confirmation - resolved status
 *
 * This is an advisory prototype feature — NOT an official alert service.
 */

import { calculatePriorityScore, ISSUE_CATEGORIES } from './priorityEngine.js';
import { calculateDistanceKm } from './formatters.js';

export const INBOX_FORMULA_TEXT =
  'Inbox relevance = weather trigger + nearby unresolved issue + priority + evidence freshness + community confirmation − resolved status';

export const INBOX_DISCLAIMER_TEXT =
  'Readiness Assistant uses transparent prototype rules based on forecast context and community evidence. It does not predict flooding, verify water quality, or issue official emergency alerts.';

export const SAFETY_DIRECTIVE_TEXT =
  'Check official weather guidance. Do not enter drains, floodwater, moving water, or unsafe roads.';

export const ADVISORY_LABEL_TEXT =
  'Advisory prototype — not an official flood or water-quality warning';

/**
 * Generates explainable inbox messages based on the current app state.
 *
 * @param {Array} reports - All current reports (seed + user)
 * @param {Object} weather - Active weather object ({ status, rain24h, ... })
 * @param {Object} userLocation - Active center/user location ({ latitude, longitude, name })
 * @param {Array<string>} readMessageIds - List of message IDs already marked read by user
 * @returns {Array<Object>} List of triage inbox messages sorted by relevance
 */
export function generateInboxMessages(reports = [], weather = {}, userLocation = {}, readMessageIds = []) {
  const readSet = new Set(readMessageIds || []);
  const rainStatus = weather.status || 'low';
  const rain24h = typeof weather.rain24h === 'number' ? weather.rain24h : 0;
  const isHeavyRain = rainStatus === 'heavy' || rain24h >= 20;
  const isModerateRain = rainStatus === 'moderate' || (rain24h >= 5 && rain24h < 20);

  const userLat = typeof userLocation.latitude === 'number' ? userLocation.latitude : 1.8548;
  const userLon = typeof userLocation.longitude === 'number' ? userLocation.longitude : 102.9325;

  const messages = [];

  // Evaluate each report with the priority engine and distance
  reports.forEach((report) => {
    const distanceKm = calculateDistanceKm(userLat, userLon, report.latitude, report.longitude);
    const evalData = calculatePriorityScore(report, rainStatus);
    const categoryCfg = ISSUE_CATEGORIES[report.issueType] || {
      id: report.issueType,
      label: 'Drainage blockage',
      score: 6,
      color: '#f59e0b',
    };

    const isResolved = report.status === 'resolved' || evalData.evidenceState === 'resolved';

    // 1. Weather Trigger Points (0 to 6)
    let weatherTriggerScore = 0;
    let weatherTriggerSignal = 'Low baseline rain (<5 mm/24h) — standard readiness';
    if (isHeavyRain) {
      weatherTriggerScore = 6;
      weatherTriggerSignal = `Heavy Rain forecast active (${rain24h.toFixed(1)} mm/24h) — high runoff potential`;
    } else if (isModerateRain) {
      weatherTriggerScore = 3;
      weatherTriggerSignal = `Moderate Rain forecast active (${rain24h.toFixed(1)} mm/24h)`;
    }

    // 2. Nearby Unresolved Issue Points (0 to 5)
    let nearbyScore = 0;
    let proximitySignal = '';
    if (distanceKm <= 1.0) {
      nearbyScore = 5;
      proximitySignal = `Within primary 1.0 km readiness radius (${distanceKm} km from demo location)`;
    } else if (distanceKm <= 2.5) {
      nearbyScore = 3;
      proximitySignal = `Within neighborhood perimeter (${distanceKm} km from demo location)`;
    } else {
      nearbyScore = 1;
      proximitySignal = `Regional Batu Pahat reference (${distanceKm} km away)`;
    }

    // 3. Priority Contribution (0 to 5 based on evalData.score)
    const priorityPoints = Math.min(5, Math.floor(evalData.score / 3));

    // 4. Evidence Freshness Points (0 to 2)
    let freshnessScore = 0;
    let evidenceSignal = 'Provisional text-only report — photo verification requested';
    if (evalData.photoFreshness?.isFresh) {
      freshnessScore = 2;
      evidenceSignal = `Current photo-supported evidence (${evalData.photoFreshness.photoAgeDays}d ago) — verified fresh`;
    } else if (report.photoDataUrl) {
      freshnessScore = 0;
      evidenceSignal = 'Photo evidence older than 7 days — update requested';
    }

    // 5. Community Confirmation Points (0 to 2)
    let confirmationScore = 0;
    let confirmationSignal = 'Pending independent community confirmation';
    if (evalData.evidenceState === 'community_confirmed' || (report.confirmations && report.confirmations.length >= 2)) {
      confirmationScore = 2;
      confirmationSignal = `${report.confirmations?.length || 2} independent community confirmations recorded`;
    } else if (evalData.evidenceState === 'coordinator_verified') {
      confirmationScore = 3;
      confirmationSignal = 'Inspected and verified by local neighborhood coordinator';
    }

    // 6. Resolved Status (-10 deduction)
    const resolvedDeduction = isResolved ? 10 : 0;

    // Total Relevance Score
    const relevanceScore = Math.max(
      0,
      weatherTriggerScore + nearbyScore + priorityPoints + freshnessScore + confirmationScore - resolvedDeduction
    );

    // Determine Message Type
    const isLitterOrRunoff = [
      'litter_hotspot',
      'illegal_dumping',
      'suspected_discharge',
    ].includes(report.issueType);

    if (isResolved) {
      // REQUIREMENT 9:
      // "Ensure resolved reports no longer create active readiness messages;
      // instead they can show an informational resolution update."
      const msgId = `inbox-res-${report.id}`;
      messages.push({
        id: msgId,
        reportId: report.id,
        type: 'resolution_update',
        typeName: 'Resolution Update',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotColor: '#10b981',
        title: `Resolved: ${report.title}`,
        time: 'Recent Update',
        summary: `Drainage issue at ${report.title} (${distanceKm} km away) was marked resolved. Drainage capacity has been restored and active readiness notices have been cleared.`,
        signals: [
          `Resolution status: Capacity restored (score adjusted by -${resolvedDeduction})`,
          `Location: ${report.title} (${distanceKm} km from demo location)`,
          `Previous issue category: ${categoryCfg.label}`,
          `Notice cleared: No active readiness action required`,
        ],
        suggestedActions: [
          'No action required. Safe drainage flow confirmed by community.',
          SAFETY_DIRECTIVE_TEXT,
        ],
        report,
        distanceKm,
        relevanceScore: 1, // Low priority since informational
        isRead: readSet.has(msgId),
        isResolvedNotice: true,
      });
      return;
    }

    // Active Reports:
    if (isLitterOrRunoff) {
      // Freshwater Protection Update
      const msgId = `inbox-freshwater-${report.id}-${rainStatus}`;
      const debrisExplanation = isHeavyRain
        ? 'Heavy rain can mobilize debris into drainage systems and connected urban waterways.'
        : 'Potential runoff pathway into urban waterways during precipitation events.';

      messages.push({
        id: msgId,
        reportId: report.id,
        type: 'freshwater_update',
        typeName: 'Freshwater Protection Update',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        dotColor: '#0d9488',
        title: `Freshwater Risk: ${report.title}`,
        time: isHeavyRain ? 'Urgent Forecast Window' : 'Pre-Rain Advisory',
        summary: `${categoryCfg.label} identified ${distanceKm} km away. ${debrisExplanation}`,
        signals: [
          `Weather trigger: ${weatherTriggerSignal} (+${weatherTriggerScore})`,
          `Proximity: ${proximitySignal} (+${nearbyScore})`,
          `Priority & Severity: P=${evalData.score} (${evalData.level.toUpperCase()}) (+${priorityPoints})`,
          `Evidence freshness: ${evidenceSignal} (+${freshnessScore})`,
          `Community confirmation: ${confirmationSignal} (+${confirmationScore})`,
          `Urban waterway impact: Runoff debris mobilization pathway to freshwater channels`,
        ],
        suggestedActions: [
          'Observe and confirm status from a safe public pavement before rains intensify.',
          'Coordinate safe neighborhood waste disposal away from open culvert grates.',
          SAFETY_DIRECTIVE_TEXT,
        ],
        report,
        distanceKm,
        relevanceScore,
        isRead: readSet.has(msgId),
        isResolvedNotice: false,
      });
    } else {
      // Community Readiness Message
      const msgId = `inbox-readiness-${report.id}-${rainStatus}`;
      messages.push({
        id: msgId,
        reportId: report.id,
        type: 'readiness_notice',
        typeName: 'Community Readiness Message',
        badgeColor:
          evalData.level === 'critical'
            ? 'bg-rose-100 text-rose-800 border-rose-300'
            : 'bg-amber-100 text-amber-800 border-amber-300',
        dotColor: evalData.level === 'critical' ? '#ef4444' : '#f59e0b',
        title: `Readiness Notice: ${report.title}`,
        time: isHeavyRain ? 'Monsoon Forecast Window' : 'Active Readiness Queue',
        summary: `Unresolved ${categoryCfg.label.toLowerCase()} located ${distanceKm} km from your demo spot with P=${evalData.score} priority score under ${rainStatus} rain context.`,
        signals: [
          `Weather trigger: ${weatherTriggerSignal} (+${weatherTriggerScore})`,
          `Proximity: ${proximitySignal} (+${nearbyScore})`,
          `Priority & Severity: P=${evalData.score} (${evalData.level.toUpperCase()}) (+${priorityPoints})`,
          `Evidence freshness: ${evidenceSignal} (+${freshnessScore})`,
          `Community confirmation: ${confirmationSignal} (+${confirmationScore})`,
          `Conveyance risk: Hindered hydraulic capacity under forecast precipitation`,
        ],
        suggestedActions: [
          'Inspect condition visually from a safe, dry location to check for escalating blockage.',
          'Verify if local municipal contractors or gotong-royong groups have scheduled inspection.',
          SAFETY_DIRECTIVE_TEXT,
        ],
        report,
        distanceKm,
        relevanceScore,
        isRead: readSet.has(msgId),
        isResolvedNotice: false,
      });
    }
  });

  // Sort: Active higher relevance first, then unread first, then lowest distance
  return messages.sort((a, b) => {
    // Unresolved before resolved
    if (a.isResolvedNotice !== b.isResolvedNotice) {
      return a.isResolvedNotice ? 1 : -1;
    }
    // High relevance score first
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    // Unread before read
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return a.distanceKm - b.distanceKm;
  });
}
