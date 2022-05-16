function pso(w, c1, c2, N, l, u, f, totalIterations, updateMemory,report) {

    let x = getRandomSwarm(N, l, u,f)
    x = initializeVelicity(x);

    xg = x[0];//best global / global learning rate
    iter = 0;

    do {

        for (let i = 0; i < x.length; i++) {

            x[i].fitness = f(x[i].position[0], x[i].position[1],x[i].position[2]);
            
            if (x[i].fitness < x[i].best_fitness){
                x[i].best_x = Object.assign({}, x[i].position);
                x[i].best_fitness = x[i].fitness;
            }
        }

        xg = chooseBestGlobal(x);

        let r1 = Math.random();
        let r2 = Math.random();

        for (let i = 0; i < x.length; i++) {

            for(let j=0;j<x[i].position.length;j++){
                x[i].velocity[j] = (w * x[i].velocity[j]) + ((r1 * c1) * (x[i].best_x[j] - x[i].position[j])) + ((r2 * c2) * (xg.position[j] - x[i].position[j]));
                x[i].position[j] = x[i].position[j] + x[i].velocity[j];
            }
            

        }

        if(updateMemory){
            updateMemory(clone(x),xg);
        }

        if(report)
            report("d = " + xg.position[0] + ", D = " + xg.position[1] + ", N = " + xg.position[2] + ", W = " + xg.fitness);
        

        iter++;
    } while (iter < totalIterations);

    return x;

}

function isFeasible(particle){

    if(particle.fitness < 0)
        return false;

    let N = particle.position[2];
    let D = particle.position[1];
    let d = particle.position[0];
    
    let g1_val = g1(N,D,d);
    let g2_val = g2(D,d);
    let g3_val = g3(N,D,d);
    let g4_val = g4(D,d);

    if( g1_val <= 0
        && g2_val <= 0
        && g3_val <= 0
        && g4_val <= 0)
        return true;

    return false;
}

function computeConstraintsViolation(particle){
    let N = particle.position[2];
    let D = particle.position[1];
    let d = particle.position[0];
    
    let g1_val = g1(N,D,d);
    let g2_val = g2(D,d);
    let g3_val = g3(N,D,d);
    let g4_val = g4(D,d);

    return Math.max(0,g1_val) + Math.max(0,g2_val) + Math.max(0,g3_val) + Math.max(0,g4_val);
}

function clone(x){
    let cln = new Array();
    for(let i=0;i<x.length;i++){
        cln.push(Object.assign({}, x[i]));
    }

    return cln;
}

function chooseBestGlobal(x) {
    let bestG = x[0];
    for(let i=1;i<x.length;i++){
        if(x[i].fitness < bestG.fitness
            && x[i].fitness > 0
            && isFeasible(x[i]))
            bestG = x[i];    
    }

    return Object.assign({}, bestG);
}

function getRandomParticle(l, u,f) {

    let n_parent = {};
    n_parent.best_fitness = Infinity;
    
    do{
        n_parent.position = new Array();
        for(let i=0;i<l.length;i++)
            n_parent.position.push(l[i] + (u[i] - l[i]) * Math.random());

        n_parent.fitness = f(n_parent.position[0],n_parent.position[1],n_parent.position[2]);
    }while(
        n_parent.fitness > 0
        && isFeasible(n_parent)
    );

    n_parent.best_x = Object.assign({}, n_parent.position);
    return n_parent;
}

function getRandomSwarm(N, l, u,f) {
    let population = new Array();
    for (let i = 0; i < N; i++) {
        let parent = getRandomParticle(l, u,f);
        population.push(parent);
    }

    return population;
}

function initializeVelicity(particles) {
    for (let i = 0; i < particles.length; i++){
        particles[i].velocity = new Array();
        for(let j=0;j<particles[i].position.length;j++)
            particles[i].velocity[j] = particles[i].position[j] * 0.1;        
    }

    return particles;

}
