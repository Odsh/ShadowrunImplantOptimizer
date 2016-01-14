interface IImplantGrade {
    name: string;
    essenceMultiplier: number;
    bioCompatibleEssenceMultiplier: number;
    costMultiplier: number;
    availabilityModifier: number;
}

class ImplantGrade implements IImplantGrade {
    name: string;
    essenceMultiplier: number;
    bioCompatibleEssenceMultiplier: number;
    costMultiplier: number;
    availabilityModifier: number;
    constructor(name: string, essenceMultiplier: number, availabilityModifier: number, costMultiplier: number) {
        this.name = name;
        this.essenceMultiplier = essenceMultiplier;
        this.bioCompatibleEssenceMultiplier = GetBiocompatibleEssenceMultiplier(essenceMultiplier);
        this.costMultiplier = costMultiplier;
        this.availabilityModifier = availabilityModifier;

    }
}

function GetBiocompatibleEssenceMultiplier(gradeCoefficient: number) {
    if (gradeCoefficient <= 1) {
        gradeCoefficient -= 0.1;
    }
    else {
        gradeCoefficient = Math.floor(9 * gradeCoefficient) / 10;
    }
    return gradeCoefficient;
}
