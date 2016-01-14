/// <reference path="ImplantType.ts" />
/// <reference path="ImplantGrade.ts" />
/// <reference path="Biocompatibility.ts" />
/// <reference path="Essence.ts" />

interface IImplantCost {
    gradeName: string;
    cost: number;
    costDelta: number;
    availability: number;
    isBioware: boolean;
    baseEssence: IEssenceLoss;
    baseEssenceDelta: IEssenceLoss;
    bioCompEssence: IEssenceLoss;
    bioCompEssenceDelta: IEssenceLoss;
    cyberCompEssence: IEssenceLoss;
    cyberCompEssenceDelta: IEssenceLoss;
    Essence(biocompatibility: biocompatibilityEnum): IEssenceLoss;
    EssenceDelta(biocompatibility: biocompatibilityEnum): IEssenceLoss;
    SetImplantCostDelta(previousCost: IImplantCost): void;
    Efficiency(biocompatibility: biocompatibilityEnum, maxEssenceGain: IEssenceLoss, maxBiowareEssenceGain: IEssenceLoss): number;
    DownGradeEfficiency(biocompatibility: biocompatibilityEnum): number;
}

class ImplantCost implements IImplantCost {
    gradeName: string;
    cost: number;
    costDelta: number;
    availability: number;
    isBioware: boolean;
    baseEssence: IEssenceLoss;
    baseEssenceDelta: IEssenceLoss;
    bioCompEssence: IEssenceLoss;
    bioCompEssenceDelta: IEssenceLoss;
    cyberCompEssence: IEssenceLoss;
    cyberCompEssenceDelta: IEssenceLoss;

    Essence(biocompatibility: biocompatibilityEnum): IEssenceLoss {
        switch (biocompatibility) {
            case biocompatibilityEnum.CYBERWARE:
                return this.cyberCompEssence;
                break;
            case biocompatibilityEnum.BIOWARE:
                return this.bioCompEssence;
                break;
            default:
                return this.baseEssence;
                break;
        }
    }
    EssenceDelta(biocompatibility: biocompatibilityEnum): IEssenceLoss {
        switch (biocompatibility) {
            case biocompatibilityEnum.CYBERWARE:
                return this.cyberCompEssenceDelta;
                break;
            case biocompatibilityEnum.BIOWARE:
                return this.bioCompEssenceDelta;
                break;
            default:
                return this.baseEssenceDelta;
                break;
        }
    }


    constructor(implantGrade: IImplantGrade, baseCost: number, baseEssence: number, baseAvailability: number, implantType: implantTypesEnum) {
        this.gradeName = implantGrade.name;
        this.cost = implantGrade.costMultiplier * baseCost;
        this.costDelta = this.cost;
        this.availability = baseAvailability + implantGrade.availabilityModifier;
        this.isBioware = (implantType == implantTypesEnum.BIOWARE);
        var rawEssence = new EssenceLoss(baseEssence);
        this.baseEssence = rawEssence.Multiply(implantGrade.essenceMultiplier);
        this.baseEssenceDelta = this.baseEssence;

        this.bioCompEssence = this.baseEssence;
        if (implantType == implantTypesEnum.BIOWARE) {
            this.bioCompEssence = rawEssence.Multiply(implantGrade.bioCompatibleEssenceMultiplier);
        }
        this.bioCompEssenceDelta = this.bioCompEssence;

        this.cyberCompEssence = this.baseEssence;
        if (implantType == implantTypesEnum.CYBERWARE) {
            this.cyberCompEssence = rawEssence.Multiply(implantGrade.bioCompatibleEssenceMultiplier);
        }
        this.cyberCompEssenceDelta = this.cyberCompEssence;
    }


    Efficiency(biocompatibility: biocompatibilityEnum, maxEssenceGain: IEssenceLoss, maxBiowareEssenceGain: IEssenceLoss): number {
        if (maxEssenceGain.numerator < 0 || maxBiowareEssenceGain.numerator < 0) {
            throw new Error("max essence gain cannot be negative");
        }
        if (this.costDelta == 0) {
            return 9007199254740991;
        }
        var essenceDelta = this.EssenceDelta(biocompatibility).Absolute();
        essenceDelta = essenceDelta.Minimum(maxEssenceGain);
        if (this.isBioware) {
            essenceDelta = essenceDelta.Minimum(maxBiowareEssenceGain);
        }
        return essenceDelta.numerator / this.costDelta;
    }

    DownGradeEfficiency(biocompatibility: biocompatibilityEnum): number {
        var essenceDelta = this.EssenceDelta(biocompatibility).Absolute();
        if (this.costDelta == 0) {
            return 9007199254740991;
        }
        return essenceDelta.numerator / this.costDelta;
    }


    SetImplantCostDelta(previousCost: IImplantCost): void {
        this.costDelta = this.cost - previousCost.cost;
        this.baseEssenceDelta = this.baseEssence.Subtract(previousCost.baseEssence);
        this.bioCompEssenceDelta = this.bioCompEssence.Subtract(previousCost.bioCompEssence);
        this.cyberCompEssenceDelta = this.cyberCompEssence.Subtract(previousCost.cyberCompEssence);
    }


}
