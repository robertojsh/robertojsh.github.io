
const A = 10;//Const needed for rastrigin func
let h = 2e-2;//amplified value
const V_SIZE = 50;
let NUM_MAX_STEPS = 500;

//Computes the descending gradient and returns the path and the min
function descending_gradient(func,g_func,x0,y0){

    let dg = [{ x: x0, y: y0, v : func(x0,y0) }];
    let xi = x0;
    let yi = y0;
    let g;
    let min = { x: x0, y: y0, v : func(x0,y0) }

    for(let i=0;i<NUM_MAX_STEPS;i++){

        //Compute gradient
        g = g_func(xi,yi,func);
        
        x1 = xi - h * g[0];
        y1 = yi - h * g[1];

        xi = x1;
        yi = y1;

        //Eval the min
        let cfv = func(xi,yi);
        
        if(cfv < min.v){

            dg.push({ x : xi, y : yi, v : cfv });

            min.x = xi;
            min.y = yi;
            min.v = cfv;
        }

    }

    return { "path" : dg, "min" : min };

}

function get_range_values(){
    let v = new Array(V_SIZE);
    let initial = -1*V_SIZE/2;
    for(let i=0;i<V_SIZE;i++){
        v[i] = initial++;
    }
    return v;
}

function randonFromRange(min,max){
    return Math.random()  * ((max - min + 1) + min);
}

function makeArrRanged(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      //arr.push((startValue + (step * i)).toFixed(2));
      arr.push(startValue + (step * i));
    }
    return arr;
  }

//https://la.mathworks.com/help/gads/example-rastrigins-function.html
function f_rastrigin(x, y){
   return A*2 + Math.pow(x,2) + Math.pow(y,2) - ( A * ( Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y) ) );
}

function f_sphere(x,y){
    return (Math.pow(x,2) + Math.pow(y,2))*1;
}

//Gradient return as vector
function grad_f(x,y,f){
    let dx = ( f(x + h, y) - f(x,y) ) / h;
    let dy = ( f(x, y + h) - f(x,y) ) / h;

    return [dx,dy];
}



