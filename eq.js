class EQ {
    highpass = new BiquadFilterNode(audioContext);
    postHighpass = new GainNode(audioContext);
    band1 = new BiquadFilterNode(audioContext);
    band2 = new BiquadFilterNode(audioContext);
    band3 = new BiquadFilterNode(audioContext);
    band4 = new BiquadFilterNode(audioContext);

    highpassActive = false;
    bandsActive = false;

    constructor() {
        this.highpass.frequency.setValueAtTime(36.4, 0);
        this.highpass.Q.setValueAtTime(-3, 0);
        this.highpass.type = "highpass";

        this.band1.frequency.setValueAtTime(112.5, 0);
        this.band1.Q.setValueAtTime(3.5, 0);
        this.band1.gain.setValueAtTime(0, 0);
        this.band1.type = "peaking";

        this.band2.frequency.setValueAtTime(632.5, 0);
        this.band2.Q.setValueAtTime(3.5, 0);
        this.band2.gain.setValueAtTime(0, 0);
        this.band2.type = "peaking";

        this.band3.frequency.setValueAtTime(3556.6, 0);
        this.band3.Q.setValueAtTime(3.5, 0);
        this.band3.gain.setValueAtTime(0, 0);
        this.band3.type = "peaking";

        this.band4.frequency.setValueAtTime(20000, 0);
        this.band4.Q.setValueAtTime(3.5, 0);
        this.band4.gain.setValueAtTime(0, 0);
        this.band4.type = "highshelf";

        this.highpass.connect(this.postHighpass);
        this.band1.connect(this.band2);
        this.band2.connect(this.band3);
        this.band3.connect(this.band4);
    }

    connect(destination) {
        this.postHighpass.connect(destination);
        this.band4.connect(destination);
    }
}

let currentChannel = 0;

let chart;
let chartOptions = {
    enableInteractivity: false,
    backgroundColor: { fill:"transparent" },
    legend: "none",
    chartArea: { width: "92%", height: "90%" },
    areaOpacity: 0.5,
    //fontSize: 12,
    
    hAxis: { 
        ticks: [20, 40, 60, 80, 100, 200, 300, 400, 500, 600, 800, { v:1000, f:"1k" }, { v:2000, f:"2k" }, { v:3000, f:"3k" }, { v:4000, f:"4k" }, { v:5000, f:"5k" }, { v:6000, f:"6k" }, { v:8000, f:"8k" }, { v:10000, f:"10k" }, { v:20000, f:"20k" }],
        scaleType: "log",
        gridlines: { color: "#B9BABC" },
        textStyle: { color: "white" },
        minValue: 20,
        maxValue: 20000,
        viewWindow: { min: 20, max: 20000 }
    },

    vAxis: {
        ticks: [-15, -10, -5, 0, 5, 10, 15],
        gridlines: { color: "#B9BABC" },
        textStyle: { color: "white" },
        minValue: -15,
        maxValue: 15,
        viewWindow: { min: -15, max: 15 }
    },

    colors: [ "red", "cyan", "orchid", "yellow", "orange", "gold" ],

    series: {
        0: { lineDashStyle: [0, 1] },
        1: { lineDashStyle: [0, 1] },
        2: { lineDashStyle: [0, 1] },
        3: { lineDashStyle: [0, 1] },
        4: { lineDashStyle: [0, 1] },
        5: { areaOpacity: 0 }
    }
};

let xValues = new Float32Array([...Array(250).keys()].map(e => 20 * Math.pow(1000, e/250)));

google.charts.load('current',{packages:['corechart']});
google.charts.setOnLoadCallback(updateEQGraph);

function updateEQGraph() {
    if (!channels[currentChannel].eq) return;

    let dataArray = [xValues, new Float32Array(xValues.length), new Float32Array(xValues.length), new Float32Array(xValues.length), new Float32Array(xValues.length), new Float32Array(xValues.length), new Float32Array(xValues.length)];

    let phaseDumpArray = new Float32Array(xValues.length)
    channels[currentChannel].eq.highpass.getFrequencyResponse(xValues, dataArray[1], phaseDumpArray);
    channels[currentChannel].eq.band1.getFrequencyResponse(xValues, dataArray[2], phaseDumpArray);
    channels[currentChannel].eq.band2.getFrequencyResponse(xValues, dataArray[3], phaseDumpArray);
    channels[currentChannel].eq.band3.getFrequencyResponse(xValues, dataArray[4], phaseDumpArray);
    channels[currentChannel].eq.band4.getFrequencyResponse(xValues, dataArray[5], phaseDumpArray);
    
    dataArray[6].fill(1);
    if (channels[currentChannel].eq.highpassActive) dataArray[6].set(dataArray[1]);
    if (channels[currentChannel].eq.bandsActive) dataArray[6] = dataArray[6].map((e, i) => e * dataArray[2][i] * dataArray[3][i] * dataArray[4][i] * dataArray[5][i]);

    let dataArrayProcessed = [];
    for (let i = 0; i < xValues.length; i++) {
        dataArrayProcessed.push([dataArray[0][i]]);
        for (let j = 1; j < dataArray.length; j++) {
            dataArrayProcessed[i].push(Math.log2(dataArray[j][i]) * 6);
        }
    }

    let data = new google.visualization.arrayToDataTable(dataArrayProcessed, true);

    if (!chart) chart = new google.visualization.AreaChart(document.querySelector(".eq-view-graph"));
    else chart.draw(data, chartOptions);
}

const eqHandleDiv = document.querySelector(".eq-view-graph-area");
const highpassHandle = document.querySelector(".eq-control-handle[data-control='highpass']");
const band1Handle = document.querySelector(".eq-control-handle[data-control='band1']");
const band2Handle = document.querySelector(".eq-control-handle[data-control='band2']");
const band3Handle = document.querySelector(".eq-control-handle[data-control='band3']");
const band4Handle = document.querySelector(".eq-control-handle[data-control='band4']");

function setEQHandlePositions() {
    highpassHandle.style.left = String(4 + (92 * Math.log2(channels[currentChannel].eq.highpass.frequency.value / 20) / Math.log2(1000))) + "%";
    highpassHandle.style.top = "50%";

    band1Handle.style.left = String(4 + (92 * Math.log2(channels[currentChannel].eq.band1.frequency.value / 20) / Math.log2(1000))) + "%";
    band1Handle.style.top = String(50 - (0.9 * channels[currentChannel].eq.band1.gain.value / 0.3)) + "%";

    band2Handle.style.left = String(4 + (92 * Math.log2(channels[currentChannel].eq.band2.frequency.value / 20) / Math.log2(1000))) + "%";
    band2Handle.style.top = String(50 - (0.9 * channels[currentChannel].eq.band2.gain.value / 0.3)) + "%";
    
    band3Handle.style.left = String(4 + (92 * Math.log2(channels[currentChannel].eq.band3.frequency.value / 20) / Math.log2(1000))) + "%";
    band3Handle.style.top = String(50 - (0.9 * channels[currentChannel].eq.band3.gain.value / 0.3)) + "%";

    band4Handle.style.left = String(4 + (92 * Math.log2(channels[currentChannel].eq.band4.frequency.value / 20) / Math.log2(1000))) + "%";
    band4Handle.style.top = String(50 - (0.9 * channels[currentChannel].eq.band4.gain.value / 0.3)) + "%";
}

let currentHandle = null;
let currentFilter;
let linkedFilter;
let EQUpdateInterval;
function EQHandleGrabbed(event, handle) {
    if (currentHandle) currentHandle.dataset.active = "false";
    handle.dataset.active = "true";
    currentHandle = handle;

    if (handle.dataset.control == "highpass") currentFilter = channels[currentChannel].eq.highpass;
    else if (handle.dataset.control == "band1") currentFilter = channels[currentChannel].eq.band1;
    else if (handle.dataset.control == "band2") currentFilter = channels[currentChannel].eq.band2;
    else if (handle.dataset.control == "band3") currentFilter = channels[currentChannel].eq.band3;
    else if (handle.dataset.control == "band4") currentFilter = channels[currentChannel].eq.band4;

    if (channels[currentChannel].link) {
        if (handle.dataset.control == "highpass") linkedFilter = channels[linkIndex(currentChannel)].eq.highpass;
        else if (handle.dataset.control == "band1") linkedFilter = channels[linkIndex(currentChannel)].eq.band1;
        else if (handle.dataset.control == "band2") linkedFilter = channels[linkIndex(currentChannel)].eq.band2;
        else if (handle.dataset.control == "band3") linkedFilter = channels[linkIndex(currentChannel)].eq.band3;
        else if (handle.dataset.control == "band4") linkedFilter = channels[linkIndex(currentChannel)].eq.band4;
    }

    if (event.type == "mousedown") {
        document.addEventListener("mousemove", EQHandleMoved, event);
        document.addEventListener("mouseup", EQHandleReleased, event);
    }
    
    else if (event.type == "touchstart") {
        document.addEventListener("touchmove", EQHandleMoved, event);
        document.addEventListener("touchend", EQHandleReleased, event);
    }
}

function EQHandleMoved(event) {
    if (!currentHandle) return;
    let rect = eqHandleDiv.getBoundingClientRect();
    let x;
    let y;

    if (event.type == "mousemove") {
        x = Math.max(rect.width * 0.04, Math.min(event.clientX - rect.left, rect.width * 0.96));
        y = currentHandle.style.top = Math.max(rect.height * 0.05, Math.min(event.clientY - rect.top, rect.height * 0.95));
    }
    
    else if (event.type == "touchmove") {
        if (event.touches.length > 1) return;
        x = Math.max(rect.width * 0.04, Math.min(event.touches[0].pageX - rect.left, rect.width * 0.96));
        y = currentHandle.style.top = Math.max(rect.height * 0.05, Math.min(event.touches[0].pageY - rect.top, rect.height * 0.95));
    }

    currentHandle.style.left = x + "px";
    if (currentHandle != highpassHandle) currentHandle.style.top = y + "px";

    // account for border around graph
    x = (x - 0.04 * rect.width) / (0.92 * rect.width);
    y = (y - 0.05 * rect.height) / (0.9 * rect.height);
    currentFilter.frequency.setValueAtTime(20 * Math.pow(1000, x), 0);
    currentFilter.gain.setValueAtTime(15 - (30 * y), 0);

    // update linked channel
    if (channels[currentChannel].link) {
        linkedFilter.frequency.setValueAtTime(20 * Math.pow(1000, x), 0);
        linkedFilter.gain.setValueAtTime(15 - (30 * y), 0);
    }
}

function EQHandleReleased(event) {
    if (!currentHandle) return;

    if (event.type == "mouseup") {
        document.removeEventListener("mousemove", EQHandleMoved);
        document.removeEventListener("mousemove", EQHandleReleased);
    }

    else if (event.type == "touchend") {
        document.removeEventListener("touchmove", EQHandleMoved);
        document.removeEventListener("touchend", EQHandleReleased);
    }
    
    updateEQGraph();
}

eqHandleDiv.addEventListener("wheel", (event) => {
    if (!currentHandle || currentFilter.type == "highpass") return;
    let newQ = currentFilter.Q.value + event.deltaY/50;
    newQ = Math.max(0.3, Math.min(newQ, 10));
    currentFilter.Q.setValueAtTime(newQ, 0);
    if (channels[currentChannel].link) linkedFilter.Q.setValueAtTime(newQ, 0);
    updateEQGraph();
});

let eqTouches = [];
eqHandleDiv.addEventListener("touchstart", (event) => {
    let newTouches = event.changedTouches;
    for (let i = 0; i < newTouches.length; i++) {
        eqTouches.push(newTouches[i]);
    }
});

eqHandleDiv.addEventListener("touchmove", (event) => {
    let movedTouches = event.changedTouches;
    for (let i = 0; i < movedTouches.length; i++) {
        for (let j = 0; j < eqTouches.length; j++) {
            if (movedTouches[i].identifier == eqTouches[j].identifier) {
                if (eqTouches.length > 2 && currentFilter.type != "highpass")  {
                    let anchorTouch = (j == 0 ? eqTouches[eqTouches.length - 1] : eqTouches[0]);

                    // calculate pinch magnitude with dot product
                    let deltaQ = ((anchorTouch.pageX - movedTouches[i].pageX) * (movedTouches[i].pageX - eqTouches[j].pageX) + (anchorTouch.pageY - movedTouches[i].pageY) * (movedTouches[i].pageY - eqTouches[j].pageY)) / 5000;
                    console.log(deltaQ);

                    let newQ = currentFilter.Q.value + deltaQ;
                    newQ = Math.max(0.3, Math.min(newQ, 10));
                    currentFilter.Q.setValueAtTime(newQ, 0);

                    if (channels[currentChannel].link) linkedFilter.Q.setValueAtTime(newQ, 0);
                }
                eqTouches[j] = movedTouches[i];
                return;
            }
        }
    }
});

eqHandleDiv.addEventListener("touchend", EQRemoveTouch);
eqHandleDiv.addEventListener("touchcancel", EQRemoveTouch);
function EQRemoveTouch(event) {
    let movedTouches = event.changedTouches;
    for (let i = 0; i < movedTouches.length; i++) {
        for (let j = 0; j < eqTouches.length; j++) {
            if (movedTouches[i].identifier == eqTouches[j].identifier) {
                eqTouches = eqTouches.slice(0, j).concat(eqTouches.slice(j + 1));
                continue;
            }
        }
    }
    if (eqTouches.length < 2) updateEQGraph();
}

function toggleEQ(index, updateLink = true) {
    channels[index].eq.bandsActive = !channels[index].eq.bandsActive;
    channels[index].htmlElement.querySelector(".channel-eq").dataset.active = channels[index].eq.bandsActive;
    document.querySelector(".eq-view-toggle-bands").dataset.active = channels[index].eq.bandsActive;
    document.querySelector(".overview-view-toggle-bands").dataset.active = channels[index].eq.bandsActive;
    
    channels[index].eq.postHighpass.disconnect();
    if (channels[index].eq.bandsActive) channels[index].eq.postHighpass.connect(channels[index].eq.band1);
    else channels[index].eq.postHighpass.connect(channels[index].preCompressor);
    
    updateEQGraph();

    if (updateLink && channels[index].link) toggleEQ(linkedIndex(index), false);
}

function toggleHighpass(index) {
    channels[index].eq.highpassActive = !channels[index].eq.highpassActive;
    document.querySelector(".eq-view-toggle-highpass").dataset.active = channels[index].eq.highpassActive;

    channels[index].preEq.disconnect();
    if (channels[index].eq.highpassActive) channels[index].preEq.connect(channels[index].eq.highpass);
    else channels[index].preEq.connect(channels[index].eq.postHighpass);

    updateEQGraph();
}