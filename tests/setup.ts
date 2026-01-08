/**
 * Vitest Global Setup
 * 
 * Runs before all tests to configure the test environment.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Ensure config directory exists for tests
const configPath = join(process.cwd(), 'config');

if (!existsSync(configPath)) {
  console.log('[Test Setup] Warning: config/ directory not found');
}

// Export empty to make this a module
export {};
