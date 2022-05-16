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

function ackley(x, y) {
  // -20*exp( -0.2*sqrt(0.5*(x.^2 + y.^2)) ) - exp( 0.5*(cos(2*pi*x)+cos(2*pi*y)) ) +20+exp(1);
  return -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (Math.pow(x,2) + Math.pow(y, 2)))) - Math.exp(0.5*( Math.cos(2*Math.PI*x)+Math.cos(2*Math.PI*y ) )) + 20*Math.exp(1);
}

function sphere(x, y) {
  // (x+2).^2 + (y+2).^2;
  return Math.pow(x+2, 2) + Math.pow(y+2, 2);
}

function booth(x, y) {
  // f(x,y)= (x+2y-7)^2+(2x+y-5)^2
  return Math.pow((x + (2*y) - 7), 2) + Math.pow((2*x) + y -5, 2);
}

function spring_weight(x1,x2,x3){
  return (x3 + 2) * (x2 * Math.pow(x1,2));
}

//D = x2
//d = x1
//N = x3

function g1(N,D,d){
  return 1 - ( (Math.pow(D,3)* N) /  (71785 * Math.pow(d,4)) );
}

function g2(D,d){
  return ( (4 * Math.pow(D,2) - (d*D)) / (12566 *  ( (D*Math.pow(d,3)) - Math.pow(d,4)) ) ) + ( 1 / (5108 * Math.pow(d,2)) ) - 1;
}

function g3(N,D,d){
  return 1 - ( (140.5 * d) / (Math.pow(D,2) * N) );
}

function g4(D,d){
  return ( (D+d) / 1.5 )  - 1;
}


//2D constraint validator
function max_fx(x1,x2){
  return ( Math.pow(Math.sin(2*Math.PI*x1),3) * Math.sin(2*Math.PI*x2) ) / ( Math.pow(x1,3) * (x1+x2) );
}

function mf_g1(x1,x2){
  return Math.pow(x1,2) - x2 + 1;
}

function mf_g2(x1,x2) {
  return 1 - x1 + (Math.pow(x2 - 4,2));
}
/*
  D = Coil Diameter 
  d = Wire Diameter
  N = # of active coils
*/
function springWeight(coilDiameter, wireDiameter, coilNumber){
  return (coilNumber + 2) * (coilDiameter * Math.pow(wireDiameter,2));
}

let constrainMinimumDeflection = (coilDiameter, wireDiameter, coilNumber) => {
  return 1 - ( (Math.pow(coilDiameter,3) * coilNumber) / ( 71785 * Math.pow(wireDiameter, 4)) );
}

let constrainShearStress = (coilDiameter, wireDiameter, coilNumber) => {
  return ( (4*Math.pow(coilDiameter,2) - coilDiameter*wireDiameter) / (12566*(coilDiameter * Math.pow(wireDiameter,3)-Math.pow(wireDiameter,4))) ) + (1/(5108*Math.pow(wireDiameter,2))) - 1;
} // 4 - 1 / 12566*

let constrainSurgeFrequency = (coilDiameter, wireDiameter, coilNumber)  => {
  return 1 - (140.45*coilDiameter / (Math.pow(wireDiameter,2)*coilNumber));
}

let constrainOutsideDiameter = (coilDiameter, wireDiameter, coilNumber)  =>{
  return (coilDiameter + wireDiameter)/1.5 - 1;
}

function paperFunction(x1, x2) {
  return Math.pow(Math.sin(2*Math.PI*x1),3) * Math.sin(2*Math.PI*x2) / Math.pow(x1, 3) * (x1 + x2);
}

function paperConstrain1(x1, x2) {
  return Math.pow(x1, 2) - x2 + 1;
}

function paperConstrain2(x1, x2) {
  return 1 - x1 + Math.pow((x2 - 4), 2);
}

let paperConstrains = [
  paperConstrain1,
  paperConstrain2
];

let constrainsFunctionsList = [
  //springWeight,
  constrainMinimumDeflection,
  constrainShearStress,
  constrainSurgeFrequency,
  constrainOutsideDiameter
];
/*
springObject[0] - COIL DIAMETER
springObject[1] - WIRE DIAMETER
springObject[2] - # ACTIVE COILS
*/

function paperConstrainGraphic1(x1) {
  return Math.pow(x1, 2) + 1;
}

function paperConstrainGraphic2(x1) {
  /*if(x1 >= 1) {
    return Math.sqrt(x1 - 1) + 4;
  } else {
    return -1 * Math.sqrt(x1-1) + 4;
  }*/
  return Math.pow(x1-4, 2) + 1;
}

function minimizeCompareFunction(a, b) {
  let fitnessIndex = a.dimensionArray.length-1;

  let a_isFeasible = a.results.isFeasible && (a.dimensionArray[fitnessIndex] > 0);
  let b_isFeasible = b.results.isFeasible && (b.dimensionArray[fitnessIndex] > 0);

  if(a_isFeasible && b_isFeasible) {
    if(a.dimensionArray[fitnessIndex] < b.dimensionArray[fitnessIndex]) {
      return -1;
    } else if(a.dimensionArray[fitnessIndex] > b.dimensionArray[fitnessIndex]) {
      return 1; 
    }
    return 0;
  } else if(a_isFeasible && !b_isFeasible) {
    return -1;
  } else if(!a_isFeasible && b_isFeasible) {
    return 1;
  } else {
    if(a.results.summation < b.results.summation) {
      return -1;
    } else if(a.results.summation > b.results.summation) {
      return 1;
    } 
    return 0;
  }      
}

function maximizeCompareFunction(a, b) {
  let fitnessIndex = a.dimensionArray.length-1;
  if(a.results.isFeasible && b.results.isFeasible) {
    if(a.dimensionArray[fitnessIndex] > b.dimensionArray[fitnessIndex]) {
      return -1;
    } else if(a.dimensionArray[fitnessIndex] < b.dimensionArray[fitnessIndex]) {
      return 1; 
    }
    return 0;
  } else if(a.results.isFeasible && !b.results.isFeasible) {
    return -1;
  } else if(!a.results.isFeasible && b.results.isFeasible) {
    return 1;
  } else {
    if(a.results.summation < b.results.summation) {
      return -1;
    } else if(a.results.summation > b.results.summation) {
      return 1;
    } 
    return 0;
  }      
}

function areSpringMeasuresValid(springObject) {
  if(springObject[0] <= 0 || springObject[1] <= 0 || springObject[2] <= 0) {
    return true;
  }
  return false;
}