class BFO {

    constructor(p, S, Nc, Ns,Nre, Ned, Ped,Ci, l, u, f) {
        this.p = p;//Search Space dimension
        this.S = S;//Total amount of bacteria
        this.Nc = Nc;//Total amount of step (Chemotaxis)
        this.Ns = Ns;//Swims
        this.Nre = Nre;//Reproduction number
        this.Ned = Ned;//Eliminations number
        this.Ped = Ped;//Elimination and dispersal probability
        this.Ci = Ci;//	the run-length unit 

        this.l = l;//bottom of values
        this.u = u;//hat of values

        //FITNESS constants
        this.d_attractant = 0.1;
        this.w_attractant = 0.2;
        this.h_repellant = 0.1;
        this.w_repellant = 10;

        this.f = f;//objective function


        this.population = new Array(this.S);

    }

    //Algorithm BFO
    exec(historyUpdate) {

        //Step1 : Initialize Happened at construction
        this.initialize(this.p,this.l,this.u,this.f);

        

        //Step 2 : Elimination-Dispersal Loop l=l+1
        for (let l = 0; l < this.Ned; l++) {
            //Step 3: Reproduction Loop
            for (let k = 0; k < this.Nre; k++) {
                //Step 4: Chemotaxis Loop
                for (let j = 0; j < this.Nc; j++) {
                    this.chemotaxis();

                    if(historyUpdate)
                        historyUpdate(this.population);

                    //Step 5: if j < Nc continue
                }

                //Step 6: Reproduction
                this.reproduction();

                //Step 7: if K < Nre continue else stop

            }

            //Step 8: Elimination-dispersal: For i=1,2, S with prob Ped, eliminate and disperse each bacteria
            this.ElminationDispersal();

            

        }

    }

    //Initialize all the values (population)
    initialize(p, l, u, f) {
        for (let i = 0; i < this.S; i++) {
            this.population[i] = new Bacteria(p, l, u, f);
        }
    }

    chemotaxis() {

        let J_last;


        //[a] For i=1,2...S take a chemotactic step for bacterium i as follows
        for (let i = 0; i < this.S; i++) {

            //[b] Compute fitness function
            for(let i=0;i<this.population.length;i++){
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
            this.computeFitness(moved_bacteria);


            this.population[i] = moved_bacteria;

            //[g] Swim
            //Let m=0 counter for swim length
            //while  m<Ns
            //Let m=m+1
            for (let m = 0; m < this.Ns; m++) {
                //if J(i,j+1,k,l) < Jlast let Jlast = J(i,j+1,k,l) = new fitness
                if (moved_bacteria.fitness < J_last) {

                    J_last = moved_bacteria.fitness;

                    this.swim(moved_bacteria,delta);

                    moved_bacteria.computeObjectiveFunction();
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
        //Z i=1 -> S -D attractant exp
        let totalSumVal = 0;
        for (let i = 0; i < this.S; i++) {

            //get the sum m=1 -> p of (θm - θim)2
            let sumThetaSqrt = 0;
            for (let m = 0; m < this.p; m++) {
                sumThetaSqrt += Math.pow(bacteria.position[m] - this.population[i].position[m], 2);
            }

            //[-d_attractant exp (-w_attractant * sumThetaSqrt] + [h_repellant exp (-w_repellant * sumThetaSqrt)]
            totalSumVal += ((-1 * this.d_attractant) * Math.exp((-1 * this.w_attractant) * sumThetaSqrt)) + (this.h_repellant * Math.exp((-1 * this.w_repellant) * sumThetaSqrt));
        }

        //J(i,j,k,l) + 𝐽𝑐𝑐(𝜃,𝑃(𝑗,𝑘,𝑒))
        bacteria.fitness = bacteria.z + totalSumVal;
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
            moved_bacteria.position[i] = bacteria.position[i] + (this.Ci * (delta[i] / norm));

            //Not looking outside the search space
            if(moved_bacteria.position[i] > this.u)
                moved_bacteria.position[i] = this.u;
            if(moved_bacteria.position[i] < this.l)
                moved_bacteria.position[i] = this.l;
        }

        return moved_bacteria;
    }

    swim(bacteria, delta) {
        let norm = this.getNorm(delta);
        for (let i = 0; i < this.p; i++){
            bacteria.position[i] = bacteria.position[i] + (this.Ci * (delta[i] / norm));

            //Not looking outside the search space
            if(bacteria.position[i] > this.u)
                bacteria.position[i] = this.u;
            if(bacteria.position[i] < this.l)
                bacteria.position[i] = this.l;
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

    reproduction(){
        
        // [a] Given k and l computes Health should be done at Chemotaxis step


        //Sort bacteria and chemotactic parameters C(i) in order of ascending cost j_health (higher means lower health)
        this.population.sort((a,b) => {

            if( a.health < b.health)
                return -1;
            if(a.health > b.health)
                return 1;

            return 0;
        });

        //Half of the population dies and the other half splits
        //[b] The Sr bacteria with the highest J_health values dies and the remaining Sr splits
        let Sr = this.S / 2;
        for(let i=0;i<Sr;i++){
            this.population[Sr+i] = Object.assign({}, this.population[i]);
            this.population[Sr+i].computeObjectiveFunction = this.population[i].computeObjectiveFunction;
        }


    }

    ElminationDispersal(){
        //Eliminate and disperse each baterium
        for(let i=0;i<this.S;i++){

            let rand_n = Math.random();

            if(rand_n <= this.Ped){
                //If a bacterium is eliminated, simply disperse another one to a random location
                this.population[i] = new Bacteria(this.p,this.l,this.u,this.f);

            }
        }
    }
}

class Bacteria {
    constructor(p, l, u, f) {
        this.position = new Array(p);
        this.l = l;
        this.u = u;

        this.f = f;

        for (let i = 0; i < p; i++) {
            this.position[i] = this.randomParamValue();
        }

        this.computeObjectiveFunction();
        this.fitness = Infinity;

        this.health = 0;
    }

    computeObjectiveFunction() {
        this.z = this.f(this.position[0],this.position[1]);
        
        if(this.z < best.z){
            best = { x:this.position[0], y: this.position[1], z: this.z };
            report(best.x + " y : " + best.y + " z = " + best.z);
        }
    }

    randomParamValue() {
        return this.l + (this.u - this.l) * Math.random();
    }
}

best = { x: Infinity, y: Infinity, z : Infinity};