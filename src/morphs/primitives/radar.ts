/**
 * AMORPH v7 - Radar Chart Morph
 * 
 * Supports both formats:
 * 1. Object: { key1: number, key2: number, ... }
 * 2. Array: [{ axis: "Label", value: number }, ...]
 */

import { createUnifiedMorph, escapeHtml, formatNumber } from '../base.js';

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

/**
 * Format axis label - truncate and clean up
 */
function formatAxisLabel(label: string, maxLen = 10): string {
  // Remove common prefixes/suffixes
  let clean = label
    .replace(/^(total_|_total|_percent|_pct|_count|_amount)$/gi, '')
    .replace(/_/g, ' ')
    .trim();
  
  if (clean.length > maxLen) {
    return clean.slice(0, maxLen - 1) + '…';
  }
  return clean || label;
}

export const radar = createUnifiedMorph(
  'radar',
  (value) => {
    const entries = normalizeRadarData(value);
    if (entries.length < 3) return `<span class="morph-text">${escapeHtml(JSON.stringify(value).slice(0, 50))}...</span>`;
    
    const size = 100;
    const center = size / 2;
    const radius = (size / 2) - 15;
    const angleStep = (2 * Math.PI) / entries.length;
    
    const max = Math.max(...entries.map(e => e.value), 1);
    
    // Draw grid circles
    const gridCircles = [0.25, 0.5, 0.75, 1].map(pct => {
      const r = radius * pct;
      return `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="rgba(77,136,255,0.15)" stroke-width="0.5"/>`;
    }).join('');
    
    // Draw axis lines
    const axisLines = entries.map((_, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x2 = center + Math.cos(angle) * radius;
      const y2 = center + Math.sin(angle) * radius;
      return `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="rgba(77,136,255,0.1)" stroke-width="0.5"/>`;
    }).join('');
    
    const points = entries.map((entry, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const r = (entry.value / max) * radius;
      return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
    });
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
    
    const labels = entries.map((entry, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 10;
      return { 
        x: center + Math.cos(angle) * labelR, 
        y: center + Math.sin(angle) * labelR, 
        text: formatAxisLabel(entry.axis, 8)
      };
    });
    
    return `
      <svg class="morph-radar" viewBox="0 0 ${size} ${size}">
        ${gridCircles}
        ${axisLines}
        <path d="${pathD}" fill="rgba(77,136,255,0.2)" stroke="rgba(77,136,255,0.8)" stroke-width="1.5" />
        ${labels.map(l => `
          <text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="5" fill="rgba(255,255,255,0.6)">
            ${escapeHtml(l.text)}
          </text>
        `).join('')}
      </svg>
    `;
  },
  // Compare: Overlapping radars with legend
  (values) => {
    // Collect all axes from all values
    const allAxes = new Set<string>();
    const normalizedValues: { entries: RadarEntry[]; color: string; name: string }[] = [];
    
    values.forEach(({ value, color, item }) => {
      const entries = normalizeRadarData(value);
      entries.forEach(e => allAxes.add(e.axis));
      normalizedValues.push({ entries, color, name: item.name || item.id });
    });
    
    const axes = [...allAxes];
    if (axes.length < 3) return '<span class="morph-text">Not enough data for comparison</span>';
    
    const size = 140;
    const center = size / 2;
    const radius = (size / 2) - 25;
    const angleStep = (2 * Math.PI) / axes.length;
    
    // Find global max
    let max = 1;
    normalizedValues.forEach(({ entries }) => {
      entries.forEach(e => {
        if (e.value > max) max = e.value;
      });
    });
    
    // Draw grid circles
    const gridCircles = [0.25, 0.5, 0.75, 1].map(pct => {
      const r = radius * pct;
      return `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="rgba(77,136,255,0.1)" stroke-width="0.5"/>`;
    }).join('');
    
    // Draw axis lines
    const axisLines = axes.map((_, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x2 = center + Math.cos(angle) * radius;
      const y2 = center + Math.sin(angle) * radius;
      return `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="rgba(77,136,255,0.08)" stroke-width="0.5"/>`;
    }).join('');
    
    // Draw paths for each item
    const paths = normalizedValues.map(({ entries, color }) => {
      const entryMap = new Map(entries.map(e => [e.axis, e.value]));
      const points = axes.map((axis, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const val = entryMap.get(axis) ?? 0;
        const r = (val / max) * radius;
        return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
      });
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
      return { d, color };
    });
    
    // Labels
    const labels = axes.map((axis, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 12;
      return { 
        x: center + Math.cos(angle) * labelR, 
        y: center + Math.sin(angle) * labelR, 
        text: formatAxisLabel(axis, 10)
      };
    });
    
    // Calculate averages for comparison insight
    const avgByAxis = axes.map(axis => {
      const vals = normalizedValues
        .map(({ entries }) => entries.find(e => e.axis === axis)?.value ?? 0)
        .filter(v => v > 0);
      return { 
        axis, 
        avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
        diff: vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : 0
      };
    });
    
    // Find biggest differences
    const topDiffs = [...avgByAxis]
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 3)
      .filter(d => d.diff > 0);
    
    return `
      <div class="radar-compare-container">
        <svg class="morph-radar-compare" viewBox="0 0 ${size} ${size}">
          ${gridCircles}
          ${axisLines}
          ${paths.map(p => `
            <path d="${p.d}" fill="${escapeHtml(p.color)}" fill-opacity="0.15" stroke="${escapeHtml(p.color)}" stroke-width="1.5" />
          `).join('')}
          ${labels.map(l => `
            <text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="rgba(255,255,255,0.6)">
              ${escapeHtml(l.text)}
            </text>
          `).join('')}
        </svg>
        ${topDiffs.length > 0 ? `
          <div class="radar-insights">
            <span class="insight-label">Größte Unterschiede:</span>
            ${topDiffs.map(d => `
              <span class="insight-item">${escapeHtml(formatAxisLabel(d.axis, 12))} <span class="insight-diff">Δ${formatNumber(d.diff)}</span></span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
);
