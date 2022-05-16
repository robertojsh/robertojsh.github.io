class GA {

    constructor(N,generations, f, pm,boundariesArray, compareFunction, constraintList) {
        this.N = N;
        this.generations = generations;
        this.f = f;
        this.pm = pm;
        
        this.boundariesArray = boundariesArray;

        this.compareFunction = compareFunction;
        this.constraintList = constraintList;
        this.generationList = new Array();

    }

    generatePopulation(population_size, boundariesArray) {
        let population = [];

        for (let i = 0; i < population_size; i++) {

            let g = new Gene(this.boundariesArray.length,this.f);

            for(let j=0;j < boundariesArray.length; j++)
                g.dimensionArray.push(boundariesArray[j].lower + (boundariesArray[j].upper - boundariesArray[j].lower) * Math.random());

            g.dimensionArray[this.boundariesArray.length] = Infinity;
            population.push(g);
        }

        return population;
    }

    evalFitness(gene) {

        gene.dimensionArray[gene.dimensionArray.length-1] = this.f(...gene.dimensionArray);
        gene.results = this.getFeasibilityResults(gene.dimensionArray);

        if(gene.dimensionArray[gene.dimensionArray.length-1] < 0) {
            gene.fitness = 1 + Math.abs(gene.dimensionArray[gene.dimensionArray.length-1]);
        }
        else {
            gene.fitness = 1 / (1 + gene.dimensionArray[gene.dimensionArray.length-1]);
        }
        return gene.fitness;
    }

    evalFitnessAll(population) {
        for (let i = 0; i < population.length; i++)
            this.evalFitness(population[i]);
    }

    tournamentSelection(population,exception){

        let sorted_population = Object.assign([],population);



        //Sort bacteria and chemotactic parameters C(i) in order of ascending cost j_health (higher means lower health)
        sorted_population.sort(this.minimizeCompareFunction);
        
        if (exception) {
            if (!exception.same(sorted_population[0]))
                return sorted_population[0];
            else {
                return sorted_population[1];

            }
        }

        return sorted_population[0];

        
    }

    rouletteSelection(population,exception){

        let totalFitness = 0;

        for(let i=0;i<population.length;i++)
            totalFitness += population[i].fitness;

        for(let i=0;i<population.length;i++)
            population[i].relativeFitness = population[i].fitness / totalFitness;
            
        let r = Math.random();

        let f_sum = 0;

        for(let i=0;i<population.length;i++){
            
            if(exception && population[i].same(exception))
                continue;
            
            f_sum += population[i].relativeFitness;
            if(f_sum >= r)
                return population[i];
        }

        return population[population.length-1];
    }


    offspring(p1,p2){

        let c1 = this.createNewGene(p1.dimensionArray);
        let c2 = this.createNewGene(p2.dimensionArray);

        c1.same = p1.same;
        c2.same = p1.same;

        let children = [c1,c2];
        //offspring point
        let op = getRandomNumber(1,p1.dimensionArray.length,true);
        let crossIndex = 1;
        let crossIndex2 = 0;
        for(let i=1;i<op;i++){
             children[crossIndex].dimensionArray[i] = p1.dimensionArray[i];
             children[crossIndex2].dimensionArray[i] = p2.dimensionArray[i];

             crossIndex = 1 - crossIndex;
             crossIndex2 = 1 - crossIndex2;
        }


        return [c1,c2];
    }

    createNewGene(dimensionArray){
        let g = new Gene(this.p,this.f);
        g.dimensionArray = Object.assign([],dimensionArray);
        return g;
    }

    mutate(population,pm,boundariesArray){

        for(let i=0; i<population.length; i++){

            for(let j=0;j<boundariesArray.length;j++){
                let r = Math.random();
                if(r > pm)
                    population[i].dimensionArray[j] = (boundariesArray[j].lower + (boundariesArray[j].upper - boundariesArray[j].lower) * Math.random());
            }
        
        }
    }

    minimizeCompareFunction(a, b) {
        let fitnessIndex = a.dimensionArray.length - 1;

        let a_isFeasible = a.results.isFeasible;
        let b_isFeasible = b.results.isFeasible;

        if (a_isFeasible && b_isFeasible) {
            if (a.fitness < b.fitness) {
                return -1;
            } else if (a.fitness > b.fitness) {
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
            values: population,
            bestSolutionIndex: this.getBest(population),
            executionTime: time,
        };

        this.generationList.push(generationObj);
    }

    getBest(population){
        let best = 0;
        let zIndex = population[best].dimensionArray.length-1;

        for(let i=1;i<population.length;i++){
            if(population[i].dimensionArray[zIndex] < population[best].dimensionArray[zIndex])
                best = i;
        }

        return best;
    }

    getAllGenerations(){
        return this.generationList;
    }

    exec() {

        let total_population = this.N;
        let iter_generations = 0;

        let population = this.generatePopulation(total_population, this.boundariesArray);

        do {
            let startTime = performance.now();

            this.evalFitnessAll(population);

            let children = [];
            let con = 0;

            children.push(population.sort(this.minimizeCompareFunction)[0]);
            children.push(population.sort(this.minimizeCompareFunction)[1]);
            while(children.length < population.length){
                let p1 = this.tournamentSelection(population);
                let p2 = this.tournamentSelection(population,p1);
                //let p1 = this.rouletteSelection(population);
                //let p2 = this.rouletteSelection(population,p1);
                
                let offspring = this.offspring(p1,p2);

                children.push(offspring[0]);
                children.push(offspring[1]);

                //children.push(population[con]);
                con++;
            }

            this.mutate(children,this.pm,this.boundariesArray);

            population = Object.assign([],children);

            
            let endTime = performance.now();

            this.logGeneration(population, endTime - startTime);
            
            iter_generations++;
        }
        while (iter_generations < this.generations);

        this.evalFitnessAll(population);

        return population;
    }

    
}

class Gene {
    constructor(p,f) {
        this.dimensionArray = new Array();


        this.f = f;

        this.p = p;

        this.fitness = Infinity;
        this.relativeFitness=0;
    }

    same(g) {        

        for(let i=0;i<this.dimensionArray.length-1;i++){
            if(this.dimensionArray[i] != g.dimensionArray[i])
                return false;
        }

        return true;
    }
}

