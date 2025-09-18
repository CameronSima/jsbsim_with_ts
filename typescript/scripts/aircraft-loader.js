/**
 * Aircraft data loader for JSBSim browser example
 * Loads aircraft XML files into the virtual file system
 */

class AircraftLoader {
  constructor() {
    this.loadedAircraft = new Set();
  }

  /**
   * Load aircraft data into JSBSim virtual file system
   */
  async loadAircraftData(jsbsimModule, aircraftName) {
    try {
      console.log(`Loading aircraft data for: ${aircraftName}`);

      // For now, we'll create a simple in-memory aircraft configuration
      // In a real application, you would fetch actual XML files

      const aircraftData = this.createBasicAircraftConfig(aircraftName);

      // Create the virtual file system structure
      const FS = jsbsimModule.FS;

      // Create necessary directories
      FS.mkdirTree('/aircraft');
      FS.mkdirTree(`/aircraft/${aircraftName}`);
      FS.mkdirTree('/engine');
      FS.mkdirTree('/systems');

      // Write the aircraft configuration file
      FS.writeFile(`/aircraft/${aircraftName}/${aircraftName}.xml`, aircraftData);

      // Create a basic engine file if needed
      if (aircraftName.includes('c172') || aircraftName === 'demo-aircraft') {
        const engineData = this.createBasicEngineConfig();
        FS.writeFile('/engine/eng_io360c.xml', engineData);

        const propData = this.createBasicPropellerConfig();
        FS.writeFile('/engine/prop_generic.xml', propData);
      }

      this.loadedAircraft.add(aircraftName);
      console.log(`Successfully loaded aircraft: ${aircraftName}`);
      return true;

    } catch (error) {
      console.error(`Failed to load aircraft ${aircraftName}:`, error);
      return false;
    }
  }

  /**
   * Create a basic aircraft configuration
   */
  createBasicAircraftConfig(aircraftName) {
    const configs = {
      'c172x': this.createC172Config(),
      'demo-aircraft': this.createDemoConfig(),
      'default': this.createGenericConfig(aircraftName)
    };

    return configs[aircraftName] || configs['default'];
  }

  createC172Config() {
    return `<?xml version="1.0"?>
<fdm_config name="Cessna C-172 Skyhawk" version="2.0" release="BETA">
  <fileheader>
    <author>JSBSim Web Demo</author>
    <description>Simplified Cessna 172 for browser</description>
  </fileheader>

  <metrics>
    <wingarea unit="FT2"> 174.0 </wingarea>
    <wingspan unit="FT"> 36.0 </wingspan>
    <chord unit="FT"> 4.9 </chord>
    <htailarea unit="FT2"> 21.9 </htailarea>
    <htailarm unit="FT"> 15.7 </htailarm>
    <vtailarea unit="FT2"> 16.5 </vtailarea>
    <vtailarm unit="FT"> 15.7 </vtailarm>
    <location name="AERORP" unit="IN">
      <x> 43.2 </x>
      <y> 0.0 </y>
      <z> 59.4 </z>
    </location>
    <location name="EYEPOINT" unit="IN">
      <x> 37.0 </x>
      <y> 0.0 </y>
      <z> 35.0 </z>
    </location>
    <location name="VRP" unit="IN">
      <x> 43.2 </x>
      <y> 0.0 </y>
      <z> 59.4 </z>
    </location>
  </metrics>

  <mass_balance>
    <ixx unit="SLUG*FT2"> 1285.32 </ixx>
    <iyy unit="SLUG*FT2"> 1824.93 </iyy>
    <izz unit="SLUG*FT2"> 2666.89 </izz>
    <emptywt unit="LBS"> 1500.0 </emptywt>
    <location name="CG" unit="IN">
      <x> 43.2 </x>
      <y> 0.0 </y>
      <z> 59.4 </z>
    </location>
  </mass_balance>

  <ground_reactions>
    <contact type="BOGEY" name="NOSE">
      <location unit="IN">
        <x> 12.0 </x>
        <y> 0.0 </y>
        <z> 85.0 </z>
      </location>
      <static_friction> 0.8 </static_friction>
      <dynamic_friction> 0.5 </dynamic_friction>
      <spring_coeff unit="LBS/FT"> 2000.0 </spring_coeff>
      <damping_coeff unit="LBS/FT/SEC"> 500.0 </damping_coeff>
    </contact>
    <contact type="BOGEY" name="LEFT_MAIN">
      <location unit="IN">
        <x> 45.0 </x>
        <y> -72.0 </y>
        <z> 85.0 </z>
      </location>
      <static_friction> 0.8 </static_friction>
      <dynamic_friction> 0.5 </dynamic_friction>
      <spring_coeff unit="LBS/FT"> 5000.0 </spring_coeff>
      <damping_coeff unit="LBS/FT/SEC"> 1000.0 </damping_coeff>
    </contact>
    <contact type="BOGEY" name="RIGHT_MAIN">
      <location unit="IN">
        <x> 45.0 </x>
        <y> 72.0 </y>
        <z> 85.0 </z>
      </location>
      <static_friction> 0.8 </static_friction>
      <dynamic_friction> 0.5 </dynamic_friction>
      <spring_coeff unit="LBS/FT"> 5000.0 </spring_coeff>
      <damping_coeff unit="LBS/FT/SEC"> 1000.0 </damping_coeff>
    </contact>
  </ground_reactions>

  <propulsion>
    <engine file="eng_io360c">
      <location unit="IN">
        <x> 33.0 </x>
        <y> 0.0 </y>
        <z> 59.4 </z>
      </location>
      <feed>0</feed>
      <thruster file="prop_generic">
        <location unit="IN">
          <x> 33.0 </x>
          <y> 0.0 </y>
          <z> 59.4 </z>
        </location>
      </thruster>
    </engine>
    <tank type="FUEL" number="0">
      <location unit="IN">
        <x> 48.0 </x>
        <y> 0.0 </y>
        <z> 59.4 </z>
      </location>
      <capacity unit="LBS"> 212.0 </capacity>
      <contents unit="LBS"> 106.0 </contents>
    </tank>
  </propulsion>

  <flight_control name="c172x">
    <channel name="Pitch">
      <summer name="Pitch Trim Sum">
        <input>fcs/elevator-cmd-norm</input>
        <input>fcs/pitch-trim-cmd-norm</input>
        <clipto>
          <min> -1 </min>
          <max>  1 </max>
        </clipto>
      </summer>
      <aerosurface_scale name="Elevator Control">
        <input>fcs/pitch-trim-sum</input>
        <range>
          <min> -0.35 </min>
          <max>  0.35 </max>
        </range>
        <output>fcs/elevator-pos-rad</output>
      </aerosurface_scale>
    </channel>
    <channel name="Roll">
      <summer name="Roll Trim Sum">
        <input>fcs/aileron-cmd-norm</input>
        <input>fcs/roll-trim-cmd-norm</input>
        <clipto>
          <min> -1 </min>
          <max>  1 </max>
        </clipto>
      </summer>
      <aerosurface_scale name="Left Aileron Control">
        <input>fcs/roll-trim-sum</input>
        <range>
          <min> -0.35 </min>
          <max>  0.35 </max>
        </range>
        <output>fcs/left-aileron-pos-rad</output>
      </aerosurface_scale>
    </channel>
    <channel name="Yaw">
      <summer name="Rudder Command Sum">
        <input>fcs/rudder-cmd-norm</input>
        <input>fcs/yaw-trim-cmd-norm</input>
        <clipto>
          <min> -1 </min>
          <max>  1 </max>
        </clipto>
      </summer>
      <aerosurface_scale name="Rudder Control">
        <input>fcs/rudder-command-sum</input>
        <range>
          <min> -0.35 </min>
          <max>  0.35 </max>
        </range>
        <output>fcs/rudder-pos-rad</output>
      </aerosurface_scale>
    </channel>
  </flight_control>

  <aerodynamics>
    <axis name="LIFT">
      <function name="aero/coefficient/CLalpha">
        <description>Lift_due_to_alpha</description>
        <product>
          <property>aero/qbar-psf</property>
          <property>metrics/Sw-sqft</property>
          <value>5.5</value>
          <property>aero/alpha-rad</property>
        </product>
      </function>
    </axis>
    <axis name="DRAG">
      <function name="aero/coefficient/CD0">
        <description>Drag_at_zero_lift</description>
        <product>
          <property>aero/qbar-psf</property>
          <property>metrics/Sw-sqft</property>
          <value>0.025</value>
        </product>
      </function>
    </axis>
    <axis name="PITCH">
      <function name="aero/coefficient/Cmalpha">
        <description>Pitch_moment_due_to_alpha</description>
        <product>
          <property>aero/qbar-psf</property>
          <property>metrics/Sw-sqft</property>
          <property>metrics/cbarw-ft</property>
          <value>-0.5</value>
          <property>aero/alpha-rad</property>
        </product>
      </function>
    </axis>
  </aerodynamics>
</fdm_config>`;
  }

  createDemoConfig() {
    return `<?xml version="1.0"?>
<fdm_config name="Demo Aircraft" version="2.0" release="BETA">
  <fileheader>
    <author>JSBSim Web Demo</author>
    <description>Basic demo aircraft for browser testing</description>
  </fileheader>
  <metrics>
    <wingarea unit="FT2"> 100.0 </wingarea>
    <wingspan unit="FT"> 30.0 </wingspan>
    <chord unit="FT"> 4.0 </chord>
  </metrics>
  <mass_balance>
    <ixx unit="SLUG*FT2"> 1000.0 </ixx>
    <iyy unit="SLUG*FT2"> 1500.0 </iyy>
    <izz unit="SLUG*FT2"> 2000.0 </izz>
    <emptywt unit="LBS"> 1000.0 </emptywt>
  </mass_balance>
</fdm_config>`;
  }

  createGenericConfig(name) {
    return `<?xml version="1.0"?>
<fdm_config name="${name}" version="2.0" release="BETA">
  <fileheader>
    <author>JSBSim Web Demo</author>
    <description>Generic aircraft configuration for ${name}</description>
  </fileheader>
  <metrics>
    <wingarea unit="FT2"> 200.0 </wingarea>
    <wingspan unit="FT"> 40.0 </wingspan>
    <chord unit="FT"> 5.0 </chord>
  </metrics>
  <mass_balance>
    <ixx unit="SLUG*FT2"> 2000.0 </ixx>
    <iyy unit="SLUG*FT2"> 3000.0 </iyy>
    <izz unit="SLUG*FT2"> 4000.0 </izz>
    <emptywt unit="LBS"> 2000.0 </emptywt>
  </mass_balance>
</fdm_config>`;
  }

  createBasicEngineConfig() {
    return `<?xml version="1.0"?>
<piston_engine name="eng_io360c">
  <minmp unit="INHG"> 10.0 </minmp>
  <maxmp unit="INHG"> 29.0 </maxmp>
  <displacement unit="IN3"> 360.0 </displacement>
  <maxhp> 180.0 </maxhp>
  <cycles> 4.0 </cycles>
  <idlerpm> 800.0 </idlerpm>
  <maxrpm> 2700.0 </maxrpm>
  <maxthrottle> 1.0 </maxthrottle>
  <minthrottle> 0.1 </minthrottle>
  <sparkfaildrop> 0.1 </sparkfaildrop>
  <volumetric-efficiency> 0.85 </volumetric-efficiency>
</piston_engine>`;
  }

  createBasicPropellerConfig() {
    return `<?xml version="1.0"?>
<propeller name="prop_generic">
  <diameter unit="IN"> 76.0 </diameter>
  <numblades> 2 </numblades>
  <gearratio> 1.0 </gearratio>
  <minpitch> 10.0 </minpitch>
  <maxpitch> 32.0 </maxpitch>
  <minrpm> 800.0 </minrpm>
  <maxrpm> 2700.0 </maxrpm>
  <constspeed> 0 </constspeed>
  <reversepitch> 0 </reversepitch>
</propeller>`;
  }

  /**
   * Check if aircraft data is loaded
   */
  isAircraftLoaded(aircraftName) {
    return this.loadedAircraft.has(aircraftName);
  }

  /**
   * Get list of loaded aircraft
   */
  getLoadedAircraft() {
    return Array.from(this.loadedAircraft);
  }
}

// Make it available globally for browser use
if (typeof window !== 'undefined') {
  window.AircraftLoader = AircraftLoader;
}

// Export for Node.js use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AircraftLoader;
}