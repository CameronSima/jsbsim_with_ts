cmake_minimum_required(VERSION 3.20)
project(JSBSimJS)

# JSBSim version information (matching main project)
set(PROJECT_VERSION_MAJOR "1")
set(PROJECT_VERSION_MINOR "2")
set(PROJECT_VERSION_PATCH "4.dev1")
set(PROJECT_VERSION "${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}.${PROJECT_VERSION_PATCH}")

# Define JSBSIM_VERSION for the source code
add_definitions(-DJSBSIM_VERSION="${PROJECT_VERSION}")

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Emscripten
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This CMakeLists.txt is designed for Emscripten builds only. Use: emcmake cmake ...")
endif()

# Disable features not needed for WebAssembly build
set(BUILD_TESTS OFF)
set(BUILD_DOCS OFF)
set(ENABLE_COVERAGE OFF)

# Define a stub add_coverage function to avoid CMake errors
function(add_coverage target)
    # Do nothing for WebAssembly builds
endfunction()

# Include JSBSim source directories
set(JSBSIM_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/..)
include_directories(${JSBSIM_ROOT}/src)

# Complete JSBSim source files based on working Emscripten build
set(JSBSIM_CORE_SOURCES
    # Core JSBSim
    ${JSBSIM_ROOT}/src/FGFDMExec.cpp
    ${JSBSIM_ROOT}/src/FGJSBBase.cpp

    # Initialization
    ${JSBSIM_ROOT}/src/initialization/FGInitialCondition.cpp
    ${JSBSIM_ROOT}/src/initialization/FGTrim.cpp
    ${JSBSIM_ROOT}/src/initialization/FGTrimAxis.cpp
    ${JSBSIM_ROOT}/src/initialization/FGLinearization.cpp

    # Atmosphere models
    ${JSBSIM_ROOT}/src/models/atmosphere/FGMSIS.cpp
    ${JSBSIM_ROOT}/src/models/atmosphere/FGMSISData.cpp
    ${JSBSIM_ROOT}/src/models/atmosphere/FGMars.cpp
    ${JSBSIM_ROOT}/src/models/atmosphere/FGStandardAtmosphere.cpp
    ${JSBSIM_ROOT}/src/models/atmosphere/FGWinds.cpp

    # Propulsion
    ${JSBSIM_ROOT}/src/models/propulsion/FGElectric.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGEngine.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGForce.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGNozzle.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGPiston.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGPropeller.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGRocket.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGTank.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGThruster.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGTurbine.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGTurboProp.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGTransmission.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGRotor.cpp
    ${JSBSIM_ROOT}/src/models/propulsion/FGBrushLessDCMotor.cpp

    # Flight control
    ${JSBSIM_ROOT}/src/models/flight_control/FGDeadBand.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGFCSComponent.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGFilter.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGGain.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGKinemat.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGSummer.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGSwitch.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGFCSFunction.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGSensor.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGPID.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGActuator.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGAccelerometer.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGGyro.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGMagnetometer.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGWaypoint.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGAngles.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGDistributor.cpp
    ${JSBSIM_ROOT}/src/models/flight_control/FGLinearActuator.cpp

    # Models
    ${JSBSIM_ROOT}/src/models/FGAerodynamics.cpp
    ${JSBSIM_ROOT}/src/models/FGAircraft.cpp
    ${JSBSIM_ROOT}/src/models/FGAtmosphere.cpp
    ${JSBSIM_ROOT}/src/models/FGAuxiliary.cpp
    ${JSBSIM_ROOT}/src/models/FGFCS.cpp
    ${JSBSIM_ROOT}/src/models/FGGroundReactions.cpp
    ${JSBSIM_ROOT}/src/models/FGInertial.cpp
    ${JSBSIM_ROOT}/src/models/FGLGear.cpp
    ${JSBSIM_ROOT}/src/models/FGMassBalance.cpp
    ${JSBSIM_ROOT}/src/models/FGModel.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/FGOutput_fixed.cpp
    ${JSBSIM_ROOT}/src/models/FGPropagate.cpp
    ${JSBSIM_ROOT}/src/models/FGPropulsion.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/FGInput_fixed.cpp
    ${JSBSIM_ROOT}/src/models/FGExternalReactions.cpp
    ${JSBSIM_ROOT}/src/models/FGExternalForce.cpp
    ${JSBSIM_ROOT}/src/models/FGBuoyantForces.cpp
    ${JSBSIM_ROOT}/src/models/FGGasCell.cpp
    ${JSBSIM_ROOT}/src/models/FGAccelerations.cpp
    ${JSBSIM_ROOT}/src/models/FGSurface.cpp

    # Input/Output (excluding socket-related files for WebAssembly)
    ${JSBSIM_ROOT}/src/input_output/FGGroundCallback.cpp
    ${JSBSIM_ROOT}/src/input_output/FGPropertyManager.cpp
    ${JSBSIM_ROOT}/src/input_output/FGScript.cpp
    ${JSBSIM_ROOT}/src/input_output/FGXMLElement.cpp
    ${JSBSIM_ROOT}/src/input_output/FGXMLParse.cpp
    ${JSBSIM_ROOT}/src/input_output/FGXMLFileRead.cpp
    ${JSBSIM_ROOT}/src/input_output/string_utilities.cpp
    ${JSBSIM_ROOT}/src/input_output/FGOutputType.cpp
    ${JSBSIM_ROOT}/src/input_output/FGOutputFile.cpp
    ${JSBSIM_ROOT}/src/input_output/FGOutputTextFile.cpp
    ${JSBSIM_ROOT}/src/input_output/FGPropertyReader.cpp
    ${JSBSIM_ROOT}/src/input_output/FGModelLoader.cpp
    ${JSBSIM_ROOT}/src/input_output/FGInputType.cpp

    # Math
    ${JSBSIM_ROOT}/src/math/FGColumnVector3.cpp
    ${JSBSIM_ROOT}/src/math/FGFunction.cpp
    ${JSBSIM_ROOT}/src/math/FGLocation.cpp
    ${JSBSIM_ROOT}/src/math/FGMatrix33.cpp
    ${JSBSIM_ROOT}/src/math/FGPropertyValue.cpp
    ${JSBSIM_ROOT}/src/math/FGQuaternion.cpp
    ${JSBSIM_ROOT}/src/math/FGRealValue.cpp
    ${JSBSIM_ROOT}/src/math/FGTable.cpp
    ${JSBSIM_ROOT}/src/math/FGCondition.cpp
    ${JSBSIM_ROOT}/src/math/FGRungeKutta.cpp
    ${JSBSIM_ROOT}/src/math/FGModelFunctions.cpp
    ${JSBSIM_ROOT}/src/math/FGNelderMead.cpp
    ${JSBSIM_ROOT}/src/math/FGStateSpace.cpp
    ${JSBSIM_ROOT}/src/math/FGTemplateFunc.cpp

    # SimGear
    ${JSBSIM_ROOT}/src/simgear/props/props.cxx
    ${JSBSIM_ROOT}/src/simgear/xml/xmlparse.c
    ${JSBSIM_ROOT}/src/simgear/xml/xmltok.c
    ${JSBSIM_ROOT}/src/simgear/xml/xmlrole.c
    ${JSBSIM_ROOT}/src/simgear/xml/easyxml.cxx
    ${JSBSIM_ROOT}/src/simgear/magvar/coremag.cxx
    ${JSBSIM_ROOT}/src/simgear/misc/sg_path.cxx
    ${JSBSIM_ROOT}/src/simgear/io/iostreams/sgstream.cxx
    ${CMAKE_CURRENT_SOURCE_DIR}/src/strutils_fixed.cxx

    # Logging
    ${JSBSIM_ROOT}/src/input_output/FGLog.cpp

    # MSIS atmosphere model
    ${JSBSIM_ROOT}/src/models/atmosphere/MSIS/nrlmsise-00.c
    ${JSBSIM_ROOT}/src/models/atmosphere/MSIS/nrlmsise-00_data.c

    # GeographicLib
    ${JSBSIM_ROOT}/src/GeographicLib/Math.cpp
    ${JSBSIM_ROOT}/src/GeographicLib/Geodesic.cpp
    ${JSBSIM_ROOT}/src/GeographicLib/GeodesicLine.cpp
)

# Check which files actually exist
set(JSBSIM_SOURCES "")
foreach(SOURCE_FILE ${JSBSIM_CORE_SOURCES})
    if(EXISTS ${SOURCE_FILE})
        list(APPEND JSBSIM_SOURCES ${SOURCE_FILE})
    else()
        message(STATUS "Source file not found: ${SOURCE_FILE}")
    endif()
endforeach()

# Print source files for debugging
list(LENGTH JSBSIM_SOURCES JSBSIM_SOURCES_COUNT)
message(STATUS "Total JSBSim source files: ${JSBSIM_SOURCES_COUNT}")

# Add the C++ binding source file
set(BINDING_SOURCES
    ${CMAKE_CURRENT_SOURCE_DIR}/src/jsbsim_binding.cpp
)

# Create the WebAssembly library
add_executable(jsbsim_wasm ${JSBSIM_SOURCES} ${BINDING_SOURCES})

# Emscripten-specific settings
set_target_properties(jsbsim_wasm PROPERTIES
    SUFFIX ".js"
    OUTPUT_NAME "jsbsim"
)

# Emscripten compile flags
target_compile_options(jsbsim_wasm PRIVATE
    -O3
    -fexceptions
    -DEMSCRIPTEN
)

# Emscripten link flags
target_link_options(jsbsim_wasm PRIVATE
    "SHELL:-O3"
    "SHELL:-s WASM=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s EXPORT_NAME=JSBSimModule"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s DISABLE_EXCEPTION_CATCHING=0"
    "SHELL:-s EXCEPTION_CATCHING_ALLOWED=['*']"
    "SHELL:-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','addFunction','removeFunction','getValue','setValue','UTF8ToString','stringToUTF8']"
    "SHELL:--bind"
    "SHELL:--pre-js ${CMAKE_CURRENT_SOURCE_DIR}/src/pre.js"
    "SHELL:--preload-file ${JSBSIM_ROOT}/aircraft@/aircraft"
    "SHELL:--preload-file ${JSBSIM_ROOT}/engine@/engine"
    "SHELL:--preload-file ${JSBSIM_ROOT}/systems@/systems"
)

# Set output directory
set_target_properties(jsbsim_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/dist
)