let activeFunctionString = "";
let activeFunction;
let xl = 0;
let xu = 0;
let yl = 0;
let yu = 0;
let generations = 0;
let var2 = 0;
let esObj;
let history = {};
let CARDINALITY = 100;
let functionData;
let lambda;
let mu;

function init() {
  esObj = new ES();
}

function historyUpdate(generationPoints) {
  let xPoint = [];
  let yPoint = [];
  let zPoint = [];
  for(let i=0; i < generationPoints.length; i++) {
    xPoint.push(generationPoints[i].x);
    yPoint.push(generationPoints[i].y);
    zPoint.push(generationPoints[i].z);
  }
  let points = {
    x: xPoint,
    y: yPoint,
    z: zPoint
  }
  console.log(points);
  history.generations.push(points);
}

function getFunction(functionName) {
  let returnFunc;
  if(functionName === "functionOne") {
    returnFunc = functionOne;
  } else if(functionName === "functionTwo") {
    returnFunc = functionTwo;
  } else if(functionName === "rastrigin") {
    returnFunc = rastrigin;
  } else if(functionName === "dropwave") {
    returnFunc = dropwave;
  }
  return returnFunc;
}

function startExec() {
  history.generations = [];
  activeFunctionString = document.querySelector('input[name="functionSelected"]:checked').value;
  activeFunction = getFunction(activeFunctionString); 
  xl = parseInt(document.getElementById("xl").value);
  xu = parseInt(document.getElementById("xu").value);
  yl = parseInt(document.getElementById("yl").value);
  yu = parseInt(document.getElementById("yu").value);
  var2 = parseInt(document.getElementById("var2").value);
  generations = parseInt(document.getElementById("generations").value);
  esVersion = document.getElementById("esVersion").value;
  mu = parseInt(document.getElementById("mu").value);
  lambda = parseInt(document.getElementById("lambda").value);

  esObj.exec(esVersion, generations, var2, activeFunction, xl, xu, yl, yu, mu, lambda, historyUpdate);

  functionData = calculateFunctionPointsData(activeFunction, xl, xu, yl, yu, CARDINALITY);
  document.getElementById("graphContainer").style.display = "";
  document.getElementById("generationId").value = generations;
  updateGraphic(generations);
}

function updateGraphic(value) {
  if(value > 0 && value <= generations) {
    let generationToUse = history.generations[value-1];
    draw(functionData, generationToUse);
  }
}


window.onload = function() {
  init();
  let nextGenBtn = document.getElementById("nextGenBtn");
  let prevGenBtn = document.getElementById("prevGenBtn");
  let genIdInput = document.getElementById("generationId");

  nextGenBtn.addEventListener("click", () => {
    let currentGen = parseInt(genIdInput.value);
    if(currentGen !== generations) {
      let newGen = currentGen + 1;
      genIdInput.value = newGen;
      updateGraphic(newGen);
    }    
  });

  prevGenBtn.addEventListener("click", () => {    
    let currentGen = parseInt(genIdInput.value);
    if(currentGen !== 1) {
      let newGen = currentGen - 1;
      genIdInput.value = newGen;
      updateGraphic(newGen);
    }    
  });

  genIdInput.addEventListener("change", () => {
    updateGraphic(parseInt(genIdInput.value));
  });
};