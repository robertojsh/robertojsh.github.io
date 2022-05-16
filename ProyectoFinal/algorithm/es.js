class ES {
  constructor(generations, variance, dimension, objectiveFunc, boundariesArray, mu, lambda, compareFunction, constrainList, physicalConstrainsList) { 
    this.generations = generations;
    this.variance = variance;
    this.stdDev = Math.sqrt(variance);
    this.dimension = dimension;
    this.objectiveFunc = objectiveFunc;
    this.boundariesArray = boundariesArray;
    this.mu = mu;
    this.lambda = lambda;
    this.compareFunction = compareFunction;
    this.constraintFunctionsList = constrainList;
    this.physicalConstrainsList = physicalConstrainsList;
    this.generationList = [];
  }

  exec() {
    this.mu_lambda_ES();
  }

  mu_lambda_ES() {
    let xpArray = this.initializeIndividuals();
    
    for(let gen=0; gen < this.generations; gen++) {
      let startTime = performance.now();
      let childrenArray = new Array();
      for(let counter=0; counter < this.lambda; counter++) {
        let selectedParentIndexes = this.selectParentIndexes();
        let parentOne = xpArray[selectedParentIndexes[0]];
        let parentTwo = xpArray[selectedParentIndexes[1]];
         // RSI
        let child = this.createChild(parentOne, parentTwo);
        let randomVec = this.createRandomVector(child);

        for(let i=0; i<this.dimension; i++) {
          child.dimensionArray[i] = child.dimensionArray[i] + randomVec[i];
        }
        childrenArray.push(child);
      }

      //  (m+l)-ES
      let population = xpArray.concat(childrenArray);
    
      xpArray = this.selectBest(population);
      let endTime = performance.now();
      let generationObject = {
        values: xpArray,
        bestSolutionIndex: 0,
        executionTime: endTime-startTime
      };
      this.generationList.push(generationObject);
    }
  }

  createRandomVector(child) {
    let r = new Array();
    for(let counter=0; counter < this.dimension; counter++) {
      r.push(this.randn_bm(child.stdDevArray[counter]));
    }
    return r;
  }

  initializeIndividuals() {
    let individualsArray = new Array(this.mu);
    for(let i=0; i < this.mu; i++) {
      individualsArray[i] = new IndividualEs(this.dimension, this.stdDev, this.boundariesArray);      
    }
    return individualsArray;
  }

  selectParentIndexes() {
    let indexOne = getRandomInt(this.mu);
    let indexTwo = getRandomInt(this.mu);
    while(indexOne === indexTwo) {
      indexTwo = getRandomInt(this.mu);
    }
    return [indexOne, indexTwo];
  }

  createChild(parentOne, parentTwo) {
    // Intermediate
    let child = new IndividualEs(this.dimension, this.stdDev, this.boundariesArray);
    for(let i=0; i<this.dimension; i++) {
      child.dimensionArray[i] = (parentOne.dimensionArray[i] + parentTwo.dimensionArray[i]) / 2;
      child.stdDevArray[i] = (parentOne.stdDevArray[i] + parentTwo.stdDevArray[i]) / 2;
    }
    return child;
  }

  createRandomVector() {
    let r = new Array();
    for(let counter=0; counter < this.dimension; counter++) {
      r.push(this.randn_bm());
    }
    return r;
  }

  selectBest(population) {
    let fitnessIndex = this.dimension;
    for(let i=0; i < population.length; i++) {
      population[i].dimensionArray[fitnessIndex] = this.objectiveFunc(...population[i].dimensionArray);
      population[i].results = this.getFeasibilityResults(population[i].dimensionArray);
    }
    
    population.sort(this.compareFunction);
    let newPopulation = population.slice(0, this.mu);
    return newPopulation;
  }

  randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return (num - 0.5) * this.stdDev;
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

  getGeneration(generationNumber) {
    return this.generationList[generationNumber];
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
  3 OR DimensionNumber = fitness

  boundariesArray: [ {upper:10, lower:-10} , ... ]
*/
class IndividualEs {
  constructor(dimension, stdDev, boundariesArray) {
    this.dimensionArray = [];
    this. stdDevArray = [];
    for(let i=0; i<dimension; i++) {
      let boundaries = boundariesArray[i];
      let upper = boundaries.upper;
      let lower = boundaries.lower;
      this.dimensionArray.push(lower + (upper - lower) * Math.random());
      this.stdDevArray.push(1 + (stdDev - 1) * Math.random());
    }
    this.dimensionArray.push = 0;
  }
}