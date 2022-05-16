class DE {
  constructor(generations, population, objectiveFunc, boundariesArray, dimension, cr, lambda, compareFunction, constrainList, physicalConstrainsList) { 
    this.bestIndex = 0;
    this.generations = generations;
    this.population = population;
    this.objectiveFunc = objectiveFunc;
    this.dimension = dimension;
    this.boundariesArray = boundariesArray;
    this.lambda = lambda;
    this.cr = cr;
    this.compareFunction = compareFunction;
    this.constraintFunctionsList = constrainList;
    this.physicalConstrainsList = physicalConstrainsList;
    this.generationList = [];
  }

  exec() {
    this.bestIndex = 0;
    // X[i].dimensionArray[]
    let X = this.initializePopulation();
        
    for(let gen=0; gen < this.generations; gen++) {
      let startTime = performance.now();
      for(let i=0; i < this.population; i++) {
        let vi = this.mutation(X); 
        
        let ui = this.recombine(X[i].dimensionArray, vi);
      
        // ui is an array
        let uiObj = { dimensionArray: ui };
        X[i] = this.selection(X[i], uiObj);       
        
        let bestResult = this.bestIndividual(X[i], X[this.bestIndex]); 
        if(bestResult === -1) {
          this.bestIndex = i;
        } 
      }    
      let endTime = performance.now();
      let generationObject = {
        values: structuredClone(X),
        bestSolutionIndex: this.bestIndex,
        executionTime: endTime-startTime
      };
      this.generationList.push(generationObject);
    }
  }

  initializePopulation() {
    let individualsArray = new Array(this.population);
    for(let i=0; i < this.population; i++) {
      individualsArray[i] = new IndividualDE(this.dimension, this.boundariesArray);
    }
    return individualsArray;
  }

  mutation(X) {
    let pickedIndexes = this.selectRandomIndexes(X.length, 4, this.bestIndex);
    let xr1 = X[pickedIndexes[0]];
    let xr2 = X[pickedIndexes[1]];
    let xr3 = X[pickedIndexes[2]];
    let xr4 = X[pickedIndexes[3]];
    let xrB = X[this.bestIndex];

    let mutatedArray = [];
    for(let i=0; i<this.dimension; i++) {
      let value = xrB.dimensionArray[i] + 
                  (this.lambda * (xr1.dimensionArray[i] - xr2.dimensionArray[i])) + 
                  (this.lambda * (xr3.dimensionArray[i] - xr4.dimensionArray[i]));
      mutatedArray.push(value);
    }
    return mutatedArray;
  }

  recombine(xi, vi) {
    let uArray = [];
    for(let i=0; i<this.dimension; i++) {
      let ra = this.getRandomNumber();
      
      if(ra <= this.cr) {
        uArray.push(vi[i]);
      } else {
        uArray.push(xi[i]);
      }
    }
    uArray.push(0);
    return uArray;
  }

  getRandomNumber() {
    return Math.random();
  }

  selection(X, u) {
    X.dimensionArray[this.dimension] = this.objectiveFunc(...X.dimensionArray);
    u.dimensionArray[this.dimension] = this.objectiveFunc(...u.dimensionArray);

    X.results = this.getFeasibilityResults(X.dimensionArray);
    u.results = this.getFeasibilityResults(u.dimensionArray);   

    let res = this.bestIndividual(X, u);
    if(res == -1 || res == 0) {
      return X;
    } else if(res == 1) {
      return u;
    }
  }

  // if indiv1 is better then return -1
  // if indiv2 is better then return 1
  // equal return 0
  bestIndividual(indiv1, indiv2) {
    let dummyArray = [];
    dummyArray.push(indiv1);
    dummyArray.push(indiv2);
    dummyArray.sort(this.compareFunction);

    if(dummyArray[0] === indiv1) {
      return -1;
    } else if(dummyArray[0] === indiv2) {
      return 1;
    } else {
      return 0;
    }
  }

  selectRandomIndexes(totalElements, numberOfElementsToPick, excludeIndex) {
    let pickedIndexes = new Array();
    
    while(pickedIndexes.length < numberOfElementsToPick) {  
      let randomInt = getRandomInt(totalElements);    
      if(!pickedIndexes.includes(randomInt)) {
        pickedIndexes.push(randomInt);
      } 
    }    
    return pickedIndexes;
  }

  createRandomVector(dimension, stdDev) {
    let r = new Array();
    for(let counter=0; counter < dimension; counter++) {
      r.push(this.randn_bm(stdDev));
    }
    return r;
  }  

  getFeasibilityResults(springDataArray) {
    let resultObject = {};
    let summation = 0;
    let isFeasible = true;
    let constrainFunction;
    let result;

    let physicalConstrainBroken = false;
    for(let i=0; i<this.physicalConstrainsList.length; i++) {
      physicalConstrainBroken = this.physicalConstrainsList[i](springDataArray);
      if(physicalConstrainBroken) {
        break;
      }
    }
    
    for(let i=0; i<this.constraintFunctionsList.length; i++) {
      constrainFunction = this.constraintFunctionsList[i];      
      result = constrainFunction(...springDataArray);
      if(result > 0 || physicalConstrainBroken) {
        isFeasible = false;
      }
      summation += Math.max(0, result);
      resultObject[constrainFunction.name] = result;
    }

    resultObject["isFeasible"] = isFeasible;
    resultObject["summation"] = summation;
    return resultObject;
  }

  getAllGenerations() {
    return this.generationList;
  }
}

/*
  Indexes:
  0 = Coil Diameter
  1 = Wire Diameter
  2 = # Active Coils
  3 OR lenght-1 = fitness

  boundariesArray: [ {upper:10, lower:-10} , ... ]
*/
class IndividualDE {
  constructor(dimension, boundariesArray) {
    this.dimensionArray = [];
    for(let i=0; i<dimension; i++) {
      let boundaries = boundariesArray[i];
      let upper = boundaries.upper;
      let lower = boundaries.lower;
      this.dimensionArray.push(lower + (upper - lower) * Math.random());
    }
    this.dimensionArray.push = 0;
  }
}