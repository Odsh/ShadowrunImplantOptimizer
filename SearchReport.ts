/// <reference path="Essence.ts" />
/// <reference path="OptimizationResult.ts" />


enum searchReportEnum {
    ABORTED = 0,
    SUCCESS = 1,
    FINISHED = 2
}

class SearchReport {
    depth: number;
    milliseconds: number;
    cost: number;
    essence: EssenceLoss;
    status: searchReportEnum;
    alternativeSolutionsExplored: number;
    alternativeFailuresExplored: number;

    constructor(depth: number, milliseconds: number, cost: number, essence: EssenceLoss, status: searchReportEnum, alternativeSolutionsExplored: number, alternativeFailuresExplored: number) {
        this.depth = depth;
        this.milliseconds = milliseconds;
        this.cost = cost;
        this.essence = essence;
        this.status = status;
        this.alternativeSolutionsExplored = alternativeSolutionsExplored;
        this.alternativeFailuresExplored = alternativeFailuresExplored;
    }
}