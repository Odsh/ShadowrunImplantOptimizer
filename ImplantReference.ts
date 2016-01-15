/// <reference path="ImplantCost.ts" />
/// <reference path="ImplantGrade.ts" />
/// <reference path="ImplantType.ts" />
/// <reference path="AllowedGradesFactory.ts" />

interface ISubImplantReference {
    row: number;
    container: string;
    baseAvailability: number;
    baseCost: number;
}

interface IImplantReference {
    rows: number[];
    name: string;
    upgrades: IImplantCost[];
    totalBaseCost: number;
    totalBaseAvailability: number;
    amount: number;
    children: ISubImplantReference[];

    AddChild(child: ISubImplantReference): void;
    AddInstance(row: number): void;
    Initialize(): void;
    IsUpgradeable(currentIndex: number, bioEssenceCanBeReduced: boolean): boolean;
    CanUpgrade(currentIndex: number): boolean;
    CanDowngrade(currentIndex: number): boolean;
}


class SubImplantReference implements ISubImplantReference {
    row: number;
    container: string;
    baseAvailability: number;
    baseCost: number;
    constructor(row: number, container: string, availability: number, cost: number) {
        this.row = row;
        this.container = container;
        this.baseAvailability = availability;
        this.baseCost = cost;
    }
}


class ImplantReference implements IImplantReference {
    rows: number[];
    name: string;
    container: string;
    upgrades: IImplantCost[];
    totalBaseCost: number;
    totalBaseAvailability: number;
    amount: number;

    allowedGrades: IImplantGrade[];
    minEssence: number;
    maxAvailability: number;
    baseEssence: number;
    type: implantTypesEnum;
    maxCostsIndex: number;
    isBioware: boolean;
    isCultured: boolean;
    children: ISubImplantReference[];
    initialized: boolean;

    AddChild(child: ISubImplantReference): void {
        if (this.initialized) {
            throw new Error("cannot add a subimplant to an initialized implant");
        }
        if (this.amount > 1) {
            throw new Error("cannot have multiple instances of the same implant with subimplants");
        }
        this.children.push(child);
        this.totalBaseCost += child.baseCost;
        this.totalBaseAvailability = Math.max(this.totalBaseAvailability, child.baseAvailability);
    }

    Initialize(): void {
        if (this.initialized) {
            return;
        }
        var previousImplantCost: IImplantCost = null;
        for (var i = 0; i < this.allowedGrades.length; i++) {
            var implantCost = new ImplantCost(this.allowedGrades[i], this.totalBaseCost, this.baseEssence, this.totalBaseAvailability, this.type);
            if (implantCost.availability > this.maxAvailability) {
                break;
            }
            if (previousImplantCost != null) {
                implantCost.SetImplantCostDelta(previousImplantCost);
            }
            previousImplantCost = implantCost;
            this.upgrades.push(implantCost);
        }
        if (this.upgrades.length == 0) {
            throw new Error("Failed: implant " + this.name + " or one of its contained implants has a too high availability even with the lowest allowed grade");
        }
        this.maxCostsIndex = this.upgrades.length - 1;
        this.initialized = true;
    }


    CanUpgrade(currentIndex: number): boolean {
        return (currentIndex < this.maxCostsIndex);
    }

    CanDowngrade(currentIndex: number): boolean {
        return (currentIndex > 0);
    }

    IsUpgradeable(currentIndex: number, bioEssenceCanBeReduced: boolean): boolean {
        if (!bioEssenceCanBeReduced && this.isBioware) {
            return false;
        }
        return (currentIndex < this.maxCostsIndex);
    }

    constructor(row: number, name: string, essence: number, availability: number, cost: number, type: implantTypesEnum, cultured: boolean, allowedGradesFactory: IAllowedGradesFactory, minEssence: number, maxAvailability: number) {
        this.initialized = false;
        this.amount = 1;
        this.rows = [];
        this.rows.push(row);
        this.name = name;
        this.baseEssence = essence;
        this.type = type;
        this.isBioware = type == implantTypesEnum.BIOWARE;
        this.isCultured = cultured;
        this.allowedGrades = allowedGradesFactory.CreateAllowedGrades(type, cultured);

        this.minEssence = minEssence;
        this.maxAvailability = maxAvailability;

        this.totalBaseCost = cost;
        this.totalBaseAvailability = availability;
        this.children = [];

        this.upgrades = [];
        this.maxCostsIndex = 0;
    }
    AddInstance(row: number): void {
        if (this.children.length > 0) {
            throw new Error("cannot have multiple instances of the same implant with subimplants");
        }
        this.rows.push(row);
        this.amount++;
    }
}

