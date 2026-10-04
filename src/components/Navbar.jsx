import React, { useState } from 'react';
import {
  Waves,
  Plus,
  Info,
  RefreshCw,
  Sparkles,
  Menu,
  X,
  Sliders,
  CloudRain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function Navbar({
  onOpenReport,
  onOpenAbout,
  onResetDemo,
  onAddDemoPriority,
  activeScenario = 'live',
  onSelectScenario,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDrawerOpen, setDemoDrawerOpen] = useState(false);

  const isSimulated = activeScenario !== 'live';

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean to-sky-400 flex items-center justify-center shadow-md shadow-sky-500/20 text-white shrink-0">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                  DrainWatch
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                  Batu Pahat
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden md:block">
                Community Drain Readiness • Track 6: Resilience Informatics
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Demo & Scenarios Drawer Toggle */}
            <button
              onClick={() => setDemoDrawerOpen(!demoDrawerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                demoDrawerOpen || isSimulated
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-navy-800/90 text-slate-300 hover:text-white border-slate-700/80'
              }`}
              title="Toggle Hackathon Demo Scenarios & Tools"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Tools {isSimulated ? `(${activeScenario})` : ''}</span>
              {demoDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* About & Limits */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-navy-800/80 hover:bg-navy-700/80 rounded-xl border border-slate-700/80 transition"
              title="About DrainWatch & Safety Boundaries"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>About &amp; Limits</span>
            </button>

            {/* Primary Action: Report Issue */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-ocean hover:bg-ocean-light active:scale-95 rounded-xl shadow-md shadow-ocean/20 transition transform"
            >
              <Plus className="w-4 h-4" />
              <span>+ Report Issue</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDemoDrawerOpen(!demoDrawerOpen)}
              className={`p-2 rounded-lg border text-xs ${
                isSimulated ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-navy-800 text-slate-300 border-slate-700'
              }`}
              title="Demo scenarios"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-ocean hover:bg-ocean-light rounded-lg shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-navy-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Hackathon Evaluator Drawer */}
      {demoDrawerOpen && (
        <div className="bg-navy-950/95 border-t border-navy-800 px-4 py-3 shadow-inner backdrop-blur animate-fadeIn">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Scenario Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Simulate Rain:</span>
              </span>
              <div className="flex items-center bg-navy-900 p-1 rounded-xl border border-navy-800 text-xs">
                <button
                  onClick={() => onSelectScenario('live')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeScenario === 'live'
                      ? 'bg-ocean text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Live Weather
                </button>
                <button
                  onClick={() => onSelectScenario('heavy')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeScenario === 'heavy'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Simulate >20mm rainfall (+6 score)"
                >
                  Heavy (&gt;20mm)
                </button>
                <button
                  onClick={() => onSelectScenario('moderate')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeScenario === 'moderate'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Simulate 5-20mm rainfall (+3 score)"
                >
                  Moderate (12mm)
                </button>
                <button
                  onClick={() => onSelectScenario('low')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeScenario === 'low'
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Simulate <5mm rainfall (+0 score)"
                >
                  Low (&lt;5mm)
                </button>
              </div>
            </div>

            {/* Test Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onAddDemoPriority}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition"
                title="Inject severe blocked drain report for hackathon demo"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Add Critical Report</span>
              </button>

              <button
                onClick={onResetDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition"
                title="Reset to 5 initial starter reports"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-800 bg-navy-900/98 px-4 py-3 space-y-2 backdrop-blur">
          <button
            onClick={() => {
              onOpenAbout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2.5 text-xs font-medium text-slate-200 bg-navy-800 rounded-xl"
          >
            <Info className="w-4 h-4 text-sky-400" />
            <span>About &amp; Safety Boundaries</span>
          </button>
        </div>
      )}
    </header>
  );
}
