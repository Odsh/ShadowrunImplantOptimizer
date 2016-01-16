/// <reference path="ImplantReferences.ts" />
/// <reference path="ImplantGrade.ts" />
/// <reference path="ImplantsOptimizer.ts" />
/// <reference path="OptimizationResult.ts" />
/// <reference path="Essence.ts" />

function OptimizeGrades(maxSeconds: number, references: IImplantReferences, minEssence: number, maxAvailability: number, allowedGrades: IImplantGrade[], biocompatibilityAllowed: boolean, biocompatibilityCost: number, prototypeAllowed: boolean, prototypeCost: number, adapsinAllowed: boolean, adapsinReference: IImplantReference) {

    var referencesWithAdapsin: IImplantReferences;
    var referencesWithoutAdapsin: IImplantReferences;
    if (ContainsAdapsin(references.implants, adapsinReference.name)) {
        referencesWithAdapsin = references;
        referencesWithoutAdapsin = references.CloneWithout(adapsinReference.name);
    }
    else {
        referencesWithoutAdapsin = references;
        referencesWithAdapsin = references.Clone();
        referencesWithAdapsin.AddImplant(adapsinReference);
    }
    referencesWithAdapsin.Initialize();
    referencesWithoutAdapsin.Initialize();

    var maxEssenceUsed = new EssenceLoss(6 - minEssence);

    var biocompatibilities: biocompatibilityEnum[];
    if (biocompatibilityAllowed) {
        biocompatibilities = [biocompatibilityEnum.NONE, biocompatibilityEnum.CYBERWARE, biocompatibilityEnum.BIOWARE];
    }
    else {
        biocompatibilities = [biocompatibilityEnum.NONE];
    }
    var withPrototypes: boolean[];
    if (prototypeAllowed) {
        withPrototypes = [false, true];
    }
    else {
        withPrototypes = [false];
    }

    var optimizers: IImplantsOptimizer[] = [];
    for (var i = 0; i < withPrototypes.length; i++) {
        var withPrototype = withPrototypes[i];
        for (var j = 0; j < biocompatibilities.length; j++) {
            var biocompatibility = biocompatibilities[j];
            var opt = new ImplantsOptimizer(referencesWithoutAdapsin, maxEssenceUsed, biocompatibility, withPrototype, false, prototypeCost, biocompatibilityCost);
            optimizers.push(opt);
            if (adapsinAllowed && adapsinReference.totalBaseAvailability <= maxAvailability) {
                var adapsinOpt = new ImplantsOptimizer(referencesWithAdapsin, maxEssenceUsed, biocompatibility, withPrototype, true, prototypeCost, biocompatibilityCost);
                optimizers.push(adapsinOpt);
            }
        }
    }

    var results: IOptimizationResult[] = [];
    var maxSecondsPerOptimizer = maxSeconds / optimizers.length;
    for (var i = 0; i < optimizers.length; i++) {
        results.push(optimizers[i].Optimize(maxSecondsPerOptimizer));
    }
    results.sort(ResultComparer);
    return results[0];
}

function ContainsAdapsin(implants: IImplantReference[], adapsinName: string): boolean {
    for (var i = 0; i < implants.length; i++) {
        var implant = implants[i];
        if (implant.name == adapsinName) {
            return true;
            break;
        }
    }
    return false;
}