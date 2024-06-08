const CHANNELLABELS = ["CH 01", "CH 02", "CH 03", "CH 04", "CH 05", "CH 06", "CH 07", "CH 08", "CH 09", "CH 10", "CH 11", "CH 12", "CH 13", "CH 14", "CH 15", "CH 16", "USB", "Rtn 1", "Rtn 2", "Rtn 3", "Rtn 4", "Bus 1", "Bus 2", "Bus 3", "Bus 4", "FXSnd 1", "FXSnd 2", "FXSnd 3", "FXSnd 4", "LR", "DCA 1", "DCA 2", "DCA 3", "DCA 4"]
let layers = [["CH 1-8", [0, 1, 2, 3, 4, 5, 6, 7]], ["CH 9-16", [8, 9, 10, 11, 12, 13, 14, 15]], ["Aux / FX", [16, 17, 18, 19, 20]], ["Bus", [21, 22, 23, 24]], ["FXSnd / Main", [25, 26, 27, 28, 29]], ["DCA", [30, 31,32, 33]]];
let maxLayers = 8;

let channelsPanel;
let blankChannel;

let layersPanel;
let blankLayer;

class Channel {
    label;
    mute = false;
    solo = false;
    volume = -Infinity;
    pan = 0;
    constructor(index) {
        this.label = CHANNELLABELS[index];
    }
}

let allChannels = [];

function onLoad() {
    for (i in CHANNELLABELS) {
        allChannels[i] = new Channel(i);
    }

    channelsPanel = document.getElementsByClassName("channels")[0];
    blankChannel = document.getElementsByClassName("channel")[0].cloneNode(true);

    layersPanel = document.getElementsByClassName("buttons-right")[0];
    blankLayer = document.getElementsByClassName("buttons-layer")[0].cloneNode(true);

    refreshLayers();
    loadLayer(0);
}

function refreshLayers() {
    layersPanel.innerHTML = "";
    for (i in layers) {
        let newLayer = blankLayer.cloneNode(true);
        newLayer.id = "layer_" + i;
        newLayer.innerHTML = "<p>" + layers[i][0] + "</p>";
        layersPanel.appendChild(newLayer);
    }
}

function loadLayer(layerNum) {
    channelsPanel.innerHTML = "";

    for (let i = 0; i < layers[layerNum][1].length && i < maxLayers; i++) {
        let newChannel = blankChannel.cloneNode(true);
        newChannel.id = "channel_" + i;

        // setting user-defined label
        newChannel.getElementsByClassName("channel-label-var")[0].innerHTML = "<p>" + allChannels[layers[layerNum][1][i]].label + "</p>";
        
        // setting constant label
        newChannel.getElementsByClassName("channel-label-const")[0].innerHTML = "<p>" + CHANNELLABELS[layers[layerNum][1][i]] + "</p>";

        channelsPanel.appendChild(newChannel);
    }

    // highlighting layer button on right
    let buttons = layersPanel.getElementsByClassName("buttons-layer");
    for (i in buttons) {
        if (buttons[i].tagName != "DIV") continue;
        let highlight = buttons[i].id == "layer_" + layerNum;
        buttons[i].style.color = highlight ? "#39B7B6" : "#B9BABC";
        buttons[i].style.borderColor = highlight ? "#39B7B6" : "#191B1A";
    }
}

function toggleMute() {
    channelIndex = this.parentNode.id.substring(8);
    let mute = !allChannels[channelIndex].mute
    allChannels[channelIndex].mute = mute;
    this.style.borderColor = mute ? "#F81F10" : "#191B1A";
    this.getElementsByClassName("channel-mute-triangle")[0].style.borderColor = "transparent " + (mute ? "#F81F10" : "#5A0000") + " transparent transparent";
}

function toggleSolo() {
    channelIndex = this.parentNode.id.substring(8);
    let solo = !allChannels[channelIndex].solo
    allChannels[channelIndex].solo = solo;
    this.style.borderColor = solo ? "#FDCF00" : "#191B1A";
    this.getElementsByClassName("channel-solo-triangle")[0].style.borderColor = "transparent transparent transparent " + (solo ? "#FDCF00" : "#755009");
}

function layerPressed() {
    layerIndex = this.id.substring(6);
    loadLayer(layerIndex);
}