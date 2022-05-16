let activeFunctionString = "";
let activeFunction;
let xl = 0;
let xu = 0;
let yl = 0;
let yu = 0;
let deVersion = "";
let generations = 0;
let bfoObj;
let history = {};
let CARDINALITY = 100;
let functionData;
let pf;
let tries;
let population = 0;
let grap3d = true;
let pso_memory = new Array();


function historyUpdateBfo(generationPoints) {
  let xPoint = [];
  let yPoint = [];
  let zPoint = [];
  for(let i=0; i < generationPoints.length; i++) {
    xPoint.push(generationPoints[i].position[0]);
    yPoint.push(generationPoints[i].position[1]);
    zPoint.push(generationPoints[i].z);
  }
  let points = {
    x: xPoint,
    y: yPoint,
    z: zPoint
  }
  history.generations.push(points);
}

function addMemoryPSO(g) {
  pso_memory.push(g);
}

let algorithmObjectGlobal;
function startExec() {
  let algorithmSelected = document.getElementById("algorithmSelected").value;
  let activeFunctionString = document.querySelector('input[name="functionSelected"]:checked').value;
  let activeFunc;  
  let boundariesArray;
  let dimension = 0;
  let compareFunction;
  let constrainList = [];
  let algorithmObject;
  let physicalConstrains = [];
  let ignoreConstrains = document.getElementById("checkIgnoreConstrains").checked;

  if(activeFunctionString === "paper") {
    activeFunc = paperFunction;
    boundariesArray = [
      {upper: 10, lower: 0},
      {upper: 10, lower: 0}
    ];
    dimension = 2;
    compareFunction = maximizeCompareFunction;
    if(!ignoreConstrains) {
      constrainList = paperConstrains;
      physicalConstrains = [];
    }
  } else {
    activeFunc = springWeight;
    boundariesArray = [
      {upper: 1.3, lower: 0.25},
      {upper: 2, lower: 0.05},
      {upper: 15, lower: 1.3},
    ];
    dimension = 3;
    compareFunction = minimizeCompareFunction;
    if(!ignoreConstrains) {
      constrainList = constrainsFunctionsList;
      physicalConstrains = [areSpringMeasuresValid];
    }
  }

  if(algorithmSelected === "bfo") {
    history.generations = [];
    

    x1_l = 0.05;
    x1_u = 2;
    x2_l = 0.25;
    x2_u = 1.3;
    x3_l = 1.3;
    x3_u = 15;

    //(𝜇+ 𝜆)- ES because of its selection strat (50%)
    //variance square
    //gen
    //mu
    //lambda

    //BFO (Maybe because of the modification proposed by Mezura Montes) and N dimentional
    //search space dim
    //Total amount of bact
    p = dimension;
    S_bacteria = parseInt(document.getElementById("S_bacteria").value);
    Nc = parseInt(document.getElementById("Nc").value);
    Ns = parseInt(document.getElementById("Ns").value);
    Nre = parseInt(document.getElementById("Nre").value);
    Ned = parseInt(document.getElementById("Ned").value);
    Ped = parseFloat(document.getElementById("Ped").value);
    Ci = parseFloat(document.getElementById("Ci").value);

    bfoObj = new BFO(p,S_bacteria,Nc,Ns,Nre,Ned,Ped,Ci,boundariesArray,activeFunc,compareFunction,constrainList);
    bfoObj.exec();
    algorithmObjectGlobal = bfoObj;
    algorithmObject = bfoObj;
  } else if(algorithmSelected === "ga") {

    
    let N = parseInt(document.getElementById("ga_N").value);;
    let generations = parseInt(document.getElementById("ga_G").value);
    let mutationRate = parseFloat(document.getElementById("ga_M").value);
    mutationRate = .6;
   
    let gaObj = new GA(N, generations,activeFunc,mutationRate,boundariesArray,compareFunction,constrainList);
    gaObj.exec();
    algorithmObjectGlobal = gaObj;
    algorithmObject = gaObj;
  } else if(algorithmSelected === "es") {
    let var2 = parseInt(document.getElementById("var2").value);
    let generations = parseInt(document.getElementById("generations").value);
    let mu = parseInt(document.getElementById("mu").value);
    let lambda = parseInt(document.getElementById("lambda").value);
    
    let esObj = new ES(generations, var2, dimension, activeFunc, boundariesArray, mu, lambda, compareFunction, constrainList, physicalConstrains);
    esObj.exec();
    algorithmObjectGlobal = esObj;
    algorithmObject = esObj;

  } else if(algorithmSelected === "de") {
    //algorithmObjectGlobal = new DE();
    let generations = parseInt(document.getElementById("generationsDe").value);
    let cr = parseFloat(document.getElementById("cr").value);
    let lambda = parseFloat(document.getElementById("lambdaDe").value);
    let population = parseInt(document.getElementById("populationDe").value);

    let deObj = new DE(generations, population, activeFunc, boundariesArray, dimension, cr, lambda, compareFunction, constrainList, physicalConstrains);
    deObj.exec();
    algorithmObjectGlobal = deObj;
    algorithmObject = deObj;
  }

  if(activeFunctionString === "paper") {
    let generationHistory = algorithmObject.getAllGenerations();
    document.getElementById("generationId").value = generationHistory.length;
    updateGraphic(generationHistory.length);
  }
  return algorithmObject;
}

function drawPaperFunction(generationToUse) {  
    let feasibleSolutions = {
      x: [],
      y: []
    };

    let unfeasibleSolutions = {
      x: [],
      y: []
    };

    for(let i=0; i<generationToUse.values.length; i++) {
      let indiv = generationToUse.values[i];
      if(indiv.results.isFeasible) {
        feasibleSolutions.x.push(indiv.dimensionArray[0]);
        feasibleSolutions.y.push(indiv.dimensionArray[1]);
      } else {
        unfeasibleSolutions.x.push(indiv.dimensionArray[0]);
        unfeasibleSolutions.y.push(indiv.dimensionArray[1]);
      }
    }

    let x = makeArrRanged(0, 2.5, 100);
    let y = [];
    let x2 = makeArrRanged(2, 6, 100);
    let y2 = [];

    for(let i=0; i < 100; i++) {
      y.push(paperConstrainGraphic1(x[i]));
    }
    for(let i=0; i < 100; i++) {
      y2.push(paperConstrainGraphic2(x2[i]));
    }
    drawPaper(x, y, x2, y2, feasibleSolutions, unfeasibleSolutions);
    document.getElementById("graphContainer").style.display = "";
}

function runTestCSV() {
  let runs = 30;
  let data = [];
  data.push("Iteration,Generation,WireDiameter(d),CoilDiameter(D),NumberOfCoils(N),Fitness(W),constrainMinimumDeflection,constrainShearStress,constrainSurgeFrequency,constrainOutsideDiameter,isFeasible,isBest,execTime");

  document.getElementById("spring").checked = true;  
  for(let i=1; i <= runs; i++) {      
    results = [];
    let algorithmObject = startExec();   
    let generationsHistory = algorithmObject.getAllGenerations();
    
    for(let generationCounter=1; generationCounter <= generationsHistory.length; generationCounter++) {
      let currentGeneration = generationsHistory[generationCounter-1];
      let bestGenIndex = currentGeneration.bestSolutionIndex;
      let generationExecTime = currentGeneration.executionTime;
      let generationValues = currentGeneration.values;

      generationValues.forEach((indiv, index) => {
        let indivData = [];
        indivData.push(i);
        indivData.push(generationCounter);
        indivData.push(indiv.dimensionArray[1]);
        indivData.push(indiv.dimensionArray[0]);
        indivData.push(indiv.dimensionArray[2]);
        indivData.push(indiv.dimensionArray[3]);
        indivData.push(indiv.results.constrainMinimumDeflection);
        indivData.push(indiv.results.constrainShearStress);
        indivData.push(indiv.results.constrainSurgeFrequency);
        indivData.push(indiv.results.constrainOutsideDiameter);
        indivData.push(indiv.results.isFeasible);
        indivData.push((index === bestGenIndex));
        indivData.push(generationExecTime);
        data.push(indivData.join(","));
      });
    }
  }
  download(data.join("\n"), "results.csv", "csv");
}

function report(log) {
  $('#log').show();
  let newp = document.createElement("p");
  let text = document.createTextNode(log);
  newp.appendChild(text);
  document.getElementById('log').appendChild(newp);

}

function updateGraphic(value) {
  let generationsHistory = algorithmObjectGlobal.getAllGenerations();
  let generationNumber = generationsHistory.length;
  if(value > 0 && value <= generationNumber) {
    let generationToUse = generationsHistory[value-1];
    setBestUI(generationToUse);
    drawPaperFunction(generationToUse);
  }
}

function play(){
  document.getElementById("generationId").value = 1;
  setTimeout(verifyPlay,400);

}

function verifyPlay(){

  document.getElementById("nextGenBtn").click();
  let generationsHistory = algorithmObjectGlobal.getAllGenerations();
  let current = parseInt(document.getElementById("generationId").value);
  if(current < generationsHistory.length) {
    setTimeout(verifyPlay,400);
  }
}

function setBestUI(generationData){  
  document.getElementById("bestX").value = generationData.values[generationData.bestSolutionIndex].dimensionArray[0];
  document.getElementById("bestY").value = generationData.values[generationData.bestSolutionIndex].dimensionArray[1];
  document.getElementById("bestZ").value = generationData.values[generationData.bestSolutionIndex].dimensionArray[2];
}

function getBest(gen){
  let currentBest = 0;
  for(let i=1;i<gen.x.length;i++){
    if(gen.z[i] < gen.z[currentBest])
      currentBest = i;
  }

  return { 'x' : gen.x[currentBest], 'y': gen.y[currentBest], 'z': gen.z[currentBest] };
}


function updateAlgorithmUI(selectedAlgorithm) {
  let algorithmList = [ "bfo", "es", "de", "ga"];
  document.getElementById(selectedAlgorithm+"_container").style.display = "";
  for(let i=0; i<algorithmList.length; i++) {
    let algorithm = algorithmList[i];
    if(algorithm == selectedAlgorithm) {
      continue;
    }
    document.getElementById(algorithm+"_container").style.display = "none";
  }
}

function updateFunctionUI(functionSelected) {
  if(functionSelected === "paper") {
    document.getElementById("springConstrains").style.display = "none";
    document.getElementById("paperConstrains").style.display = "";
  } else {
    document.getElementById("springConstrains").style.display = "";
    document.getElementById("paperConstrains").style.display = "none";
  }
}

window.onload = function() {
  
  let nextGenBtn = document.getElementById("nextGenBtn");
  let prevGenBtn = document.getElementById("prevGenBtn");
  let genIdInput = document.getElementById("generationId");
  let playBtn = document.getElementById("playBtn");
  let algorithmsDropdown = document.getElementById("algorithmSelected");
  let selectedFunctions = document.querySelectorAll('input[name="functionSelected"]');

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

  algorithmsDropdown.addEventListener("change", (event) => {   
    updateAlgorithmUI(event.target.value);
  });

  for(const funct of selectedFunctions) {
    funct.onclick = (e) => {
      updateFunctionUI(e.target.value);
    }
  }
  updateAlgorithmUI(document.getElementById("algorithmSelected").value);
  updateFunctionUI(document.querySelector('input[name="functionSelected"]:checked').value);  
};