const TYPE_A_3D = 'surface';
const TYPE_A_2D = 'contour';

const TYPE_B_3D = 'scatter3d';
const TYPE_B_2D = 'scatter';


function draw(functionData, calculatedData, type) {

    let currentTypeA = TYPE_A_2D;
    let currentTypeB = TYPE_B_2D;

    if (type) {
        currentTypeA = TYPE_A_3D;
        currentTypeB = TYPE_B_3D;
    }

    let data1 = {
        name: 'Space',
        x: functionData.x,
        y: functionData.y,
        z: functionData.z,
        type: currentTypeA,
        colorscale: 'Earth',
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: { z: true }
            }
        }
    };    

    let data2 = {
        name: 'ES Point',
        x: calculatedData.x,
        y: calculatedData.y,
        z: calculatedData.z,
        mode: 'markers',
        marker: {
            size: 12,
            line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
            },
            opacity: 0.8
        },
        type: currentTypeB
    }

    let layout = {
        title: '',
        autosize: true,
        uirevision: true,
        width: 600,
        height: 600,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90,
        }
    };

    Plotly.react(document.getElementById("plot"), [data1, data2], layout);
}

function drawPaper(x, y, x2, y2, feasibleSolutions, unfeasibleSolutions) {


  let data1 = {
      name: 'Function g(x1)',
      x: x,
      y: y,
      mode: 'markers',
      marker: {
          size: 3,
          line: {
              color: 'rgba(217, 217, 217, 0.14)',
              width: 0.5
          },
          opacity: 0.8
      },
      type: 'scatter'
  }

  let data2 = {
    name: 'Function g(x2)',
    x: y2,
    y: x2,
    mode: 'markers',
    marker: {
        size: 3,
        line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5
        },
        opacity: 0.8
    },
    type: 'scatter'
  }

  let data3 = {
    name: 'Feasible Solution',
    x: feasibleSolutions.x,
    y: feasibleSolutions.y,
    mode: 'markers',
    marker: {
        size: 3,
        line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5
        },
        opacity: 0.8
    },
    type: 'scatter'
  }

  let data4 = {
    name: 'Unfeasible Solution',
    x: unfeasibleSolutions.x,
    y: unfeasibleSolutions.y,
    mode: 'markers',
    marker: {
        size: 3,
        line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5
        },
        opacity: 0.8
    },
    type: 'scatter'
  }

  let layout = {
      title: '',
      autosize: true,
      uirevision: true,
      width: 600,
      height: 600,
      margin: {
          l: 65,
          r: 50,
          b: 65,
          t: 90,
      }
  };

  Plotly.react(document.getElementById("plot"), [data1, data2, data3, data4], layout);
}