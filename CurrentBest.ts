/// <reference path="Configuration.ts" />
/// <reference path="Essence.ts" />

interface ICurrentBest {
    cost: number;
    essenceCost: IEssenceLoss;
    config: IConfiguration;
}

class CurrentBest implements ICurrentBest {
    cost: number;
    essenceCost: IEssenceLoss;
    config: IConfiguration;
    constructor(config: IConfiguration) {
        this.cost = config.cost;
        this.essenceCost = config.RealEssenceUsed();
        this.config = config;
    }
}
