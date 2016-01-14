/// <reference path="ImplantReferences.ts" />
/// <reference path="ImplantGrade.ts" />
/// <reference path="ImplantsOptimizer.ts" />
/// <reference path="OptimizationResult.ts" />
/// <reference path="Essence.ts" />

function OptimizeGrades(maxSeconds: number, references: IImplantReferences, minEssence: number, maxAvailability: number, allowedGrades: IImplantGrade[], biocompatibilityAllowed: boolean, biocompatibilityCost: number, prototypeAllowed: boolean, prototypeCost: number) {
    references.Initialize();

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
            var opt = new ImplantsOptimizer(references, maxEssenceUsed, biocompatibility, withPrototype, prototypeCost, biocompatibilityCost);
            optimizers.push(opt);
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
