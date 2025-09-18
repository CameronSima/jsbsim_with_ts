
// Browser-compatible JSBSim bundle
(function(global) {
    'use strict';

    // Create exports object
    var exports = {};

    // Inline the compiled TypeScript module content (converted from ES6)
    /**
 * JSBSim JavaScript/TypeScript Bindings
 *
 * This module provides JavaScript/TypeScript bindings for the JSBSim flight dynamics model.
 * JSBSim is compiled to WebAssembly using Emscripten and can run in web browsers or Node.js.
 */
/// <reference types="emscripten" />
// JSBSim WebAssembly module factory - loads the WASM module
const JSBSimModuleFactory = async () => {
    // Check if the global JSBSimModule function is available
    if (typeof JSBSimModule === 'function') {
        return JSBSimModule();
    }
    // If not available, throw an error with instructions
    throw new Error('JSBSim WebAssembly module not available. Make sure jsbsim.js is loaded before initializing JSBSim.');
};
// Base exception classes
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BaseError';
    }
}
class TrimFailureError extends BaseError {
    constructor(message) {
        super(message);
        this.name = 'TrimFailureError';
    }
}
class GeographicError extends BaseError {
    constructor(message) {
        super(message);
        this.name = 'GeographicError';
    }
}
// Enums matching JSBSim C++ enums
var TemperatureUnit;
(function (TemperatureUnit) {
    TemperatureUnit[TemperatureUnit["NoTempUnit"] = 0] = "NoTempUnit";
    TemperatureUnit[TemperatureUnit["Fahrenheit"] = 1] = "Fahrenheit";
    TemperatureUnit[TemperatureUnit["Celsius"] = 2] = "Celsius";
    TemperatureUnit[TemperatureUnit["Rankine"] = 3] = "Rankine";
    TemperatureUnit[TemperatureUnit["Kelvin"] = 4] = "Kelvin";
})(TemperatureUnit || (TemperatureUnit = {}));
var PressureUnit;
(function (PressureUnit) {
    PressureUnit[PressureUnit["NoPressUnit"] = 0] = "NoPressUnit";
    PressureUnit[PressureUnit["PSF"] = 1] = "PSF";
    PressureUnit[PressureUnit["Millibars"] = 2] = "Millibars";
    PressureUnit[PressureUnit["Pascals"] = 3] = "Pascals";
    PressureUnit[PressureUnit["InchesHg"] = 4] = "InchesHg";
})(PressureUnit || (PressureUnit = {}));
/**
 * High-level wrapper class for easier JSBSim usage
 */
class JSBSim {
    constructor() {
        this.module = null;
        this.fdm = null;
    }
    /**
     * Initialize the JSBSim module
     */
    async init(config = {}) {
        try {
            this.module = await JSBSimModuleFactory();
            // Set up virtual file system if data files are provided
            if (config.dataFiles && config.dataFiles.length > 0) {
                this.module.loadDataFiles(config.dataFiles);
            }
            // Set up paths
            if (config.rootDir) {
                this.module.setupJSBSimPaths(config.rootDir);
            }
            // Create FDM executive
            this.fdm = new this.module.FGFDMExec(config.rootDir || '');
            // Configure paths
            if (config.aircraftPath) {
                this.fdm.setAircraftPath(config.aircraftPath);
            }
            if (config.enginePath) {
                this.fdm.setEnginePath(config.enginePath);
            }
            if (config.systemsPath) {
                this.fdm.setSystemsPath(config.systemsPath);
            }
            if (config.outputPath) {
                this.fdm.setOutputPath(config.outputPath);
            }
        }
        catch (error) {
            throw new BaseError(`Failed to initialize JSBSim: ${error}`);
        }
    }
    /**
     * Get the FDM executive instance
     */
    getFDM() {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm;
    }
    /**
     * Get the WebAssembly module instance
     */
    getModule() {
        if (!this.module) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.module;
    }
    /**
     * Load an aircraft model
     */
    loadAircraft(aircraftName, addToPath = true) {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm.loadModel(aircraftName, addToPath);
    }
    /**
     * Load and run a script
     */
    runScript(scriptPath, deltaT = 0.0, initFile = '') {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm.loadScript(scriptPath, deltaT, initFile);
    }
    /**
     * Run a single simulation step
     */
    step() {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm.run();
    }
    /**
     * Run the simulation for a specified time duration
     */
    async run(duration, realTime = false) {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        const startTime = this.fdm.getSimTime();
        const endTime = startTime + duration;
        const deltaT = this.fdm.getDeltaT();
        while (this.fdm.getSimTime() < endTime) {
            if (!this.fdm.run()) {
                break;
            }
            if (realTime) {
                // Sleep for real-time simulation
                await new Promise(resolve => setTimeout(resolve, deltaT * 1000));
            }
        }
    }
    /**
     * Get the current simulation time
     */
    getTime() {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm.getSimTime();
    }
    /**
     * Set a property value
     */
    setProperty(property, value) {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        this.fdm.setPropertyValue(property, value);
    }
    /**
     * Get a property value
     */
    getProperty(property) {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        return this.fdm.getPropertyValue(property);
    }
    /**
     * Reset the simulation to initial conditions
     */
    reset() {
        if (!this.fdm) {
            throw new BaseError('JSBSim not initialized. Call init() first.');
        }
        this.fdm.resetToInitialConditions();
    }
    // ========================================================================
    // Aircraft Control Methods
    // ========================================================================
    /**
     * Set primary flight controls (normalized -1 to 1)
     */
    setElevator(value) {
        this.setProperty('fcs/elevator-cmd-norm', value);
    }
    setAileron(value) {
        this.setProperty('fcs/aileron-cmd-norm', value);
    }
    setRudder(value) {
        this.setProperty('fcs/rudder-cmd-norm', value);
    }
    /**
     * Set secondary flight controls (normalized 0 to 1)
     */
    setFlaps(value) {
        this.setProperty('fcs/flap-cmd-norm', value);
    }
    setSpeedbrakes(value) {
        this.setProperty('fcs/speedbrake-cmd-norm', value);
    }
    setSpoilers(value) {
        this.setProperty('fcs/spoiler-cmd-norm', value);
    }
    /**
     * Set trim controls (normalized -1 to 1)
     */
    setPitchTrim(value) {
        this.setProperty('fcs/pitch-trim-cmd-norm', value);
    }
    setRollTrim(value) {
        this.setProperty('fcs/roll-trim-cmd-norm', value);
    }
    setYawTrim(value) {
        this.setProperty('fcs/yaw-trim-cmd-norm', value);
    }
    /**
     * Set engine controls (normalized 0 to 1)
     */
    setThrottle(engineIndex, value) {
        this.setProperty(`fcs/throttle-cmd-norm[${engineIndex}]`, value);
    }
    setMixture(engineIndex, value) {
        this.setProperty(`fcs/mixture-cmd-norm[${engineIndex}]`, value);
    }
    setPropellerAdvance(engineIndex, value) {
        this.setProperty(`fcs/advance-cmd-norm[${engineIndex}]`, value);
    }
    /**
     * Set all engine throttles to the same value
     */
    setAllThrottles(value) {
        const propulsion = this.getFDM().getPropulsion();
        const numEngines = propulsion.getNumEngines();
        for (let i = 0; i < numEngines; i++) {
            this.setThrottle(i, value);
        }
    }
    /**
     * Set brake controls (normalized 0 to 1)
     */
    setLeftBrake(value) {
        this.setProperty('fcs/left-brake-cmd-norm', value);
    }
    setRightBrake(value) {
        this.setProperty('fcs/right-brake-cmd-norm', value);
    }
    setCenterBrake(value) {
        this.setProperty('fcs/center-brake-cmd-norm', value);
    }
    setBrakes(value) {
        this.setLeftBrake(value);
        this.setRightBrake(value);
    }
    /**
     * Set steering control (normalized -1 to 1)
     */
    setSteering(value) {
        this.setProperty('fcs/steer-cmd-norm', value);
    }
    /**
     * Set landing gear control (normalized 0 to 1, 0=up, 1=down)
     */
    setLandingGear(value) {
        this.setProperty('gear/gear-cmd-norm', value);
    }
    // ========================================================================
    // Aircraft State Getter Methods
    // ========================================================================
    /**
     * Get aircraft position
     */
    getPosition() {
        return {
            latitude: this.getProperty('position/lat-gc-deg'),
            longitude: this.getProperty('position/long-gc-deg'),
            altitude: this.getProperty('position/h-sl-ft')
        };
    }
    getLatitude() {
        return this.getProperty('position/lat-gc-deg');
    }
    getLongitude() {
        return this.getProperty('position/long-gc-deg');
    }
    getAltitude() {
        return this.getProperty('position/h-sl-ft');
    }
    getAltitudeAGL() {
        return this.getProperty('position/h-agl-ft');
    }
    /**
     * Get aircraft attitude (Euler angles in degrees)
     */
    getAttitude() {
        return {
            roll: this.getProperty('attitude/phi-deg'),
            pitch: this.getProperty('attitude/theta-deg'),
            yaw: this.getProperty('attitude/psi-deg')
        };
    }
    getRoll() {
        return this.getProperty('attitude/phi-deg');
    }
    getPitch() {
        return this.getProperty('attitude/theta-deg');
    }
    getHeading() {
        return this.getProperty('attitude/psi-deg');
    }
    /**
     * Get aircraft velocities
     */
    getVelocity() {
        return {
            u: this.getProperty('velocities/u-fps'),
            v: this.getProperty('velocities/v-fps'),
            w: this.getProperty('velocities/w-fps')
        };
    }
    getGroundSpeed() {
        return this.getProperty('velocities/vg-fps');
    }
    getCalibratedAirspeed() {
        return this.getProperty('velocities/vc-kts');
    }
    getTrueAirspeed() {
        return this.getProperty('velocities/vtrue-kts');
    }
    getMachNumber() {
        return this.getProperty('velocities/mach');
    }
    /**
     * Get angular rates (degrees per second)
     */
    getAngularRates() {
        return {
            rollRate: this.getProperty('velocities/p-rad_sec') * 180 / Math.PI,
            pitchRate: this.getProperty('velocities/q-rad_sec') * 180 / Math.PI,
            yawRate: this.getProperty('velocities/r-rad_sec') * 180 / Math.PI
        };
    }
    getRollRate() {
        return this.getProperty('velocities/p-rad_sec') * 180 / Math.PI;
    }
    getPitchRate() {
        return this.getProperty('velocities/q-rad_sec') * 180 / Math.PI;
    }
    getYawRate() {
        return this.getProperty('velocities/r-rad_sec') * 180 / Math.PI;
    }
    /**
     * Get aerodynamic angles
     */
    getAngleOfAttack() {
        return this.getProperty('aero/alpha-deg');
    }
    getSideslipAngle() {
        return this.getProperty('aero/beta-deg');
    }
    /**
     * Get dynamic pressure
     */
    getDynamicPressure() {
        return this.getProperty('aero/qbar-psf');
    }
    // ========================================================================
    // Engine State Methods
    // ========================================================================
    /**
     * Get engine thrust for a specific engine (pounds)
     */
    getEngineThrust(engineIndex) {
        return this.getProperty(`propulsion/engine[${engineIndex}]/thrust-lbs`);
    }
    /**
     * Get total thrust from all engines
     */
    getTotalThrust() {
        const propulsion = this.getFDM().getPropulsion();
        const numEngines = propulsion.getNumEngines();
        let totalThrust = 0;
        for (let i = 0; i < numEngines; i++) {
            totalThrust += this.getEngineThrust(i);
        }
        return totalThrust;
    }
    /**
     * Get fuel flow rate for a specific engine (gallons per hour)
     */
    getFuelFlowRate(engineIndex) {
        return this.getProperty(`propulsion/engine[${engineIndex}]/fuel-flow-rate-gph`);
    }
    /**
     * Get total fuel quantity (pounds)
     */
    getTotalFuel() {
        return this.getProperty('propulsion/total-fuel-lbs');
    }
    /**
     * Get engine running state
     */
    isEngineRunning(engineIndex) {
        return this.getProperty(`propulsion/engine[${engineIndex}]/set-running`) > 0;
    }
    /**
     * Start/stop engine
     */
    setEngineRunning(engineIndex, running) {
        this.setProperty(`propulsion/engine[${engineIndex}]/set-running`, running ? 1 : 0);
    }
    /**
     * Start all engines
     */
    startAllEngines() {
        const propulsion = this.getFDM().getPropulsion();
        const numEngines = propulsion.getNumEngines();
        for (let i = 0; i < numEngines; i++) {
            this.setEngineRunning(i, true);
        }
    }
    /**
     * Stop all engines
     */
    stopAllEngines() {
        const propulsion = this.getFDM().getPropulsion();
        const numEngines = propulsion.getNumEngines();
        for (let i = 0; i < numEngines; i++) {
            this.setEngineRunning(i, false);
        }
    }
    // ========================================================================
    // Landing Gear and Ground Contact Methods
    // ========================================================================
    /**
     * Get weight on wheels status
     */
    isOnGround() {
        return this.getProperty('gear/wow') > 0;
    }
    /**
     * Get landing gear position (0=up, 1=down)
     */
    getLandingGearPosition() {
        return this.getProperty('gear/gear-pos-norm');
    }
    /**
     * Check if landing gear is down and locked
     */
    isLandingGearDown() {
        return this.getLandingGearPosition() > 0.99;
    }
    /**
     * Check if landing gear is up and locked
     */
    isLandingGearUp() {
        return this.getLandingGearPosition() < 0.01;
    }
    // ========================================================================
    // Control Surface Position Getters
    // ========================================================================
    /**
     * Get current control surface positions (normalized)
     */
    getElevatorPosition() {
        return this.getProperty('fcs/elevator-pos-norm');
    }
    getAileronPosition() {
        return this.getProperty('fcs/aileron-cmd-norm'); // Use command as position may vary L/R
    }
    getRudderPosition() {
        return this.getProperty('fcs/rudder-pos-norm');
    }
    getFlapsPosition() {
        return this.getProperty('fcs/flap-pos-norm');
    }
    getSpeedbrakesPosition() {
        return this.getProperty('fcs/speedbrake-pos-norm');
    }
    // ========================================================================
    // Atmospheric Conditions
    // ========================================================================
    /**
     * Get atmospheric conditions
     */
    getAtmosphericConditions() {
        return {
            temperature: this.getProperty('atmosphere/T-R'), // Rankine
            pressure: this.getProperty('atmosphere/P-psf'), // psf
            density: this.getProperty('atmosphere/rho-slugs_ft3'), // slugs/ft³
            windSpeed: this.getProperty('atmosphere/wind-mag-fps') // fps
        };
    }
    getWindComponents() {
        return {
            north: this.getProperty('atmosphere/wind-north-fps'),
            east: this.getProperty('atmosphere/wind-east-fps'),
            down: this.getProperty('atmosphere/wind-down-fps')
        };
    }
    // ========================================================================
    // Forces and Moments
    // ========================================================================
    /**
     * Get aerodynamic forces (pounds)
     */
    getAerodynamicForces() {
        return {
            x: this.getProperty('forces/fbx-aero-lbs'),
            y: this.getProperty('forces/fby-aero-lbs'),
            z: this.getProperty('forces/fbz-aero-lbs')
        };
    }
    /**
     * Get aerodynamic moments (pound-feet)
     */
    getAerodynamicMoments() {
        return {
            roll: this.getProperty('moments/l-aero-lbsft'),
            pitch: this.getProperty('moments/m-aero-lbsft'),
            yaw: this.getProperty('moments/n-aero-lbsft')
        };
    }
    /**
     * Get propulsion forces (pounds)
     */
    getPropulsionForces() {
        return {
            x: this.getProperty('forces/fbx-prop-lbs'),
            y: this.getProperty('forces/fby-prop-lbs'),
            z: this.getProperty('forces/fbz-prop-lbs')
        };
    }
    // ========================================================================
    // Convenience Methods
    // ========================================================================
    /**
     * Get comprehensive aircraft state summary
     */
    getAircraftState() {
        const propulsion = this.getFDM().getPropulsion();
        const numEngines = propulsion.getNumEngines();
        const throttles = [];
        const engines = [];
        for (let i = 0; i < numEngines; i++) {
            throttles.push(this.getProperty(`fcs/throttle-pos-norm[${i}]`));
            engines.push({
                running: this.isEngineRunning(i),
                thrust: this.getEngineThrust(i)
            });
        }
        return {
            time: this.getTime(),
            position: this.getPosition(),
            attitude: this.getAttitude(),
            velocity: {
                groundSpeed: this.getGroundSpeed(),
                airspeed: this.getCalibratedAirspeed(),
                mach: this.getMachNumber()
            },
            controls: {
                elevator: this.getElevatorPosition(),
                aileron: this.getAileronPosition(),
                rudder: this.getRudderPosition(),
                throttle: throttles
            },
            gear: {
                position: this.getLandingGearPosition(),
                onGround: this.isOnGround()
            },
            engines: engines
        };
    }
}
// Export the JSBSim module factory


    // Manually assign exports
    if (typeof BaseError !== 'undefined') exports.BaseError = BaseError;
    if (typeof TrimFailureError !== 'undefined') exports.TrimFailureError = TrimFailureError;
    if (typeof GeographicError !== 'undefined') exports.GeographicError = GeographicError;
    if (typeof TemperatureUnit !== 'undefined') exports.TemperatureUnit = TemperatureUnit;
    if (typeof PressureUnit !== 'undefined') exports.PressureUnit = PressureUnit;
    if (typeof JSBSim !== 'undefined') exports.JSBSim = JSBSim;
    if (typeof JSBSimModuleFactory !== 'undefined') exports.JSBSimModuleFactory = JSBSimModuleFactory;

    // Expose JSBSim to global scope for browser usage
    if (typeof window !== 'undefined') {
        window.JSBSim = exports.JSBSim;
        window.JSBSimModuleFactory = exports.JSBSimModuleFactory;
        window.BaseError = exports.BaseError;
        window.TrimFailureError = exports.TrimFailureError;
        window.GeographicError = exports.GeographicError;
        window.TemperatureUnit = exports.TemperatureUnit;
        window.PressureUnit = exports.PressureUnit;
    }

    // Also support CommonJS and AMD
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    }

    if (typeof define === 'function' && define.amd) {
        define('jsbsim', [], function() {
            return exports;
        });
    }

})(typeof window !== 'undefined' ? window : this);
