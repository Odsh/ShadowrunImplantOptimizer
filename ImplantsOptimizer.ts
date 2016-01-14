/// <reference path="CurrentBest.ts" />
/// <reference path="Configuration.ts" />
/// <reference path="ImplantReference.ts" />
/// <reference path="ImplantReferences.ts" />
/// <reference path="BioCompatibility.ts" />
/// <reference path="OptimizationResult.ts" />
/// <reference path="Essence.ts" />
/// <reference path="SortedList.ts" />
/// <reference path="Dictionary.ts" />
/// <reference path="SearchReport.ts" />

interface IImplantsOptimizer {
    implantReferences: IImplantReferences;
    maxEssenceLoss: IEssenceLoss;
    bioCompatibility: biocompatibilityEnum;
    withPrototype: boolean;

    Optimize(maxSeconds: number): IOptimizationResult;
}


class ImplantsOptimizer implements IImplantsOptimizer {
    implantReferences: IImplantReferences;
    maxEssenceLoss: IEssenceLoss;
    bioCompatibility: biocompatibilityEnum;
    withPrototype: boolean;

    prototypeCost: number;
    biocompatibilityCost: number;

    currentBestSolution: ICurrentBest;
    searchReports: SearchReport[];

    startTime: number;
    alternativeSolutionsExplored: number;
    alternativeFailuresExplored: number;

    constructor(implantReferences: IImplantReferences, maxEssenceLoss: IEssenceLoss, bioCompatibility: biocompatibilityEnum, withPrototype: boolean, prototypeCost: number, biocompatibilityCost: number) {
        this.currentBestSolution = null;
        this.implantReferences = implantReferences;
        this.maxEssenceLoss = maxEssenceLoss;
        this.bioCompatibility = bioCompatibility;
        this.withPrototype = withPrototype;
        this.prototypeCost = prototypeCost;
        this.biocompatibilityCost = biocompatibilityCost;
        this.searchReports = [];
        this.alternativeSolutionsExplored = 0;
        this.alternativeFailuresExplored = 0;
    }

    SetBestIfNeeded(config: IConfiguration): boolean {
        var result = false;
        if (this.currentBestSolution == null || this.currentBestSolution.config.Compare(config) > 0) {
            this.currentBestSolution = new CurrentBest(config);
            result = true;
        }
        return result;
    }

    IsSolution(config: IConfiguration): boolean {
        var realEssenceLoss = config.RealEssenceUsed();
        return this.maxEssenceLoss.GreaterOrEqualThan(realEssenceLoss);
    }

    SprintToFirstFringeSolutionWithFixedUpgrades(configuration: IConfiguration, fixed: UpgradeIdentifier[]): IConfiguration {
        var solution = this.SprintToFirstSolutionWithFixedUpgrades(configuration, fixed);
        if (solution == null) {
            return null;
        }
        return this.DownGradeToFirstFringeSolution(solution);
    }

    SprintToFirstSolutionWithFixedUpgrades(configuration: IConfiguration, fixed: UpgradeIdentifier[]): IConfiguration {
        var result = configuration;
        while (!this.IsSolution(result)) {
            var bestUpgrade = result.GetBestUpgradeNotIn(fixed);
            if (bestUpgrade == null) {
                return null;
            }
            result = new Configuration(true, result, bestUpgrade.i, bestUpgrade.j);
        }
        return result;
    }

    DownGradeToFirstFringeSolution(configuration: IConfiguration): IConfiguration {
        var result = configuration;
        while (true) {
            var bestDowngrades = result.GetBestDowngrades();
            var found = false;
            for (var i = 0; i < bestDowngrades.length; i++) {
                var downgrade = bestDowngrades[i];
                var candidateConfiguration = new Configuration(false, result, downgrade.i, downgrade.j);
                if (this.IsSolution(candidateConfiguration)) {
                    result = candidateConfiguration;
                    found = true;
                    break;
                }
            }
            if (!found) {
                break;
            }
        }
        return result;
    }

    ImproveBest(maxSeconds: number): void {
        this.startTime = Date.now();
        this.searchReports.push(new SearchReport(0, Date.now() - this.startTime, this.currentBestSolution.cost, this.currentBestSolution.essenceCost, searchReportEnum.SUCCESS, this.alternativeSolutionsExplored, this.alternativeFailuresExplored));
        var timeLimit = this.startTime + maxSeconds * 1000;
        while (Date.now() < timeLimit && this.ImproveBestOnce(timeLimit)) { }
    }

    ImproveBestOnce(timeLimit: number): boolean {
        var foundSolution = true;
        var lastDepth = 0;
        for (var depth = 0; foundSolution && Date.now() < timeLimit; depth++) {
            lastDepth = depth;
            var improve = this.ImproveBestOnceAtDepth(timeLimit, depth);
            if (improve.bestSolutionImproved) {
                this.searchReports.push(new SearchReport(depth, Date.now() - this.startTime, this.currentBestSolution.cost, this.currentBestSolution.essenceCost, searchReportEnum.SUCCESS, this.alternativeSolutionsExplored, this.alternativeFailuresExplored));
            }
            foundSolution = improve.solutionsFoundAtDepth;
        }
        var searchReportStatus = searchReportEnum.ABORTED;
        if (!foundSolution) {
            searchReportStatus = searchReportEnum.FINISHED;
        }
        this.searchReports.push(new SearchReport(lastDepth, Date.now() - this.startTime, this.currentBestSolution.cost, this.currentBestSolution.essenceCost, searchReportStatus, this.alternativeSolutionsExplored, this.alternativeFailuresExplored));

        return false;
    }

    ImproveBestOnceAtDepth(timeLimit: number, depth: number): ImprovementResult {
        var currentBestConfig = this.currentBestSolution.config;
        var upgradedImplantReferences = currentBestConfig.GetUpgradedImplantReferences();
        var orderedImplantIndexes: number[] = [];
        for (var i = 0; i < upgradedImplantReferences.length; i++) {
            var upgradedImplantReference = upgradedImplantReferences[i];
            orderedImplantIndexes.push(upgradedImplantReference.implantIndex);
        }
        var upgrades = currentBestConfig.upgrades;
        var downgrades: number[][] = [];
        return this.ImproveConfigOnceAtDepth(timeLimit, depth, currentBestConfig, orderedImplantIndexes, [], 0);
    }

    ImproveConfigOnceAtDepth(timeLimit: number, depth: number, config: IConfiguration, orderedImplantIndexes: number[], fixedIndexes: UpgradeIdentifier[], currentIndex: number): ImprovementResult {
        if (depth == 0) {
            return this.ImproveConfigOnce(depth, config, fixedIndexes);
        }
        return this.ImproveConfigOnceAtPositiveDepth(timeLimit, depth, config, orderedImplantIndexes, fixedIndexes, currentIndex);
    }

    ImproveConfigOnceAtPositiveDepth(timeLimit: number, depth: number, config: IConfiguration, orderedImplantIndexes: number[], fixedIndexes: UpgradeIdentifier[], currentIndex: number): ImprovementResult {
        var result = new ImprovementResult(depth);
        var implantIndex = orderedImplantIndexes[currentIndex];
        var upgrades = config.upgrades[implantIndex];
        var previousUpgrade = 0;
        for (var i = upgrades.length - 1; i >= 0 && Date.now() < timeLimit; i--) {
            var upgrade = upgrades[i];
            if (upgrade <= previousUpgrade) {
                continue;
            }
            previousUpgrade = upgrade;
            var downgradedConfig = new Configuration(false, config, implantIndex, i);
            var newFixedIndexes = this.AddToFixedIndexes(fixedIndexes, new UpgradeIdentifier(implantIndex, i));
            var partialResult = this.ImproveConfigOnceAtDepth(timeLimit, depth - 1, downgradedConfig, orderedImplantIndexes, newFixedIndexes, currentIndex);
            this.MergeResults(result, partialResult);
            if (result.bestSolutionImproved) {
                return result;
            }
        }
        if (currentIndex < orderedImplantIndexes.length - 1 && Date.now() < timeLimit) {
            var furtherResult = this.ImproveConfigOnceAtPositiveDepth(timeLimit, depth, config, orderedImplantIndexes, fixedIndexes, currentIndex + 1);
            this.MergeResults(result, furtherResult);
        }
        return result;
    }

    MergeResults(current: ImprovementResult, partial: ImprovementResult): void {
        if (partial.solutionsFoundAtDepth) {
            current.solutionsFoundAtDepth = true;
        }
        if (partial.bestSolutionImproved) {
            current.bestSolutionImproved = true;
        }
    }

    ImproveConfigOnce(depth: number, config: IConfiguration, fixedIndexes: UpgradeIdentifier[]): ImprovementResult {
        var result = new ImprovementResult(depth);
        var newSolution = this.SprintToFirstFringeSolutionWithFixedUpgrades(config, fixedIndexes);
        if (newSolution != null) {
            this.alternativeSolutionsExplored++;
            result.solutionsFoundAtDepth = true;
            result.bestSolutionImproved = this.SetBestIfNeeded(newSolution);

        }
        else {
            this.alternativeFailuresExplored++;
        }
        return result;
    }

    AddToFixedIndexes(fixedIndexes: UpgradeIdentifier[], newFixed: UpgradeIdentifier): UpgradeIdentifier[] {
        var result: UpgradeIdentifier[] = [];
        for (var i = 0; i < fixedIndexes.length; i++) {
            var fixedIndex = fixedIndexes[i];
            if (fixedIndex.i == newFixed.i && fixedIndex.j == newFixed.j) {
                continue;
            }
            result.push(fixedIndex);
        }
        result.push(newFixed);
        return result;
    }

    Optimize(maxSeconds: number): IOptimizationResult {
        var configuration: IConfiguration = new InitialConfiguration(this.implantReferences, this.maxEssenceLoss, this.bioCompatibility, this.withPrototype, this.prototypeCost, this.biocompatibilityCost);
        var solution = this.SprintToFirstFringeSolutionWithFixedUpgrades(configuration, []);
        this.SetBestIfNeeded(solution);
        this.ImproveBest(maxSeconds);
        return new OptimizationResult(this.currentBestSolution, this.searchReports);
    }
}

class ImprovementResult {
    solutionsFoundAtDepth: boolean;
    bestSolutionImproved: boolean;
    depth: number;
    constructor(depth: number) {
        this.solutionsFoundAtDepth = false;
        this.bestSolutionImproved = false;
        this.depth = depth;
    }
}
