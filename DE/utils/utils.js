function generateVz(f, x, y, cardinality) {
    let z = new Array(cardinality);
    for (let i = 0; i < cardinality; i++) {
        z[i] = new Array();
        for (let j = 0; j < cardinality; j++)
            z[i][j] = f(x[i], y[j]);
    }
    return z;
}

function makeArrRanged(startValue, stopValue, cardinality) {
  let arr = [];
  let step = (stopValue - startValue) / (cardinality - 1);
  for (let i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
  }
  return arr;
}

function calculateFunctionPointsData(activeFunction, xl, xu, yl, yu, cardinality) {
  let x = makeArrRanged(xl, xu, cardinality);
  let y = makeArrRanged(yl, yu, cardinality);
  let functionData = {
    x: x,
    y: y,
    z: generateVz(activeFunction, x, y, cardinality)
  };
  return functionData;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomNumber(low, upper) {
  let value = Math.random();
  if(low !== undefined && upper !== undefined) {
    value = low + (upper - low) * value;
  }  
  return value;
}