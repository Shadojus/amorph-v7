/**
 * AMORPH v7 - Lifecycle Morph
 * 
 * Zeigt Lebenszyklus-Phasen mit Dauer.
 * Struktur: [{phase: "", duration: "", active?: boolean}]
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface LifecyclePhase {
  phase?: string;
  name?: string;
  duration?: string;
  dauer?: string;
  active?: boolean;
  aktiv?: boolean;
}

function parsePhase(item: unknown): { phase: string; duration: string; active: boolean } {
  if (typeof item !== 'object' || item === null) {
    return { phase: String(item), duration: '', active: false };
  }
  
  const obj = item as LifecyclePhase;
  return {
    phase: String(obj.phase || obj.name || ''),
    duration: String(obj.duration || obj.dauer || ''),
    active: Boolean(obj.active || obj.aktiv)
  };
}

export const lifecycle = createUnifiedMorph(
  'lifecycle',
  (value) => {
    const phases = Array.isArray(value) ? value : [value];
    const parsed = phases.map(parsePhase);
    
    return `
      <div class="morph-lifecycle">
        ${parsed.map((item, idx) => `
          <div class="morph-lifecycle-phase ${item.active ? 'morph-lifecycle-phase--active' : ''}">
            <div class="morph-lifecycle-connector">
              <div class="morph-lifecycle-line ${idx === 0 ? 'morph-lifecycle-line--first' : ''}"></div>
              <div class="morph-lifecycle-dot"></div>
              <div class="morph-lifecycle-line ${idx === parsed.length - 1 ? 'morph-lifecycle-line--last' : ''}"></div>
            </div>
            <div class="morph-lifecycle-content">
              <span class="morph-lifecycle-name">${escapeHtml(item.phase)}</span>
              ${item.duration ? `<span class="morph-lifecycle-duration">${escapeHtml(item.duration)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  // Compare: Parallel lifecycle phases
  (values) => {
    // Collect all unique phases
    const allPhases = new Set<string>();
    values.forEach(({ value }) => {
      const phases = Array.isArray(value) ? value : [value];
      phases.forEach(p => {
        const parsed = parsePhase(p);
        if (parsed.phase) allPhases.add(parsed.phase);
      });
    });
    
    return `
      <div class="morph-lifecycle-compare">
        <div class="lifecycle-phases">
          ${[...allPhases].map(phaseName => `
            <div class="lifecycle-phase-row">
              <span class="lifecycle-phase-label">${escapeHtml(phaseName)}</span>
              <div class="lifecycle-phase-values">
                ${values.map(({ item, value, color }) => {
                  const phases = Array.isArray(value) ? value : [value];
                  const phase = phases.map(parsePhase).find(p => p.phase === phaseName);
                  const name = item.name || item.id;
                  return `
                    <div class="lifecycle-cell" data-species="${escapeHtml(name)}" style="--item-color: ${escapeHtml(color)}">
                      ${phase ? `
                        <span class="cmp-dot ${phase.active ? 'cmp-dot--active' : 'cmp-dot--muted'}"></span>
                        ${phase.duration ? `<span class="lifecycle-duration">${escapeHtml(phase.duration)}</span>` : '-'}
                      ` : '-'}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
);
