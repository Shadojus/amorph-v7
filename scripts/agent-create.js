/**
 * AMORPH Agent-basierte Datenerstellung
 * 
 * Dieses Script ermöglicht mehreren Claude-Agenten parallel Daten zu erstellen:
 * - Jeder Agent bekommt eine Spezies + Perspektive zugewiesen
 * - Validierung läuft automatisch nach Erstellung
 * - Experten werden automatisch zugeordnet
 * - Konflikte werden erkannt und gemeldet
 * 
 * Usage:
 *   node scripts/agent-create.js --species steinpilz --perspective medicine
 *   node scripts/agent-create.js --list-pending
 *   node scripts/agent-create.js --validate steinpilz
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const QUEUE_FILE = path.join(DATA_DIR, '.agent-queue.json');
const LOCK_DIR = path.join(DATA_DIR, '.locks');

// ═══════════════════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT - Verteilung der Arbeit an Agenten
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialisiert die Agent-Queue
 */
export function initQueue() {
  if (!fs.existsSync(LOCK_DIR)) {
    fs.mkdirSync(LOCK_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(QUEUE_FILE)) {
    const initialQueue = {
      version: '1.0',
      created: new Date().toISOString(),
      pending: [],
      inProgress: [],
      completed: [],
      failed: []
    };
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(initialQueue, null, 2));
  }
  
  return loadQueue();
}

/**
 * Lädt die Queue
 */
export function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    return initQueue();
  }
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
}

/**
 * Speichert die Queue
 */
export function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Fügt eine Aufgabe zur Queue hinzu
 */
export function addTask(species, perspective, priority = 5) {
  const queue = loadQueue();
  const taskId = `${species}/${perspective}`;
  
  // Check ob bereits existiert
  const allTasks = [...queue.pending, ...queue.inProgress, ...queue.completed];
  if (allTasks.some(t => t.id === taskId)) {
    return { success: false, message: `Task ${taskId} already exists` };
  }
  
  queue.pending.push({
    id: taskId,
    species,
    perspective,
    priority,
    created: new Date().toISOString(),
    assignedTo: null
  });
  
  // Nach Priorität sortieren
  queue.pending.sort((a, b) => a.priority - b.priority);
  
  saveQueue(queue);
  return { success: true, taskId };
}

/**
 * Holt die nächste verfügbare Aufgabe für einen Agenten
 */
export function claimTask(agentId) {
  const queue = loadQueue();
  
  if (queue.pending.length === 0) {
    return { success: false, message: 'No pending tasks' };
  }
  
  const task = queue.pending.shift();
  task.assignedTo = agentId;
  task.startedAt = new Date().toISOString();
  
  queue.inProgress.push(task);
  saveQueue(queue);
  
  // Lock erstellen
  const lockFile = path.join(LOCK_DIR, `${task.id.replace('/', '_')}.lock`);
  fs.writeFileSync(lockFile, JSON.stringify({ agentId, startedAt: task.startedAt }));
  
  return { success: true, task };
}

/**
 * Markiert eine Aufgabe als abgeschlossen
 */
export function completeTask(taskId, agentId, result) {
  const queue = loadQueue();
  
  const taskIndex = queue.inProgress.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return { success: false, message: 'Task not found in progress' };
  }
  
  const task = queue.inProgress[taskIndex];
  if (task.assignedTo !== agentId) {
    return { success: false, message: 'Task assigned to different agent' };
  }
  
  queue.inProgress.splice(taskIndex, 1);
  task.completedAt = new Date().toISOString();
  task.result = result;
  queue.completed.push(task);
  
  saveQueue(queue);
  
  // Lock entfernen
  const lockFile = path.join(LOCK_DIR, `${taskId.replace('/', '_')}.lock`);
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
  
  return { success: true };
}

/**
 * Markiert eine Aufgabe als fehlgeschlagen
 */
export function failTask(taskId, agentId, error) {
  const queue = loadQueue();
  
  const taskIndex = queue.inProgress.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return { success: false, message: 'Task not found in progress' };
  }
  
  const task = queue.inProgress[taskIndex];
  queue.inProgress.splice(taskIndex, 1);
  task.failedAt = new Date().toISOString();
  task.error = error;
  queue.failed.push(task);
  
  saveQueue(queue);
  
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATEN-ERSTELLUNG MIT VALIDIERUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema für eine neue Perspektiven-Datei
 */
const perspectiveDataSchema = z.object({
  _meta: z.object({
    created: z.string(),
    createdBy: z.string(),
    version: z.string().default('1.0'),
    validated: z.boolean().default(false)
  }).optional(),
  _source: z.object({
    expert: z.string().optional(),
    references: z.array(z.string()).optional()
  }).optional()
}).passthrough();

/**
 * Erstellt oder aktualisiert eine Perspektiven-Datei
 */
export function createPerspectiveData(species, perspective, data, agentId) {
  const speciesDir = path.join(DATA_DIR, 'fungi', species);
  const filePath = path.join(speciesDir, `${perspective}.json`);
  
  // Prüfen ob Spezies-Ordner existiert
  if (!fs.existsSync(speciesDir)) {
    return { 
      success: false, 
      message: `Species directory not found: ${species}` 
    };
  }
  
  // Meta-Daten hinzufügen
  const enrichedData = {
    _meta: {
      created: new Date().toISOString(),
      createdBy: agentId,
      version: '1.0',
      validated: false
    },
    ...data
  };
  
  // Basis-Validierung
  try {
    perspectiveDataSchema.parse(enrichedData);
  } catch (error) {
    return {
      success: false,
      message: 'Basic schema validation failed',
      errors: error.errors
    };
  }
  
  // Backup wenn Datei existiert
  if (fs.existsSync(filePath)) {
    const backupPath = filePath.replace('.json', `.backup-${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
  }
  
  // Speichern
  fs.writeFileSync(filePath, JSON.stringify(enrichedData, null, 2));
  
  return {
    success: true,
    filePath,
    message: `Created ${perspective}.json for ${species}`
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERTEN-ZUORDNUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lädt Experten-Empfehlungen für eine Perspektive
 */
export async function getRecommendedExperts(perspective) {
  // Dynamischer Import des Mapping-Moduls
  const { getExpertsForPerspective } = await import('./lib/field-expert-mapping.js');
  return getExpertsForPerspective(perspective);
}

/**
 * Reichert Daten mit Experten-Zuordnungen an
 */
export async function enrichWithExperts(data, perspective) {
  const { generateFieldExpertMapping } = await import('./lib/field-expert-mapping.js');
  
  const fieldMapping = generateFieldExpertMapping(data);
  
  return {
    ...data,
    _experts: fieldMapping
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
AMORPH Agent-basierte Datenerstellung

Usage:
  node scripts/agent-create.js <command> [options]

Commands:
  --init                      Initialize agent queue
  --list-pending              List pending tasks
  --list-progress             List tasks in progress
  --claim <agent-id>          Claim next task for agent
  --complete <task-id> <agent-id>  Mark task as completed
  --add <species> <perspective> [priority]  Add task to queue
  --create <species> <perspective> <agent-id>  Create data directly
  --experts <perspective>     Get recommended experts

Examples:
  node scripts/agent-create.js --init
  node scripts/agent-create.js --add steinpilz medicine 1
  node scripts/agent-create.js --claim claude-agent-1
  node scripts/agent-create.js --experts medicine
    `);
    return;
  }
  
  if (args.includes('--init')) {
    initQueue();
    console.log('✓ Agent queue initialized');
    return;
  }
  
  if (args.includes('--list-pending')) {
    const queue = loadQueue();
    console.log('\nPending Tasks:');
    console.log('═'.repeat(60));
    if (queue.pending.length === 0) {
      console.log('  (none)');
    } else {
      for (const task of queue.pending) {
        console.log(`  [P${task.priority}] ${task.id}`);
      }
    }
    console.log(`\nTotal: ${queue.pending.length} pending`);
    return;
  }
  
  if (args.includes('--list-progress')) {
    const queue = loadQueue();
    console.log('\nTasks In Progress:');
    console.log('═'.repeat(60));
    if (queue.inProgress.length === 0) {
      console.log('  (none)');
    } else {
      for (const task of queue.inProgress) {
        console.log(`  ${task.id} → ${task.assignedTo} (started: ${task.startedAt})`);
      }
    }
    return;
  }
  
  if (args.includes('--claim')) {
    const agentId = args[args.indexOf('--claim') + 1];
    if (!agentId) {
      console.error('Error: Agent ID required');
      process.exit(1);
    }
    const result = claimTask(agentId);
    if (result.success) {
      console.log(`\n✓ Task claimed: ${result.task.id}`);
      console.log(`  Species: ${result.task.species}`);
      console.log(`  Perspective: ${result.task.perspective}`);
    } else {
      console.log(`\n✗ ${result.message}`);
    }
    return;
  }
  
  if (args.includes('--add')) {
    const idx = args.indexOf('--add');
    const species = args[idx + 1];
    const perspective = args[idx + 2];
    const priority = parseInt(args[idx + 3]) || 5;
    
    if (!species || !perspective) {
      console.error('Error: Species and perspective required');
      process.exit(1);
    }
    
    const result = addTask(species, perspective, priority);
    if (result.success) {
      console.log(`✓ Task added: ${result.taskId} (priority: ${priority})`);
    } else {
      console.log(`✗ ${result.message}`);
    }
    return;
  }
  
  if (args.includes('--experts')) {
    const perspective = args[args.indexOf('--experts') + 1];
    if (!perspective) {
      console.error('Error: Perspective required');
      process.exit(1);
    }
    
    const experts = await getRecommendedExperts(perspective);
    console.log(`\nRecommended experts for "${perspective}":`);
    for (const { expert, score } of experts) {
      console.log(`  → ${expert} (score: ${score})`);
    }
    return;
  }
  
  console.log('Unknown command. Use --help for usage.');
}

main().catch(console.error);
