/**
 * AMORPH v7 - Morph Test Setup
 * 
 * Shared contexts and utilities for all morph tests.
 */

export const singleContext = { mode: 'single' as const, itemCount: 1 };

export const compareContext = { 
  mode: 'compare' as const, 
  itemCount: 2,
  items: [
    { id: '1', slug: 'steinpilz', name: 'Steinpilz' },
    { id: '2', slug: 'fliegenpilz', name: 'Fliegenpilz' }
  ],
  colors: ['#0df', '#f0d']
};

export const gridContext = { 
  mode: 'grid' as const, 
  itemCount: 1,
  compact: true
};

/**
 * Creates a compare context with items containing specific field values
 */
export function createCompareContextWithValues(
  fieldName: string,
  values: unknown[]
) {
  const items = [
    { id: '1', slug: 'steinpilz', name: 'Steinpilz', [fieldName]: values[0] },
    { id: '2', slug: 'fliegenpilz', name: 'Fliegenpilz', [fieldName]: values[1] }
  ];
  
  return {
    mode: 'compare' as const,
    itemCount: 2,
    items,
    fieldName,
    colors: ['#0df', '#f0d']
  };
}
