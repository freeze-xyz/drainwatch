import React, { useState } from 'react';
import {
  CloudRain,
  MapPin,
  Navigation,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RotateCcw,
} from 'lucide-react';

export function WeatherCard({
  weather,
  loadingWeather,
  onUseMyLocation,
  onResetLocation,
  isUsingCustomLocation,
  activeScenario,
  onSelectScenario,
  activeCount = 0,
  criticalHighCount = 0,
  resolvedCount = 0,
}) {
  const [showHourly, setShowHourly] = useState(false);
  const isHeavy = weather.status === 'heavy';

  const readinessMeta = {
    heavy: {
      label: 'Heavy Rain Readiness',
      badgeClass: 'bg-rose-500 text-white border-rose-600',
      description: 'Precipitation > 20 mm in next 24h (+6 priority)',
      cardBg: 'bg-gradient-to-r from-rose-50 via-white to-amber-50 border-rose-300',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
    },
    moderate: {
      label: 'Moderate Rain Readiness',
      badgeClass: 'bg-amber-500 text-white border-amber-600',
      description: 'Precipitation 5–20 mm in next 24h (+3 priority)',
      cardBg: 'bg-white border-slate-200',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    low: {
      label: 'Low Rain Readiness',
      badgeClass: 'bg-sky-600 text-white border-sky-700',
      description: 'Precipitation < 5 mm in next 24h (+0 priority)',
      cardBg: 'bg-white border-slate-200',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
    },
  }[weather.status] || {
    label: 'Standard Readiness',
    badgeClass: 'bg-slate-600 text-white',
    description: 'Forecast data contextualized',
    cardBg: 'bg-white border-slate-200',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
  };

  const hourlyValues = weather.hourly?.slice(0, 16) || [];
  const maxHourly = Math.max(...hourlyValues, 2);

  return (
    <div className="space-y-2">
      {/* Heavy Rain Non-Alarmist Advisory */}
      {isHeavy && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-3.5 py-2.5 rounded-xl shadow-xs border border-rose-400/40 flex items-center justify-between gap-3 animate-fadeIn text-xs">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-amber-200" />
            <span className="font-semibold">
              Heavy rain forecast in Batu Pahat. Review high-priority drain spots and follow official advice.
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] text-amber-200 uppercase tracking-wider font-bold shrink-0">
            Readiness Advisory
          </span>
        </div>
      )}

      {/* Unified Compact Readiness Strip */}
      <div className={`rounded-2xl p-3 sm:p-4 border shadow-xs transition ${readinessMeta.cardBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Weather condition & 24h total */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${readinessMeta.iconBg} ${readinessMeta.iconColor} shrink-0`}>
              <CloudRain className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-ocean" />
                  {weather.locationName}
                </span>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${readinessMeta.badgeClass}`}>
                  {weather.precipitation24h} mm • {readinessMeta.label}
                </span>

                {weather.isFallback || activeScenario !== 'live' ? (
                  <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Demo Weather {activeScenario !== 'live' ? `(${activeScenario})` : ''}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Live Forecast</span>
                  </span>
                )}

                {isUsingCustomLocation && (
                  <button
                    onClick={onResetLocation}
                    className="text-[11px] text-ocean hover:underline font-semibold flex items-center gap-0.5"
                    title="Reset location to Batu Pahat, Johor"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {readinessMeta.description} • Precipitation forecast from Open-Meteo
              </p>
            </div>
          </div>

          {/* Right: Quick Readiness Counts & Tools */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            {/* Quick Stat Chips */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[11px]">
              <span className="px-2 py-0.5 rounded-lg font-medium text-slate-700">
                <strong className="text-slate-900">{activeCount}</strong> Active
              </span>
              <span className="px-2 py-0.5 rounded-lg font-medium text-rose-700 bg-rose-50 border border-rose-200">
                <strong className="text-rose-900">{criticalHighCount}</strong> Critical
              </span>
              <span className="px-2 py-0.5 rounded-lg font-medium text-emerald-700">
                <strong className="text-emerald-900">{resolvedCount}</strong> Resolved
              </span>
            </div>

            {/* Geolocation Button */}
            <button
              onClick={onUseMyLocation}
              disabled={loadingWeather}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs"
              title="Use current GPS location"
            >
              <Navigation className={`w-3.5 h-3.5 text-ocean ${loadingWeather ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loadingWeather ? 'Locating...' : 'My GPS'}</span>
            </button>

            {/* Collapsible 16h Trend Button */}
            {hourlyValues.length > 0 && (
              <button
                onClick={() => setShowHourly(!showHourly)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-2xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                <span>{showHourly ? 'Hide Trend' : '16h Trend'}</span>
                {showHourly ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible 16-Hour Hourly Trend Visualizer */}
        {showHourly && hourlyValues.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span>Hourly rain progression (next 16 hours):</span>
              <span className="text-[10px] text-sky-700 font-semibold">Open-Meteo.com</span>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 h-11 items-end bg-slate-50 p-2 rounded-xl border border-slate-200/60">
              {hourlyValues.map((mm, idx) => {
                const heightPct = Math.min(100, Math.max(14, Math.round((mm / maxHourly) * 100)));
                const barColor =
                  mm > 2.5
                    ? 'bg-rose-500'
                    : mm > 1.0
                    ? 'bg-amber-500'
                    : mm > 0.1
                    ? 'bg-sky-400'
                    : 'bg-slate-300';
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-xs transition-all ${barColor}`}
                    />
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none z-20 whitespace-nowrap shadow-md">
                      <span>+{idx + 1}h: {mm}mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
