class BFO {

    constructor(p, S, Nc, Ns, Nre, Ned, Ped, Ci, boundariesArray, f, compareFunction, constraintList) {
        this.p = p;//Search Space dimension
        this.S = S;//Total amount of bacteria
        this.Nc = Nc;//Total amount of step (Chemotaxis)
        this.Ns = Ns;//Swims
        this.Nre = Nre;//Reproduction number
        this.Ned = Ned;//Eliminations number
        this.Ped = Ped;//Elimination and dispersal probability
        this.Ci = Ci;//	the run-length unit 

        this.boundariesArray = boundariesArray;

        //FITNESS constants
        this.d_attractant = 0.1;
        this.w_attractant = 0.2;
        this.h_repellant = 0.1;
        this.w_repellant = 10;

        this.f = f;//objective function

        this.compareFunction = compareFunction;
        this.constraintList = constraintList;


        this.population = new Array(this.S);

        this.generationList = [];

    }

    //Algorithm BFO
    exec() {

        //Step1 : Initialize Happened at construction
        this.initialize();



        //Step 2 : Elimination-Dispersal Loop l=l+1
        for (let l = 0; l < this.Ned; l++) {
            //Step 3: Reproduction Loop
            for (let k = 0; k < this.Nre; k++) {
                let startTime = performance.now();
                //Step 4: Chemotaxis Loop
                for (let j = 0; j < this.Nc; j++) {



                    this.chemotaxis();
                    //Step 5: if j < Nc continue
                }

                for(let i=0;i<this.population.length;i++)
                    this.population[i].results = this.getFeasibilityResults(this.population[i].dimensionArray);

                //Step 6: Reproduction
                this.reproduction();

                //Step 7: if K < Nre continue else stop
                let endTime = performance.now();

                this.logGeneration(this.population, endTime - startTime);
            }

            //Step 8: Elimination-dispersal: For i=1,2, S with prob Ped, eliminate and disperse each bacteria
            this.ElminationDispersal();



        }

    }

    //Initialize all the values (population)
    initialize() {
        for (let i = 0; i < this.S; i++) {
            this.population[i] = new Bacteria(this.p, this.boundariesArray, this.f);
        }
    }

    chemotaxis() {

        let J_last;


        //[a] For i=1,2...S take a chemotactic step for bacterium i as follows
        for (let i = 0; i < this.S; i++) {

            //[b] Compute fitness function
            for (let i = 0; i < this.population.length; i++) {
                this.computeFitness(this.population[i]);
            }

            //[c] Let J_lst = J(i,j,k,l) to save this value since we may find a better cost via a run
            J_last = this.population[i].fitness;

            //[d] Tumble: generate a random vector Delta(i) with each element Delta_m(i), m=1,2, p a random number [-1,1]
            let delta = this.tumble();

            //[e] Move: Let  θ_i(j+1,k,l) = θ_i(j,k,l) + C(i) * delta(i) / sqrt(delta*delta)
            let moved_bacteria = this.move(this.population[i], delta);

            //[f] Compute J(i,j + 1,k,l) + 𝐽𝑐𝑐(𝜃_i(j+1,k,l),𝑃(𝑗 + 1,𝑘,𝑒))
            moved_bacteria.computeObjectiveFunction();
            moved_bacteria.results = this.getFeasibilityResults(moved_bacteria.dimensionArray);
            this.computeFitness(moved_bacteria);


            this.population[i] = moved_bacteria;

            //[g] Swim
            //Let m=0 counter for swim length
            //while  m<Ns
            //Let m=m+1
            for (let m = 0; m < this.Ns; m++) {
                //if J(i,j+1,k,l) < Jlast let Jlast = J(i,j+1,k,l) = new fitness
                if (moved_bacteria.fitness < J_last
                    //&& moved_bacteria.fitness > 0
                    //&& this.getFeasibilityResults(moved_bacteria.dimensionArray).isFeasible
                ) {

                    J_last = moved_bacteria.fitness;

                    this.swim(moved_bacteria, delta);

                    moved_bacteria.computeObjectiveFunction();
                    moved_bacteria.results = this.getFeasibilityResults(moved_bacteria.dimensionArray);
                    this.computeFitness(moved_bacteria);

                    this.population[i] = moved_bacteria;
                } else//Else, let m=Ns, this is the end of the while statement
                    break;
            }

            //[h] Go to next baterium(i+1) if(i <> S) go to [b] to process next bact

            //REPRODUCTION: [a] for the given k and l, and for each i let j_i_health = SUM j=1 -> Nc + 1 J(i,j,k,l)
            this.population[i].health += this.population[i].fitness;
        }


    }

    computeFitness(bacteria) {
        let totalSumVal = 0;

        //Z i=1 -> S -D attractant exp
        for (let i = 0; i < this.S; i++) {


            //get the sum m=1 -> p of (θm - θim)2
            let sumThetaSq = 0;
            for (let m = 0; m < this.p; m++) {
                sumThetaSq += Math.pow(bacteria.dimensionArray[m] - this.population[i].dimensionArray[m], 2);
            }

            //[-d_attractant exp (-w_attractant * sumThetaSqrt] + [h_repellant exp (-w_repellant * sumThetaSqrt)]
            totalSumVal = totalSumVal + ((-1 * this.d_attractant) * Math.exp((-1 * this.w_attractant) * sumThetaSq))
            totalSumVal = totalSumVal + (this.h_repellant * Math.exp((-1 * this.w_repellant) * sumThetaSq));
        }

        //J(i,j,k,l) + 𝐽𝑐𝑐(𝜃,𝑃(𝑗,𝑘,𝑒))
        bacteria.fitness = bacteria.dimensionArray[this.p] + totalSumVal;
    }


    tumble() {

        let delta = new Array(this.p);//New Delta [-1,1]
        //New Delta Vector
        for (let i = 0; i < this.p; i++)
            delta[i] = this.randomRange(-1, 1);

        return delta;

    }

    move(bacteria, delta) {

        //Normalization for Delta by L2
        let norm = this.getNorm(delta);

        //Copy bacteria
        let moved_bacteria = Object.assign({}, bacteria);
        moved_bacteria.computeObjectiveFunction = bacteria.computeObjectiveFunction;

        for (let i = 0; i < this.p; i++) {
            moved_bacteria.dimensionArray[i] = bacteria.dimensionArray[i] + (this.Ci * (delta[i] / norm));

            //Not looking outside the search space
            if (moved_bacteria.dimensionArray[i] > this.boundariesArray[i].upper)
                moved_bacteria.dimensionArray[i] = this.boundariesArray[i].upper;
            if (moved_bacteria.dimensionArray[i] < this.boundariesArray[i].lower)
                moved_bacteria.dimensionArray[i] = this.boundariesArray[i].lower;
        }

        return moved_bacteria;
    }

    swim(bacteria, delta) {
        let norm = this.getNorm(delta);
        for (let i = 0; i < this.p; i++) {
            bacteria.dimensionArray[i] = bacteria.dimensionArray[i] + (this.Ci * (delta[i] / norm));

            //Not looking outside the search space
            if (bacteria.dimensionArray[i] > this.boundariesArray[i].upper)
                bacteria.dimensionArray[i] = this.boundariesArray[i].upper;
            if (bacteria.dimensionArray[i] < this.boundariesArray[i].lower)
                bacteria.dimensionArray[i] = this.boundariesArray[i].lower;
        }

    }

    getNorm(delta) {
        let norm = 0;
        for (let i = 0; i < this.p; i++)
            norm += Math.pow(delta[i], 2);
        norm = Math.sqrt(norm);

        return norm;
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    reproduction() {

        // [a] Given k and l computes Health should be done at Chemotaxis step


        //Sort bacteria and chemotactic parameters C(i) in order of ascending cost j_health (higher means lower health)
        this.population.sort(this.minimizeCompareFunction);

        //Half of the population dies and the other half splits
        //[b] The Sr bacteria with the highest J_health values dies and the remaining Sr splits
        let Sr = this.S / 2;
        for (let i = 0; i < Sr; i++) {
            this.population[Sr + i] = Object.assign({}, this.population[i]);
            this.population[Sr + i].computeObjectiveFunction = this.population[i].computeObjectiveFunction;

            //Should we reset the health?
            this.population[i].health = 0;
            this.population[Sr + i].health = 0;
        }


    }

    ElminationDispersal() {
        //Eliminate and disperse each baterium
        for (let i = 0; i < this.S; i++) {

            let rand_n = Math.random();

            if (rand_n <= this.Ped) {
                //If a bacterium is eliminated, simply disperse another one to a random location
                this.population[i] = new Bacteria(this.p, this.boundariesArray, this.f);
            }
        }
    }

    minimizeCompareFunction(a, b) {
        let fitnessIndex = a.dimensionArray.length - 1;

        let a_isFeasible = a.results.isFeasible && (a.dimensionArray[fitnessIndex] > 0);
        let b_isFeasible = b.results.isFeasible && (b.dimensionArray[fitnessIndex] > 0);

        if (a_isFeasible && b_isFeasible) {
            if (a.health < b.health) {
                return -1;
            } else if (a.health > b.health) {
                return 1;
            }
            return 0;
        } else if (a_isFeasible && !b_isFeasible) {
            return -1;
        } else if (!a_isFeasible && b_isFeasible) {
            return 1;
        } else {
            if (a.results.summation < b.results.summation) {
                return -1;
            } else if (a.results.summation > b.results.summation) {
                return 1;
            }
            return 0;
        }
    }

    getFeasibilityResults(springDataArray) {
        let resultObject = {};
        let summation = 0;
        let isFeasible = true;
        let constrainFunction;
        let result;

        for (let i = 0; i < this.constraintList.length; i++) {
            constrainFunction = this.constraintList[i];
            result = constrainFunction(...springDataArray);
            if (result > 0) {
                isFeasible = false;
            }
            summation += Math.max(0, result);
            resultObject[constrainFunction.name] = result;
        }

        resultObject["isFeasible"] = isFeasible;
        resultObject["summation"] = summation;
        return resultObject;
    }

    logGeneration(population, time) {
        let generationObj = {
            values: Object.assign([], population),
            bestSolutionIndex: 0,
            executionTime: time,
        };

        this.generationList.push(generationObj);
    }

    getAllGenerations() {
        return this.generationList;
    }
}

class Bacteria {
    constructor(p, boundariesArray, f) {
        this.dimensionArray = new Array();


        this.f = f;

        this.p = p;


        for (let i = 0; i < p; i++) {
            this.dimensionArray.push(this.randomParamValue(boundariesArray[i].lower, boundariesArray[i].upper));
        }

        this.computeObjectiveFunction();

        this.fitness = Infinity;

        this.health = 0;
    }

    computeObjectiveFunction() {
        this.dimensionArray[this.p] = this.f(...this.dimensionArray);
    }

    randomParamValue(lower, upper) {
        return lower + (upper - lower) * Math.random();
    }
}
