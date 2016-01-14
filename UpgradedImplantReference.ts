/// <reference path="ImplantReference.ts" />
/// <reference path="Essence.ts" />
/// <reference path="SortedList.ts" />

class UpgradedImplantReference implements IComparable {
    implantReference: IImplantReference;
    upgrades: number[];
    biocompatibility: biocompatibilityEnum;
    implantIndex: number;

    constructor(biocompatibility: biocompatibilityEnum, implantReference: IImplantReference, implantIndex: number, upgrades: number[]) {
        this.implantReference = implantReference;
        this.upgrades = upgrades;
        this.biocompatibility = biocompatibility;
        this.implantIndex = implantIndex;
    }

    Downgrade(subIndex: number): UpgradedImplantReference {
        var newUpgrades: number[] = [];
        for (var i = 0; i < this.upgrades.length; i++) {
            if (i == subIndex) {
                newUpgrades.push(this.upgrades[i] - 1);
            }
            else {
                newUpgrades.push(this.upgrades[i]);
            }
        }
        return new UpgradedImplantReference(this.biocompatibility, this.implantReference, this.implantIndex, newUpgrades);
    }

    DownGradeMaxEssenceLoss(): IEssenceLoss {
        var result = zeroEssence;
        var lastUpgrade = 0;
        for (var i = this.upgrades.length - 1; i >= 0; i--) {
            var upgrade = this.upgrades[i];
            if (upgrade == lastUpgrade) {
                continue;
            }
            lastUpgrade = upgrade;
            var essenceLoss = this.implantReference.upgrades[upgrade].EssenceDelta(this.biocompatibility).Absolute();
            if (essenceLoss.GreaterThan(result)) {
                result = essenceLoss;
            }
        }
        return result;
    }

    Compare(comp: IComparable): number {
        var other = <UpgradedImplantReference>comp;
        return other.DownGradeMaxEssenceLoss().numerator - this.DownGradeMaxEssenceLoss().numerator;
    }
}