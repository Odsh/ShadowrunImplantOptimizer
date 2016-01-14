interface IEncounteredKeys {
    Exists(key: string): boolean;
    Add(key: string): void;
}

class EncounteredKeys implements IEncounteredKeys {
    keys: { [key: string]: boolean; }

    constructor() {
        this.keys = {};
    }

    Exists(key: string): boolean {
        if (this.keys[key] === undefined) {
            return false;
        }
        else {
            return true;
        }
    }

    Add(key: string): void {
        this.keys[key] = true;
    }
}
