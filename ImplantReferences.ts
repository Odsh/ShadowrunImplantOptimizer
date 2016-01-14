/// <reference path="ImplantReference.ts" />

interface IImplantReferencesProvider {
    GetImplants(): IImplantReferences[];
}

interface IImplantReferences {
    totalBaseCost: number;
    implants: IImplantReference[];
    subImplantsWithoutParents: ISubImplantReference[];
    AddImplant(implantReference: IImplantReference): void;
    AddSubImplant(subImplantReference: ISubImplantReference): void;
    Initialize(): void;
}


class ImplantReferences implements IImplantReferences {
    totalBaseCost: number;
    implants: IImplantReference[];
    subImplantsWithoutParents: ISubImplantReference[];

    initialized: boolean;

    constructor() {
        this.initialized = false;
        this.totalBaseCost = 0;
        this.implants = [];
        this.subImplantsWithoutParents = [];
    }

    AddImplant(implantReference: IImplantReference): void {
        this.totalBaseCost += implantReference.totalBaseCost;

        for (var i = 0; i < this.implants.length; i++) {
            var implant = this.implants[i];
            if (implant.name == implantReference.name) {
                for (var j = 0; j < implantReference.rows.length; j++) {
                    var row = implantReference.rows[j];
                    implant.AddInstance(row);
                }
                return;
            }
        }

        if (this.subImplantsWithoutParents.length > 0) {
            var newSubImplantsWithoutParent: ISubImplantReference[] = [];
            for (var i = 0; i < this.subImplantsWithoutParents.length; i++) {
                var subImplant = this.subImplantsWithoutParents[i];
                if (subImplant.container == implantReference.name) {
                    implantReference.AddChild(subImplant);
                }
                else {
                    newSubImplantsWithoutParent.push(subImplant);
                }
            }
            this.subImplantsWithoutParents = newSubImplantsWithoutParent;
        }
        this.implants.push(implantReference);
    }

    AddSubImplant(subImplantReference: ISubImplantReference): void {
        this.totalBaseCost += subImplantReference.baseCost;
        for (var i = 0; i < this.implants.length; i++) {
            var implant = this.implants[i];
            if (implant.name == subImplantReference.container) {
                var changes = implant.AddChild(subImplantReference);
                return;
                break;
            }
        }

        this.subImplantsWithoutParents.push(subImplantReference);
    }

    Initialize(): void {
        if (this.initialized) {
            return;
        }
        if (this.subImplantsWithoutParents.length > 0) {
            throw new Error("Some implants using up capacity don't have a parent implant'");
        }
        for (var i = 0; i < this.implants.length; i++) {
            this.implants[i].Initialize();
        }
        this.initialized = true;

    }

}

