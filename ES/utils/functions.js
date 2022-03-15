function functionOne(x, y) {
    return Math.pow((x - 2), 2) + Math.pow((y - 2), 2);
}

function rastrigin(x, y) {
    let A = 10;
    return A * 2 + Math.pow(x, 2) + Math.pow(y, 2) - (A * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)));
}

function dropwave(x, y){
    return (-1)*( (1 + Math.cos( 12 * Math.sqrt( Math.pow(x,2) + Math.pow(y,2) ) ) ) / (0.5 * ( Math.pow(x,2) + Math.pow(y,2) ) + 2 ) );
}

function functionTwo(x, y) {
    return x * Math.pow(2.7182, (-1) * (Math.pow(x, 2) + Math.pow(y, 2)));
}
