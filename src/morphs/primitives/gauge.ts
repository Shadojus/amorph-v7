/**
 * AMORPH v7 - Gauge Morph
 * 
 * Zeigt einen Wert mit farbigen Zonen (Ampel-System).
 * Struktur: {value: 0, min: 0, max: 100, zones: [{from: 0, to: 30, color: "danger"}, ...]}
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

interface GaugeZone {
  from?: number;
  to?: number;
  color?: string;
  variant?: string;
}

interface GaugeData {
  value?: number;
  wert?: number;
  min?: number;
  max?: number;
  unit?: string;
  zones?: GaugeZone[];
}

const ZONE_COLORS: Record<string, string> = {
  danger: 'var(--morph-danger)',
  warning: 'var(--morph-warning)',
  success: 'var(--morph-success)',
  muted: 'var(--morph-muted)',
  default: 'var(--morph-accent)'
};

interface ParsedGaugeData {
  value: number;
  min: number;
  max: number;
  unit: string;
  zones: GaugeZone[];
}

function extractGaugeData(value: unknown): ParsedGaugeData {
  if (typeof value === 'object' && value !== null) {
    const obj = value as GaugeData;
    return {
      value: Number(obj.value ?? obj.wert ?? 0),
      min: Number(obj.min ?? 0),
      max: Number(obj.max ?? 100),
      unit: String(obj.unit || ''),
      zones: Array.isArray(obj.zones) ? obj.zones : []
    };
  }
  return { value: Number(value) || 0, min: 0, max: 100, unit: '', zones: [] };
}

function getZoneClass(value: number, zones: GaugeZone[]): string {
  for (const zone of zones) {
    const from = zone.from ?? 0;
    const to = zone.to ?? 100;
    if (value >= from && value <= to) {
      return zone.color || zone.variant || 'default';
    }
  }
  return 'default';
}

export const gauge = createUnifiedMorph(
  'gauge',
  (value) => {
    const data = extractGaugeData(value);
    const { value: val, min, max, unit, zones } = data;
    const range = max - min || 1;
    const pct = Math.min(100, Math.max(0, ((val - min) / range) * 100));
    const zoneClass = getZoneClass(val, zones);
    
    // Generate zone segments
    const zoneSegments = zones.length > 0 ? zones.map(zone => {
      const zoneFrom = ((zone.from ?? 0) - min) / range * 100;
      const zoneTo = ((zone.to ?? 100) - min) / range * 100;
      const zoneVariant = zone.color || zone.variant || 'muted';
      return `<div class="morph-gauge-zone morph-gauge-zone--${zoneVariant}" style="left: ${zoneFrom}%; width: ${zoneTo - zoneFrom}%;"></div>`;
    }).join('') : '';
    
    return `
      <div class="morph-gauge morph-gauge--${zoneClass}" role="meter" aria-valuenow="${val}" aria-valuemin="${min}" aria-valuemax="${max}" aria-label="Gauge: ${formatNumber(val)}${unit}">
        <div class="morph-gauge-track" aria-hidden="true">
          ${zoneSegments}
          <div class="morph-gauge-fill" style="width: ${pct}%"></div>
          <div class="morph-gauge-marker" style="left: ${pct}%"></div>
        </div>
        <div class="morph-gauge-labels" aria-hidden="true">
          <span class="morph-gauge-min">${formatNumber(min)}${unit}</span>
          <span class="morph-gauge-value">${formatNumber(val)}${unit}</span>
          <span class="morph-gauge-max">${formatNumber(max)}${unit}</span>
        </div>
      </div>
    `;
  },
  // Compare: Side-by-side gauges
  (values) => {
    return `
      <div class="morph-gauge-compare">
        ${values.map(({ value, color: itemColor, item }) => {
          const data = extractGaugeData(value);
          const { value: val, min, max, unit, zones } = data;
          const range = max - min || 1;
          const pct = Math.min(100, Math.max(0, ((val - min) / range) * 100));
          const zoneClass = getZoneClass(val, zones);
          
          return `
            <div class="gauge-row gauge-row--${zoneClass}" data-species="${escapeHtml(item.name)}" style="--item-color: ${escapeHtml(itemColor)}">
              <div class="gauge-track">
                <div class="gauge-fill" style="width: ${pct}%"></div>
              </div>
              <span class="gauge-val">${formatNumber(val)}${unit}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
