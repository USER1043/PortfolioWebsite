/**
 * @file Every terminal command, registered in help order (hidden ones last).
 * @module lib/terminal/commands
 */
import { createRegistry } from '../registry.js';
import { coreCommands } from './core.js';
import { funCommands } from './fun.js';
import { shellCommands } from './shell.js';

export function buildRegistry() {
  return createRegistry([...coreCommands, ...shellCommands, ...funCommands]);
}
