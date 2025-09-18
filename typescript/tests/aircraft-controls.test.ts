/**
 * Tests for JSBSim aircraft control wrapper methods
 */

import { JSBSim, BaseError } from '../src/index';

describe('Aircraft Controls', () => {
  let jsbsim: JSBSim;

  beforeEach(() => {
    jsbsim = new JSBSim();
  });

  describe('Primary Flight Controls', () => {
    test('should throw error when setting elevator before init', () => {
      expect(() => jsbsim.setElevator(0.5)).toThrow(BaseError);
      expect(() => jsbsim.setElevator(0.5)).toThrow('JSBSim not initialized');
    });

    test('should throw error when setting aileron before init', () => {
      expect(() => jsbsim.setAileron(-0.3)).toThrow(BaseError);
    });

    test('should throw error when setting rudder before init', () => {
      expect(() => jsbsim.setRudder(0.2)).toThrow(BaseError);
    });

    test('should have elevator control method', () => {
      expect(typeof jsbsim.setElevator).toBe('function');
    });

    test('should have aileron control method', () => {
      expect(typeof jsbsim.setAileron).toBe('function');
    });

    test('should have rudder control method', () => {
      expect(typeof jsbsim.setRudder).toBe('function');
    });
  });

  describe('Secondary Flight Controls', () => {
    test('should have flaps control method', () => {
      expect(typeof jsbsim.setFlaps).toBe('function');
      expect(() => jsbsim.setFlaps(0.5)).toThrow(BaseError);
    });

    test('should have speedbrakes control method', () => {
      expect(typeof jsbsim.setSpeedbrakes).toBe('function');
      expect(() => jsbsim.setSpeedbrakes(0.8)).toThrow(BaseError);
    });

    test('should have spoilers control method', () => {
      expect(typeof jsbsim.setSpoilers).toBe('function');
      expect(() => jsbsim.setSpoilers(1.0)).toThrow(BaseError);
    });
  });

  describe('Trim Controls', () => {
    test('should have pitch trim control method', () => {
      expect(typeof jsbsim.setPitchTrim).toBe('function');
      expect(() => jsbsim.setPitchTrim(0.1)).toThrow(BaseError);
    });

    test('should have roll trim control method', () => {
      expect(typeof jsbsim.setRollTrim).toBe('function');
      expect(() => jsbsim.setRollTrim(-0.05)).toThrow(BaseError);
    });

    test('should have yaw trim control method', () => {
      expect(typeof jsbsim.setYawTrim).toBe('function');
      expect(() => jsbsim.setYawTrim(0.02)).toThrow(BaseError);
    });
  });

  describe('Engine Controls', () => {
    test('should have throttle control methods', () => {
      expect(typeof jsbsim.setThrottle).toBe('function');
      expect(typeof jsbsim.setAllThrottles).toBe('function');
      expect(() => jsbsim.setThrottle(0, 0.8)).toThrow(BaseError);
      expect(() => jsbsim.setAllThrottles(0.8)).toThrow(BaseError);
    });

    test('should have mixture control method', () => {
      expect(typeof jsbsim.setMixture).toBe('function');
      expect(() => jsbsim.setMixture(0, 0.9)).toThrow(BaseError);
    });

    test('should have propeller advance control method', () => {
      expect(typeof jsbsim.setPropellerAdvance).toBe('function');
      expect(() => jsbsim.setPropellerAdvance(0, 0.7)).toThrow(BaseError);
    });

    test('should have engine start/stop methods', () => {
      expect(typeof jsbsim.setEngineRunning).toBe('function');
      expect(typeof jsbsim.startAllEngines).toBe('function');
      expect(typeof jsbsim.stopAllEngines).toBe('function');
      expect(() => jsbsim.setEngineRunning(0, true)).toThrow(BaseError);
    });
  });

  describe('Brake and Steering Controls', () => {
    test('should have brake control methods', () => {
      expect(typeof jsbsim.setLeftBrake).toBe('function');
      expect(typeof jsbsim.setRightBrake).toBe('function');
      expect(typeof jsbsim.setCenterBrake).toBe('function');
      expect(typeof jsbsim.setBrakes).toBe('function');
      expect(() => jsbsim.setBrakes(0.5)).toThrow(BaseError);
    });

    test('should have steering control method', () => {
      expect(typeof jsbsim.setSteering).toBe('function');
      expect(() => jsbsim.setSteering(0.2)).toThrow(BaseError);
    });
  });

  describe('Landing Gear Controls', () => {
    test('should have landing gear control method', () => {
      expect(typeof jsbsim.setLandingGear).toBe('function');
      expect(() => jsbsim.setLandingGear(1.0)).toThrow(BaseError);
    });
  });
});

describe('Aircraft State Getters', () => {
  let jsbsim: JSBSim;

  beforeEach(() => {
    jsbsim = new JSBSim();
  });

  describe('Position Methods', () => {
    test('should have position getter methods', () => {
      expect(typeof jsbsim.getPosition).toBe('function');
      expect(typeof jsbsim.getLatitude).toBe('function');
      expect(typeof jsbsim.getLongitude).toBe('function');
      expect(typeof jsbsim.getAltitude).toBe('function');
      expect(typeof jsbsim.getAltitudeAGL).toBe('function');
    });

    test('should throw error when getting position before init', () => {
      expect(() => jsbsim.getPosition()).toThrow(BaseError);
      expect(() => jsbsim.getLatitude()).toThrow(BaseError);
      expect(() => jsbsim.getLongitude()).toThrow(BaseError);
      expect(() => jsbsim.getAltitude()).toThrow(BaseError);
      expect(() => jsbsim.getAltitudeAGL()).toThrow(BaseError);
    });
  });

  describe('Attitude Methods', () => {
    test('should have attitude getter methods', () => {
      expect(typeof jsbsim.getAttitude).toBe('function');
      expect(typeof jsbsim.getRoll).toBe('function');
      expect(typeof jsbsim.getPitch).toBe('function');
      expect(typeof jsbsim.getHeading).toBe('function');
    });

    test('should throw error when getting attitude before init', () => {
      expect(() => jsbsim.getAttitude()).toThrow(BaseError);
      expect(() => jsbsim.getRoll()).toThrow(BaseError);
      expect(() => jsbsim.getPitch()).toThrow(BaseError);
      expect(() => jsbsim.getHeading()).toThrow(BaseError);
    });
  });

  describe('Velocity Methods', () => {
    test('should have velocity getter methods', () => {
      expect(typeof jsbsim.getVelocity).toBe('function');
      expect(typeof jsbsim.getGroundSpeed).toBe('function');
      expect(typeof jsbsim.getCalibratedAirspeed).toBe('function');
      expect(typeof jsbsim.getTrueAirspeed).toBe('function');
      expect(typeof jsbsim.getMachNumber).toBe('function');
    });

    test('should throw error when getting velocity before init', () => {
      expect(() => jsbsim.getVelocity()).toThrow(BaseError);
      expect(() => jsbsim.getGroundSpeed()).toThrow(BaseError);
      expect(() => jsbsim.getCalibratedAirspeed()).toThrow(BaseError);
      expect(() => jsbsim.getTrueAirspeed()).toThrow(BaseError);
      expect(() => jsbsim.getMachNumber()).toThrow(BaseError);
    });
  });

  describe('Angular Rate Methods', () => {
    test('should have angular rate getter methods', () => {
      expect(typeof jsbsim.getAngularRates).toBe('function');
      expect(typeof jsbsim.getRollRate).toBe('function');
      expect(typeof jsbsim.getPitchRate).toBe('function');
      expect(typeof jsbsim.getYawRate).toBe('function');
    });

    test('should throw error when getting angular rates before init', () => {
      expect(() => jsbsim.getAngularRates()).toThrow(BaseError);
      expect(() => jsbsim.getRollRate()).toThrow(BaseError);
      expect(() => jsbsim.getPitchRate()).toThrow(BaseError);
      expect(() => jsbsim.getYawRate()).toThrow(BaseError);
    });
  });

  describe('Aerodynamic Methods', () => {
    test('should have aerodynamic getter methods', () => {
      expect(typeof jsbsim.getAngleOfAttack).toBe('function');
      expect(typeof jsbsim.getSideslipAngle).toBe('function');
      expect(typeof jsbsim.getDynamicPressure).toBe('function');
    });

    test('should throw error when getting aerodynamic data before init', () => {
      expect(() => jsbsim.getAngleOfAttack()).toThrow(BaseError);
      expect(() => jsbsim.getSideslipAngle()).toThrow(BaseError);
      expect(() => jsbsim.getDynamicPressure()).toThrow(BaseError);
    });
  });

  describe('Engine State Methods', () => {
    test('should have engine state getter methods', () => {
      expect(typeof jsbsim.getEngineThrust).toBe('function');
      expect(typeof jsbsim.getTotalThrust).toBe('function');
      expect(typeof jsbsim.getFuelFlowRate).toBe('function');
      expect(typeof jsbsim.getTotalFuel).toBe('function');
      expect(typeof jsbsim.isEngineRunning).toBe('function');
    });

    test('should throw error when getting engine state before init', () => {
      expect(() => jsbsim.getEngineThrust(0)).toThrow(BaseError);
      expect(() => jsbsim.getTotalThrust()).toThrow(BaseError);
      expect(() => jsbsim.getFuelFlowRate(0)).toThrow(BaseError);
      expect(() => jsbsim.getTotalFuel()).toThrow(BaseError);
      expect(() => jsbsim.isEngineRunning(0)).toThrow(BaseError);
    });
  });

  describe('Landing Gear Methods', () => {
    test('should have landing gear state getter methods', () => {
      expect(typeof jsbsim.isOnGround).toBe('function');
      expect(typeof jsbsim.getLandingGearPosition).toBe('function');
      expect(typeof jsbsim.isLandingGearDown).toBe('function');
      expect(typeof jsbsim.isLandingGearUp).toBe('function');
    });

    test('should throw error when getting gear state before init', () => {
      expect(() => jsbsim.isOnGround()).toThrow(BaseError);
      expect(() => jsbsim.getLandingGearPosition()).toThrow(BaseError);
      expect(() => jsbsim.isLandingGearDown()).toThrow(BaseError);
      expect(() => jsbsim.isLandingGearUp()).toThrow(BaseError);
    });
  });

  describe('Control Surface Position Methods', () => {
    test('should have control surface position getter methods', () => {
      expect(typeof jsbsim.getElevatorPosition).toBe('function');
      expect(typeof jsbsim.getAileronPosition).toBe('function');
      expect(typeof jsbsim.getRudderPosition).toBe('function');
      expect(typeof jsbsim.getFlapsPosition).toBe('function');
      expect(typeof jsbsim.getSpeedbrakesPosition).toBe('function');
    });

    test('should throw error when getting control positions before init', () => {
      expect(() => jsbsim.getElevatorPosition()).toThrow(BaseError);
      expect(() => jsbsim.getAileronPosition()).toThrow(BaseError);
      expect(() => jsbsim.getRudderPosition()).toThrow(BaseError);
      expect(() => jsbsim.getFlapsPosition()).toThrow(BaseError);
      expect(() => jsbsim.getSpeedbrakesPosition()).toThrow(BaseError);
    });
  });

  describe('Atmospheric Methods', () => {
    test('should have atmospheric getter methods', () => {
      expect(typeof jsbsim.getAtmosphericConditions).toBe('function');
      expect(typeof jsbsim.getWindComponents).toBe('function');
    });

    test('should throw error when getting atmospheric data before init', () => {
      expect(() => jsbsim.getAtmosphericConditions()).toThrow(BaseError);
      expect(() => jsbsim.getWindComponents()).toThrow(BaseError);
    });
  });

  describe('Forces and Moments Methods', () => {
    test('should have forces and moments getter methods', () => {
      expect(typeof jsbsim.getAerodynamicForces).toBe('function');
      expect(typeof jsbsim.getAerodynamicMoments).toBe('function');
      expect(typeof jsbsim.getPropulsionForces).toBe('function');
    });

    test('should throw error when getting forces before init', () => {
      expect(() => jsbsim.getAerodynamicForces()).toThrow(BaseError);
      expect(() => jsbsim.getAerodynamicMoments()).toThrow(BaseError);
      expect(() => jsbsim.getPropulsionForces()).toThrow(BaseError);
    });
  });

  describe('Comprehensive State Method', () => {
    test('should have aircraft state summary method', () => {
      expect(typeof jsbsim.getAircraftState).toBe('function');
    });

    test('should throw error when getting aircraft state before init', () => {
      expect(() => jsbsim.getAircraftState()).toThrow(BaseError);
    });
  });
});