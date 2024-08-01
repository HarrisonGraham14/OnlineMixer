//==================================================================================================================================================================================================================================================================
//                                                                                                                          AUDIO CONTEXT
//==================================================================================================================================================================================================================================================================

const audioContext = new AudioContext();
let audios = [];
let sources = [];
let gains = [];
let gainAnalysers = [];
let gates = [];
let eqs = [];
let compressors = [];
let volumes = [];
let pans = [];

const playButton = document.querySelector(".play-button");
//const pauseButton = document.querySelector(".pause-button");
//const stopButton = document.querySelector(".stop-button");
const playerBar = document.querySelector(".player-bar");
const playerTime = document.querySelector(".player-time");

const sampleBuffer = new Float32Array(2048);
function updateAnalyser(index) {
    let channel = document.getElementById("channel_" + index);
    if (!channel) return;

    gainAnalysers[index].getFloatTimeDomainData(sampleBuffer);

    // Compute peak instantaneous power over the interval.
    let peakInstantaneousPower = 0;
    for (let i = 0; i < sampleBuffer.length; i++) {
      const power = Math.abs(sampleBuffer[i]);
      peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
    }
    const peakInstantaneousPowerDecibels = 20 * Math.log10(peakInstantaneousPower);

    channel.getElementsByClassName("peak-meter-bar")[0].style.height = Math.min(100, -peakInstantaneousPowerDecibels) + "%";
}

for (let i = 0; i < 16; i++) {
    audios.push(new Audio());
    sources.push(audioContext.createMediaElementSource(audios[i]));
    gains.push(new GainNode(audioContext));
    gainAnalysers.push(new AnalyserNode(audioContext));
    volumes.push(new GainNode(audioContext));
    pans.push(new StereoPannerNode(audioContext));

    sources[i].connect(gains[i]);
    gains[i].connect(gainAnalysers[i]);
    gains[i].connect(volumes[i]);
    volumes[i].connect(pans[i]);
    pans[i].connect(audioContext.destination);

    gainAnalysers[0].fftSize = sampleBuffer.length;
    setInterval(updateAnalyser, 50, [i]);
}

function loadAudio(folder, trackCount) {
    unloadedTracks = trackCount;
    for (let i = 0; i < trackCount; i++) {
        let trackPath = folder + "/Track " + (i < 9 ? "0" : "") + (i + 1) + ".ogg";
        audios[i].src = trackPath;
        audios[i].load
    }
    loadLayer(0);
}

let playState = "loading";
function play() {
    if (audioContext.state == "suspended") audioContext.resume();

    // don't allow play before tracks have loaded
    for (let i in audios) {
        if (audios[i].readyState != 0 && audios[i].readyState != 4) {
            playState = "loading";
            playButton.getElementsByClassName("play-button-image")[0].src = "./images/loading.png";
            playButton.getElementsByClassName("play-button-image")[0].alt = "loading audio...";
            playButton.getElementsByClassName("play-button-image")[0].style.animation = "spin 2s linear infinite";
            return;
        }
    }

    for (let i in audios) {
        if (audios[i].readyState == 0) continue;
        audios[i].play();
        audios[i].currentTime = audios[0].currentTime;
    }
    playState = "playing";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/pause.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "pause";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "none";
}

function pause() {
    for (let i in audios) {
        audios[i].pause();
    }
    playState = "paused";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/play.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "play";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "none";
}

function buffer() {
    for (let i in audios) {
        audios[i].pause();
    }
    playState = "loading-play";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/loading.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "loading audio...";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "spin 2s linear infinite";
}

playButton.addEventListener("click", () => {
    if (playState == "paused") play();
    else if (playState == "playing") pause();
});

playerBar.addEventListener("input", (event) => {
    for (let i in audios) {
        audios[i].currentTime = playerBar.value;
    }
    buffer();
});
playerBar.addEventListener("change", (event) => audioContext.resume());

function updatePlayerTime() {

    // Checks if tracks are loading
    if (playState == "loading" || playState == "loading-play") {
        for (let i = 1; i < 16; i++) {
            if (audios[i].readyState != 0 && audios[i].readyState != 4) break;
            else if (i == 16 - 1) {
                if (playState == "loading") pause();
                else if (playState == "loading-play") play();
            }
        }
    }

    let currentTime = audios[0].currentTime;
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    playerTime.innerHTML = minutes + ":" + seconds; 
    if (audioContext.state == "suspended") return;

    playerBar.value = currentTime;
    playerBar.max = audios[0].duration;
    
    // Keeps tracks in sync
    for (let i = 1; i < 16; i++) {
        if (Math.abs(audios[i].currentTime - audios[0].currentTime) > 0.05) audios[i].currentTime = audios[0].currentTime;
    }
}
setInterval(updatePlayerTime, 100);



//==================================================================================================================================================================================================================================================================
//                                                                                                                         CHANNELS/PANELS
//==================================================================================================================================================================================================================================================================

class Channel {
    label;
    backgroundColor = "#ffffff";
    fontColor = "#000000";
    mute = false;
    solo = false;
    volume = -Infinity;
    pan = 0;
    constructor(index) {
        this.label = CHANNELLABELS[index];
    }
}

const CHANNELCOLORS = ["#000000", "#fe0000", "#00ff01", "#ffff00", "#1f70ff", "#ff00fe", "#00ffff", "#ffffff", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]
const CHANNELCOLORSFONT = ["#ffffff", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#ffffff", "#fe0000", "#00ff01", "#ffff00", "#1f70ff", "#ff00fe", "#00ffff", "#ffffff"]

const CHANNELLABELS = ["CH 01", "CH 02", "CH 03", "CH 04", "CH 05", "CH 06", "CH 07", "CH 08", "CH 09", "CH 10", "CH 11", "CH 12", "CH 13", "CH 14", "CH 15", "CH 16", "USB", "Rtn 1", "Rtn 2", "Rtn 3", "Rtn 4", "Bus 1", "Bus 2", "Bus 3", "Bus 4", "FXSnd 1", "FXSnd 2", "FXSnd 3", "FXSnd 4", "LR", "DCA 1", "DCA 2", "DCA 3", "DCA 4"]
let layers = [["CH 1-8", [0, 1, 2, 3, 4, 5, 6, 7]], ["CH 9-16", [8, 9, 10, 11, 12, 13, 14, 15]], ["Aux / FX", [16, 17, 18, 19, 20]], ["Bus", [21, 22, 23, 24]], ["FXSnd / Main", [25, 26, 27, 28, 29]], ["DCA", [30, 31,32, 33]]];
let maxChannels = 8;

let allChannels = [];
for (let i in CHANNELLABELS) {
    allChannels[i] = new Channel(i);
}

let channelsPanel = document.getElementsByClassName("channels")[0];
let blankChannel = document.getElementsByClassName("channel")[0].cloneNode(true);

let layersPanel = document.getElementsByClassName("buttons-right")[0];
let blankLayer = document.getElementsByClassName("buttons-layer")[0].cloneNode(true);

refreshLayers();
loadLayer(0);

function refreshLayers() {
    layersPanel.innerHTML = "";
    for (let i in layers) {
        let newLayer = blankLayer.cloneNode(true);
        newLayer.id = "layer_" + i;
        newLayer.innerHTML = "<p>" + layers[i][0] + "</p>";
        layersPanel.appendChild(newLayer);
    }
}

function loadLayer(layerNum) {
    channelsPanel.innerHTML = "";
    
    for (let i = 0; i < layers[layerNum][1].length && i < maxChannels; i++) {
        let newChannel = blankChannel.cloneNode(true);
        let id = layers[layerNum][1][i];
        newChannel.id = "channel_" + id;

        // adjusting sizes depending on maxChannels
        newChannel.style.width = (98.4 / maxChannels) + "%";
        newChannel.getElementsByClassName("fader")[0].style.height = (8 / maxChannels) + "svh ";

        // displaying user-defined label
        newChannel.getElementsByClassName("channel-label-var")[0].innerHTML = allChannels[id].label;
        newChannel.getElementsByClassName("channel-label-var")[0].style.color = allChannels[id].fontColor;
        newChannel.getElementsByClassName("channel-label-var")[0].parentNode.style.backgroundColor = allChannels[id].backgroundColor;

        // displaying pan
        let fill = newChannel.getElementsByClassName("channel-pan-fill")[0];
        fill.style.width = Math.abs(Number(allChannels[id].pan) / 2.1) + "%";
        fill.style.left = allChannels[id].pan < 0 ? (50 - Math.abs(Number(allChannels[id].pan) / 2.1)) + "%" : "50%";

        // displaying solo
        if (allChannels[id].solo) {
            newChannel.getElementsByClassName("channel-solo")[0].style.borderColor = "#FDCF00";
            newChannel.getElementsByClassName("channel-solo-triangle")[0].style.borderColor = "transparent transparent transparent #FDCF00";
        }

        // fader level readout
        newChannel.getElementsByClassName("channel-fader-level")[0].innerHTML = faderReadout(allChannels[id].volume);

        // fader placement
        let faderPos = allChannels[id].volume == -Infinity ? -90 : allChannels[id].volume;
        if (faderPos < -10) faderPos = faderPos / 2 - 5;
        if (faderPos < -20) faderPos = faderPos / 2 - 10;
        if (faderPos < -25) faderPos = faderPos / 2 - 12.5;
        newChannel.getElementsByClassName("fader")[0].value = faderPos;
        
        // displaying constant label
        newChannel.getElementsByClassName("channel-label-const")[0].innerHTML = "<p>" + CHANNELLABELS[id] + "</p>";

        // displaying mute
        if (allChannels[id].mute) {
            newChannel.getElementsByClassName("channel-mute")[0].style.borderColor = "#F81F10";
            newChannel.getElementsByClassName("channel-mute-triangle")[0].style.borderColor = "transparent #F81F10 transparent transparent";
        }

        channelsPanel.appendChild(newChannel);
    }

    // highlighting layer button on right
    let buttons = layersPanel.getElementsByClassName("buttons-layer");
    for (let i in buttons) {
        if (buttons[i].tagName != "DIV") continue;
        let highlight = buttons[i].id == "layer_" + layerNum;
        buttons[i].style.color = highlight ? "#39B7B6" : "#B9BABC";
        buttons[i].style.borderColor = highlight ? "#39B7B6" : "#191B1A";
    }
}

function toggleSolo() {
    let channelIndex = this.parentNode.id.substring(8);
    let solo = !allChannels[channelIndex].solo
    allChannels[channelIndex].solo = solo;
    this.style.borderColor = solo ? "#FDCF00" : "#191B1A";
    this.getElementsByClassName("channel-solo-triangle")[0].style.borderColor = "transparent transparent transparent " + (solo ? "#FDCF00" : "#755009");
}

function toggleMute() {
    let channelIndex = this.parentNode.id.substring(8);
    let mute = !allChannels[channelIndex].mute
    allChannels[channelIndex].mute = mute;
    this.style.borderColor = mute ? "#F81F10" : "#191B1A";
    this.getElementsByClassName("channel-mute-triangle")[0].style.borderColor = "transparent " + (mute ? "#F81F10" : "#5A0000") + " transparent transparent";
    volumes[channelIndex].gain.value = mute ? 0 : Math.pow(2, allChannels[channelIndex].volume/6);
}

function faderReadout(volume) {
    if (volume <= -90) return "-&infin;";
    else return (volume > 0 ? "+" : "") + Number(volume).toFixed(1);
}

function updateFader() {
    let channelIndex = this.parentNode.parentNode.id.substring(8);

    let volume = this.value;
    if (volume < -10) volume = volume * 2 + 10;
    if (volume < -30) volume = volume * 2 + 30;
    if (volume < -50) volume = volume * 2 + 50;
    if (volume <= -90) volume = -Infinity;

    if (channelIndex < 16) {
        volumes[channelIndex].gain.value = Math.pow(2, volume/6);
        if (allChannels[channelIndex].mute) volumes[channelIndex].gain.value = 0;
        pans[channelIndex].pan.value = allChannels[channelIndex].pan / 100;
    }

    allChannels[channelIndex].volume = volume;
    let channel = document.getElementById("channel_" + channelIndex);
    if (channel) channel.getElementsByClassName("channel-fader-level")[0].innerHTML = faderReadout(volume);
}

function layerPressed() {
    layerIndex = this.id.substring(6);
    loadLayer(layerIndex);
}

//==================================================================================================================================================================================================================================================================
//                                                                                                                              SCENES
//==================================================================================================================================================================================================================================================================

class Scene {
    folder = "";
    trackCount = 0;
    trackNames = [];
    trackColors = [];
    trackVolumes = [];
    trackPans = [];

    constructor(folder, trackCount) {
        this.folder = folder;
        this.trackCount = trackCount;

        this.trackNames = CHANNELLABELS.slice(0, 16);
        this.trackColors = Array(trackCount).fill(7).concat(Array(16 - trackCount).fill(0));
        this.trackVolumes = Array(trackCount).fill(-12).concat(Array(16 - trackCount).fill(-Infinity));
        this.trackPans = Array(16).fill(0);
    }

    addNames(trackNames) {
        this.trackNames = trackNames.concat(this.trackNames.slice(trackNames.length, 16));
    }

    addColors(trackColors) {
        this.trackColors = trackColors.concat(this.trackColors.slice(trackColors.length, 16));
    }

    addVolumes(trackVolumes) {
        this.trackVolumes = trackVolumes.concat(this.trackVolumes.slice(trackVolumes.length, 16));
    }

    addPans(trackPans) {
        this.trackPans = trackPans.concat(this.trackPans.slice(trackPans.length, 16));
    }

    load() {
        loadAudio(this.folder, this.trackCount);
        for (let i = 0; i < 16; i++) {
            allChannels[i].volume = this.trackVolumes[i];
            volumes[i].gain.value = Math.pow(2, this.trackVolumes[i]/6);
            allChannels[i].pan = this.trackPans[i];
            pans[i].pan.value = this.trackPans[i]/100;
            allChannels[i].label = this.trackNames[i];
            allChannels[i].backgroundColor = CHANNELCOLORS[this.trackColors[i]];
            allChannels[i].fontColor = CHANNELCOLORSFONT[this.trackColors[i]];
        }
        loadLayer(0);
    }
}

const goodGoodFather = new Scene("./audio/Good Good Father", 16);
goodGoodFather.addNames(["Vox Lead", "Vox Back 1", "Vox Back 2", "CH 04", "CH 05", "CH 06", "CH 07", "Bass", "Guit Aco", "CH 10", "Guit Elec L", "Guit Elec R", "Keys L", "Keys R", "Drums L", "Drums R"]);
goodGoodFather.addColors([6, 2, 4, 0, 0, 0, 0, 5, 6, 0, 2, 2, 4, 4, 3, 3]);
goodGoodFather.addVolumes([-8, -14, -14, -Infinity, -Infinity, -Infinity, -Infinity, -13.5, -13, -Infinity, -18.5, -18.5, -14, -14, -11.5, -11.5]);
goodGoodFather.addPans([0, -20, 20, 0, 0, 0, 0, 0, -30, 0, -40, 100, -100, 100, -50, 50]);
goodGoodFather.load();



//==================================================================================================================================================================================================================================================================
//                                                                                                                              VIEWS
//==================================================================================================================================================================================================================================================================

const panOverlay = document.querySelector(".pan-overlay")
const panSlider = document.querySelector(".pan-slider")
const panReadout = document.querySelector(".pan-readout");
let panCurrent = 0;
function pressPan() {
    panCurrent = this.parentNode.id.substring(8);
    panOverlay.style.display = "block";
    panSlider.value = allChannels[panCurrent].pan;
    panReadout.innerHTML = "Pan: " + allChannels[panCurrent].pan;
}

function inputPan(slider) {
    panReadout.innerHTML = "Pan: " + this.value;
    allChannels[panCurrent].pan = Number(this.value);
    let fill = document.getElementById("channel_" + panCurrent).getElementsByClassName("channel-pan-fill")[0];
    fill.style.width = Math.abs(Number(this.value) / 2.1) + "%";
    fill.style.left = this.value < 0 ? (50 - Math.abs(Number(this.value) / 2.1)) + "%" : "50%";
    pans[panCurrent].pan.value = this.value / 100;
}

let channelView = 0;
function openView(view, channel) {
    channelView = channel;

    let viewPanel = document.getElementsByClassName(view)[0];
    if (!viewPanel) return;

    viewPanel.style.display = "block";

    document.getElementsByClassName("heading-upper")[0].innerHTML = allChannels[channelView].label;

    let lowerHeading = "";
    if (view == "overview-view") lowerHeading = "Overview";
    else if (view == "gate-view") lowerHeading = "Gate";
    else if (view == "eq-view") lowerHeading = "EQ";
    else if (view == "dynamic-view") lowerHeading = "Dynamic";
    else if (view == "sends-view") lowerHeading = "Sends";
    document.getElementsByClassName("heading-lower")[0].innerHTML = lowerHeading;
}

function closeView(self) {
    self.parentNode.style.display = "none";
    
    console.log(document.getElementsByClassName("overview-view")[0].style.display);
    
    if (document.getElementsByClassName("overview-view")[0].style.display == "block") document.getElementsByClassName("heading-lower")[0].innerHTML = "Overview";

    else {
        document.getElementsByClassName("heading-upper")[0].innerHTML = "Mixer View";
        document.getElementsByClassName("heading-lower")[0].innerHTML = "LR Mix";
    }
}