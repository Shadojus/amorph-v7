/**
 * AMORPH v7 - Radar Chart Morph
 * 
 * Supports both formats:
 * 1. Object: { key1: number, key2: number, ... }
 * 2. Array: [{ axis: "Label", value: number }, ...]
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface RadarEntry {
  axis: string;
  value: number;
}

/**
 * Normalize radar data to entries array
 */
function normalizeRadarData(value: unknown): RadarEntry[] {
  // Array format: [{ axis, value }, ...]
  if (Array.isArray(value)) {
    return value
      .filter((item): item is { axis: string; value: number } => 
        typeof item === 'object' && 
        item !== null && 
        'axis' in item && 
        'value' in item &&
        typeof item.value === 'number'
      )
      .map(item => ({ axis: String(item.axis), value: Number(item.value) }));
  }
  
  // Object format: { key: number, ... }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return Object.entries(obj)
      .filter(([_, v]) => typeof v === 'number')
      .map(([key, v]) => ({ axis: key, value: Number(v) }));
  }
  
  return [];
}

export const radar = createUnifiedMorph(
  'radar',
  (value) => {
    const entries = normalizeRadarData(value);
    if (entries.length < 3) return `<span class="morph-text">${escapeHtml(JSON.stringify(value).slice(0, 50))}...</span>`;
    
    const size = 80;
    const center = size / 2;
    const radius = (size / 2) - 10;
    const angleStep = (2 * Math.PI) / entries.length;
    
    const max = Math.max(...entries.map(e => e.value), 1);
    
    const points = entries.map((entry, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const r = (entry.value / max) * radius;
      return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
    });
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    
    const labels = entries.map((entry, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 8;
      return { 
        x: center + Math.cos(angle) * labelR, 
        y: center + Math.sin(angle) * labelR, 
        text: entry.axis.length > 8 ? entry.axis.slice(0, 6) + '…' : entry.axis
      };
    });
    
    return `
      <svg class="morph-radar" viewBox="0 0 ${size} ${size}">
        <path d="${pathD}" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1" />
        ${labels.map(l => `
          <text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="5">
            ${escapeHtml(l.text)}
          </text>
        `).join('')}
      </svg>
    `;
  },
  // Compare: Overlapping radars
  (values) => {
    // Collect all axes from all values
    const allAxes = new Set<string>();
    const normalizedValues: { entries: RadarEntry[]; color: string }[] = [];
    
    values.forEach(({ value, color }) => {
      const entries = normalizeRadarData(value);
      entries.forEach(e => allAxes.add(e.axis));
      normalizedValues.push({ entries, color });
    });
    
    const axes = [...allAxes];
    if (axes.length < 3) return '';
    
    const size = 100;
    const center = size / 2;
    const radius = (size / 2) - 15;
    const angleStep = (2 * Math.PI) / axes.length;
    
    let max = 1;
    normalizedValues.forEach(({ entries }) => {
      entries.forEach(e => {
        if (e.value > max) max = e.value;
      });
    });
    
    const paths = normalizedValues.map(({ entries, color }) => {
      const entryMap = new Map(entries.map(e => [e.axis, e.value]));
      const points = axes.map((axis, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const val = entryMap.get(axis) ?? 0;
        const r = (val / max) * radius;
        return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
      });
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
      return { d, color };
    });
    
    const labels = axes.map((axis, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 10;
      return { 
        x: center + Math.cos(angle) * labelR, 
        y: center + Math.sin(angle) * labelR, 
        text: axis.length > 8 ? axis.slice(0, 6) + '…' : axis
      };
    });
    
    return `
      <svg class="morph-radar-compare" viewBox="0 0 ${size} ${size}">
        ${paths.map(p => `
          <path d="${p.d}" fill="${escapeHtml(p.color)}" fill-opacity="0.15" stroke="${escapeHtml(p.color)}" stroke-width="1.5" />
        `).join('')}
        ${labels.map(l => `
          <text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="6">
            ${escapeHtml(l.text)}
          </text>
        `).join('')}
      </svg>
    `;
  }
);
