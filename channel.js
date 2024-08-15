const CHANNEL_TEMPLATE = document.querySelector(".channel");
const CHANNELS_PANEL = document.querySelector(".channels");
CHANNELS_PANEL.innerHTML = "";

const CHANNEL_NAMES = [
    "CH 01", "CH 02", "CH 03", "CH 04", "CH 05", "CH 06", "CH 07", "CH 08", 
    "CH 09", "CH 10", "CH 11", "CH 12", "CH 13", "CH 14", "CH 15", "CH 16", 
    "USB", "Rtn 1", "Rtn 2", "Rtn 3", "Rtn 4", 
    "Bus 1", "Bus 2", "Bus 3", "Bus 4", 
    "FXSnd 1", "FXSnd 2", "FXSnd 3", "FXSnd 4", "LR", 
    "DCA 1", "DCA 2", "DCA 3", "DCA 4"
]

class Channel {
    index;
    htmlElement;
    label = "";
    labelColor = BLACK;

    link = false;

    peakMeterBar;

    audio;
    source;
    gain;
    gainAnalyser;
    preGate = new GainNode(audioContext);
    gate;
    preEq = new GainNode(audioContext);
    eq;
    preCompressor = new GainNode(audioContext);
    compressor;
    volume = new GainNode(audioContext);
    pan;

    constructor(index) {

        // create html element
        this.index = Number(index);
        this.htmlElement = CHANNEL_TEMPLATE.cloneNode(true);
        this.htmlElement.dataset.index = index;
        CHANNELS_PANEL.appendChild(this.htmlElement);

        // labels
        this.label = CHANNEL_NAMES[index];
        this.htmlElement.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[index];

        // start channels as hidden - load through scene select
        this.htmlElement.style.display = "none";

        this.preGate.connect(this.preEq);
        this.preEq.connect(this.preCompressor);
        this.preCompressor.connect(this.volume);

        // only channels 1-16 have input/gain/gates
        if (index < 16) {
            this.audio = new Audio;
            this.source = audioContext.createMediaElementSource(this.audio);
            this.gain = new GainNode(audioContext);
            this.gainAnalyser = new AnalyserNode(audioContext);
            this.source.connect(this.gain);
            this.gain.connect(this.gainAnalyser);
            this.gainAnalyser.fftSize = 32;
            this.gain.connect(this.preGate);

            this.gate = null; ///to do
        }
        else this.htmlElement.querySelector(".channel-gate").style.visibility = "hidden";

        // all but sends, returns & dca have compression
        if ((index < 25 && (index < 16 || index > 20)) || index == 29) {
            this.compressor = null; ///to do
        }
        else this.htmlElement.querySelector(".channel-dyn").style.visibility = "hidden";

        // all but sends & dca have eq/panning
        if (index < 25 || index == 29) {
            this.eq = new EQ();
            this.pan = new StereoPannerNode(audioContext);
            
            this.preEq.connect(this.eq.postHighpass);
            this.eq.connect(this.preCompressor);
            this.volume.connect(this.pan);
            this.pan.connect(audioContext.destination);
        }
        else {
            this.htmlElement.querySelector(".channel-eq").style.visibility = "hidden";
            this.htmlElement.querySelector(".channel-pan").style.visibility = "hidden";
        }

        // input events
        this.htmlElement.querySelector(".fader").addEventListener("input", () => this.pollVolume());
        this.htmlElement.querySelector(".channel-mute").addEventListener("click", () => this.toggleMute());

        // peak meter
        if (index < 16) { ///temp
        this.peakMeterBar = this.htmlElement.querySelector(".peak-meter-bar");
        this.peakMeterBar.style.height = "100%";
        setInterval(this.updateGainAnalyser.bind(this), 50);
        }
    }

    setPan(value) {
        this.pan.pan.value = value / 100;
        let panBar = this.htmlElement.querySelector(".channel-pan-bar");
        panBar.style.width = Math.abs(value / 2.1) + "%";
        panBar.style.left = value < 0 ? (50 - Math.abs(value / 2.1)) + "%" : "50%";
    }

    pollVolume() {
        this.setVolume(faderValueToDB(this.htmlElement.querySelector(".fader").value), false);
    }

    setVolume(dB, updateFader = true, updateLink = true) {
        this.volume.gain.value = Math.pow(2, dB/6);
        this.htmlElement.querySelector(".channel-fader-level").innerHTML = dB <= -90 ? "-&infin;" : (dB > 0 ? "+" : "") + Number(dB).toFixed(1);
        if (updateFader) this.htmlElement.querySelector(".fader").value = dbToFaderValue(dB);

        // sets volume of linked channel
        if (this.link && updateLink) channels[this.index % 2 == 0 ? this.index + 1 : this.index - 1].setVolume(dB, true, false);
    }

    toggleMute(updateLink = true) {
        let muteButton = this.htmlElement.querySelector(".channel-mute");
        muteButton.dataset.active = (muteButton.dataset.active == "false" ? "true" : "false");
        if (muteButton.dataset.active == "false") this.volume.connect(this.pan);
        else this.volume.disconnect(this.pan);

        // toggles linked channel
        if (this.link && updateLink) channels[this.index % 2 == 0 ? this.index + 1 : this.index - 1].toggleMute(false);
    }

    updateHtml() {
        let label = this.htmlElement.querySelector(".channel-label");
        label.innerHTML = this.label;
        label.style.backgroundColor = COLOR_BACKGROUND[this.labelColor];
        label.style.color = COLOR_TEXT[this.labelColor];
        if (this.pan) this.setPan(this.pan.pan.value * 100);
        this.setVolume(Math.log2(this.volume.gain.value) * 6);
    }

    updateGainAnalyser() {
        let sampleBuffer = new Float32Array(32);
        this.gainAnalyser.getFloatTimeDomainData(sampleBuffer);
        let currentDecibels = 20 * Math.log10(sampleBuffer.reduce((a, b) => Math.max(a, b)));
        if (isNaN(currentDecibels)) currentDecibels = -Infinity; 
        currentDecibels = Math.max(currentDecibels, -3-parseFloat(this.peakMeterBar.style.height));
        this.peakMeterBar.style.height = Math.min(100, -currentDecibels) + "%";   
    }

    setLink(value) {
        this.link = value;
        channels[this.index % 2 == 0 ? this.index + 1 : this.index - 1].link = value;

        // pans hard left and right upon linking
        if (value == true) {
            this.setPan(this.index % 2 == 0 ? -100 : 100);
            channels[this.index % 2 == 0 ? this.index + 1 : this.index - 1].setPan(this.index % 2 == 0 ? 100 : -100);
        }
    }
}

function dbToFaderValue(dB) {
    if (dB == -Infinity) dB = -90;
    if (dB < -50) dB = dB / 2 - 25;
    if (dB < -30) dB = dB / 2 - 15;
    if (dB < -10) dB = dB / 2 - 5;
    return dB;
}

function faderValueToDB(faderValue) {
    if (faderValue < -10) faderValue = faderValue * 2 + 10;
    if (faderValue < -30) faderValue = faderValue * 2 + 30;
    if (faderValue < -50) faderValue = faderValue * 2 + 50;
    if (faderValue <= -90) faderValue = -Infinity;
    return faderValue;
}

let channels = [];
for (i in CHANNEL_NAMES) {
    channels.push(new Channel(i));
}