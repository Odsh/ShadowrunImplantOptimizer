/// <reference path="ImplantGrade.ts" />
/// <reference path="ImplantType.ts" />

function CreateAllowedGradesFactory(allowedGrades: IImplantGrade[], genewareAllowedGrades: IImplantGrade[], culturedBiowareMinAllowedGrades: IImplantGrade[], culturedBiowareUnauthorizedGrade: IImplantGrade) {
    return new AllowedGradesFactory(allowedGrades, genewareAllowedGrades, culturedBiowareMinAllowedGrades, culturedBiowareUnauthorizedGrade);
}

interface IAllowedGradesFactory {
    CreateAllowedGrades(type: implantTypesEnum, cultured: boolean): IImplantGrade[];
}

class AllowedGradesFactory implements IAllowedGradesFactory {
    allowedGrades: IImplantGrade[];
    genewareAllowedGrades: IImplantGrade[];
    culturedBiowareMinAllowedGrades: IImplantGrade[];
    culturedBiowareUnauthorizedGrade: IImplantGrade;

    constructor(allowedGrades: IImplantGrade[], genewareAllowedGrades: IImplantGrade[], culturedBiowareMinAllowedGrades: IImplantGrade[], culturedBiowareUnauthorizedGrade: IImplantGrade) {
        this.allowedGrades = allowedGrades;
        this.genewareAllowedGrades = genewareAllowedGrades;
        this.culturedBiowareMinAllowedGrades = culturedBiowareMinAllowedGrades;
        this.culturedBiowareUnauthorizedGrade = culturedBiowareUnauthorizedGrade;
    }

    CreateAllowedGrades(type: implantTypesEnum, cultured: boolean): IImplantGrade[] {
        if (type == implantTypesEnum.GENEWARE) {
            return this.genewareAllowedGrades;
        }
        else if (cultured && this.allowedGrades[0].name == this.culturedBiowareUnauthorizedGrade.name) {
            return this.culturedBiowareMinAllowedGrades;
        }
        else {
            return this.allowedGrades;
        }
    }
}
