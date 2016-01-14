class implantTypesEnum
{
	constructor(public value : string){
	}

    toString(){
        return this.value;
    }
    
  static CYBERWARE = new implantTypesEnum("cyberware");
  static BIOWARE = new implantTypesEnum("bioware");
  static GENEWARE = new implantTypesEnum("geneware");
  static SYMBIONT = new implantTypesEnum("symbiont");
}
