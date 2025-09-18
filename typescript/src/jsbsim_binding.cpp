/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

 Module:       jsbsim_binding.cpp
 Author:       JSBSim Development Team
 Date started: 2024
 Purpose:      JavaScript/WebAssembly bindings for JSBSim using Emscripten

 ------------- Copyright (C) 2024  JSBSim Development Team  -----------------

 This program is free software; you can redistribute it and/or modify it under
 the terms of the GNU Lesser General Public License as published by the Free
 Software Foundation; either version 2 of the License, or (at your option) any
 later version.

 This program is distributed in the hope that it will be useful, but WITHOUT
 ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 details.

 You should have received a copy of the GNU Lesser General Public License along
 with this program; if not, write to the Free Software Foundation, Inc., 59
 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <memory>
#include <vector>
#include <string>

// JSBSim includes
#include "FGFDMExec.h"
#include "FGJSBBase.h"
#include "initialization/FGInitialCondition.h"
#include "initialization/FGLinearization.h"
#include "input_output/FGPropertyManager.h"
#include "models/FGPropagate.h"
#include "models/FGPropulsion.h"
#include "models/FGAerodynamics.h"
#include "models/FGAircraft.h"
#include "models/FGAtmosphere.h"
#include "models/FGAuxiliary.h"
#include "models/FGGroundReactions.h"
#include "models/FGMassBalance.h"
#include "models/propulsion/FGEngine.h"
#include "models/FGLGear.h"
#include "math/FGColumnVector3.h"
#include "math/FGMatrix33.h"

using namespace emscripten;
using namespace JSBSim;

// Wrapper classes to match Python API structure

class JSBSimColumnVector3 {
public:
    JSBSimColumnVector3(const FGColumnVector3& vec) : vec_(vec) {}

    double getEntry(int idx) const {
        return vec_.Entry(idx);
    }

    val toArray() const {
        val array = val::array();
        array.set(0, vec_.Entry(1));
        array.set(1, vec_.Entry(2));
        array.set(2, vec_.Entry(3));
        return array;
    }

private:
    FGColumnVector3 vec_;
};

class JSBSimMatrix33 {
public:
    JSBSimMatrix33(const FGMatrix33& mat) : mat_(mat) {}

    double getEntry(int row, int col) const {
        return mat_.Entry(row, col);
    }

    val toArray() const {
        val array = val::array();
        for (int i = 1; i <= 3; i++) {
            val row = val::array();
            for (int j = 1; j <= 3; j++) {
                row.set(j-1, mat_.Entry(i, j));
            }
            array.set(i-1, row);
        }
        return array;
    }

private:
    FGMatrix33 mat_;
};

class JSBSimPropertyManager {
public:
    JSBSimPropertyManager(std::shared_ptr<FGPropertyManager> pm) : pm_(pm) {}

    bool hasNode(const std::string& path) const {
        return pm_->HasNode(path);
    }

private:
    std::shared_ptr<FGPropertyManager> pm_;
};

class JSBSimInitialCondition {
public:
    JSBSimInitialCondition(std::shared_ptr<FGInitialCondition> ic) : ic_(ic) {}

    bool load(const std::string& rstfile, bool useAircraftPath) {
        SGPath path(rstfile);
        return ic_->Load(path, useAircraftPath);
    }

private:
    std::shared_ptr<FGInitialCondition> ic_;
};

class JSBSimPropagate {
public:
    JSBSimPropagate(std::shared_ptr<FGPropagate> prop) : prop_(prop) {}

    JSBSimMatrix33 getTl2b() const {
        return JSBSimMatrix33(prop_->GetTl2b());
    }

    JSBSimMatrix33 getTec2b() const {
        return JSBSimMatrix33(prop_->GetTec2b());
    }

    JSBSimColumnVector3 getUVW() const {
        return JSBSimColumnVector3(prop_->GetUVW());
    }

private:
    std::shared_ptr<FGPropagate> prop_;
};

class JSBSimEngine {
public:
    JSBSimEngine(std::shared_ptr<FGEngine> engine) : engine_(engine) {}

    int initRunning() {
        return engine_->InitRunning();
    }

private:
    std::shared_ptr<FGEngine> engine_;
};

class JSBSimPropulsion {
public:
    JSBSimPropulsion(std::shared_ptr<FGPropulsion> prop) : prop_(prop) {}

    void initRunning(int n) {
        prop_->InitRunning(n);
    }

    int getNumEngines() const {
        return prop_->GetNumEngines();
    }

    JSBSimEngine getEngine(int idx) {
        return JSBSimEngine(prop_->GetEngine(idx));
    }

    bool getSteadyState() const {
        return prop_->GetSteadyState();
    }

private:
    std::shared_ptr<FGPropulsion> prop_;
};

class JSBSimAerodynamics {
public:
    JSBSimAerodynamics(std::shared_ptr<FGAerodynamics> aero) : aero_(aero) {}

    JSBSimColumnVector3 getMomentsMRC() const {
        return JSBSimColumnVector3(aero_->GetMomentsMRC());
    }

    JSBSimColumnVector3 getForces() const {
        return JSBSimColumnVector3(aero_->GetForces());
    }

private:
    std::shared_ptr<FGAerodynamics> aero_;
};

class JSBSimAircraft {
public:
    JSBSimAircraft(std::shared_ptr<FGAircraft> aircraft) : aircraft_(aircraft) {}

    std::string getAircraftName() const {
        return aircraft_->GetAircraftName();
    }

    JSBSimColumnVector3 getXYZrp() const {
        return JSBSimColumnVector3(aircraft_->GetXYZrp());
    }

private:
    std::shared_ptr<FGAircraft> aircraft_;
};

class JSBSimAtmosphere {
public:
    JSBSimAtmosphere(std::shared_ptr<FGAtmosphere> atmo) : atmo_(atmo) {}

    double getTemperature(double h) const {
        return atmo_->GetTemperature(h);
    }

    void setTemperature(double t, double h, int unit) {
        atmo_->SetTemperature(t, h, static_cast<FGAtmosphere::eTemperature>(unit));
    }

    void setPressureSL(int unit, double pressure) {
        atmo_->SetPressureSL(static_cast<FGAtmosphere::ePressure>(unit), pressure);
    }

private:
    std::shared_ptr<FGAtmosphere> atmo_;
};

class JSBSimAuxiliary {
public:
    JSBSimAuxiliary(std::shared_ptr<FGAuxiliary> aux) : aux_(aux) {}

    JSBSimMatrix33 getTw2b() const {
        return JSBSimMatrix33(aux_->GetTw2b());
    }

    JSBSimMatrix33 getTb2w() const {
        return JSBSimMatrix33(aux_->GetTb2w());
    }

private:
    std::shared_ptr<FGAuxiliary> aux_;
};

class JSBSimLGear {
public:
    JSBSimLGear(std::shared_ptr<FGLGear> gear) : gear_(gear) {}

    double getSteerNorm() const {
        return gear_->GetSteerNorm();
    }

    double getBodyXForce() const {
        return gear_->GetBodyXForce();
    }

    double getBodyYForce() const {
        return gear_->GetBodyYForce();
    }

    double getBodyZForce() const {
        return gear_->GetBodyZForce();
    }

    JSBSimColumnVector3 getLocation() const {
        return JSBSimColumnVector3(gear_->GetLocation());
    }

    JSBSimColumnVector3 getActingLocation() const {
        return JSBSimColumnVector3(gear_->GetActingLocation());
    }

private:
    std::shared_ptr<FGLGear> gear_;
};

class JSBSimGroundReactions {
public:
    JSBSimGroundReactions(std::shared_ptr<FGGroundReactions> gr) : gr_(gr) {}

    JSBSimLGear getGearUnit(int gear) {
        return JSBSimLGear(gr_->GetGearUnit(gear));
    }

    int getNumGearUnits() const {
        return gr_->GetNumGearUnits();
    }

private:
    std::shared_ptr<FGGroundReactions> gr_;
};

class JSBSimMassBalance {
public:
    JSBSimMassBalance(std::shared_ptr<FGMassBalance> mb) : mb_(mb) {}

    JSBSimColumnVector3 getXYZcg() const {
        return JSBSimColumnVector3(mb_->GetXYZcg());
    }

    JSBSimMatrix33 getJ() const {
        return JSBSimMatrix33(mb_->GetJ());
    }

    JSBSimMatrix33 getJinv() const {
        return JSBSimMatrix33(mb_->GetJinv());
    }

private:
    std::shared_ptr<FGMassBalance> mb_;
};

class JSBSimLinearization {
public:
    JSBSimLinearization(FGFDMExec* fdmex) {
        lin_ = std::make_shared<FGLinearization>(fdmex);
    }

    void writeScicoslab() const {
        lin_->WriteScicoslab();
    }

    void writeScicoslabWithPath(std::string path) const {
        lin_->WriteScicoslab(path);
    }

    val getSystemMatrix() const {
        auto& matrix = lin_->GetSystemMatrix();
        val result = val::array();
        for (size_t i = 0; i < matrix.size(); ++i) {
            val row = val::array();
            for (size_t j = 0; j < matrix[i].size(); ++j) {
                row.set(j, matrix[i][j]);
            }
            result.set(i, row);
        }
        return result;
    }

    val getInputMatrix() const {
        auto& matrix = lin_->GetInputMatrix();
        val result = val::array();
        for (size_t i = 0; i < matrix.size(); ++i) {
            val row = val::array();
            for (size_t j = 0; j < matrix[i].size(); ++j) {
                row.set(j, matrix[i][j]);
            }
            result.set(i, row);
        }
        return result;
    }

    val getOutputMatrix() const {
        auto& matrix = lin_->GetOutputMatrix();
        val result = val::array();
        for (size_t i = 0; i < matrix.size(); ++i) {
            val row = val::array();
            for (size_t j = 0; j < matrix[i].size(); ++j) {
                row.set(j, matrix[i][j]);
            }
            result.set(i, row);
        }
        return result;
    }

private:
    std::shared_ptr<FGLinearization> lin_;
};

class JSBSimJSBBase {
public:
    JSBSimJSBBase() {
        base_ = std::make_shared<FGJSBBase>();
    }

    JSBSimJSBBase(std::shared_ptr<FGJSBBase> base) : base_(base) {}

    std::string getVersion() const {
        return base_->GetVersion();
    }

    void disableHighlighting() {
        base_->disableHighLighting();
    }

    int getDebugLevel() const {
        return base_->debug_lvl;
    }

    void setDebugLevel(int level) {
        base_->debug_lvl = level;
    }

private:
    std::shared_ptr<FGJSBBase> base_;
};

class JSBSimFDMExec : public JSBSimJSBBase {
public:
    JSBSimFDMExec(const std::string& root_dir = "") {
        fdm_ = std::make_shared<FGFDMExec>();
        // Skip root directory setup for now due to missing SimGear dependencies
    }

    bool run() {
        return fdm_->Run();
    }

    bool runIC() {
        return fdm_->RunIC();
    }

    bool loadModel(const std::string& model, bool add_model_to_path = true) {
        return fdm_->LoadModel(model, add_model_to_path);
    }

    bool loadScript(const std::string& script, double delta_t = 0.0, const std::string& initfile = "") {
        SGPath scriptPath(script);
        SGPath initPath(initfile);
        return fdm_->LoadScript(scriptPath, delta_t, initPath);
    }

    bool setEnginePath(const std::string& path) {
        SGPath enginePath(path);
        return fdm_->SetEnginePath(enginePath);
    }

    bool setAircraftPath(const std::string& path) {
        SGPath aircraftPath(path);
        return fdm_->SetAircraftPath(aircraftPath);
    }

    bool setSystemsPath(const std::string& path) {
        SGPath systemsPath(path);
        return fdm_->SetSystemsPath(systemsPath);
    }

    bool setOutputPath(const std::string& path) {
        SGPath outputPath(path);
        return fdm_->SetOutputPath(outputPath);
    }

    void setRootDir(const std::string& path) {
        SGPath rootPath(path);
        fdm_->SetRootDir(rootPath);
    }

    std::string getEnginePath() const {
        return fdm_->GetEnginePath().utf8Str();
    }

    std::string getAircraftPath() const {
        return fdm_->GetAircraftPath().utf8Str();
    }

    std::string getSystemsPath() const {
        return fdm_->GetSystemsPath().utf8Str();
    }

    std::string getOutputPath() const {
        return fdm_->GetOutputPath().utf8Str();
    }

    std::string getRootDir() const {
        return fdm_->GetRootDir().utf8Str();
    }

    double getPropertyValue(const std::string& property) {
        return fdm_->GetPropertyValue(property);
    }

    void setPropertyValue(const std::string& property, double value) {
        fdm_->SetPropertyValue(property, value);
    }

    std::string getModelName() const {
        return fdm_->GetModelName();
    }

    bool setOutputDirectives(const std::string& fname) {
        SGPath path(fname);
        return fdm_->SetOutputDirectives(path);
    }

    void setLoggingRate(double rate) {
        fdm_->SetLoggingRate(rate);
    }

    bool setOutputFileName(int n, const std::string& fname) {
        return fdm_->SetOutputFileName(n, fname);
    }

    std::string getOutputFileName(int n) const {
        return fdm_->GetOutputFileName(n);
    }

    void doTrim(int mode) {
        fdm_->DoTrim(mode);
    }

    void disableOutput() {
        fdm_->DisableOutput();
    }

    void enableOutput() {
        fdm_->EnableOutput();
    }

    void hold() {
        fdm_->Hold();
    }

    void resume() {
        fdm_->Resume();
    }

    bool holding() const {
        return fdm_->Holding();
    }

    void resetToInitialConditions(int mode = 0) {
        fdm_->ResetToInitialConditions(mode);
    }

    std::string queryPropertyCatalog(const std::string& check) const {
        return fdm_->QueryPropertyCatalog(check);
    }

    void printPropertyCatalog() {
        fdm_->PrintPropertyCatalog();
    }

    void printSimulationConfiguration() {
        fdm_->PrintSimulationConfiguration();
    }

    void setTrimStatus(bool status) {
        fdm_->SetTrimStatus(status);
    }

    bool getTrimStatus() const {
        return fdm_->GetTrimStatus();
    }

    std::string getPropulsionTankReport() const {
        return fdm_->GetPropulsionTankReport();
    }

    double getSimTime() const {
        return fdm_->GetSimTime();
    }

    double getDeltaT() const {
        return fdm_->GetDeltaT();
    }

    void suspendIntegration() {
        fdm_->SuspendIntegration();
    }

    void resumeIntegration() {
        fdm_->ResumeIntegration();
    }

    bool integrationSuspended() const {
        return fdm_->IntegrationSuspended();
    }

    bool setSimTime(double cur_time) {
        return fdm_->Setsim_time(cur_time);
    }

    void setDt(double delta_t) {
        fdm_->Setdt(delta_t);
    }

    double incrTime() {
        return fdm_->IncrTime();
    }

    JSBSimPropulsion getPropulsion() {
        return JSBSimPropulsion(fdm_->GetPropulsion());
    }

    JSBSimInitialCondition getIC() {
        return JSBSimInitialCondition(fdm_->GetIC());
    }

    JSBSimPropagate getPropagate() {
        return JSBSimPropagate(fdm_->GetPropagate());
    }

    JSBSimPropertyManager getPropertyManager() {
        return JSBSimPropertyManager(fdm_->GetPropertyManager());
    }

    JSBSimGroundReactions getGroundReactions() {
        return JSBSimGroundReactions(fdm_->GetGroundReactions());
    }

    JSBSimAuxiliary getAuxiliary() {
        return JSBSimAuxiliary(fdm_->GetAuxiliary());
    }

    JSBSimAerodynamics getAerodynamics() {
        return JSBSimAerodynamics(fdm_->GetAerodynamics());
    }

    JSBSimAircraft getAircraft() {
        return JSBSimAircraft(fdm_->GetAircraft());
    }

    JSBSimAtmosphere getAtmosphere() {
        return JSBSimAtmosphere(fdm_->GetAtmosphere());
    }

    JSBSimMassBalance getMassBalance() {
        return JSBSimMassBalance(fdm_->GetMassBalance());
    }

    JSBSimLinearization getLinearization() {
        return JSBSimLinearization(fdm_.get());
    }

private:
    std::shared_ptr<FGFDMExec> fdm_;
};

// Emscripten bindings
EMSCRIPTEN_BINDINGS(jsbsim) {
    // Base classes
    class_<JSBSimJSBBase>("FGJSBBase")
        .constructor<>()
        .function("getVersion", &JSBSimJSBBase::getVersion)
        .function("disableHighlighting", &JSBSimJSBBase::disableHighlighting)
        .function("getDebugLevel", &JSBSimJSBBase::getDebugLevel)
        .function("setDebugLevel", &JSBSimJSBBase::setDebugLevel);

    // Vector and Matrix classes
    class_<JSBSimColumnVector3>("FGColumnVector3")
        .function("getEntry", &JSBSimColumnVector3::getEntry)
        .function("toArray", &JSBSimColumnVector3::toArray);

    class_<JSBSimMatrix33>("FGMatrix33")
        .function("getEntry", &JSBSimMatrix33::getEntry)
        .function("toArray", &JSBSimMatrix33::toArray);

    // Property Manager
    class_<JSBSimPropertyManager>("FGPropertyManager")
        .function("hasNode", &JSBSimPropertyManager::hasNode);

    // Initial Conditions
    class_<JSBSimInitialCondition>("FGInitialCondition")
        .function("load", &JSBSimInitialCondition::load);

    // Models
    class_<JSBSimPropagate>("FGPropagate")
        .function("getTl2b", &JSBSimPropagate::getTl2b)
        .function("getTec2b", &JSBSimPropagate::getTec2b)
        .function("getUVW", &JSBSimPropagate::getUVW);

    class_<JSBSimEngine>("FGEngine")
        .function("initRunning", &JSBSimEngine::initRunning);

    class_<JSBSimPropulsion>("FGPropulsion")
        .function("initRunning", &JSBSimPropulsion::initRunning)
        .function("getNumEngines", &JSBSimPropulsion::getNumEngines)
        .function("getEngine", &JSBSimPropulsion::getEngine)
        .function("getSteadyState", &JSBSimPropulsion::getSteadyState);

    class_<JSBSimAerodynamics>("FGAerodynamics")
        .function("getMomentsMRC", &JSBSimAerodynamics::getMomentsMRC)
        .function("getForces", &JSBSimAerodynamics::getForces);

    class_<JSBSimAircraft>("FGAircraft")
        .function("getAircraftName", &JSBSimAircraft::getAircraftName)
        .function("getXYZrp", &JSBSimAircraft::getXYZrp);

    class_<JSBSimAtmosphere>("FGAtmosphere")
        .function("getTemperature", &JSBSimAtmosphere::getTemperature)
        .function("setTemperature", &JSBSimAtmosphere::setTemperature)
        .function("setPressureSL", &JSBSimAtmosphere::setPressureSL);

    class_<JSBSimAuxiliary>("FGAuxiliary")
        .function("getTw2b", &JSBSimAuxiliary::getTw2b)
        .function("getTb2w", &JSBSimAuxiliary::getTb2w);

    class_<JSBSimLGear>("FGLGear")
        .function("getSteerNorm", &JSBSimLGear::getSteerNorm)
        .function("getBodyXForce", &JSBSimLGear::getBodyXForce)
        .function("getBodyYForce", &JSBSimLGear::getBodyYForce)
        .function("getBodyZForce", &JSBSimLGear::getBodyZForce)
        .function("getLocation", &JSBSimLGear::getLocation)
        .function("getActingLocation", &JSBSimLGear::getActingLocation);

    class_<JSBSimGroundReactions>("FGGroundReactions")
        .function("getGearUnit", &JSBSimGroundReactions::getGearUnit)
        .function("getNumGearUnits", &JSBSimGroundReactions::getNumGearUnits);

    class_<JSBSimMassBalance>("FGMassBalance")
        .function("getXYZcg", &JSBSimMassBalance::getXYZcg)
        .function("getJ", &JSBSimMassBalance::getJ)
        .function("getJinv", &JSBSimMassBalance::getJinv);

    class_<JSBSimLinearization>("FGLinearization")
        .function("writeScicoslab", &JSBSimLinearization::writeScicoslab)
        .function("writeScicoslabWithPath", &JSBSimLinearization::writeScicoslabWithPath)
        .function("getSystemMatrix", &JSBSimLinearization::getSystemMatrix)
        .function("getInputMatrix", &JSBSimLinearization::getInputMatrix)
        .function("getOutputMatrix", &JSBSimLinearization::getOutputMatrix);

    // Main FDM Executive
    class_<JSBSimFDMExec, base<JSBSimJSBBase>>("FGFDMExec")
        .constructor<>()
        .constructor<const std::string&>()
        .function("run", &JSBSimFDMExec::run)
        .function("runIC", &JSBSimFDMExec::runIC)
        .function("loadModel", &JSBSimFDMExec::loadModel)
        .function("loadScript", &JSBSimFDMExec::loadScript)
        .function("setEnginePath", &JSBSimFDMExec::setEnginePath)
        .function("setAircraftPath", &JSBSimFDMExec::setAircraftPath)
        .function("setSystemsPath", &JSBSimFDMExec::setSystemsPath)
        .function("setOutputPath", &JSBSimFDMExec::setOutputPath)
        .function("setRootDir", &JSBSimFDMExec::setRootDir)
        .function("getEnginePath", &JSBSimFDMExec::getEnginePath)
        .function("getAircraftPath", &JSBSimFDMExec::getAircraftPath)
        .function("getSystemsPath", &JSBSimFDMExec::getSystemsPath)
        .function("getOutputPath", &JSBSimFDMExec::getOutputPath)
        .function("getRootDir", &JSBSimFDMExec::getRootDir)
        .function("getPropertyValue", &JSBSimFDMExec::getPropertyValue)
        .function("setPropertyValue", &JSBSimFDMExec::setPropertyValue)
        .function("getModelName", &JSBSimFDMExec::getModelName)
        .function("setOutputDirectives", &JSBSimFDMExec::setOutputDirectives)
        .function("setLoggingRate", &JSBSimFDMExec::setLoggingRate)
        .function("setOutputFileName", &JSBSimFDMExec::setOutputFileName)
        .function("getOutputFileName", &JSBSimFDMExec::getOutputFileName)
        .function("doTrim", &JSBSimFDMExec::doTrim)
        .function("disableOutput", &JSBSimFDMExec::disableOutput)
        .function("enableOutput", &JSBSimFDMExec::enableOutput)
        .function("hold", &JSBSimFDMExec::hold)
        .function("resume", &JSBSimFDMExec::resume)
        .function("holding", &JSBSimFDMExec::holding)
        .function("resetToInitialConditions", &JSBSimFDMExec::resetToInitialConditions)
        .function("queryPropertyCatalog", &JSBSimFDMExec::queryPropertyCatalog)
        .function("printPropertyCatalog", &JSBSimFDMExec::printPropertyCatalog)
        .function("printSimulationConfiguration", &JSBSimFDMExec::printSimulationConfiguration)
        .function("setTrimStatus", &JSBSimFDMExec::setTrimStatus)
        .function("getTrimStatus", &JSBSimFDMExec::getTrimStatus)
        .function("getPropulsionTankReport", &JSBSimFDMExec::getPropulsionTankReport)
        .function("getSimTime", &JSBSimFDMExec::getSimTime)
        .function("getDeltaT", &JSBSimFDMExec::getDeltaT)
        .function("suspendIntegration", &JSBSimFDMExec::suspendIntegration)
        .function("resumeIntegration", &JSBSimFDMExec::resumeIntegration)
        .function("integrationSuspended", &JSBSimFDMExec::integrationSuspended)
        .function("setSimTime", &JSBSimFDMExec::setSimTime)
        .function("setDt", &JSBSimFDMExec::setDt)
        .function("incrTime", &JSBSimFDMExec::incrTime)
        .function("getPropulsion", &JSBSimFDMExec::getPropulsion)
        .function("getIC", &JSBSimFDMExec::getIC)
        .function("getPropagate", &JSBSimFDMExec::getPropagate)
        .function("getPropertyManager", &JSBSimFDMExec::getPropertyManager)
        .function("getGroundReactions", &JSBSimFDMExec::getGroundReactions)
        .function("getAuxiliary", &JSBSimFDMExec::getAuxiliary)
        .function("getAerodynamics", &JSBSimFDMExec::getAerodynamics)
        .function("getAircraft", &JSBSimFDMExec::getAircraft)
        .function("getAtmosphere", &JSBSimFDMExec::getAtmosphere)
        .function("getMassBalance", &JSBSimFDMExec::getMassBalance)
        .function("getLinearization", &JSBSimFDMExec::getLinearization);
}