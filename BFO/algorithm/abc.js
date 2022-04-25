class ABC {
  constructor() { 
    this.bestIndex = 0;
  }

  exec(generations, population, objectiveFunc, xl, xu, yl, yu, pf, L, historyUpdateFunc) {
    this.bestIndex = 0;
    let po = population - pf;
    let workerBees = this.initializeWorkerBeePopulation(pf, xl, xu, yl, yu, objectiveFunc);

    for(let gen=0; gen < generations; gen++) {

      // First Step - Worker bees / Second Step Observer bees
      this.firstAndSecondStep(workerBees, objectiveFunc, pf, po, "first");

      // Second Step - Observer bees
      this.firstAndSecondStep(workerBees, objectiveFunc, pf, po, "second");

      // Third Step - Explorer bees
      this.thirdStep(workerBees, pf, L, xl, xu, yl, yu, objectiveFunc);
       
      historyUpdateFunc(workerBees);  
    }
  }

  initializeWorkerBeePopulation(population, xl, xu, yl, yu, objectiveFunc) {
    let beesArray = new Array(population);
    for(let i=0; i < population; i++) {
      beesArray[i] = new Bee(xl, xu, yl, yu);
      beesArray[i].computeFitnessValue(objectiveFunc);
    }
    return beesArray;
  }

  //worker
  firstAndSecondStep(workerBees, objectiveFunction, pf, po, step) {
    const isFirstStep = (step === "first");
    const P = (isFirstStep) ? pf : po;

    for(let i = 0; i < P; i++) {
      // Only difference with the first and second step is which X to use. 
      // Use Xi for first step and Xm for second step
      let indexToUse = 0;
      if(!isFirstStep) {
        const m = this.rouletteSelection(workerBees, workerBees[i]);
        indexToUse = m;
      } else {
        indexToUse = i;
      }
      let x = workerBees[indexToUse];

      let k = getRandomNumber(0,pf,true);
      while(k == indexToUse) {
        k = getRandomNumber(0,pf,true);
      }
      let xk = workerBees[k];
      let j = getRandomNumber(0,1,true);
      let p = getRandomNumber(-1,1,false);
      let vi = new Bee(0,0,0,0);
      vi.x = x.x;
      vi.y = x.y;
      if(j == 0) {
        vi.x = x.x + p * (x.x - xk.x);
      } else {
        vi.y = x.y + p * (x.y - xk.y);
      }

      vi.computeFitnessValue(objectiveFunction);
      x.computeFitnessValue(objectiveFunction);
      if(vi.z < x.z) {
        workerBees[indexToUse] = vi;
        vi.L = 0;
      } else {
        workerBees[indexToUse].L++;
      }
    }
  }
  //Observer
  secondStep(workerBees, po, pf) {
    for(let i = 0; i < po; i++) {
      let xm = this.rouletteSelection(workerBees, workerBees[i]);
      let k = getRandomNumber(0,pf,true);
      while(k == i) {
        k = getRandomNumber(0,pf,true);
      }
      let xk = workerBees[k];
      let j = getRandomNumber(0,1,true);
      let p = getRandomNumber(-1,1,false);
      let vm = new Bee(0,0,0,0);
      vm.x = xm.x;
      vm.y = xm.y;
      if(j == 0) {
        vm.x = xm.x + p * (xm.x - xk.x);
      } else {
        vm.y = xm.y + p * (xm.y - xk.y);
      }
    }
  }
  //Explorer
  thirdStep(workerBees, pf, L, xl, xu, yl, yu, objectiveFunc) {
    for(let i = 0; i < pf; i++) {
      if(workerBees[i].L > L) {
        workerBees[i] = new Bee(xl, xu, yl, yu);
        workerBees[i].computeFitnessValue(objectiveFunc);
      }
    }
  }

  rouletteSelection(population, exception) {
    let totalFitness = 0;
    for(let i=0; i < population.length; i++) {
      totalFitness += population[i].fitness;
    }

    for(let i=0; i < population.length; i++) {
      population[i].relativeFitness = population[i].fitness / totalFitness;
    }

    let r = Math.random();
    let f_sum = 0;
    for(let i=0; i < population.length; i++){
      if(exception && population[i] === exception) {
        continue;
      }

      f_sum += population[i].relativeFitness;
      if(f_sum >= r) {
        return i;
      }
    }
    return population.length-1;
  }

}

class Bee {
  constructor(xl, xu, yl, yu) {
    this.x = xl + (xu - xl) * Math.random();
    this.y = yl + (yu - yl) * Math.random();
    this.z = 0;
    this.fitness = 0;
    this.L = 0;
    this.relativeFitness = 0;
  }

  computeFitnessValue(objectiveFunction) { 
    this.z = objectiveFunction(this.x, this.y);
    if(this.z >= 0) {
        this.fitness = 1 / (1 + this.z);
    } else {
        this.fitness = 1 + Math.abs(this.z); 
    }
  }
}