/**
 * DrainWatch Deterministic Priority Engine with Photo-Supported Evidence
 * OneAquaHealth IEEE Global Hackathon 2026 - Track 6: Resilience Informatics
 *
 * Evidence States:
 * - needs_evidence: Low-evidence or photo missing. Cannot reach Critical priority.
 * - photo_submitted: Has photo evidence with timestamp and coordinates.
 * - community_confirmed: Community-confirmed — independent confirmation recorded.
 * - coordinator_verified: Inspected by local coordinator.
 * - resolved: Cleared or resolved safe (-10 deduction).
 *
 * Scoring Formula:
 * P = Severity + Weather + Age + PhotoEvidence + Confirmation + Vulnerability - Resolution
 *
 * Safety & Trust Principles:
 * - Photos are termed "photo-supported evidence", never "proof" or "authentication".
 * - Photo freshness rule: current only if uploaded within the last 7 days.
 * - Low-evidence reports cannot trigger Critical priority or 1 km nearby readiness notices.
 */

export const SEVERITY_SCORES = {
  partial_blockage: 3,
  damaged: 5,
  blocked: 6,
  overflowing: 8,
};

export const SEVERITY_LABELS = {
  partial_blockage: 'Partial Blockage',
  damaged: 'Damaged Structure',
  blocked: 'Blocked Drain',
  overflowing: 'Overflowing / Surcharging',
};

export const WEATHER_SCORES = {
  low: 0,       // < 5mm / 24h
  moderate: 3,  // 5 - 20mm / 24h
  heavy: 6,     // > 20mm / 24h
};

export const VULNERABILITY_LABELS = {
  homes: 'Residential Homes',
  school: 'School / Childcare',
  clinic: 'Healthcare / Clinic',
  pedestrian_route: 'Pedestrian Route / Walkway',
};

export const EVIDENCE_STATES = {
  needs_evidence: {
    key: 'needs_evidence',
    badgeLabel: 'Needs photo evidence',
    colorClass: 'bg-amber-50 text-amber-900 border-amber-300 border-dashed',
    dotColor: '#d97706',
    description: 'Text-only report awaiting photo-supported evidence',
  },
  photo_submitted: {
    key: 'photo_submitted',
    badgeLabel: 'Photo-supported report',
    colorClass: 'bg-sky-50 text-sky-800 border-sky-300',
    dotColor: '#0284c7',
    description: 'Accompanied by timestamped photo evidence',
  },
  community_confirmed: {
    key: 'community_confirmed',
    badgeLabel: 'Community-confirmed',
    colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    dotColor: '#6366f1',
    description: 'Community-confirmed — independent confirmation recorded',
  },
  coordinator_verified: {
    key: 'coordinator_verified',
    badgeLabel: 'Coordinator-verified',
    colorClass: 'bg-teal-50 text-teal-800 border-teal-300',
    dotColor: '#0d9488',
    description: 'Reviewed by neighborhood readiness coordinator',
  },
  resolved: {
    key: 'resolved',
    badgeLabel: 'Resolved',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dotColor: '#10b981',
    description: 'Condition resolved or cleared safe',
  },
};

/**
 * Calculates report age in hours and days
 */
export function getReportAge(reportedAt) {
  const reportedDate = new Date(reportedAt);
  const now = new Date();
  const diffMs = Math.max(0, now - reportedDate);
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  return { diffHours, diffDays };
}

/**
 * Evaluates photo freshness (7-day validity threshold)
 * A report photo is considered current only if uploaded within the last 7 days.
 */
export function getPhotoFreshness(photoUploadedAt, reportedAt) {
  const timestamp = photoUploadedAt || reportedAt;
  if (!timestamp) {
    return {
      hasPhoto: false,
      isFresh: false,
      ageDays: null,
      label: 'No photo evidence attached',
    };
  }

  const { diffDays } = getReportAge(timestamp);
  const isFresh = diffDays <= 7;

  return {
    hasPhoto: true,
    isFresh,
    ageDays: Math.round(diffDays * 10) / 10,
    label: isFresh
      ? `Current photo evidence (${Math.round(diffDays)}d ago)`
      : `Photo may be outdated — update requested (${Math.round(diffDays)}d ago)`,
  };
}

/**
 * Returns score contribution for report age:
 * - < 24h: 0
 * - 1-3 days: 1
 * - 4-7 days: 2
 * - > 7 days: 3
 */
export function getAgeScore(diffDays) {
  if (diffDays < 1) return { score: 0, label: 'Reported < 24h' };
  if (diffDays <= 3) return { score: 1, label: 'Reported 1–3 days ago' };
  if (diffDays <= 7) return { score: 2, label: 'Reported 4–7 days ago' };
  return { score: 3, label: 'Reported > 7 days ago (persistent)' };
}

/**
 * Calculates deterministic priority score and explainable breakdown
 * incorporating photo evidence, freshness, and community confirmation.
 *
 * @param {Object} report
 * @param {string} weatherStatus - 'low' | 'moderate' | 'heavy'
 */
export function calculatePriorityScore(report, weatherStatus = 'moderate') {
  const breakdown = [];

  // Determine current evidence state
  let evidenceKey = report.evidenceState;
  if (report.status === 'resolved') {
    evidenceKey = 'resolved';
  } else if (!evidenceKey) {
    if (!report.photoDataUrl) {
      evidenceKey = 'needs_evidence';
    } else if (Number(report.confirmations || 0) >= 2) {
      evidenceKey = 'community_confirmed';
    } else {
      evidenceKey = 'photo_submitted';
    }
  }

  const evidenceMeta = EVIDENCE_STATES[evidenceKey] || EVIDENCE_STATES.needs_evidence;
  const photoFreshness = getPhotoFreshness(report.photoUploadedAt, report.reportedAt);

  // 1. Issue Severity
  const severityScore = SEVERITY_SCORES[report.issueType] ?? 3;
  const issueName = SEVERITY_LABELS[report.issueType] ?? 'Reported Issue';
  breakdown.push({
    factor: 'Issue Severity',
    detail: `${issueName} (${report.severity || 'standard'})`,
    value: severityScore,
    sign: '+',
  });

  // 2. Weather Context
  const normalizedWeather = ['low', 'moderate', 'heavy'].includes(weatherStatus?.toLowerCase())
    ? weatherStatus.toLowerCase()
    : 'moderate';
  const weatherScore = WEATHER_SCORES[normalizedWeather];
  const weatherLabel =
    normalizedWeather === 'heavy'
      ? 'Heavy rain forecast (>20mm)'
      : normalizedWeather === 'moderate'
      ? 'Moderate rain forecast (5–20mm)'
      : 'Low rain forecast (<5mm)';

  breakdown.push({
    factor: 'Weather Context',
    detail: weatherLabel,
    value: weatherScore,
    sign: '+',
  });

  // 3. Report Age
  const { diffDays } = getReportAge(report.reportedAt);
  const ageItem = getAgeScore(diffDays);
  breakdown.push({
    factor: 'Report Age',
    detail: ageItem.label,
    value: ageItem.score,
    sign: '+',
  });

  // 4. Photo-Supported Evidence (+2 if current photo present and not needs_evidence)
  const hasCurrentPhoto =
    Boolean(report.photoDataUrl) &&
    photoFreshness.isFresh &&
    evidenceKey !== 'needs_evidence' &&
    report.status !== 'resolved';

  const photoEvidenceScore = hasCurrentPhoto ? 2 : 0;
  const photoDetail = hasCurrentPhoto
    ? 'Current photo evidence attached (≤7 days)'
    : !report.photoDataUrl
    ? 'Needs photo evidence (+0)'
    : 'Photo may be outdated — update requested (+0)';

  breakdown.push({
    factor: 'Photo Evidence',
    detail: photoDetail,
    value: photoEvidenceScore,
    sign: '+',
  });

  // 5. Community Confirmation (+2 if community_confirmed or >= 2 confirmations)
  const confirmationsCount = Number(report.confirmations || 0);
  const isCommunityConfirmed =
    evidenceKey === 'community_confirmed' || confirmationsCount >= 2;
  const confirmationScore = isCommunityConfirmed ? 2 : 0;

  breakdown.push({
    factor: 'Community Confirmation',
    detail: isCommunityConfirmed
      ? `Community-confirmed — independent confirmation recorded (${confirmationsCount} confirmation${confirmationsCount === 1 ? '' : 's'})`
      : `${confirmationsCount} confirmation(s) (needs ≥2 or second observer)`,
    value: confirmationScore,
    sign: '+',
  });

  // 6. Nearby Vulnerability
  const vulnList = Array.isArray(report.vulnerableNearby) ? report.vulnerableNearby : [];
  const hasVulnerability = vulnList.length > 0;
  const vulnScore = hasVulnerability ? 2 : 0;
  const vulnDetails = hasVulnerability
    ? vulnList.map((k) => VULNERABILITY_LABELS[k] || k).join(', ')
    : 'No vulnerable facilities flagged';

  breakdown.push({
    factor: 'Nearby Vulnerability',
    detail: vulnDetails,
    value: vulnScore,
    sign: '+',
  });

  // 7. Resolution Status (subtraction)
  let resolutionDeduction = 0;
  let statusDetail = 'Active community report';

  if (report.status === 'resolved') {
    resolutionDeduction = 10;
    statusDetail = 'Marked resolved by observer/neighborhood';
  } else if (report.status === 'verified' || report.status === 'reported') {
    resolutionDeduction = 2;
    statusDetail = report.status === 'reported'
      ? 'Marked as reported by the user'
      : 'Verified by local coordinator';
  }

  breakdown.push({
    factor: 'Resolution Status',
    detail: statusDetail,
    value: -resolutionDeduction,
    sign: '-',
  });

  // Raw Total Score
  const rawScore =
    severityScore +
    weatherScore +
    ageItem.score +
    photoEvidenceScore +
    confirmationScore +
    vulnScore -
    resolutionDeduction;

  let finalScore = Math.max(0, rawScore);

  // CRITICAL EVIDENCE RULE:
  // "Allow text-only / photo-missing reports only as 'Needs evidence.'
  // These low-evidence reports must not trigger Critical priority or nearby readiness notices."
  const isNeedsEvidence = evidenceKey === 'needs_evidence';
  if (isNeedsEvidence && finalScore >= 14) {
    finalScore = 13; // Capped below Critical threshold
  }

  // Priority Level:
  // - Critical: score >= 14 (and NOT needs_evidence)
  // - High: score 10-13
  // - Medium: score 6-9
  // - Low: score <= 5
  let level = 'low';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = '#64748b';

  if (report.status === 'resolved' || evidenceKey === 'resolved') {
    level = 'resolved';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    dotColor = '#10b981';
  } else if (finalScore >= 14 && !isNeedsEvidence) {
    level = 'critical';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    dotColor = '#ef4444';
  } else if (finalScore >= 10) {
    level = 'high';
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
    dotColor = '#ea580c';
  } else if (finalScore >= 6) {
    level = 'medium';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    dotColor = '#f59e0b';
  }

  // 1 km Nearby Readiness Notice eligibility:
  // "Only a current, photo-supported active/confirmed report can trigger a 1 km nearby readiness notice."
  const eligibleForNearbyNotice =
    (evidenceKey === 'photo_submitted' ||
      evidenceKey === 'community_confirmed' ||
      evidenceKey === 'coordinator_verified') &&
    photoFreshness.isFresh &&
    report.status !== 'resolved';

  // Exact scoring reasons string
  const summaryParts = [];
  summaryParts.push(`${issueName} +${severityScore}`);
  if (weatherScore > 0) summaryParts.push(`${normalizedWeather} rain +${weatherScore}`);
  if (photoEvidenceScore > 0) summaryParts.push(`photo evidence +${photoEvidenceScore}`);
  if (confirmationScore > 0) summaryParts.push(`confirmed +${confirmationScore}`);
  if (hasVulnerability) summaryParts.push(`vulnerability +${vulnScore}`);
  if (ageItem.score > 0) summaryParts.push(`age +${ageItem.score}`);
  if (resolutionDeduction > 0) summaryParts.push(`${report.status} -${resolutionDeduction}`);
  if (isNeedsEvidence) summaryParts.push(`[capped: needs evidence]`);

  const summaryString = `${summaryParts.join(', ')} = Priority Score ${finalScore}`;

  // Plain language attention paragraph
  const keyFactors = [];
  if (severityScore >= 6) keyFactors.push(`severe visible condition (${issueName.toLowerCase()})`);
  if (weatherScore >= 3) keyFactors.push(`upcoming forecast rainfall (${normalizedWeather})`);
  if (photoEvidenceScore > 0) keyFactors.push(`current photo-supported evidence`);
  if (confirmationScore > 0) keyFactors.push(`community confirmation`);
  if (hasVulnerability) keyFactors.push(`proximity to vulnerable infrastructure (${vulnDetails})`);
  if (isNeedsEvidence) keyFactors.push(`provisional review (photo evidence requested)`);

  const factorExplanation = keyFactors.length > 0
    ? `This location is evaluated at ${level.toUpperCase()} priority (${evidenceMeta.badgeLabel}) based on ${keyFactors.join(', ')}.`
    : `This location is evaluated with baseline readiness parameters.`;

  const attentionParagraph = `${factorExplanation} In accordance with the explainable scoring rule (P = ${finalScore}), this spot warrants timely, safe public verification before incoming precipitation. Observers must never step into culverts or runoff water.`;

  return {
    score: finalScore,
    level,
    badgeColor,
    dotColor,
    breakdown,
    summaryString,
    attentionParagraph,
    evidenceState: evidenceKey,
    evidenceMeta,
    photoFreshness,
    eligibleForNearbyNotice,
    isNeedsEvidence,
    priorityTagline: 'Priority for safe verification before forecast rain.',
  };
}
