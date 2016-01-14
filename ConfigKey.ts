/// <reference path="ImplantReference.ts" />
/// <reference path="SortedList.ts" />

interface IConfigKey extends IComparable {
    key: string;
    Upgrade(index: number, subIndex: number, newValue: number): IConfigKey;
}

class ConfigKey implements IConfigKey {
    key: string;
    startingIndexes: number[];
    amounts: number[];
    nrImplantTypes: number;

    constructor(implants: IImplantReference[]) {
        if (implants == null) {
            return;
        }
        this.startingIndexes = [];
        this.amounts = [];
        this.nrImplantTypes = 0;
        var current = 0;
        for (var i = 0; i < implants.length; i++) {
            this.nrImplantTypes++;
            var amount = implants[i].amount;
            this.startingIndexes.push(current + amount - 1);
            this.amounts.push(amount);
            current += amount;
        }
        this.key = "";
        for (var i = 0; i < this.nrImplantTypes; i++) {
            for (var j = 0; j < this.amounts[i]; j++) {
                this.key += "0";
            }
        }
    }
    Compare(other: IComparable): number {
        var a = this.key;
        var b = (<ConfigKey>other).key;
        return a < b ? -1 : (a > b ? 1 : 0);
    }

    Upgrade(index: number, subIndex: number, newValue: number): IConfigKey {
        var result = new ConfigKey(null);
        result.startingIndexes = this.startingIndexes;
        result.amounts = this.amounts;
        result.nrImplantTypes = this.nrImplantTypes;
        var absoluteIndex = this.startingIndexes[index] + subIndex;
        result.key = this.key.substr(0, absoluteIndex) + newValue + this.key.substr(absoluteIndex + 1);
        return result;
    }
}
