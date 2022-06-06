class AFSA{

    constructor(dim, population,iterations, trytimes,visual,step,u,l,f){
        this.dim = dim;
        this.population = population;
        this.iterations = iterations;
        this.trytimes = trytimes;
        this.visual = visual;
        this.step = step;
        this.u = u;
        this.l = l;
        this.f = f;
        this.groupFish = new Array(population);
    }

    initiliaze(){

        for(let i=0;i<this.population;i++){
            this.groupFish[i] = new Fish(this.dim,this.l,this.u,this.f);
        }

    }

    getBestFish(){
        this.groupFish.sort((a,b) => {

            if( a.z < b.z)
                return -1;
            if(a.z > b.Z)
                return 1;

            return 0;
        });

        return this.groupFish[0];
    }

    follow(fish,tmpFish){

        for(let i=0;i<this.dim;i++){
            fish.position[i] = fish.position[i] + (((tmpFish.position[i]-fish.position[i]) / this.eucDistance(tmpFish.position,fish.position))*this.step*Math.random());
        }

        fish.computeObjectiveFunction();

    }

    swarm(fish,best){
        for(let i=0;i<this.dim;i++){
            fish.position[i] = fish.position[i] + (((best.position[i]-fish.position[i]) / this.eucDistance(best.position,fish.position))*this.step*Math.random());
        }

        fish.computeObjectiveFunction();
    }

    prey(fish,tmpFish,best,j){

        let crowdFactor = this.randomRange(0.5,1);
        let new_position = new Array(this.dim);

        for(let i=0;i<this.dim;i++){
            new_position[i] =  fish.position[i] + (((tmpFish.position[i]-fish.position[i]) / this.eucDistance(tmpFish.position,fish.position))*this.step*Math.random());
        }

        let new_fitness = this.f(new_position[0],new_position[1]);

        let nf = this.visual * this.population;

        for(let i=0;i<nf;i++){

            let centers = [];
            
            if(j != 0 && j!=(this.population-1)){
                for(let x=0;x<this.dim;x++){
                    centers.push(this.groupFish[j-1].position[x]+this.groupFish[j].position[x]+this.groupFish[j+1].position[x])
                }
            }

            let center_fitness = this.f(centers[0],centers[1]);
            

            if(best.fitness > fish.fitness
                && (nf/this.population) < crowdFactor){
                    this.follow(fish,tmpFish);
                }
            else if(center_fitness && center_fitness > fish.fitness
                && (nf/this.population)<crowdFactor){
                    this.swarm(fish,best);
                }
            else{
                fish.position = new_position;
                fish.fitness = new_fitness;
            }

        }

    }

    //https://supunkavinda.blog/js-euclidean-distance
    eucDistance(a, b) {
        return a
            .map((x, i) => Math.abs( x - b[i] ) ** 2) // square the difference
            .reduce((sum, now) => sum + now) // sum
            ** (1/2)
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    exec(historyUpdate){

        let storeBest = new Array();

        this.initiliaze();

        let best = this.getBestFish();

        storeBest.push(Object.assign({},best));

        let i =0;

        while(i < this.iterations){

            let j = 0;

            while(j < this.population){

                let k = 0;

                while(k < this.trytimes){

                    let moved_fish = this.groupFish[j].makeTempPosition(this.visual);

                    if(this.groupFish[j].fitness < moved_fish.fitness){
                        this.prey(this.groupFish[j],moved_fish,best,j);
                        break;
                    }

                    k++;

                }
                this.groupFish[j].moveRandomly(this.visual);
                j++;
            }

            if(historyUpdate)
                historyUpdate(this.groupFish);


            i++;

            best = this.getBestFish();
            storeBest.push(Object.assign({},best));

        }

        if(historyUpdate)
                historyUpdate(storeBest);

    }
}

class Fish{

    constructor(dim,l,u,f){

        this.position = new Array(dim);
        this.u = u;
        this.l = l;
        this.f = f;

        for (let i = 0; i < p; i++) {
            this.position[i] = this.randomParamValue();
        }

        this.fitness = Infinity;
        this.z = Infinity;
        this.computeObjectiveFunction();


    }

    moveRandomly(visual){
        for(let i=0;i<this.position.length;i++){
            this.position[i] = this.position[i]+(visual * Math.random());
        }

        this.computeObjectiveFunction();
    }

    makeTempPosition(visual){

        let f = new Fish(this.dim,this.l,this.u,this.f);

        //f.computeObjectiveFunction = this.computeObjectiveFunction;
        //f.makeTempPosition = this.makeTempPosition;

        for(let i=0;i<f.position.length;i++){
            f.position[i] = this.position[i]+(visual * Math.random());
        }

        f.computeObjectiveFunction();

        return f;
    }

    computeObjectiveFunction() {
        this.fitness = this.f(this.position[0],this.position[1]);
        this.z = this.fitness;
    }

    randomParamValue() {
        return this.l + (this.u - this.l) * Math.random();
    }

}