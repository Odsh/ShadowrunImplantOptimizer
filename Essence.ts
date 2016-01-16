interface IEssenceLoss {
    numerator: number;
    ToString(): string;
    RemainingEssenceToString(): string;
    Add(other: IEssenceLoss): IEssenceLoss;
    Subtract(other: IEssenceLoss): IEssenceLoss;
    Multiply(factor: number): IEssenceLoss;
    Minimum(other: IEssenceLoss): IEssenceLoss;
    Maximum(other: IEssenceLoss): IEssenceLoss;
    GreaterOrEqualThan(other: IEssenceLoss): boolean;
    GreaterThan(other: IEssenceLoss): boolean;
    Absolute(): IEssenceLoss;
}

var essencePrecision: number = 100000;

class EssenceLoss implements IEssenceLoss {
    numerator: number;

    constructor(essenceLoss: number) {
        this.numerator = Math.round(essenceLoss * essencePrecision);
    }

    ToString(): string {
        return EssenceNumeratorToString(this.numerator);
    }

    RemainingEssenceToString(): string {
        return EssenceNumeratorToString(6 * essencePrecision - this.numerator);
    }


    Add(other: IEssenceLoss): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = this.numerator + other.numerator;
        return result;
    }

    Subtract(other: IEssenceLoss): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = this.numerator - other.numerator;
        return result;
    }

    Multiply(factor: number): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = Math.round(this.numerator * factor);
        return result;
    }

    Minimum(other: IEssenceLoss): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = Math.min(this.numerator, other.numerator);
        return result;
    }

    Maximum(other: IEssenceLoss): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = Math.max(this.numerator, other.numerator);
        return result;
    }

    Absolute(): IEssenceLoss {
        var result = new EssenceLoss(0);
        result.numerator = Math.abs(this.numerator);
        return result;
    }

    GreaterOrEqualThan(other: IEssenceLoss): boolean {
        return this.numerator >= other.numerator;
    }

    GreaterThan(other: IEssenceLoss): boolean {
        return this.numerator > other.numerator;
    }
}


var zeroEssence = new EssenceLoss(0);
var oneEssence = new EssenceLoss(1);
var sixEssence = new EssenceLoss(6);


function EssenceNumeratorToString(numerator: number): string {
    var remainder = numerator % essencePrecision;
    var remainderString = remainder.toString();
    var zerosToAdd = essencePrecision.toString().length - remainderString.length - 1;
    while (remainderString.charAt(remainderString.length - 1) == "0") {
        remainderString = remainderString.slice(0, -1);
    }
    var prefix = "";
    for (var i = 0; i < zerosToAdd; i++) {
        prefix += "0";
    }
    remainderString = prefix + remainderString;
    var integerValue = (numerator - remainder) / essencePrecision;
    return integerValue.toString() + "." + remainderString;
}