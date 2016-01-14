interface IComparable {
    Compare(other: IComparable): number;
}

interface IInsertionData {
    isNew: boolean;
    index: number;
}

class InsertionData implements IInsertionData {
    isNew: boolean;
    index: number;

    constructor(isNew: boolean, index: number) {
        this.isNew = isNew;
        this.index = index;
    }
}

function InsertInSortedList(sortedList: IComparable[], item: IComparable): void {
    var insertionIndex = GetInsertionIndex(sortedList, item).index;
    sortedList.splice(insertionIndex, 0, item);
}

function ExistsInSortedList(sortedList: IComparable[], item: IComparable): boolean {
    return !GetInsertionIndex(sortedList, item).isNew;
}

function GetInsertionIndex(sortedList: IComparable[], item: IComparable): IInsertionData {
    if (sortedList.length == 0) {
        return new InsertionData(true, 0);
    }
    var start = 0;
    var end = sortedList.length - 1;

    return GetInsertionIndexBetween(sortedList, item, start, end);
}

function GetInsertionIndexBetween(sortedList: IComparable[], item: IComparable, start: number, end: number): IInsertionData {
    var pivotIndex = Math.floor((start + end) / 2);
    var pivotValue = sortedList[pivotIndex];
    var comparison = item.Compare(pivotValue);
    if (comparison == 0) {
        return new InsertionData(false, pivotIndex);
    }
    if (comparison < 0) {
        if (pivotIndex == start) {
            return new InsertionData(true, pivotIndex);
        }
        return GetInsertionIndexBetween(sortedList, item, start, pivotIndex - 1);
    }
    if (comparison > 0) {
        if (pivotIndex == end) {
            return new InsertionData(true, pivotIndex + 1);
        }
        return GetInsertionIndexBetween(sortedList, item, pivotIndex + 1, end);
    }
}
