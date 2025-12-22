/**
 * AMORPH v7 - Citation Morph
 * 
 * Zeigt wissenschaftliche Zitate formatiert an.
 * Struktur: {authors: "", year: 0, title: "", journal?: "", doi?: ""}
 */

import { createUnifiedMorph, escapeHtml } from '../base.js';

interface CitationData {
  authors?: string;
  autor?: string;
  autoren?: string;
  year?: number;
  jahr?: number;
  title?: string;
  titel?: string;
  journal?: string;
  zeitschrift?: string;
  doi?: string;
  url?: string;
}

function parseCitation(value: unknown): CitationData {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  
  const obj = value as CitationData;
  return {
    authors: String(obj.authors || obj.autor || obj.autoren || ''),
    year: Number(obj.year ?? obj.jahr ?? 0),
    title: String(obj.title || obj.titel || ''),
    journal: String(obj.journal || obj.zeitschrift || ''),
    doi: String(obj.doi || obj.url || '')
  };
}

export const citation = createUnifiedMorph(
  'citation',
  (value) => {
    const data = parseCitation(value);
    
    const doiLink = data.doi 
      ? (data.doi.startsWith('http') 
          ? data.doi 
          : `https://doi.org/${data.doi}`)
      : '';
    
    // Clean, compact citation format
    return `
      <div class="morph-citation">
        <div class="citation-main">
          ${data.authors ? `<span class="citation-authors">${escapeHtml(data.authors)}</span>` : ''}
          ${data.year ? `<span class="citation-year">(${data.year})</span>` : ''}
        </div>
        ${data.title ? `<div class="citation-title">${escapeHtml(data.title)}</div>` : ''}
        <div class="citation-meta">
          ${data.journal ? `<span class="citation-journal">${escapeHtml(data.journal)}</span>` : ''}
          ${doiLink ? `<a class="citation-doi" href="${escapeHtml(doiLink)}" target="_blank" rel="noopener">${escapeHtml(data.doi || '')}</a>` : ''}
        </div>
      </div>
    `;
  },
  // Compare: Citations list
  (values) => {
    return `
      <div class="morph-citation-compare">
        ${values.map(({ value, color }) => {
          const data = parseCitation(value);
          
          return `
            <div class="citation-cell" style="--item-color: ${escapeHtml(color)}">
              <span class="citation-authors">${escapeHtml(data.authors || '-')}</span>
              ${data.year ? `<span class="citation-year">(${data.year})</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
);
