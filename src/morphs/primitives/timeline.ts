/**
 * AMORPH v7 - Timeline Morph
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface TimelineEvent {
  date?: string;
  datum?: string;
  year?: number;
  jahr?: number;
  label?: string;
  event?: string;
  name?: string;
  titel?: string;
}

function parseEvent(event: unknown): { date: string; label: string } {
  if (typeof event !== 'object' || event === null) {
    return { date: '', label: String(event) };
  }
  
  const obj = event as TimelineEvent;
  const date = obj.date || obj.datum || (obj.year ? String(obj.year) : '') || (obj.jahr ? String(obj.jahr) : '') || '';
  const label = obj.label || obj.event || obj.name || obj.titel || '';
  
  return { date, label };
}

export const timeline = createUnifiedMorph(
  'timeline',
  (value) => {
    const events = Array.isArray(value) ? value : [value];
    
    return `
      <div class="morph-timeline">
        ${events.map((event) => {
          const { date, label } = parseEvent(event);
          return `
            <div class="morph-timeline-event">
              <div class="morph-timeline-marker"></div>
              <div class="morph-timeline-content">
                ${date ? `<span class="morph-timeline-date">${escapeHtml(date)}</span>` : ''}
                <span class="morph-timeline-label">${escapeHtml(label)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
