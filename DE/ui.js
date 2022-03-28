let activeFunctionString = "";
let activeFunction;
let xl = 0;
let xu = 0;
let yl = 0;
let yu = 0;
let deVersion = "";
let generations = 0;
let deObj;
let history = {};
let CARDINALITY = 100;
let functionData;
let lambda;
let cr;
let population = 0;

function init() {
  deObj = new DE();
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
  history.generations.push(points);
}

function getFunction(functionName) {
  let returnFunc;
  if(functionName === "rastrigin") {
    returnFunc = rastrigin;
  } else if(functionName === "dropwave") {
    returnFunc = dropwave;
  } else if(functionName === "ackley") {
    returnFunc = ackley;
  } else if(functionName === "sphere") {
    returnFunc = sphere;
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
  generations = parseInt(document.getElementById("generations").value);
  deVersion = document.getElementById("deVersion").value;
  cr = parseFloat(document.getElementById("cr").value);
  lambda = parseInt(document.getElementById("lambda").value);
  population = parseInt(document.getElementById("population").value);
  deObj.exec(deVersion, generations, population, activeFunction, xl, xu, yl, yu, cr, lambda, historyUpdate);

  functionData = calculateFunctionPointsData(activeFunction, xl, xu, yl, yu, CARDINALITY);
  document.getElementById("graphContainer").style.display = "";
  document.getElementById("generationId").value = generations;
  updateGraphic(generations);
  document.getElementById("bestX").value = Math.round(history.generations[generations-1].x[deObj.bestIndex]);
  document.getElementById("bestY").value = Math.round(history.generations[generations-1].y[deObj.bestIndex]);
  document.getElementById("bestZ").value = Math.round(history.generations[generations-1].z[deObj.bestIndex]);
}

function runTest() {
  let runs = 30;
  let versions = ["DE/rand/1/bin", "DE/best/1/bin", "DE/best/2/bin"];
  let objFunctions = ["rastrigin", "ackley", "sphere"];
  let activeFunc;
  let txl = 0;
  let txu = 0;
  let tyl = 0;
  let tyu = 0;
  let generationsToRun = 100;
  let populationN = 100;  
  let data = [];
  data.push("ITERATION,FUNCTION,VERSION,X,Y,Z");

  for(let i=1; i <= runs; i++) {
    objFunctions.forEach((func) => {
      if(func === "rastrigin") {
        activeFunc = rastrigin;
        txl = -5;
        txu = 5;
        tyl = -5;
        tyu = 5;
      } else if(func === "ackley") {
        activeFunc = ackley;
        txl = -5;
        txu = 5;
        tyl = -5;
        tyu = 5;
      } else if(func === "sphere"){
        activeFunc = sphere;
        txl = -5;
        txu = 5;
        tyl = -5;
        tyu = 5;
      }
      versions.forEach((version) => {
        history.generations = [];
        deObj.exec(version, generationsToRun, populationN, activeFunc, txl, txu, tyl, tyu, 0.5, 1.5, historyUpdate);
        let bestX = history.generations[generationsToRun-1].x[deObj.bestIndex];
        let bestY = history.generations[generationsToRun-1].y[deObj.bestIndex];
        let bestZ = history.generations[generationsToRun-1].z[deObj.bestIndex];
        if(func === "sphere") {
          console.log(activeFunc);
          console.log(`${i},${func},${version},${bestX},${bestY},${bestZ}`);
        }
        data.push(`${i},${func},${version},${bestX},${bestY},${bestZ}`);
      });    
    });
  }

  download(data.join("\n"), "results.csv", "csv");
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