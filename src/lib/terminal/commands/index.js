/**
 * @file Every terminal command, registered in help order.
 * @module lib/terminal/commands
 */
import { createRegistry } from '../registry.js';
import { coreCommands } from './core.js';
import { shellCommands } from './shell.js';

export function buildRegistry() {
  return createRegistry([...coreCommands, ...shellCommands]);
}
