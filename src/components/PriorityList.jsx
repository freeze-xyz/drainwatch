import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Search,
  ChevronRight,
  Clock,
  Radio,
  Camera,
  CameraOff,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { calculatePriorityScore, SEVERITY_LABELS, ISSUE_CATEGORIES, REPORT_TAG_CONFIG } from '../utils/priorityEngine';
import { formatRelativeTime } from '../utils/formatters';

export function PriorityList({ reports, weatherStatus, onSelectReport, selectedReportId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Compute priority scores and rank
  const rankedReports = useMemo(() => {
    return reports
      .map((report) => ({
        ...report,
        evaluation: calculatePriorityScore(report, weatherStatus),
      }))
      .sort((a, b) => {
        // Resolved issues rank lower
        if (a.status === 'resolved' && b.status !== 'resolved') return 1;
        if (a.status !== 'resolved' && b.status === 'resolved') return -1;
        // Rank by priority score descending
        return b.evaluation.score - a.evaluation.score;
      });
  }, [reports, weatherStatus]);

  // Filter based on search query, evidence/priority filters, and category filters
  const filteredReports = useMemo(() => {
    return rankedReports.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const catLabel = ISSUE_CATEGORIES[item.issueType]?.label || SEVERITY_LABELS[item.issueType] || '';
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query) ||
        catLabel.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Evidence & Priority filter
      const evKey = item.evaluation.evidenceState;
      if (filterState === 'critical' && item.evaluation.level !== 'critical') return false;
      if (filterState === 'photo_supported' && evKey !== 'photo_submitted' && evKey !== 'coordinator_verified') return false;
      if (filterState === 'community_confirmed' && evKey !== 'community_confirmed') return false;
      if (filterState === 'needs_evidence' && evKey !== 'needs_evidence') return false;
      if (filterState === 'resolved' && item.status !== 'resolved' && evKey !== 'resolved') return false;

      // Category filter
      if (categoryFilter !== 'all') {
        const type = item.issueType;
        if (categoryFilter === 'drainage_blockage') {
          if (!['drainage_blockage', 'blocked', 'overflowing', 'partial_blockage'].includes(type)) return false;
        } else if (categoryFilter === 'damaged_asset') {
          if (!['damaged_asset', 'damaged'].includes(type)) return false;
        } else if (type !== categoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [rankedReports, searchQuery, filterState, categoryFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[580px] lg:h-[620px]">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Priority Readiness Queue
            </h3>
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredReports.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Ranked by rain risk &amp; evidence
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search locations or observation notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean/30 focus:border-ocean transition"
          />
        </div>

        {/* Filter Pills with Evidence States */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Critical' },
            { id: 'photo_supported', label: 'Photo-Supported' },
            { id: 'community_confirmed', label: 'Confirmed' },
            { id: 'needs_evidence', label: 'Needs Evidence' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-xs ${
                filterState === tab.id
                  ? 'bg-navy-900 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Pills (6 Categories) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-none pt-1 border-t border-slate-100 mt-1.5">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Cat:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'drainage_blockage', label: 'Blockage' },
            { id: 'litter_hotspot', label: 'Litter' },
            { id: 'illegal_dumping', label: 'Dumping' },
            { id: 'suspected_discharge', label: 'Discharge' },
            { id: 'standing_water', label: 'Standing Water' },
            { id: 'damaged_asset', label: 'Damaged' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition text-[10px] ${
                categoryFilter === cat.id
                  ? 'bg-ocean text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No matching reports</p>
            <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or search terms</p>
          </div>
        ) : (
          filteredReports.map((item, index) => {
            const isSelected = item.id === selectedReportId;
            const evalData = item.evaluation;
            const evMeta = evalData.evidenceMeta;
            const photoFreshness = evalData.photoFreshness;

            return (
              <div
                key={item.id}
                onClick={() => onSelectReport(item)}
                className={`group p-2.5 sm:p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-sky-50/80 border-ocean shadow-xs ring-1 ring-ocean/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Visual Photo Thumbnail or Fallback Icon */}
                  <div className="relative shrink-0">
                    {item.photoDataUrl ? (
                      <img
                        src={item.photoDataUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:scale-102 transition"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-700 text-[10px] font-semibold text-center p-1">
                        <CameraOff className="w-4 h-4 text-amber-500 mb-0.5" />
                        <span>No Photo</span>
                      </div>
                    )}
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-navy-900 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border border-white">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Main Information Center */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-ocean transition leading-snug truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-ocean bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                            {ISSUE_CATEGORIES[item.issueType]?.label || SEVERITY_LABELS[item.issueType] || item.issueType}
                          </span>
                          {evalData.isElevatedDebrisRisk && (
                            <span className="text-[10px] font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                              ⚡ Debris Mobilized
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Clean Priority Pill */}
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${evalData.badgeColor}`}
                      >
                        P={evalData.score} • {evalData.level}
                      </span>
                    </div>

                    {/* Note excerpt */}
                    {item.note && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1 font-sans">
                        "{item.note}"
                      </p>
                    )}

                    {/* Ecosystem & Readiness Tags */}
                    {evalData.tags?.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {evalData.tags.map((tag) => {
                          const cfg = REPORT_TAG_CONFIG[tag] || { badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
                          return (
                            <span
                              key={tag}
                              className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${cfg.badgeClass}`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Evidence & Status Tags */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${evMeta.colorClass}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: evMeta.dotColor }}
                        ></span>
                        <span>{evMeta.badgeLabel}</span>
                      </span>

                      {photoFreshness.hasPhoto && !photoFreshness.isFresh && (
                        <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-700" />
                          <span>Photo &gt;7d</span>
                        </span>
                      )}

                      {evalData.eligibleForNearbyNotice && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 animate-pulse text-indigo-600" />
                          <span>1km notice ready</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                        <span>{formatRelativeTime(item.reportedAt)}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center text-[10px] text-slate-500">
        Click any report to view photo evidence, community audits, and score calculation
      </div>
    </div>
  );
}
