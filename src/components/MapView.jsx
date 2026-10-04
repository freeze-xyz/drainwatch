import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Crosshair, MapPin, AlertCircle } from 'lucide-react';
import { calculatePriorityScore, SEVERITY_LABELS } from '../utils/priorityEngine';
import { formatCoordinates } from '../utils/formatters';

// Helper to generate SVG colored marker icons for Leaflet
function createLeafletIcon(color, level, isSelected = false) {
  const isCritical = level === 'critical';
  const size = isSelected ? 38 : isCritical ? 34 : 28;
  const pulseClass = isCritical ? 'pulse-critical' : '';

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isCritical
          ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: critical-pulse 2s infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size - 6}px;
        height: ${size - 6}px;
        border-radius: 9999px;
        background-color: ${color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: system-ui, sans-serif;
        font-size: 11px;
        font-weight: 800;
      ">
        ${level === 'resolved' ? '✓' : isCritical ? '!' : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Custom picker icon for reporting
const pickerIcon = L.divIcon({
  html: `
    <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(2,132,199,0.8); animation: bounce 1s infinite;"></div>
    </div>
  `,
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export function MapView({
  reports,
  weatherStatus,
  selectedReportId,
  onSelectReport,
  isPickingLocation = false,
  pickedLocation = null,
  onLocationPicked,
  centerLocation,
  onOpenMapAsset,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const pickerMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const initialLat = centerLocation?.latitude || 1.8548;
    const initialLon = centerLocation?.longitude || 102.9325;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click when in picking location mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isPickingLocation && onLocationPicked) {
        onLocationPicked({
          latitude: Number(e.latlng.lat.toFixed(5)),
          longitude: Number(e.latlng.lng.toFixed(5)),
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onLocationPicked]);

  // Update picker marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickedLocation) {
      if (!pickerMarkerRef.current) {
        pickerMarkerRef.current = L.marker([pickedLocation.latitude, pickedLocation.longitude], {
          icon: pickerIcon,
        }).addTo(map);
      } else {
        pickerMarkerRef.current.setLatLng([pickedLocation.latitude, pickedLocation.longitude]);
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickedLocation]);

  // Render report markers on map
  useEffect(() => {
    if (!mapReady || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    reports.forEach((report) => {
      const evaluation = calculatePriorityScore(report, weatherStatus);
      const isSelected = report.id === selectedReportId;
      const icon = createLeafletIcon(evaluation.dotColor, evaluation.level, isSelected);

      const marker = L.marker([report.latitude, report.longitude], { icon });

      // Build custom styled popup with evidence state
      const evMeta = evaluation.evidenceMeta;
      const photoFreshness = evaluation.photoFreshness;

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; width: 235px; padding: 12px 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${evaluation.dotColor}22; color: ${evaluation.dotColor};">
              ${evaluation.level} (P=${evaluation.score})
            </span>
            <span style="font-size: 10px; font-weight: 600; color: #475569;">
              ${report.status}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">${report.title}</h4>
          
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap;">
            <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; background: ${evMeta.dotColor}18; color: ${evMeta.dotColor}; border: 1px solid ${evMeta.dotColor}44;">
              ${evMeta.badgeLabel}
            </span>
            ${
              photoFreshness.hasPhoto && !photoFreshness.isFresh
                ? `<span style="font-size: 9px; font-weight: 600; padding: 2px 5px; border-radius: 4px; background: #fef3c7; color: #92400e;">Photo &gt;7d</span>`
                : ''
            }
          </div>

          <p style="font-size: 11px; color: #475569; margin: 0 0 10px 0;">
            ${SEVERITY_LABELS[report.issueType] || report.issueType}
          </p>
          <div style="display: flex; gap: 6px;">
            <button id="btn-inspect-${report.id}" style="
              width: 100%;
              background: #034078;
              color: white;
              border: none;
              padding: 7px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              Review Photo &amp; Priority Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${report.id}`);
        if (btn) {
          btn.onclick = (e) => {
            if (e) e.stopPropagation();
            onSelectReport(report);
          };
        }
      });

      marker.on('click', () => {
        if (isPickingLocation) {
          if (onLocationPicked) {
            onLocationPicked({
              latitude: Number(report.latitude.toFixed(5)),
              longitude: Number(report.longitude.toFixed(5)),
            });
          }
          return;
        }
        onSelectReport(report);
      });

      markersGroupRef.current.addLayer(marker);
    });
  }, [reports, weatherStatus, selectedReportId, mapReady, onSelectReport]);

  // Pan to selected report if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReportId) return;
    const report = reports.find((r) => r.id === selectedReportId);
    if (report) {
      mapInstanceRef.current.setView([report.latitude, report.longitude], 15, { animate: true });
    }
  }, [selectedReportId, reports]);

  // Recenter helper
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const lat = centerLocation?.latitude || 1.8548;
    const lon = centerLocation?.longitude || 102.9325;
    mapInstanceRef.current.setView([lat, lon], 14, { animate: true });
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Picking Location Banner */}
      {isPickingLocation && (
        <div className="absolute top-3 left-3 right-3 z-10 bg-ocean text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 animate-spin" />
            <span className="font-semibold">Tap anywhere on the map to place the issue pin</span>
          </div>
          {pickedLocation && (
            <span className="bg-navy-900/60 px-2 py-0.5 rounded text-[11px] font-mono">
              {pickedLocation.latitude.toFixed(4)}, {pickedLocation.longitude.toFixed(4)}
            </span>
          )}
        </div>
      )}

      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {onOpenMapAsset && (
          <button
            onClick={onOpenMapAsset}
            className="flex items-center gap-1.5 px-3 py-2 bg-navy-900/90 hover:bg-navy-800 text-white rounded-xl shadow-md border border-slate-700/80 backdrop-blur-xs transition text-xs font-bold active:scale-95"
            title="Map a new community drainage asset point with photo evidence"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Map Asset</span>
          </button>
        )}
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 hover:bg-slate-50 text-slate-700 rounded-xl shadow-md border border-slate-200 transition backdrop-blur-xs"
          title="Recenter Map to Batu Pahat"
        >
          <Crosshair className="w-4 h-4 text-ocean" />
        </button>
      </div>

      {/* Sleek, Unobtrusive Map Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200/90 text-[10px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700">
          <span className="font-bold uppercase tracking-wider text-slate-900 text-[9px]">Priority:</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            <span>Critical (&ge;14)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
            <span>High (10–13)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>Med (6–9)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
            <span>Low (&le;5)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
