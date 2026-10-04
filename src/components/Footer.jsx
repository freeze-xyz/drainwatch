import React from 'react';
import { AlertCircle, Waves, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-navy-900 text-slate-400 border-t border-navy-800 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Persistent Disclaimer Bar */}
        <div className="p-3.5 rounded-2xl bg-navy-800/80 border border-slate-700/60 flex items-center gap-3 text-slate-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-medium">
            <strong className="text-white">Persistent Disclaimer:</strong> Prototype using simulated starter reports. Not an official flood warning or emergency service.
          </p>
        </div>

        {/* Attributions & Details */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">DrainWatch Community Prototype</span>
            <span>• OneAquaHealth IEEE Global Hackathon 2026</span>
          </div>

          <div className="text-center sm:text-right space-y-0.5">
            <p>
              Weather data by{' '}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline font-semibold"
              >
                Open-Meteo.com
              </a>
              . Map data &copy;{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:underline font-semibold"
              >
                OpenStreetMap contributors
              </a>
              .
            </p>
            <p className="text-slate-400">
              Demo location points are illustrative • For life-threatening emergencies, call 999.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
