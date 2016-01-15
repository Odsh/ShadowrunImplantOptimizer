interface IImplantGrade {
    name: string;
    essenceMultiplier: number;
    bioCompatibleEssenceMultiplier: number;
    adapsinEssenceMultiplier: number;
    adapsinBioCompatibleEssenceMultiplier: number;
    costMultiplier: number;
    availabilityModifier: number;
}

class ImplantGrade implements IImplantGrade {
    name: string;
    essenceMultiplier: number;
    bioCompatibleEssenceMultiplier: number;
    adapsinEssenceMultiplier: number;
    adapsinBioCompatibleEssenceMultiplier: number;
    costMultiplier: number;
    availabilityModifier: number;
    constructor(name: string, essenceMultiplier: number, availabilityModifier: number, costMultiplier: number) {
        this.name = name;
        this.essenceMultiplier = essenceMultiplier;
        this.bioCompatibleEssenceMultiplier = GetReducedEssenceMultiplier(essenceMultiplier, 1);
        this.adapsinEssenceMultiplier = this.bioCompatibleEssenceMultiplier;
        this.adapsinBioCompatibleEssenceMultiplier = GetReducedEssenceMultiplier(essenceMultiplier, 2);
        this.costMultiplier = costMultiplier;
        this.availabilityModifier = availabilityModifier;
    }
}

function GetReducedEssenceMultiplier(gradeCoefficient: number, nr10PercentReductions: number) {
    return Math.floor((10 - nr10PercentReductions) * gradeCoefficient) / 10;
}
