/**
 * Open-Meteo Forecast API Integration
 * OneAquaHealth IEEE Hackathon 2026 - Track 6: Resilience Informatics
 *
 * Fetches hourly precipitation for next 24 hours.
 * Classifies readiness status:
 * - Low: < 5 mm / 24h
 * - Moderate: 5–20 mm / 24h
 * - Heavy: > 20 mm / 24h
 *
 * Includes graceful offline/fallback demo data.
 */

export const DEFAULT_LOCATION = {
  name: 'Batu Pahat, Johor, Malaysia',
  latitude: 1.8548,
  longitude: 102.9325,
};

export const FALLBACK_WEATHER = {
  locationName: 'Batu Pahat, Johor (Demo Weather Context)',
  latitude: 1.8548,
  longitude: 102.9325,
  precipitation24h: 24.6, // Demo heavy rain scenario by default for rich testing
  status: 'heavy',
  isFallback: true,
  lastUpdated: new Date().toISOString(),
  hourly: [
    0.0, 0.0, 0.2, 0.5, 1.2, 2.4, 4.1, 5.2, 3.8, 2.5, 1.8, 1.0,
    0.6, 0.4, 0.2, 0.1, 0.0, 0.0, 0.0, 0.1, 0.2, 0.1, 0.1, 0.1
  ],
};

/**
 * Calculates rain status from 24h total mm
 */
export function getRainStatus(totalMm) {
  if (totalMm < 5) return 'low';
  if (totalMm <= 20) return 'moderate';
  return 'heavy';
}

/**
 * Fetches real weather forecast from Open-Meteo
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} customName
 */
export async function fetchWeatherForecast(latitude, longitude, customName = '') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation&forecast_days=2&timezone=auto`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();
    const hourly = data?.hourly?.precipitation || [];
    const timeArray = data?.hourly?.time || [];

    // Find index corresponding to current hour or start from current index
    const nowIsoHour = new Date().toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    let startIndex = timeArray.findIndex((t) => t.startsWith(nowIsoHour));
    if (startIndex === -1) startIndex = 0;

    // Sum next 24 hours of precipitation
    const next24Hours = hourly.slice(startIndex, startIndex + 24);
    const sum24h = next24Hours.reduce((acc, val) => acc + (Number(val) || 0), 0);
    const roundedTotal = Math.round(sum24h * 10) / 10;

    const status = getRainStatus(roundedTotal);

    return {
      locationName: customName || (Math.abs(latitude - DEFAULT_LOCATION.latitude) < 0.1 ? DEFAULT_LOCATION.name : `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`),
      latitude,
      longitude,
      precipitation24h: roundedTotal,
      status,
      isFallback: false,
      lastUpdated: new Date().toISOString(),
      hourly: next24Hours.length >= 24 ? next24Hours : (hourly.slice(0, 24)),
      timeSlots: timeArray.slice(startIndex, startIndex + 24),
    };
  } catch (error) {
    console.warn('[DrainWatch] Weather API unavailable or rate-limited. Using resilient demo context.', error);
    return {
      ...FALLBACK_WEATHER,
      locationName: customName || FALLBACK_WEATHER.locationName,
      latitude,
      longitude,
      isFallback: true,
      fallbackReason: error.message || 'Network unavailable',
    };
  }
}
