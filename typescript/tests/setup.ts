/**
 * Jest setup file for JSBSim tests
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}

// Increase timeout for WASM loading
jest.setTimeout(30000);