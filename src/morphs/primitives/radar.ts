/**
 * AMORPH v7 - Radar Chart Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

export const radar = createUnifiedMorph(
  'radar',
  (value) => {
    if (typeof value !== 'object' || value === null) return '';
    
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj).filter(([_, v]) => typeof v === 'number');
    if (entries.length < 3) return `<span class="morph-text">${escapeHtml(JSON.stringify(value))}</span>`;
    
    const size = 80;
    const center = size / 2;
    const radius = (size / 2) - 10;
    const angleStep = (2 * Math.PI) / entries.length;
    
    const max = Math.max(...entries.map(([_, v]) => Number(v)), 1);
    
    const points = entries.map(([_, val], idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const r = (Number(val) / max) * radius;
      return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
    });
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    
    const labels = entries.map(([key], idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 8;
      return { x: center + Math.cos(angle) * labelR, y: center + Math.sin(angle) * labelR, text: key };
    });
    
    return `
      <svg class="morph-radar" viewBox="0 0 ${size} ${size}">
        <path d="${pathD}" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1" />
        ${labels.map(l => `
          <text x="${l.x}" y="${l.y}" text-anchor="middle" dominant-baseline="middle" font-size="6">
            ${escapeHtml(l.text)}
          </text>
        `).join('')}
      </svg>
    `;
  },
  // Compare: Overlapping radars
  (values) => {
    const allAxes = new Set<string>();
    values.forEach(({ value }) => {
      if (typeof value === 'object' && value !== null) {
        Object.keys(value as Record<string, unknown>).forEach(k => allAxes.add(k));
      }
    });
    
    const axes = [...allAxes];
    if (axes.length < 3) return '';
    
    const size = 100;
    const center = size / 2;
    const radius = (size / 2) - 15;
    const angleStep = (2 * Math.PI) / axes.length;
    
    let max = 1;
    values.forEach(({ value }) => {
      if (typeof value === 'object' && value !== null) {
        Object.values(value as Record<string, unknown>).forEach(v => {
          if (typeof v === 'number' && v > max) max = v;
        });
      }
    });
    
    const paths = values.map(({ value, color }) => {
      const obj = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
      const points = axes.map((axis, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const val = Number(obj[axis] ?? 0);
        const r = (val / max) * radius;
        return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
      });
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
      return { d, color };
    });
    
    const labels = axes.map((axis, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const labelR = radius + 10;
      return { x: center + Math.cos(angle) * labelR, y: center + Math.sin(angle) * labelR, text: axis };
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
