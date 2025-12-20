/**
 * AMORPH v7 - Client Debug
 * 
 * Leichtgewichtiges Debug-Logging mit Kategorien.
 * Standardmäßig AKTIVIERT für Entwicklung.
 */

// DEBUG ist standardmäßig AN - deaktivieren mit localStorage.setItem('amorph:debug', 'false')
const DEBUG_ENABLED = typeof window !== 'undefined' && 
  localStorage.getItem('amorph:debug') !== 'false';

const CATEGORIES = {
  amorph: { emoji: '🍄', color: '#0df' },
  selection: { emoji: '✓', color: '#0f0' },
  compare: { emoji: '🔬', color: '#f0d' },
  api: { emoji: '🌐', color: '#fd0' },
  router: { emoji: '🔗', color: '#0fd' },
  touch: { emoji: '📱', color: '#d0f' },
  layout: { emoji: '📐', color: '#fa0' },
  morph: { emoji: '🔮', color: '#af0' }
} as const;

type Category = keyof typeof CATEGORIES;

function log(category: Category, message: string, data?: unknown): void {
  if (!DEBUG_ENABLED) return;
  
  const { emoji, color } = CATEGORIES[category];
  const prefix = `%c${emoji} [${category}]`;
  const style = `color: ${color}; font-weight: bold`;
  
  if (data !== undefined) {
    console.log(prefix, style, message, data);
  } else {
    console.log(prefix, style, message);
  }
}

export const debug = {
  amorph: (msg: string, data?: unknown) => log('amorph', msg, data),
  selection: (msg: string, data?: unknown) => log('selection', msg, data),
  compare: (msg: string, data?: unknown) => log('compare', msg, data),
  api: (msg: string, data?: unknown) => log('api', msg, data),
  router: (msg: string, data?: unknown) => log('router', msg, data),
  touch: (msg: string, data?: unknown) => log('touch', msg, data),
  layout: (msg: string, data?: unknown) => log('layout', msg, data),
  morph: (msg: string, data?: unknown) => log('morph', msg, data),
  
  enable: () => localStorage.setItem('amorph:debug', 'true'),
  disable: () => localStorage.removeItem('amorph:debug'),
  isEnabled: () => DEBUG_ENABLED
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).amorphDebug = debug;
}
