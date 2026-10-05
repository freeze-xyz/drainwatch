import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Navbar,
} from './components/Navbar';
import { WeatherCard } from './components/WeatherCard';
import { MapView } from './components/MapView';
import { PriorityList } from './components/PriorityList';
import { IssueDetailModal } from './components/IssueDetailModal';
import { ReportModal } from './components/ReportModal';
import { AboutSection } from './components/AboutSection';
import { ReadinessInboxModal } from './components/ReadinessInboxModal';
import { Footer } from './components/Footer';

import {
  fetchWeatherForecast,
  DEFAULT_LOCATION,
  FALLBACK_WEATHER,
  getRainStatus,
} from './api/weather';
import {
  getStoredReports,
  saveStoredReports,
  resetDemoData,
  injectDemoPriorityReport,
} from './utils/storage';
import { calculatePriorityScore } from './utils/priorityEngine';
import { generateInboxMessages } from './utils/inboxEngine';
import { calculateDistanceKm } from './utils/formatters';
import { Sparkles, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, Radio, Layers, Plus } from 'lucide-react';

export default function App() {
  // Core application state
  const [reports, setReports] = useState(() => getStoredReports());
  const [weather, setWeather] = useState(FALLBACK_WEATHER);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [isUsingCustomLocation, setIsUsingCustomLocation] = useState(false);

  // Demo & scenario states
  const [activeScenario, setActiveScenario] = useState('live'); // 'live' | 'heavy' | 'moderate' | 'low'

  // Modals & UI states
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalMode, setReportModalMode] = useState('issue'); // 'issue' | 'asset'
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [readInboxIds, setReadInboxIds] = useState(() => {
    try {
      const saved = localStorage.getItem('drainwatch_read_inbox_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'list'
  const [toast, setToast] = useState(null);

  const handleOpenReportIssue = () => {
    setReportModalMode('issue');
    setIsPickingLocation(false);
    setPickedLocation(null);
    setIsReportModalOpen(true);
  };

  const handleOpenMapAsset = () => {
    setReportModalMode('asset');
    setIsPickingLocation(false);
    setPickedLocation(null);
    setIsReportModalOpen(true);
  };

  // Helper to trigger transient toasts
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  // Fetch Open-Meteo weather forecast
  const loadWeather = useCallback(async (lat, lon, name = '') => {
    setLoadingWeather(true);
    try {
      const data = await fetchWeatherForecast(lat, lon, name);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch encountered issue, using fallback:', err);
      setWeather((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        locationName: name || 'Demo Weather Context',
        isFallback: true,
      }));
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.name);
  }, [loadWeather]);

  // Handle Scenario switching for hackathon demo evaluation
  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
    if (scenario === 'live') {
      loadWeather(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name);
      showToast('Loaded live Open-Meteo forecast data.');
    } else if (scenario === 'heavy') {
      setWeather((prev) => ({
        ...prev,
        precipitation24h: 34.2,
        status: 'heavy',
        locationName: `${selectedLocation.name} (Simulated Heavy Rain)`,
        isFallback: false,
        hourly: [1.2, 2.5, 4.0, 5.5, 6.2, 4.8, 3.5, 2.2, 1.8, 1.0, 0.5, 0.4, 0.3, 0.1, 0.1, 0.1],
      }));
      showToast('Simulated Heavy Rain (>20mm). Priority scores adjusted (+6).', 'warning');
    } else if (scenario === 'moderate') {
      setWeather((prev) => ({
        ...prev,
        precipitation24h: 12.8,
        status: 'moderate',
        locationName: `${selectedLocation.name} (Simulated Moderate Rain)`,
        isFallback: false,
        hourly: [0.2, 0.5, 1.1, 1.8, 2.4, 1.9, 1.5, 1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.0, 0.0],
      }));
      showToast('Simulated Moderate Rain (5-20mm). Priority scores adjusted (+3).');
    } else if (scenario === 'low') {
      setWeather((prev) => ({
        ...prev,
        precipitation24h: 2.1,
        status: 'low',
        locationName: `${selectedLocation.name} (Simulated Low Rain)`,
        isFallback: false,
        hourly: [0.0, 0.0, 0.1, 0.2, 0.4, 0.5, 0.3, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0],
      }));
      showToast('Simulated Low Rain (<5mm). Baseline priority scores applied (+0).');
    }
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser. Retaining Batu Pahat demo location.', 'warning');
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          name: 'My Current Location',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        };
        setSelectedLocation(userLoc);
        setIsUsingCustomLocation(true);
        loadWeather(userLoc.latitude, userLoc.longitude, userLoc.name);
        showToast('Updated weather for your current GPS coordinates.');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        showToast('Location permission denied or unavailable. Retaining Batu Pahat demo context.', 'warning');
        setLoadingWeather(false);
      },
      { timeout: 8000 }
    );
  };

  // Reset to Batu Pahat location
  const handleResetLocation = () => {
    setSelectedLocation(DEFAULT_LOCATION);
    setIsUsingCustomLocation(false);
    loadWeather(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, DEFAULT_LOCATION.name);
    showToast('Reset location to Batu Pahat, Johor.');
  };

  // Save changes to report
  const handleUpdateReport = (reportId, updatedFields) => {
    const nextReports = reports.map((r) => {
      if (r.id === reportId) {
        return { ...r, ...updatedFields };
      }
      return r;
    });

    setReports(nextReports);
    saveStoredReports(nextReports);

    // If modal is open for this report, update modal view
    setSelectedReport((prev) => (prev?.id === reportId ? { ...prev, ...updatedFields } : prev));
    showToast('Report updated and priority re-evaluated!');
  };

  // Submit new report
  const handleSubmitNewReport = (newReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    saveStoredReports(updated);
    setSelectedReport(newReport);
    setPickedLocation(null);
    setIsPickingLocation(false);
    showToast('New community report submitted! Marker added to map and ranked in queue.');
  };

  // Map picking flow
  const handleStartMapPick = () => {
    setIsReportModalOpen(false);
    setIsPickingLocation(true);
    showToast('Click anywhere on the map to set report coordinates.', 'info');
  };

  const handleLocationPicked = (coords) => {
    setPickedLocation(coords);
    setIsPickingLocation(false);
    setIsReportModalOpen(true);
    showToast(`Pinned location at ${coords.latitude}, ${coords.longitude}`);
  };

  // Demo: Reset starter data
  const handleResetDemoData = () => {
    const resetList = resetDemoData();
    setReports(resetList);
    setSelectedReport(null);
    setReadInboxIds([]);
    try {
      localStorage.removeItem('drainwatch_read_inbox_ids');
    } catch (e) {}
    showToast('Demo data restored to starter Batu Pahat reports.');
  };

  // Demo: Inject critical priority report
  const handleAddDemoPriority = () => {
    const { updated, newItem } = injectDemoPriorityReport();
    setReports(updated);
    setSelectedReport(newItem);
    showToast('Injected severe blocked drain near homes! Ranked #1 Critical (P ≥ 14).', 'warning');
  };

  // Calculated summary counts
  const summaryStats = useMemo(() => {
    let active = 0;
    let criticalHigh = 0;
    let resolved = 0;

    reports.forEach((report) => {
      if (report.status === 'resolved') {
        resolved += 1;
      } else {
        active += 1;
        const evalData = calculatePriorityScore(report, weather.status);
        if (evalData.level === 'critical' || evalData.level === 'high') {
          criticalHigh += 1;
        }
      }
    });

    return {
      activeCount: active,
      criticalHighCount: criticalHigh,
      resolvedCount: resolved,
    };
  }, [reports, weather.status]);

  // Compute 1 km Nearby Rain Readiness Alerts (Requirement 5)
  // Only current (<=7d), photo-supported active/confirmed reports can trigger a 1 km notice!
  const nearbyAlerts = useMemo(() => {
    const userLat = selectedLocation?.latitude ?? DEFAULT_LOCATION.latitude;
    const userLon = selectedLocation?.longitude ?? DEFAULT_LOCATION.longitude;

    return reports
      .map((report) => {
        const evalData = calculatePriorityScore(report, weather.status);
        const distanceKm = calculateDistanceKm(userLat, userLon, report.latitude, report.longitude);
        return {
          ...report,
          evalData,
          distanceKm,
        };
      })
      .filter((item) => item.distanceKm != null && item.distanceKm <= 1.0 && item.evalData.eligibleForNearbyNotice)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [reports, selectedLocation, weather.status]);

  // Compute In-App Explainable Readiness Inbox Messages (Requirement 3, 4, 8)
  const inboxMessages = useMemo(() => {
    return generateInboxMessages(reports, weather, selectedLocation, readInboxIds);
  }, [reports, weather, selectedLocation, readInboxIds]);

  const unreadInboxCount = useMemo(() => {
    return inboxMessages.filter((m) => !m.isRead).length;
  }, [inboxMessages]);

  const handleMarkInboxRead = useCallback((msgId) => {
    setReadInboxIds((prev) => {
      if (prev.includes(msgId)) return prev;
      const next = [...prev, msgId];
      try {
        localStorage.setItem('drainwatch_read_inbox_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const handleMarkAllInboxRead = useCallback(() => {
    const allIds = inboxMessages.map((m) => m.id);
    setReadInboxIds(allIds);
    try {
      localStorage.setItem('drainwatch_read_inbox_ids', JSON.stringify(allIds));
    } catch (e) {}
    showToast('All inbox messages marked as read.');
  }, [inboxMessages, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-ocean/20 selection:text-ocean">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold animate-slideUp transition-all ${
            toast.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-700'
              : toast.type === 'info'
              ? 'bg-ocean text-white border-ocean-light'
              : 'bg-navy-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
          ) : toast.type === 'info' ? (
            <Sparkles className="w-4 h-4 shrink-0 text-sky-200" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation with Evaluator Toolbar */}
      <Navbar
        onOpenReport={handleOpenReportIssue}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenInbox={() => setIsInboxOpen(true)}
        unreadCount={unreadInboxCount}
        onResetDemo={handleResetDemoData}
        onAddDemoPriority={handleAddDemoPriority}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        {/* Sleek Subheader with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
              DrainWatch: Stormwater &amp; Litter Watch
            </h1>
            <p className="text-xs text-slate-500">
              Community stormwater and litter readiness for healthier urban waterways.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleOpenMapAsset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition shadow-2xs active:scale-95"
              title="Map a new community drainage asset point with photo evidence"
            >
              <Layers className="w-3.5 h-3.5 text-ocean" />
              <span>+ Map Asset</span>
            </button>
            <button
              onClick={handleOpenReportIssue}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-ocean hover:bg-ocean-light rounded-xl transition shadow-xs active:scale-95"
              title="Report visible drainage problem"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Report Issue</span>
            </button>
          </div>
        </div>

        {/* 1 km Nearby Rain Readiness Notice (Compact, High-Impact) */}
        {nearbyAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-navy-900 to-indigo-950 text-white px-4 py-3 rounded-2xl shadow-xs border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/30 text-indigo-300 rounded-xl shrink-0">
                <Radio className="w-4 h-4 animate-pulse text-indigo-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    Community Stormwater Readiness Notice — not an official flood or water-quality warning.
                  </span>
                  <span className="text-xs text-indigo-200 font-medium">
                    {nearbyAlerts.length} nearby issue{nearbyAlerts.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="font-semibold text-white">
                  Nearest: {nearbyAlerts[0].title} ({nearbyAlerts[0].distanceKm} km away) — Supported by a current community photo — verification may still be needed.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedReport(nearbyAlerts[0])}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-xs transition shrink-0 self-start sm:self-center"
            >
              Inspect Nearest ({nearbyAlerts[0].distanceKm} km)
            </button>
          </div>
        )}

        {/* Unified Readiness Strip (Replaces massive WeatherCard + SummaryCards) */}
        <WeatherCard
          weather={weather}
          loadingWeather={loadingWeather}
          onUseMyLocation={handleUseMyLocation}
          onResetLocation={handleResetLocation}
          isUsingCustomLocation={isUsingCustomLocation}
          activeScenario={activeScenario}
          onSelectScenario={handleSelectScenario}
          activeCount={summaryStats.activeCount}
          criticalHighCount={summaryStats.criticalHighCount}
          resolvedCount={summaryStats.resolvedCount}
        />

        {/* Mobile View Toggle (Visible only on < lg screens) */}
        <div className="flex lg:hidden items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'map' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-ocean" />
            <span>Community Map</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileTab === 'list' ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-ocean" />
            <span>Priority Queue ({reports.length})</span>
          </button>
        </div>

        {/* Core Layout: Leaflet Map & Priority Locations Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Map Column (7 cols on desktop, responsive tab on mobile) */}
          <div className={`lg:col-span-7 space-y-2 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Community Drain Map
                </h3>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  (Batu Pahat, Johor)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic hidden sm:block">
                Illustrative demo locations
              </p>
            </div>

            <MapView
              reports={reports}
              weatherStatus={weather.status}
              selectedReportId={selectedReport?.id}
              onSelectReport={(r) => setSelectedReport(r)}
              isPickingLocation={isPickingLocation}
              pickedLocation={pickedLocation}
              onLocationPicked={handleLocationPicked}
              centerLocation={selectedLocation}
              onOpenMapAsset={handleOpenMapAsset}
            />
          </div>

          {/* Ranked Priority Queue Column (5 cols on desktop, responsive tab on mobile) */}
          <div className={`lg:col-span-5 ${mobileTab === 'list' ? 'block' : 'hidden lg:block'}`}>
            <PriorityList
              reports={reports}
              weatherStatus={weather.status}
              onSelectReport={(r) => setSelectedReport(r)}
              selectedReportId={selectedReport?.id}
            />
          </div>
        </div>
      </main>

      {/* Persistent Footer with Disclaimers and Attributions */}
      <Footer />

      {/* Issue Detail Modal */}
      {selectedReport && (
        <IssueDetailModal
          report={selectedReport}
          weather={weather}
          onClose={() => setSelectedReport(null)}
          onUpdateReport={handleUpdateReport}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        initialMode={reportModalMode}
        onClose={() => {
          setIsReportModalOpen(false);
          setIsPickingLocation(false);
        }}
        onSubmitReport={handleSubmitNewReport}
        onStartMapPick={handleStartMapPick}
        pickedLocation={pickedLocation}
        onUseCurrentLocation={(cb) => {
          if (!navigator.geolocation) {
            showToast('Geolocation unavailable.', 'warning');
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => cb({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => showToast('Could not retrieve coordinates.', 'warning')
          );
        }}
        locating={loadingWeather}
      />

      {/* About & Limits Modal */}
      <AboutSection
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* In-App Readiness Inbox Modal */}
      <ReadinessInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        messages={inboxMessages}
        onSelectReport={(rep) => {
          setSelectedReport(rep);
        }}
        onMarkAllAsRead={handleMarkAllInboxRead}
        onMarkAsRead={handleMarkInboxRead}
        weather={weather}
        selectedLocation={selectedLocation}
      />
    </div>
  );
}
