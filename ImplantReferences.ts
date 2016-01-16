/// <reference path="ImplantReference.ts" />

function CreateImplantReferences() {
    return new ImplantReferences();
}

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
    Clone(): IImplantReferences;
    CloneWithout(implantName: string): IImplantReferences;
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

    Clone(): IImplantReferences {
        var result = new ImplantReferences();
        result.totalBaseCost = this.totalBaseCost;
        result.initialized = this.initialized;
        for (var i = 0; i < this.implants.length; i++) {
            result.implants.push(this.implants[i]);
        }
        for (var j = 0; j < this.subImplantsWithoutParents.length; j++) {
            result.subImplantsWithoutParents.push(this.subImplantsWithoutParents[j]);
        }
        return result;
    }

    CloneWithout(implantName: string): IImplantReferences {
        var result = new ImplantReferences();
        result.totalBaseCost = this.totalBaseCost;
        result.initialized = this.initialized;
        for (var i = 0; i < this.implants.length; i++) {
            var implant = this.implants[i];
            if (implant.name == implantName) {
                result.totalBaseCost -= implant.totalBaseCost;
            }
            else {
                result.implants.push(implant);
            }
        }
        for (var j = 0; j < this.subImplantsWithoutParents.length; j++) {
            result.subImplantsWithoutParents.push(this.subImplantsWithoutParents[j]);
        }
        return result;
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
        if (this.initialized) {
            implantReference.Initialize();
        }
    }

    AddSubImplant(subImplantReference: ISubImplantReference): void {
        if (this.initialized) {
            throw new Error("Cannot add a sub-implant if parent implant has already been initialized");
        }

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

