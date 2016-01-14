/// <reference path="ImplantReferences.ts" />
/// <reference path="ImplantReference.ts" />
/// <reference path="ImplantType.ts" />
/// <reference path="Biocompatibility.ts" />
/// <reference path="ImplantCost.ts" />
/// <reference path="CurrentBest.ts" />
/// <reference path="Essence.ts" />
/// <reference path="SortedList.ts" />
/// <reference path="Dictionary.ts" />
/// <reference path="ConfigKey.ts" />
/// <reference path="UpgradedImplantReference.ts" />

class UpgradeIdentifier {
    i: number;
    j: number;
    constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
    }
}

class UpgradeDescription extends UpgradeIdentifier implements IComparable {
    efficiency: number;
    constructor(i: number, j: number, efficiency: number) {
        super(i, j);
        this.efficiency = efficiency;
    }

    Compare(comp: IComparable): number {
        var other = <UpgradeDescription>comp;
        return this.efficiency - other.efficiency;
    }
}

interface IConfiguration extends IComparable {
    implantReferences: IImplantReferences;
    essenceUsed: IEssenceLoss;
    bioEssenceUsed: IEssenceLoss;
    cost: number;
    qualityCost: number;
    biocompatibility: biocompatibilityEnum;
    withPrototype: boolean;
    upgrades: number[][];
    maxEssenceLoss: IEssenceLoss;

    GetBestUpgradeNotIn(excluded: UpgradeIdentifier[]): UpgradeDescription;
    GetBestDowngrades(): UpgradeDescription[];
    RealEssenceUsed(): IEssenceLoss;
    GetUpgradedImplantReferences(): UpgradedImplantReference[];
}

class ConfigurationBase implements IConfiguration {
    implantReferences: IImplantReferences;
    essenceUsed: IEssenceLoss;
    bioEssenceUsed: IEssenceLoss;
    cost: number;
    qualityCost: number;
    biocompatibility: biocompatibilityEnum;
    withPrototype: boolean;
    upgrades: number[][];
    maxUpgradeIndex: number;
    maxEssenceLoss: IEssenceLoss;

    GetUpgradedImplantReferences(): UpgradedImplantReference[] {
        var result: UpgradedImplantReference[] = [];
        for (var i = 0; i < this.implantReferences.implants.length; i++) {
            var implant = this.implantReferences.implants[i];
            var upgrades = this.upgrades[i];
            InsertInSortedList(result, new UpgradedImplantReference(this.biocompatibility, implant, i, upgrades));
        }
        return result;
    }

    GetBestDowngrades(): UpgradeDescription[] {
        var results: UpgradeDescription[] = [];
        for (var i = 0; i < this.upgrades.length; i++) {
            var upgrades = this.upgrades[i];
            var lastUpgrade = 0;
            for (var j = upgrades.length - 1; j >= 0; j--) {
                var upgrade = upgrades[j];
                if (upgrade == lastUpgrade) {
                    continue;
                }
                lastUpgrade = upgrade;

                var implant = this.implantReferences.implants[i];
                if (!implant.CanDowngrade(upgrade)) {
                    continue;
                }
                var upgradeCost = implant.upgrades[upgrade];
                var efficiency = upgradeCost.DownGradeEfficiency(this.biocompatibility);
                var result = new UpgradeDescription(i, j, efficiency);
                InsertInSortedList(results, result);
            }
        }
        return results;
    }

    GetBestUpgradeNotIn(excluded: UpgradeIdentifier[]): UpgradeDescription {
        var result: UpgradeDescription = null;
        var resultEfficiency = 0;
        var maxEssenceGain = this.RealEssenceUsed().Subtract(this.maxEssenceLoss);
        var maxBioEssenceGain = maxEssenceGain;
        if (this.withPrototype) {
            maxBioEssenceGain = maxBioEssenceGain.Minimum(this.bioEssenceUsed.Subtract(oneEssence).Maximum(zeroEssence));
        }
        for (var i = 0; i < this.upgrades.length; i++) {
            var upgrades = this.upgrades[i];
            var lastUpgrade = 1000000;
            for (var j = 0; j < upgrades.length; j++) {
                if (lastUpgrade == 0) {
                    break;
                }
                var upgrade = upgrades[j];
                if (upgrade == lastUpgrade) {
                    continue;
                }
                lastUpgrade = upgrade;

                var isExcluded = false;
                for (var k = 0; k < excluded.length; k++) {
                    var ex = excluded[k];
                    if (i == ex.i && j == ex.j) {
                        isExcluded = true;
                        break;
                    }
                }
                if (isExcluded) {
                    continue;
                }

                var implant = this.implantReferences.implants[i];
                if (!implant.CanUpgrade(upgrade)) {
                    continue;
                }
                var nextUpgradeCost = implant.upgrades[upgrade + 1];
                var efficiency = nextUpgradeCost.Efficiency(this.biocompatibility, maxEssenceGain, maxBioEssenceGain);
                if (efficiency > resultEfficiency) {
                    resultEfficiency = efficiency;
                    result = new UpgradeDescription(i, j, efficiency);
                }
            }
        }
        return result;
    }

    RealEssenceUsed(): IEssenceLoss {
        var result = this.essenceUsed;
        if (this.withPrototype) {
            result = result.Subtract(this.bioEssenceUsed.Minimum(oneEssence));
        }
        return result;
    }

    Compare(otherComparable: IComparable): number {
        var a = this;
        var b: IConfiguration = <IConfiguration>otherComparable;

        var result = a.cost - b.cost;
        if (result == 0) {
            result = a.qualityCost - b.qualityCost;
        }
        if (result == 0) {
            result = a.RealEssenceUsed().numerator - b.RealEssenceUsed().numerator;
        }
        return result;
    }
}

class Configuration extends ConfigurationBase {

    constructor(upgrade: boolean, configuration: IConfiguration, indexToUpgrade: number, subIndexToUpgrade: number) {
        super();
        this.implantReferences = configuration.implantReferences;
        this.essenceUsed = configuration.essenceUsed;
        this.bioEssenceUsed = configuration.bioEssenceUsed;
        this.cost = configuration.cost;
        this.biocompatibility = configuration.biocompatibility;
        this.withPrototype = configuration.withPrototype;
        this.qualityCost = configuration.qualityCost;
        this.maxEssenceLoss = configuration.maxEssenceLoss;

        var sourceUpgrades = configuration.upgrades;
        this.upgrades = [];
        for (var i = 0; i < sourceUpgrades.length; i++) {
            var sourceUpgrade = sourceUpgrades[i];
            var targetUpgrade: number[] = [];
            for (var j = 0; j < sourceUpgrade.length; j++) {
                targetUpgrade.push(sourceUpgrade[j]);
            }
            this.upgrades.push(targetUpgrade);
        }
        this.maxUpgradeIndex = this.upgrades.length - 1;

        if (upgrade) {
            this.upgrades[indexToUpgrade][subIndexToUpgrade]++;
        }
        else {
            this.upgrades[indexToUpgrade][subIndexToUpgrade]--;
        }
        UpdateConfiguration(upgrade, this, indexToUpgrade, subIndexToUpgrade);
    }
}

class InitialConfiguration extends ConfigurationBase {

    constructor(implantReferences: IImplantReferences, maxEssenceLoss: IEssenceLoss, bioCompatibility: biocompatibilityEnum, withPrototype: boolean, prototypeCost: number, biocompatibilityCost: number) {
        super();
        this.implantReferences = implantReferences;
        this.essenceUsed = new EssenceLoss(0);
        this.bioEssenceUsed = new EssenceLoss(0);
        this.maxEssenceLoss = maxEssenceLoss;

        this.qualityCost = 0;
        if (withPrototype) {
            this.qualityCost += prototypeCost;
        }
        if (bioCompatibility == biocompatibilityEnum.CYBERWARE || bioCompatibility == biocompatibilityEnum.BIOWARE) {
            this.qualityCost += biocompatibilityCost;
        }
        this.cost = this.qualityCost;

        this.biocompatibility = bioCompatibility;
        this.withPrototype = withPrototype;

        this.upgrades = [];
        for (var i = 0; i < implantReferences.implants.length; i++) {
            var implantUpgrades: number[] = [];
            var implant = implantReferences.implants[i];
            for (var j = 0; j < implant.amount; j++) {
                implantUpgrades.push(0);
            }
            this.upgrades.push(implantUpgrades);
        }
        for (var i = 0; i < implantReferences.implants.length; i++) {
            var implant = implantReferences.implants[i];
            for (var j = 0; j < implant.amount; j++) {
                UpdateConfiguration(true, this, i, j);
            }
        }
    }
}

function UpdateConfiguration(isAnUpgrade: boolean, config: IConfiguration, index: number, subIndex: number) {
    if (isAnUpgrade) {
        var implantReference = config.implantReferences.implants[index];
        var upgradeRank = config.upgrades[index][subIndex];
        var upgrade = implantReference.upgrades[upgradeRank];
        config.cost += upgrade.costDelta;
        var essenceDelta = upgrade.EssenceDelta(config.biocompatibility);
        config.essenceUsed = config.essenceUsed.Add(essenceDelta);
        if (upgrade.isBioware) {
            config.bioEssenceUsed = config.bioEssenceUsed.Add(essenceDelta);
        }
    }
    else {
        var implantReference = config.implantReferences.implants[index];
        var upgradeRank = config.upgrades[index][subIndex];
        var previousUpgrade = implantReference.upgrades[upgradeRank + 1];
        config.cost -= previousUpgrade.costDelta;
        var essenceDelta = previousUpgrade.EssenceDelta(config.biocompatibility);
        config.essenceUsed = config.essenceUsed.Subtract(essenceDelta);
        if (previousUpgrade.isBioware) {
            config.bioEssenceUsed = config.bioEssenceUsed.Subtract(essenceDelta);
        }
    }
}
