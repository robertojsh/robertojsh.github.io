class DE {
  constructor() { 
    this.bestIndex = 0;
  }

  exec(deVersion, generations, population, objectiveFunc, xl, xu, yl, yu, cr, lambda, historyUpdateFunc) {
    this.bestIndex = 0;
    let X = this.initializePopulation(population, xl, xu, yl, yu);
    for(let gen=0; gen < generations; gen++) {
      for(let i=0; i < population; i++) {
        let vi = this.mutation(i, X, lambda, deVersion);        
        let ui = this.recombine(X[i], vi, cr);    
        X[i] = this.selection(X[i], ui, objectiveFunc); 
        
        if(X[i].z < X[this.bestIndex].z) {
          this.bestIndex = i;
        }       
      }    
      historyUpdateFunc(X);  
    }
  }

  initializePopulation(population, xl, xu, yl, yu) {
    let individualsArray = new Array(population);
    for(let i=0; i < population; i++) {
      individualsArray[i] = new Individual(xl, xu, yl, yu);
    }
    return individualsArray;
  }

  mutation(i, X, lambda, version) {
    let xi = 0;
    let yi = 0;
    if(version === "DE/rand/1/bin") {
      let pickedIndexes = this.selectRandomIndexes(X.length, 3, i);
      let xr1 = X[pickedIndexes[0]];
      let xr2 = X[pickedIndexes[1]];
      let xr3 = X[pickedIndexes[2]];
      xi = xr1.x + (lambda * (xr2.x - xr3.x));
      yi = xr1.y + (lambda * (xr2.y - xr3.y));

    } else if(version === "DE/best/1/bin") {
      let pickedIndexes = this.selectRandomIndexes(X.length, 2, this.bestIndex);
      let xr1 = X[pickedIndexes[0]];
      let xr2 = X[pickedIndexes[1]];
      let xrB = X[this.bestIndex];
      xi = xrB.x + (lambda * (xr1.x - xr2.x));
      yi = xrB.y + (lambda * (xr1.y - xr2.y));

    } else if(version === "DE/best/2/bin") {
      let pickedIndexes = this.selectRandomIndexes(X.length, 4, this.bestIndex);
      let xr1 = X[pickedIndexes[0]];
      let xr2 = X[pickedIndexes[1]];
      let xr3 = X[pickedIndexes[2]];
      let xr4 = X[pickedIndexes[3]];
      let xrB = X[this.bestIndex];
      xi = xrB.x + (lambda * (xr1.x - xr2.x)) + (lambda * (xr3.x - xr4.x));
      yi = xrB.y + (lambda * (xr1.y - xr2.y)) + (lambda * (xr3.y - xr4.y));
    } 

    return {x: xi, y: yi};
  }

  recombine(xi, vi, cr) {
    let ui = {x:0, y:0};
    // For X
    let rax = getRandomNumber();
    if(rax <= cr) {
      ui.x = vi.x;
    } else {
      ui.x = xi.x;
    }

    // For Y    
    let ray = getRandomNumber();
    if(ray <= cr) {
      ui.y = vi.y;
    } else {
      ui.y = xi.y;
    }
    ui.z = 0;
    return ui;
  }

  selection(X, u, objectiveFunc) {
    X.z = objectiveFunc(X.x, X.y);
    u.z = objectiveFunc(u.x, u.y);
    if(u.z < X.z) {
      return u;
    }
    return X;
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
}

class Individual {
  constructor(xl, xu, yl, yu) {
    this.x = xl + (xu - xl) * Math.random();
    this.y = yl + (yu - yl) * Math.random();
    this.z = 0;
  }
}