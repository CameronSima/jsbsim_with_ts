cmake_minimum_required(VERSION 3.20)
project(JSBSimJS)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find Emscripten
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This CMakeLists.txt is designed for Emscripten builds only. Use: emcmake cmake ...")
endif()

# Include JSBSim source directories
set(JSBSIM_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/..)
include_directories(${JSBSIM_ROOT}/src)

# Collect JSBSim source files
file(GLOB_RECURSE JSBSIM_SOURCES
    ${JSBSIM_ROOT}/src/*.cpp
    ${JSBSIM_ROOT}/src/*.c
)

# Remove the main JSBSim.cpp file as we'll create our own entry point
list(FILTER JSBSIM_SOURCES EXCLUDE REGEX ".*JSBSim\\.cpp$")
list(FILTER JSBSIM_SOURCES EXCLUDE REGEX ".*JSBSim\\.minimal\\.cpp$")

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
    -O3
    -s WASM=1
    -s EXPORT_ES6=1
    -s MODULARIZE=1
    -s EXPORT_NAME="JSBSimModule"
    -s ALLOW_MEMORY_GROWTH=1
    -s DISABLE_EXCEPTION_CATCHING=0
    -s EXCEPTION_CATCHING_ALLOWED=['*']
    -s EXPORTED_FUNCTIONS=['_malloc','_free']
    -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','addFunction','removeFunction','getValue','setValue','UTF8ToString','stringToUTF8']
    --bind
    --pre-js ${CMAKE_CURRENT_SOURCE_DIR}/src/pre.js
)

# Set output directory
set_target_properties(jsbsim_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/dist
)