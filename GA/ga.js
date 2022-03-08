class GA {

    constructor() {

    }

    generatePopulation(population_size, xl, xu, yl, yu) {
        let population = [];

        for (let i = 0; i < population_size; i++) {
            let xi = xl + (xu - xl) * Math.random();
            let g = new Gene(xi);
            if(yl && yu)
                g.y = yl + (yu - yl) * Math.random();

            population.push(g);
        }

        return population;
    }

    evalFitness(gene, f) {
        gene.z = f(gene.x,gene.y);
        if(gene.z < 0) {
            gene.fitness = 1 + Math.abs(gene.z);
        }
        else {
            gene.fitness = 1 / (1 + gene.z);
        }
        return gene.fitness;
    }

    evalFitnessAll(population, f) {
        for (let i = 0; i < population.length; i++)
            this.evalFitness(population[i], f);
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
        let c1 = new Gene(p2.x);
        let c2 = new Gene(p1.x);

        if(p1.y)
            c2.y = p1.y;

        if(p2.y)
            c1.y = p2.y;

        return [c1,c2];
    }

    mutate(population,pm,xl,xu,yl,yu){

        for(let i=0; i<population.length; i++){

            let rx = Math.random()
            if(rx > pm)
                population[i].x = xl + (xu - xl) * Math.random();

            //Determines if Y is defined
            if(population[i].y){
                let ry = Math.random();
                if(ry > pm)
                    population[i].y = yl + (yu - yl) * Math.random();
            }
        
        }
    }

    exec(N,generations, f, pm, xl, xu, yl, yu, updateFunction) {

        let total_population = N;
        let iter_generations = 0;

        let population = this.generatePopulation(total_population, xl, xu,yl,yu);

        do {

            this.evalFitnessAll(population,f);

            if(updateFunction) {
                updateFunction(iter_generations,population);
            }

            let children = [];

            while(children.length < population.length){
                let p1 = this.rouletteSelection(population);
                let p2 = this.rouletteSelection(population,p1);

                let offspring = this.offspring(p1,p2);

                children.push(offspring[0]);
                children.push(offspring[1]);
            }

            this.mutate(children,pm,xl,xu,yl,yu);

            population = children;

            iter_generations++;
        }
        while (iter_generations < generations);

        this.evalFitnessAll(population,f);

        return population;
    }
}

class Gene {
    constructor(x) {
        this.x = x;
        this.y;
        this.z = 0;
        this.fitness = -1;
        this.relativeFitness=0;
    }

    same(g) {
        return (this.x == g.x) && (!this.y || this.y == g.y);
    }
}
