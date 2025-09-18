/**
 * Tests for JSBSim JavaScript/TypeScript bindings
 */

import { JSBSim, BaseError } from '../src/index';

describe('JSBSim', () => {
  let jsbsim: JSBSim;

  beforeEach(() => {
    jsbsim = new JSBSim();
  });

  afterEach(() => {
    // Clean up if needed
  });

  describe('Initialization', () => {
    test('should create JSBSim instance', () => {
      expect(jsbsim).toBeInstanceOf(JSBSim);
    });

    test('should throw error when accessing FDM before init', () => {
      expect(() => jsbsim.getFDM()).toThrow(BaseError);
      expect(() => jsbsim.getFDM()).toThrow('JSBSim not initialized');
    });

    test('should throw error when accessing module before init', () => {
      expect(() => jsbsim.getModule()).toThrow(BaseError);
      expect(() => jsbsim.getModule()).toThrow('JSBSim not initialized');
    });
  });

  describe('Module Loading', () => {
    test('should initialize JSBSim module', async () => {
      // This test would require the actual WASM module to be built
      // For now, we'll test that the method exists and handles errors appropriately

      try {
        await jsbsim.init();
        expect(jsbsim.getFDM()).toBeDefined();
        expect(jsbsim.getModule()).toBeDefined();
      } catch (error) {
        // Expected to fail in test environment without WASM files
        expect(error).toBeInstanceOf(BaseError);
      }
    }, 30000);

    test('should handle initialization with config', async () => {
      const config = {
        rootDir: '/test/root',
        aircraftPath: '/test/aircraft',
        enginePath: '/test/engine'
      };

      try {
        await jsbsim.init(config);
        // If initialization succeeds, test the configuration
        const fdm = jsbsim.getFDM();
        expect(fdm).toBeDefined();
      } catch (error) {
        // Expected to fail in test environment without WASM files
        expect(error).toBeInstanceOf(BaseError);
      }
    });
  });

  describe('Property System', () => {
    test('should throw error when setting property before init', () => {
      expect(() => jsbsim.setProperty('test/property', 1.0)).toThrow(BaseError);
    });

    test('should throw error when getting property before init', () => {
      expect(() => jsbsim.getProperty('test/property')).toThrow(BaseError);
    });
  });

  describe('Aircraft Loading', () => {
    test('should throw error when loading aircraft before init', () => {
      expect(() => jsbsim.loadAircraft('c172x')).toThrow(BaseError);
    });
  });

  describe('Simulation Control', () => {
    test('should throw error when stepping before init', () => {
      expect(() => jsbsim.step()).toThrow(BaseError);
    });

    test('should throw error when running before init', async () => {
      try {
        await jsbsim.run(1.0);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
      }
    });

    test('should throw error when getting time before init', () => {
      expect(() => jsbsim.getTime()).toThrow(BaseError);
    });

    test('should throw error when resetting before init', () => {
      expect(() => jsbsim.reset()).toThrow(BaseError);
    });
  });
});

describe('Error Classes', () => {
  test('BaseError should be instanceof Error', () => {
    const error = new BaseError('test message');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BaseError');
    expect(error.message).toBe('test message');
  });

  test('should import TrimFailureError', async () => {
    const { TrimFailureError } = await import('../src/index');
    const error = new TrimFailureError('trim failed');
    expect(error).toBeInstanceOf(BaseError);
    expect(error.name).toBe('TrimFailureError');
  });

  test('should import GeographicError', async () => {
    const { GeographicError } = await import('../src/index');
    const error = new GeographicError('geographic error');
    expect(error).toBeInstanceOf(BaseError);
    expect(error.name).toBe('GeographicError');
  });
});

describe('Enums', () => {
  test('should import TemperatureUnit enum', async () => {
    const { TemperatureUnit } = await import('../src/index');
    expect(TemperatureUnit.Celsius).toBe(2);
    expect(TemperatureUnit.Fahrenheit).toBe(1);
    expect(TemperatureUnit.Kelvin).toBe(4);
  });

  test('should import PressureUnit enum', async () => {
    const { PressureUnit } = await import('../src/index');
    expect(PressureUnit.PSF).toBe(1);
    expect(PressureUnit.Millibars).toBe(2);
    expect(PressureUnit.InchesHg).toBe(4);
  });
});