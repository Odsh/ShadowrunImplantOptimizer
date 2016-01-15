/// <reference path="OptimizeGrades.ts" />
/// <reference path="ImplantReferences.ts" />
/// <reference path="ImplantReference.ts" />
/// <reference path="AllowedGradesFactory.ts" />
/// <reference path="ImplantGrade.ts" />
/// <reference path="Configuration.ts" />
/// <reference path="ImplantCost.ts" />

function Test1() {
    var result = TestOptimization(0.001, 40, true, true);
}

function TestEssenceCosts(essence: number): IImplantCost[] {
    var allowedGradesFactory = GetAllowedGradesFactory();
    var testCyberImplant = new ImplantReference(1, "Test implant", essence, 0, 1000000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, 0.001, 40);
    testCyberImplant.Initialize();
    var upgrades = testCyberImplant.upgrades;
    return upgrades;
}

function TestGetBestUpgrade() {
    var allowedGradesFactory = GetAllowedGradesFactory();
    var implantReferences = CreateImplantReferences(0.001, 40, allowedGradesFactory);
    var config = new InitialConfiguration(implantReferences, new EssenceLoss(5.99), biocompatibilityEnum.CYBERWARE, false, true, 50000, 25000);
    return config.GetBestUpgradeNotIn([]);
}

function TestOptimization(minEssence: number, maxAvailability: number, biocompatibilityAllowed: boolean, prototypeAllowed: boolean) {
    var allowedGradesFactory = GetAllowedGradesFactory();
    var adapsinImplant = GetAdapsinImplant(minEssence, maxAvailability, allowedGradesFactory);
    var implantReferences = CreateImplantReferences(minEssence, maxAvailability, allowedGradesFactory);
    return OptimizeGrades(5, implantReferences, minEssence, maxAvailability, allowedGrades, biocompatibilityAllowed, 25000, prototypeAllowed, 50000, false, adapsinImplant);
}

function TestOptimizationWithAdapsin(minEssence: number, maxAvailability: number, biocompatibilityAllowed: boolean, prototypeAllowed: boolean) {
    var allowedGradesFactory = GetAllowedGradesFactory();
    var adapsinImplant = GetAdapsinImplant(minEssence, maxAvailability, allowedGradesFactory);
    var implantReferences = CreateImplantReferences(minEssence, maxAvailability, allowedGradesFactory);
    return OptimizeGrades(5, implantReferences, minEssence, maxAvailability, allowedGrades, biocompatibilityAllowed, 25000, prototypeAllowed, 50000, true, adapsinImplant);
}

function TestSimplifiedOptimization(minEssence: number, maxAvailability: number, biocompatibilityAllowed: boolean, prototypeAllowed: boolean) {
    var allowedGradesFactory = GetAllowedGradesFactory();
    var adapsinImplant = GetAdapsinImplant(minEssence, maxAvailability, allowedGradesFactory);
    var implantReferences = CreateSimplifiedImplantReferences(minEssence, maxAvailability, allowedGradesFactory);
    return OptimizeGrades(5, implantReferences, minEssence, maxAvailability, allowedGrades, biocompatibilityAllowed, 25000, prototypeAllowed, 50000, false, adapsinImplant);
}

function CreateSimplifiedImplantReferences(minEssence: number, maxAvailability: number, allowedGradesFactory: IAllowedGradesFactory): IImplantReferences {

    var implantReferences = new ImplantReferences();

    implantReferences.AddImplant(new ImplantReference(0, "Cybereyes", 0.3, 6, 6000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddSubImplant(new SubImplantReference(1, "Cybereyes", 4, 1000));
    implantReferences.AddSubImplant(new SubImplantReference(2, "Cybereyes", 4, 1500));
    implantReferences.AddSubImplant(new SubImplantReference(3, "Cybereyes", 9, 12000));
    implantReferences.AddSubImplant(new SubImplantReference(4, "Cybereyes", 2, 500));

    implantReferences.AddImplant(new ImplantReference(6, "Cyberears", 0.2, 3, 3000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddSubImplant(new SubImplantReference(7, "Cyberears", 4, 1000));
    implantReferences.AddSubImplant(new SubImplantReference(8, "Cyberears", 2, 500));
    implantReferences.AddSubImplant(new SubImplantReference(9, "Cyberears", 2, 500));
    implantReferences.AddSubImplant(new SubImplantReference(10, "Cyberears", 8, 12000));
    implantReferences.AddSubImplant(new SubImplantReference(11, "Cyberears", 6, 500));

    implantReferences.AddImplant(new ImplantReference(13, "Skin toner", 0.5, 4, 2000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(14, "False face", 0.5, 12, 20000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(15, "Voice Modulator", 0.2, 18, 30000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(16, "Tailored pheromones", 0.6, 12, 93000, implantTypesEnum.BIOWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(17, "Fiberoptic hair", 0.1, 0, 100, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(19, "Synaptic booster", 1.5, 18, 285000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(20, "Cerebral booster", 0.6, 18, 94500, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(21, "Cerebellum booster", 0.4, 16, 100000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(23, "PuSHed", 0.1, 14, 62000, implantTypesEnum.GENEWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(24, "Qualia", 0.4, 14, 65000, implantTypesEnum.GENEWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(26, "Implanted cyberdeck", 0.4, 5, 5000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.Initialize();
    return implantReferences;
}

function GetAdapsinImplant(minEssence: number, maxAvailability: number, allowedGradesFactory: IAllowedGradesFactory): IImplantReference {
    return new ImplantReference(44, "Adapsin", 0.2, 16, 30000, implantTypesEnum.GENEWARE, false, allowedGradesFactory, minEssence, maxAvailability);
}

function GetAllowedGradesFactory() {
    return new AllowedGradesFactory(allowedGrades, genewareAllowedGrades, culturedBiowareMinAllowedGrades, usedImplantGrade);
}

function CreateImplantReferences(minEssence: number, maxAvailability: number, allowedGradesFactory: IAllowedGradesFactory): IImplantReferences {

    var implantReferences = new ImplantReferences();

    implantReferences.AddImplant(new ImplantReference(0, "Cybereyes", 0.3, 6, 6000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddSubImplant(new SubImplantReference(1, "Cybereyes", 4, 1000));
    implantReferences.AddSubImplant(new SubImplantReference(2, "Cybereyes", 4, 1500));
    implantReferences.AddSubImplant(new SubImplantReference(3, "Cybereyes", 9, 12000));
    implantReferences.AddSubImplant(new SubImplantReference(4, "Cybereyes", 2, 500));

    implantReferences.AddImplant(new ImplantReference(6, "Cyberears", 0.2, 3, 3000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddSubImplant(new SubImplantReference(7, "Cyberears", 4, 1000));
    implantReferences.AddSubImplant(new SubImplantReference(8, "Cyberears", 2, 500));
    implantReferences.AddSubImplant(new SubImplantReference(9, "Cyberears", 2, 500));
    implantReferences.AddSubImplant(new SubImplantReference(10, "Cyberears", 8, 12000));
    implantReferences.AddSubImplant(new SubImplantReference(11, "Cyberears", 6, 500));

    implantReferences.AddImplant(new ImplantReference(13, "Skin toner", 0.5, 4, 2000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(14, "False face", 0.5, 12, 20000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(15, "Voice Modulator", 0.2, 18, 30000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(16, "Tailored pheromones", 0.6, 12, 93000, implantTypesEnum.BIOWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(17, "Fiberoptic hair", 0.1, 0, 100, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(19, "Synaptic booster", 1.5, 18, 285000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(20, "Cerebral booster", 0.6, 18, 94500, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(21, "Cerebellum booster", 0.4, 16, 100000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(23, "PuSHed", 0.1, 14, 62000, implantTypesEnum.GENEWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(24, "Qualia", 0.4, 14, 65000, implantTypesEnum.GENEWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(26, "Implanted cyberdeck", 0.4, 5, 5000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(27, "Datajack", 0.1, 2, 1000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(28, "Radar sensor", 1, 12, 16000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(29, "Soft nanohive", 0.2, 5, 10000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(30, "Soft nanohive", 0.2, 5, 10000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(32, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(33, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(34, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(35, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(36, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(37, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(38, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(39, "Reflex recorder", 0.1, 10, 14000, implantTypesEnum.BIOWARE, true, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.AddImplant(new ImplantReference(41, "Retractable cyberneedle", 0.05, 8, 1000, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));
    implantReferences.AddImplant(new ImplantReference(42, "Auto-injector expanded reservoir", 0.05, 4, 250, implantTypesEnum.CYBERWARE, false, allowedGradesFactory, minEssence, maxAvailability));

    implantReferences.Initialize();
    return implantReferences;
}
var usedImplantGrade = new ImplantGrade("Used", 1.25, -4, 0.75);
var standardImplantGrade = new ImplantGrade("Standard", 1, 0, 1);
var alphaImplantGrade = new ImplantGrade("Alphaware", 0.8, 2, 1.2);
var betaImplantGrade = new ImplantGrade("Betaware", 0.7, 4, 1.5);
var deltaImplantGrade = new ImplantGrade("Deltaware", 0.5, 8, 2.5);
var allowedGrades: IImplantGrade[] = [usedImplantGrade, standardImplantGrade, alphaImplantGrade, betaImplantGrade, deltaImplantGrade];
var genewareAllowedGrades: IImplantGrade[] = [standardImplantGrade];
var culturedBiowareMinAllowedGrades: IImplantGrade[] = [standardImplantGrade, alphaImplantGrade, betaImplantGrade, deltaImplantGrade];
