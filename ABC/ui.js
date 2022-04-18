let activeFunctionString = "";
let activeFunction;
let xl = 0;
let xu = 0;
let yl = 0;
let yu = 0;
let deVersion = "";
let generations = 0;
let abcObj;
let history = {};
let CARDINALITY = 100;
let functionData;
let pf;
let tries;
let population = 0;
let grap3d = true;

function init() {
  abcObj = new ABC();
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
  pf = parseFloat(document.getElementById("pf").value);
  tries = parseInt(document.getElementById("tries").value);
  population = parseInt(document.getElementById("population").value);
  console.log(generations, population, activeFunction, xl, xu, yl, yu, pf, tries, historyUpdate);
  abcObj.exec(generations, population, activeFunction, xl, xu, yl, yu, pf, tries, historyUpdate);

  functionData = calculateFunctionPointsData(activeFunction, xl, xu, yl, yu, CARDINALITY);
  document.getElementById("graphContainer").style.display = "";
  document.getElementById("generationId").value = generations;

  grap3d = document.getElementById("check3D").checked;

  updateGraphic(generations);
}


function runTest(){
  report("X      |      Y      |      fitness    ");
  for(let i=0;i<30;i++){
      startExec();
      let best = getBest(history.generations[i]);
      report(best.x + ","+best.y+","+best.z);
      
  }
}


function report(log) {
  $('#log').show();
  let newp = document.createElement("p");
  let text = document.createTextNode(log);
  newp.appendChild(text);
  document.getElementById('log').appendChild(newp);

}


function updateGraphic(value) {
  if(value > 0 && value <= generations) {
    let generationToUse = history.generations[value-1];
    setBestUI(getBest(generationToUse));
    draw(functionData, generationToUse,grap3d);
  }
}

function play(){
  document.getElementById("generationId").value = 1;
  setTimeout(verifyPlay,400);

}

function verifyPlay(){

  document.getElementById("nextGenBtn").click();

  let current = parseInt(document.getElementById("generationId").value);
  if(current < population)
    setTimeout(verifyPlay,400);
}

function setBestUI(best){
  document.getElementById("bestX").value = best.x;
  document.getElementById("bestY").value = best.y;
  document.getElementById("bestZ").value = best.z;
}

function getBest(gen){
  let currentBest = 0;
  for(let i=1;i<gen.x.length;i++){
    if(gen.z[i] < gen.z[currentBest])
      currentBest = i;
  }

  return { 'x' : gen.x[currentBest], 'y': gen.y[currentBest], 'z': gen.z[currentBest] };
}


window.onload = function() {
  init();
  let nextGenBtn = document.getElementById("nextGenBtn");
  let prevGenBtn = document.getElementById("prevGenBtn");
  let genIdInput = document.getElementById("generationId");
  let playBtn = document.getElementById("playBtn");

  playBtn.addEventListener("click",play);

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