function fe(x,y){
    return parseFloat(x * Math.pow(Math.E, -1 * (Math.pow(x,2) + Math.pow(y,2))));
}

function _f(x, y) {
    return Math.pow((x - 2), 2) + Math.pow((y - 2), 2);
}

function makeArrRanged(startValue, stopValue, cardinality, pt) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
        let nv = startValue + (step * i);
        arr.push(nv);
    }
    return arr;
}


function f_rastrigin(x, y) {
    let A = 10;
    return A * 2 + Math.pow(x, 2) + Math.pow(y, 2) - (A * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)));
}

function f_dropwave(x,y){
    return (-1)*( (1 + Math.cos( 12 * Math.sqrt( Math.pow(x,2) + Math.pow(y,2) ) ) ) / (0.5 * ( Math.pow(x,2) + Math.pow(y,2) ) + 2 ) );
}

function f_sphere_2(x,y){
    return Math.pow(x+2,2) + Math.pow(y+2,2);
}

function f_sphere(x,y){
    return (Math.pow(x,2) + Math.pow(y,2))*1;
}

let a = 20;
let b = 0.2;
let c = 2 * Math.PI;

function f_ackley(x,y){
    let aa = (-a * Math.pow( Math.E,(-b * Math.sqrt(0.5 * (Math.pow(x,2) + Math.pow(y,2)))) ));
    let bb = Math.pow(Math.E, (0.5 * (Math.cos(c * x) + Math.cos(c*y))));
    let cc = a + Math.pow(Math.E,1);

    return aa - bb + cc;
}