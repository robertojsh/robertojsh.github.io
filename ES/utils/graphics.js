function draw(functionData, calculatedData) {
    let data1 = {
        name: 'Space',
        x: functionData.x,
        y: functionData.y,
        z: functionData.z,
        type: 'surface',
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
        type: 'scatter3d'
    }

    let layout = {
        title: '',
        autosize: true,
        uirevision: true,
        width: 800,
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