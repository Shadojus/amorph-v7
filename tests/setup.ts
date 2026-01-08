/**
 * Vitest Global Setup
 * 
 * Runs before all tests to configure the test environment.
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Ensure config directory exists for tests
// The config.ts module looks for 'config/' not 'config-local/'
const configPath = join(process.cwd(), 'config');
const configLocalPath = join(process.cwd(), 'config-local');

// If config/ doesn't exist but config-local/ does, create a symlink
if (!existsSync(configPath) && existsSync(configLocalPath)) {
  try {
    // On Windows, symlinks might fail without admin rights
    // Try symlink first, fall back to just setting env variable
    symlinkSync(configLocalPath, configPath, 'junction');
    console.log('[Test Setup] Created config -> config-local junction');
  } catch (error) {
    // If symlink fails, we rely on the config module's fallback behavior
    console.log('[Test Setup] Could not create config symlink, tests may skip config-dependent suites');
  }
}

// Export empty to make this a module
export {};
