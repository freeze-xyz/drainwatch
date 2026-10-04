import React from 'react';
import { AlertCircle, Flame, CheckCircle, Droplets } from 'lucide-react';

export function SummaryCards({ activeCount, criticalHighCount, resolvedCount, precipitationTotal, weatherStatus }) {
  const cards = [
    {
      title: 'Active Reports',
      value: activeCount,
      subtitle: 'Awaiting safe inspection',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Critical / High Priority',
      value: criticalHighCount,
      subtitle: 'Elevated rain vulnerability',
      icon: Flame,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
    },
    {
      title: 'Resolved Reports',
      value: resolvedCount,
      subtitle: 'Cleared or verified safe',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: '24h Forecast Total',
      value: `${precipitationTotal} mm`,
      subtitle: `Readiness: ${weatherStatus?.toUpperCase() || 'MODERATE'}`,
      icon: Droplets,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs flex items-center justify-between transition hover:shadow-sm`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">{card.value}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.iconColor} shrink-0`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
