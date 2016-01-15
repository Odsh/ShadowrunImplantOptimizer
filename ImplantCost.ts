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

    adapsinBaseEssence: IEssenceLoss;
    adapsinBaseEssenceDelta: IEssenceLoss;
    adapsinBioCompEssence: IEssenceLoss;
    adapsinBioCompEssenceDelta: IEssenceLoss;
    adapsinCyberCompEssence: IEssenceLoss;
    adapsinCyberCompEssenceDelta: IEssenceLoss;

    Essence(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): IEssenceLoss;
    EssenceDelta(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): IEssenceLoss;
    SetImplantCostDelta(previousCost: IImplantCost): void;
    Efficiency(biocompatibility: biocompatibilityEnum, withAdapsin: boolean, maxEssenceGain: IEssenceLoss, maxBiowareEssenceGain: IEssenceLoss): number;
    DownGradeEfficiency(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): number;
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

    adapsinBaseEssence: IEssenceLoss;
    adapsinBaseEssenceDelta: IEssenceLoss;
    adapsinBioCompEssence: IEssenceLoss;
    adapsinBioCompEssenceDelta: IEssenceLoss;
    adapsinCyberCompEssence: IEssenceLoss;
    adapsinCyberCompEssenceDelta: IEssenceLoss;

    Essence(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): IEssenceLoss {
        if (withAdapsin) {
            switch (biocompatibility) {
                case biocompatibilityEnum.CYBERWARE:
                    return this.adapsinCyberCompEssence;
                    break;
                case biocompatibilityEnum.BIOWARE:
                    return this.adapsinBioCompEssence;
                    break;
                default:
                    return this.adapsinBaseEssence;
                    break;
            }
        }
        else {
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
    }
    EssenceDelta(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): IEssenceLoss {
        if (withAdapsin) {
            switch (biocompatibility) {
                case biocompatibilityEnum.CYBERWARE:
                    return this.adapsinCyberCompEssenceDelta;
                    break;
                case biocompatibilityEnum.BIOWARE:
                    return this.adapsinBioCompEssenceDelta;
                    break;
                default:
                    return this.adapsinBaseEssenceDelta;
                    break;
            }
        }
        else {
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
    }


    constructor(implantGrade: IImplantGrade, baseCost: number, baseEssence: number, baseAvailability: number, implantType: implantTypesEnum) {
        this.gradeName = implantGrade.name;
        this.cost = implantGrade.costMultiplier * baseCost;
        this.costDelta = this.cost;
        this.availability = baseAvailability + implantGrade.availabilityModifier;
        this.isBioware = (implantType == implantTypesEnum.BIOWARE);
        var rawEssence = new EssenceLoss(baseEssence);

        this.baseEssence = rawEssence.Multiply(implantGrade.essenceMultiplier);

        this.bioCompEssence = this.baseEssence;
        if (implantType == implantTypesEnum.BIOWARE) {
            this.bioCompEssence = rawEssence.Multiply(implantGrade.bioCompatibleEssenceMultiplier);
        }

        this.cyberCompEssence = this.baseEssence;
        if (implantType == implantTypesEnum.CYBERWARE) {
            this.cyberCompEssence = rawEssence.Multiply(implantGrade.bioCompatibleEssenceMultiplier);
        }


        this.adapsinBaseEssence = this.baseEssence;
        this.adapsinBioCompEssence = this.bioCompEssence;
        this.adapsinCyberCompEssence = this.cyberCompEssence;

        if (implantType == implantTypesEnum.CYBERWARE) {
            this.adapsinBaseEssence = rawEssence.Multiply(implantGrade.adapsinEssenceMultiplier);
            this.adapsinBioCompEssence = this.adapsinBaseEssence;
            this.adapsinCyberCompEssence = rawEssence.Multiply(implantGrade.adapsinBioCompatibleEssenceMultiplier);
        }

        this.baseEssenceDelta = this.baseEssence;
        this.bioCompEssenceDelta = this.bioCompEssence;
        this.cyberCompEssenceDelta = this.cyberCompEssence;

        this.adapsinBaseEssenceDelta = this.adapsinBaseEssence;
        this.adapsinBioCompEssenceDelta = this.adapsinBioCompEssence;
        this.adapsinCyberCompEssenceDelta = this.adapsinCyberCompEssence;
    }


    Efficiency(biocompatibility: biocompatibilityEnum, withAdapsin: boolean, maxEssenceGain: IEssenceLoss, maxBiowareEssenceGain: IEssenceLoss): number {
        if (maxEssenceGain.numerator < 0 || maxBiowareEssenceGain.numerator < 0) {
            throw new Error("max essence gain cannot be negative");
        }
        if (this.costDelta == 0) {
            return 9007199254740991;
        }
        var essenceDelta = this.EssenceDelta(biocompatibility, withAdapsin).Absolute();
        essenceDelta = essenceDelta.Minimum(maxEssenceGain);
        if (this.isBioware) {
            essenceDelta = essenceDelta.Minimum(maxBiowareEssenceGain);
        }
        return essenceDelta.numerator / this.costDelta;
    }

    DownGradeEfficiency(biocompatibility: biocompatibilityEnum, withAdapsin: boolean): number {
        var essenceDelta = this.EssenceDelta(biocompatibility, withAdapsin).Absolute();
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

        this.adapsinBaseEssenceDelta = this.adapsinBaseEssence.Subtract(previousCost.adapsinBaseEssence);
        this.adapsinBioCompEssenceDelta = this.adapsinBioCompEssence.Subtract(previousCost.adapsinBioCompEssence);
        this.adapsinCyberCompEssenceDelta = this.adapsinCyberCompEssence.Subtract(previousCost.adapsinCyberCompEssence);

    }


}
