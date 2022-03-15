class ES {
  constructor() { 

  }

  exec(esVersion, generations, variance, objectiveFunc, xl, xu, yl, yu, mu, lambda, historyUpdateFunc) {
    if(esVersion === "1+1-ES" || esVersion === "1+1-ES-Adap") {
      let adjustmentEnabled = (esVersion === "1+1-ES-Adap");
      this.one_plus_one_ES(generations, variance, objectiveFunc, xl, xu, yl, yu, adjustmentEnabled, historyUpdateFunc);
    } else if(esVersion === "m+l-ES" || esVersion == "m_l-ES") {
      let onlyChildren = (esVersion === "m_l-ES");
      this.mu_lambda_ES(generations, variance, objectiveFunc, xl, xu, yl, yu, mu, lambda, onlyChildren, historyUpdateFunc);
    } 
  }

  one_plus_one_ES(generations, variance, objectiveFunc, xl, xu, yl, yu, adjustmentEnabled, historyUpdateFunc) {
    let stdDev = Math.sqrt(variance);
    let xp = new Individual(xl, xu, yl, yu);
    xp.z = objectiveFunc(xp.x, xp.y);
    let xh = {};
    let ne = 0;
    for(let gen = 0; gen < generations; gen++) {
      let r = this.createRandomVector(2, stdDev);
      xh.x = xp.x + r[0];
      xh.y = xp.y + r[1]; 

      let xhzTemp = objectiveFunc(xh.x, xh.y);
      let xpzTemp = objectiveFunc(xp.x, xp.y);
      if(xhzTemp < xpzTemp) {    
        ne += 1;    
        xp = {
          x: xh.x,
          y: xh.y,
          z: xhzTemp
        }
      }
      if(adjustmentEnabled) {
        stdDev = this.adjustStdDev(stdDev, gen, ne);
      }      
      historyUpdateFunc([xp]);
    }
    return xp;
  }

  mu_lambda_ES(generations, variance, objectiveFunc, xl, xu, yl, yu, mu, lambda, onlyChildren, historyUpdateFunc) {
    let stdDev = Math.sqrt(variance);
    let xpArray = this.initializeIndividuals(mu, stdDev, xl, xu, yl, yu);
    
    for(let gen=0; gen < generations; gen++) {

      let childrenArray = new Array();
      for(let counter=0; counter < lambda; counter++) {
        let selectedParentIndexes = this.selectParentIndexes(mu);
        console.log(selectedParentIndexes);
        let parentOne = xpArray[selectedParentIndexes[0]];
        let parentTwo = xpArray[selectedParentIndexes[1]];
         // RSI
        let child = this.createChild(parentOne, parentTwo);
        console.log(child);
        let rx = this.createRandomVector(1, child.xStdDev);
        let ry = this.createRandomVector(1, child.yStdDev);
        console.log(rx, ry);
        child.x = child.x + rx[0];
        child.y = child.y + ry[0];
        childrenArray.push(child);
      }

      //  (m+l)-ES
      let population = xpArray.concat(childrenArray);
      // (m,l)-ES
      if(onlyChildren) { 
        population = childrenArray;
      }
      xpArray = this.selectBest(mu, population, objectiveFunc);
      historyUpdateFunc(xpArray);
    }
  }

  createRandomVector(dimension, stdDev) {
    let r = new Array();
    for(let counter=0; counter < dimension; counter++) {
      r.push(this.randn_bm(stdDev));
    }
    return r;
  }

  adjustStdDev(stdDev, gen, ne) {
    let newStdDev = stdDev;
    let p = ne / gen;
    if(p < 0.2) {
      newStdDev = Math.pow(0.817,2) * stdDev
    } else if(p > 0.2) {
      newStdDev = stdDev / Math.pow(0.817,2);
    }
    return newStdDev;
  }

  initializeIndividuals(mu, stdDev, xl, xu, yl, yu) {
    let individualsArray = new Array(mu);
    for(let i=0; i < mu; i++) {
      individualsArray[i] = new Individual(xl, xu, yl, yu);
      individualsArray[i].xStdDev = 1 + (stdDev - 1) * Math.random();
      individualsArray[i].yStdDev = 1 + (stdDev - 1) * Math.random();
    }
    return individualsArray;
  }

  selectParentIndexes(mu) {
    let indexOne = getRandomInt(mu);
    let indexTwo = getRandomInt(mu);
    while(indexOne === indexTwo) {
      indexTwo = getRandomInt(mu);
    }
    return [indexOne, indexTwo];
  }

  createChild(parentOne, parentTwo) {
    // Intermediate
    let child = new Individual(0,0,0,0);
    child.x = (parentOne.x + parentTwo.x) / 2;
    child.y = (parentOne.y + parentTwo.y) / 2;
    child.xStdDev = (parentOne.xStdDev + parentTwo.xStdDev) / 2;
    child.yStdDev = (parentOne.yStdDev + parentTwo.yStdDev) / 2;    
    return child;
  }

  selectBest(mu, population, objectiveFunc) {
    for(let i=0; i < population.length; i++) {
      population[i].z = objectiveFunc(population[i].x, population[i].y);
    }
    
    population.sort((a,b) => {
      return a.z > b.z;
    });

    let newPopulation = population.slice(0, mu);
    console.log(newPopulation);
    return newPopulation;
  }

  randn_bm(stdDev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return (num - 0.5) * stdDev;
  }
}

class Individual {
  constructor(xl, xu, yl, yu) {
    this.x = xl + (xu - xl) * Math.random();
    this.y = yl + (yu - yl) * Math.random();
    this.z = 0;
    this.xStdDev = 0;
    this.yStdDev = 0;
  }
}