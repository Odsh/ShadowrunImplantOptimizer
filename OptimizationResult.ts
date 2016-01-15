/// <reference path="CurrentBest.ts" />
/// <reference path="ImplantsOptimizer.ts" />
/// <reference path="Essence.ts" />
/// <reference path="Biocompatibility.ts" />
/// <reference path="SearchReport.ts" />

enum optimizationResultEnum {
    FAILED = 0,
    SUCCESS = 1
}

var standardGrade = "Standard";

interface IOptimizationResult {
    result: optimizationResultEnum;
    cost: number;
    qualityCost: number;
    essenceCost: IEssenceLoss;
    costEfficiencyPercent: number;
    biocompatibility: biocompatibilityEnum;
    withPrototype: boolean;
    withAdapsin: boolean;
    grades: string[];
    searchReports: SearchReport[];
}

class OptimizationResult implements IOptimizationResult {
    result: optimizationResultEnum;
    cost: number;
    essenceCost: IEssenceLoss;
    qualityCost: number;
    costEfficiencyPercent: number;
    biocompatibility: biocompatibilityEnum;
    withPrototype: boolean;
    withAdapsin: boolean;
    grades: string[];
    searchReports: SearchReport[];

    constructor(currentBest: ICurrentBest, searchReports: SearchReport[]) {
        this.searchReports = searchReports;

        if (currentBest == null) {
            this.result = optimizationResultEnum.FAILED;
            return
        }

        this.result = optimizationResultEnum.SUCCESS;
        var config = currentBest.config;
        this.biocompatibility = config.biocompatibility;
        this.withPrototype = config.withPrototype;
        this.withAdapsin = config.withAdapsin;
        this.cost = config.cost;
        this.qualityCost = config.qualityCost;
        this.essenceCost = config.essenceUsed;
        var totalBaseCost = config.implantReferences.totalBaseCost;
        var implants = config.implantReferences.implants;
        if (this.withAdapsin) {
            totalBaseCost -= this.GetAdapsinCost(implants);
        }
        this.costEfficiencyPercent = 100 * config.cost / totalBaseCost;

        var gradeResults: IGradeResult[] = [];
        var upgrades = config.upgrades;
        for (var i = 0; i < upgrades.length; i++) {

            var implantUpgrades = upgrades[i];
            var implant = implants[i];
            for (var j = 0; j < implant.amount; j++) {
                var upgrade = implantUpgrades[j];
                var implantCost = implant.upgrades[upgrade];
                var gradeName = implantCost.gradeName;
                var position = implant.rows[j];
                gradeResults.push(new GradeResult(position, gradeName));
                if (j == 0) {
                    var children = implant.children;
                    for (var k = 0; k < children.length; k++) {
                        var childPosition = children[k].row;
                        gradeResults.push(new GradeResult(childPosition, gradeName));
                    }
                }
            }
        }
        gradeResults.sort(GradeResultComparer);
        this.grades = [];
        for (var i = 0; i < gradeResults.length; i++) {
            var gradeResult = gradeResults[i];
            while (this.grades.length < gradeResult.row) {
                this.grades.push(standardGrade);
            }
            this.grades.push(gradeResult.grade);
        }
    }

    GetAdapsinCost(implants: IImplantReference[]): number {
        for (var i = 0; i < implants.length; i++) {
            var implant = implants[i];
            if (implant.name == "Adapsin") {
                return implant.totalBaseCost;
                break;
            }
        }
    }
}

interface IGradeResult {
    row: number;
    grade: string;
}

class GradeResult implements IGradeResult {
    row: number;
    grade: string;
    constructor(row: number, grade: string) {
        this.row = row;
        this.grade = grade;
    }
}

function GradeResultComparer(result1: IGradeResult, result2: IGradeResult) {
    return result1.row - result2.row;
}

function ResultComparer(result1: IOptimizationResult, result2: IOptimizationResult): number {
    if (result1.result == result2.result) {
        if (result1.result == optimizationResultEnum.FAILED) {
            return 0; // TODO change if filling in other results
        }
        if (result1.cost == result2.cost) {
            if (result1.qualityCost == result2.qualityCost) {
                return result1.essenceCost.numerator - result2.essenceCost.numerator;
            }
            else {
                return result1.qualityCost - result2.qualityCost;
            }
        }
        else {
            return result1.cost - result2.cost;
        }
    }
    else if (result1.result == optimizationResultEnum.SUCCESS) {
        return -10000000;
    }
    else {
        return 10000000;
    }
}
