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

function parseEvent(event: unknown): { date: string; label: string; timestamp: number } {
  if (typeof event !== 'object' || event === null) {
    return { date: '', label: String(event), timestamp: 0 };
  }
  
  const obj = event as TimelineEvent;
  const date = obj.date || obj.datum || (obj.year ? String(obj.year) : '') || (obj.jahr ? String(obj.jahr) : '') || '';
  const label = obj.label || obj.event || obj.name || obj.titel || '';
  
  // Try to parse timestamp for sorting
  let timestamp = 0;
  if (date) {
    const parsed = Date.parse(date);
    if (!isNaN(parsed)) timestamp = parsed;
    else if (/^\d{4}$/.test(date)) timestamp = parseInt(date) * 10000; // Year only
  }
  
  return { date, label, timestamp };
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
  },
  // Compare: Parallel timelines on shared axis
  (values) => {
    // Collect all events with source info
    const allEvents: { date: string; label: string; timestamp: number; source: string; color: string }[] = [];
    
    values.forEach(({ item, value, color }) => {
      const events = Array.isArray(value) ? value : [value];
      events.forEach(e => {
        const parsed = parseEvent(e);
        allEvents.push({ ...parsed, source: item.name, color });
      });
    });
    
    // Sort by timestamp
    allEvents.sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by date for visualization
    const dateGroups = new Map<string, typeof allEvents>();
    allEvents.forEach(event => {
      const key = event.date || 'Unbekannt';
      const group = dateGroups.get(key) || [];
      group.push(event);
      dateGroups.set(key, group);
    });
    
    return `
      <div class="morph-timeline-compare">
        <div class="timeline-axis">
          ${[...dateGroups.entries()].map(([date, events]) => `
            <div class="timeline-point">
              <div class="timeline-date">${escapeHtml(date)}</div>
              <div class="timeline-events">
                ${events.map(({ label, source, color }) => `
                  <div class="timeline-event-item" data-species="${escapeHtml(source)}" style="--item-color: ${escapeHtml(color)}">
                    <span class="timeline-event-label">${escapeHtml(label)}</span>
                    <span class="timeline-event-source">${escapeHtml(source)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="timeline-legend">
          ${values.map(({ item, color }) => `
            <span class="timeline-legend-item" data-species="${escapeHtml(item.name)}" style="--item-color: ${escapeHtml(color)}">${escapeHtml(item.name)}</span>
          `).join('')}
        </div>
      </div>
    `;
  }
);
