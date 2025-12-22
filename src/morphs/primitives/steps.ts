/**
 * AMORPH v7 - Steps Morph
 * 
 * Zeigt Schritte mit Status (pending/active/complete).
 * Struktur: [{step: 1, label: "", status: "pending|active|complete"}]
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface StepData {
  step?: number;
  schritt?: number;
  label?: string;
  name?: string;
  status?: string;
}

const STATUS_ICONS: Record<string, string> = {
  complete: '✓',
  completed: '✓',
  active: '●',
  current: '●',
  pending: '○',
  waiting: '○'
};

function parseStep(item: unknown, idx: number): { step: number; label: string; status: string } {
  if (typeof item !== 'object' || item === null) {
    return { step: idx + 1, label: String(item), status: 'pending' };
  }
  
  const obj = item as StepData;
  return {
    step: Number(obj.step ?? obj.schritt ?? idx + 1),
    label: String(obj.label || obj.name || ''),
    status: String(obj.status || 'pending').toLowerCase()
  };
}

function getStatusClass(status: string): string {
  if (['complete', 'completed', 'done'].includes(status)) return 'complete';
  if (['active', 'current', 'in-progress'].includes(status)) return 'active';
  return 'pending';
}

export const steps = createUnifiedMorph(
  'steps',
  (value) => {
    const items = Array.isArray(value) ? value : [value];
    const parsed = items.map(parseStep);
    
    return `
      <div class="morph-steps">
        ${parsed.map((item, idx) => {
          const statusClass = getStatusClass(item.status);
          
          return `
            <div class="morph-step morph-step--${statusClass}">
              <div class="morph-step-indicator">
                <span class="morph-step-dot"></span>
                ${idx < parsed.length - 1 ? '<div class="morph-step-connector"></div>' : ''}
              </div>
              <div class="morph-step-content">
                <span class="morph-step-number">Schritt ${item.step}</span>
                <span class="morph-step-label">${escapeHtml(item.label)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  // Compare: Step status across items
  (values) => {
    // Get max step count
    let maxSteps = 0;
    values.forEach(({ value }) => {
      const items = Array.isArray(value) ? value : [value];
      if (items.length > maxSteps) maxSteps = items.length;
    });
    
    return `
      <div class="morph-steps-compare">
        ${Array.from({ length: maxSteps }, (_, stepIdx) => `
          <div class="steps-row">
            <span class="steps-num">${stepIdx + 1}</span>
            ${values.map(({ value, color }) => {
              const items = Array.isArray(value) ? value : [value];
              const step = items[stepIdx] ? parseStep(items[stepIdx], stepIdx) : null;
              
              if (!step) {
                return `<div class="steps-cell" style="--item-color: ${escapeHtml(color)}">-</div>`;
              }
              
              const statusClass = getStatusClass(step.status);
              
              return `
                <div class="steps-cell steps-cell--${statusClass}" style="--item-color: ${escapeHtml(color)}"></div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
  }
);
