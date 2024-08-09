const LAYER_TEMPLATE = document.querySelector(".buttons-layer");
const LAYERS_PANEL = document.querySelector(".buttons-right");

let layers = [
    ["CH 1-8", [0, 1, 2, 3, 4, 5, 6, 7]], 
    ["CH 9-16", [8, 9, 10, 11, 12, 13, 14, 15]], 
    ["Aux / FX", [16, 17, 18, 19, 20]], 
    ["Bus", [21, 22, 23, 24]], 
    ["FXSnd / Main", [25, 26, 27, 28, 29]], 
    ["DCA", [30, 31,32, 33]]
];

function refreshLayers() {
    LAYERS_PANEL.innerHTML = "";
    for (i in layers) {
        let newLayer = LAYER_TEMPLATE.cloneNode(true);
        newLayer.innerHTML = layers[i][0];
        newLayer.dataset.index = i;
        LAYERS_PANEL.appendChild(newLayer);
    }
}

function loadLayer(index) {
    for (i in channels) channels[i].htmlElement.style.display = layers[index][1].includes(Number(i)) ? "flex" : "none";
    for (i of layers[index][1]) channels[i].updateHtml();
    
    // highlighting button
    for (layer of layers) {
        activeLayer = document.querySelector(".buttons-layer[data-active='true']");
        if (activeLayer) activeLayer.dataset.active = "false";
        document.querySelector(".buttons-layer[data-index='"+index+"']").dataset.active = "true";
    }
}

refreshLayers();