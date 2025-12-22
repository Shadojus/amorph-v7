/**
 * AMORPH v7 - Primitives Index
 * 
 * Modulare Re-Exports aller Morph-Primitives.
 * Jeder Morph hat seine eigene Datei für maximale Modularität.
 */

// Text & Basics
export { text } from './text.js';
export { number } from './number.js';
export { boolean } from './boolean.js';

// Labels & Tags
export { badge } from './badge.js';
export { tag } from './tag.js';

// Progress & Rating
export { progress } from './progress.js';
export { rating } from './rating.js';
export { range } from './range.js';
export { stats } from './stats.js';
export { gauge } from './gauge.js';

// Media
export { image } from './image.js';
export { link } from './link.js';

// Collections
export { list } from './list.js';
export { object } from './object.js';

// Temporal
export { date } from './date.js';
export { timeline } from './timeline.js';
export { lifecycle } from './lifecycle.js';
export { steps } from './steps.js';
export { calendar } from './calendar.js';

// Charts
export { bar } from './bar.js';
export { pie } from './pie.js';
export { sparkline } from './sparkline.js';
export { radar } from './radar.js';

// Specialized
export { severity } from './severity.js';
export { dosage } from './dosage.js';
export { citation } from './citation.js';
export { currency } from './currency.js';

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVES MAP
// ═══════════════════════════════════════════════════════════════════════════════

import { text } from './text.js';
import { number } from './number.js';
import { boolean } from './boolean.js';
import { badge } from './badge.js';
import { tag } from './tag.js';
import { progress } from './progress.js';
import { rating } from './rating.js';
import { range } from './range.js';
import { stats } from './stats.js';
import { gauge } from './gauge.js';
import { image } from './image.js';
import { link } from './link.js';
import { list } from './list.js';
import { object } from './object.js';
import { date } from './date.js';
import { timeline } from './timeline.js';
import { lifecycle } from './lifecycle.js';
import { steps } from './steps.js';
import { calendar } from './calendar.js';
import { bar } from './bar.js';
import { pie } from './pie.js';
import { sparkline } from './sparkline.js';
import { radar } from './radar.js';
import { severity } from './severity.js';
import { dosage } from './dosage.js';
import { citation } from './citation.js';
import { currency } from './currency.js';

export const primitives = {
  text,
  number,
  boolean,
  badge,
  tag,
  progress,
  rating,
  range,
  stats,
  gauge,
  image,
  link,
  list,
  object,
  date,
  timeline,
  lifecycle,
  steps,
  calendar,
  bar,
  pie,
  sparkline,
  radar,
  severity,
  dosage,
  citation,
  currency
} as const;

export type PrimitiveName = keyof typeof primitives;
