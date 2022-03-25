function pso(w, c1, c2, N, xl, xu, yl, yu, f, totalIterations, updateMemory) {

    let x = getRandomSwarm(N, xl, xu, yl, yu)
    x = initializeVelicity(x);

    xg = x[0];//best global / global learning rate
    iter = 0;

    do {

        for (let i = 0; i < x.length; i++) {
            x[i].fitness = f(x[i].x, x[i].y);
            if (x[i].fitness < x[i].best_fitness){
                x[i].best_x = x[i].x;
                x[i].best_y = x[i].y;
                x[i].best_fitness = x[i].fitness;
            }
        }

        xg = chooseBestGlobal(x);

        let r1 = Math.random();
        let r2 = Math.random();

        for (let i = 0; i < x.length; i++) {

            x[i].velocity[0] = (w * x[i].velocity[0]) + ((r1 * c1) * (x[i].best_x - x[i].x)) + ((r2 * c2) * (xg.x - x[i].x));
            x[i].velocity[1] = (w * x[i].velocity[1]) + ((r1 * c1) * (x[i].best_y - x[i].y)) + ((r2 * c2) * (xg.y - x[i].y));
            
            x[i].x = x[i].x + x[i].velocity[0];
            x[i].y = x[i].y + x[i].velocity[1];

        }

        if(updateMemory){
            updateMemory(clone(x),xg);
        }
        

        iter++;
    } while (iter < totalIterations);

    return x;

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
        if(x[i].fitness < bestG.fitness)
            bestG = x[i];    
    }

    return Object.assign({}, bestG);
}

function getRandomParticle(xl, xu, yl, yu) {
    let y = yl + (yu - yl) * Math.random();
    let x = xl + (xu - xl) * Math.random();

    return { "x": x, "y": y , "best_x" : x , "best_y" : y, "best_fitness" : Infinity};
}

function getRandomSwarm(N, xl, xu, yl, yu) {
    let population = new Array();
    for (let i = 0; i < N; i++) {
        let parent = getRandomParticle(xl, xu, yl, yu);
        population.push(parent);
    }

    return population;
}

function initializeVelicity(particles) {
    for (let i = 0; i < particles.length; i++){
        particles[i].velocity = new Array();
        particles[i].velocity[0] = particles[i].x * 0.1;
        particles[i].velocity[1] = particles[i].y * 0.1;
    }

    return particles;

}
