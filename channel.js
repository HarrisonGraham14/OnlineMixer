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
    linkIndex;

    peakMeterBar;

    audio;
    source;
    gain;
    meterAnalyser  = new AnalyserNode(audioContext);
    preGate = new GainNode(audioContext);
    gate;
    preEq = new GainNode(audioContext);
    eq;
    preCompressor = new GainNode(audioContext);
    compressor;
    volume = new GainNode(audioContext);
    pan;

    effect;
    preFX1;
    preFX2;
    preFX3;
    preFX4;

    constructor(index) {

        // create html element
        this.index = Number(index);
        this.htmlElement = CHANNEL_TEMPLATE.cloneNode(true);
        this.htmlElement.dataset.index = index;
        CHANNELS_PANEL.appendChild(this.htmlElement);

        // label
        this.htmlElement.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[index];

        // dca channels have no overview page
        if (index >= 30) this.htmlElement.querySelector(".channel-label").onclick = "" ;

        // start channels as hidden - load through scene select
        this.htmlElement.style.display = "none";

        this.preGate.connect(this.preEq);
        this.preEq.connect(this.preCompressor);
        this.preCompressor.connect(this.volume);

        // peak meter
        this.peakMeterBar = this.htmlElement.querySelector(".peak-meter-bar");
        this.peakMeterBar.style.height = "100%";
        setInterval(this.updatemeterAnalyser.bind(this), 50);
        this.meterAnalyser.fftSize = 32;

        // only channels 1-16 have input/gain/gates
        if (index < 16) {
            this.audio = new Audio;
            this.source = audioContext.createMediaElementSource(this.audio);
            this.gain = new GainNode(audioContext);
            this.source.connect(this.gain);
            this.gain.connect(this.meterAnalyser);
            this.gain.connect(this.preGate);
            this.gate = true; ///to do
        }
        else {
            this.htmlElement.querySelector(".channel-gate").style.visibility = "hidden";
            this.preEq.connect(this.meterAnalyser);
        }

        // all but sends, returns & dca have compression
        if ((index < 25 && (index < 16 || index > 20)) || index == 29) {
            this.compressor = new Compressor();
            this.compressor.connect(this.volume);
        }
        else this.htmlElement.querySelector(".channel-dyn").style.visibility = "hidden";

        // all but sends & dca have eq/panning
        if (index < 25 || index == 29) {
            this.eq = new EQ();
            this.pan = new StereoPannerNode(audioContext);
            
            this.preEq.connect(this.eq.postHighpass);
            this.eq.connect(this.preCompressor);
            this.volume.connect(this.pan);
        }
        else {
            this.htmlElement.querySelector(".channel-eq").style.visibility = "hidden";
            this.htmlElement.querySelector(".channel-pan").style.visibility = "hidden";
        }

        // channels 1-16 and aux/fx have sends
        if (index < 21) {
            this.preFX1 = new GainNode(audioContext);
            this.preFX2 = new GainNode(audioContext);
            this.preFX3 = new GainNode(audioContext);
            this.preFX4 = new GainNode(audioContext);

            this.preFX1.gain.setValueAtTime(0, 0);
            this.preFX2.gain.setValueAtTime(0, 0);
            this.preFX3.gain.setValueAtTime(0, 0);
            this.preFX4.gain.setValueAtTime(0, 0);

            this.pan.connect(this.preFX1);
            this.pan.connect(this.preFX2);
            this.pan.connect(this.preFX3);
            this.pan.connect(this.preFX4);
        }

        // fx - reverbs
        if (index == 25 || index == 26) {
            this.effect = new ConvolverNode(audioContext);

            if (index == 25) this.loadImpulseResponse("./impulse/bright plate.wav");
            else this.loadImpulseResponse("./impulse/warm hall.wav");

            this.preEq.connect(this.effect);
            this.effect.connect(this.volume);
        }

        // fx - delays
        if (index == 27 || index == 28) {
            this.effect = new DelayNode(audioContext);
            
            this.effect.delayTime.setValueAtTime(index == 27 ? 0.25 : 0.14, 0);
            this.preCompressor.gain.setValueAtTime(0.35, 0);

            this.preCompressor.connect(this.effect);
            this.effect.connect(this.preCompressor);
            this.effect.connect(this.volume);
        }

        ///temp: disable fader for buses and DCA
        if ((index >= 21 && index <= 24) || (index >= 30 && index <= 33)) {
            this.setVolume(-Infinity);
            this.htmlElement.querySelector(".fader").disabled = true;
            return;
        }

        // input events
        this.htmlElement.querySelector(".fader").addEventListener("input", () => this.pollVolume());
        this.htmlElement.querySelector(".channel-mute").addEventListener("click", () => this.toggleMute());
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
        if (this.link && updateLink) channels[linkIndex(this.index)].setVolume(dB, true, false);
    }

    toggleMute(updateLink = true) {
        let muteButton = this.htmlElement.querySelector(".channel-mute");
        muteButton.dataset.active = (muteButton.dataset.active == "false" ? "true" : "false");
        if (muteButton.dataset.active == "false") this.volume.connect(this.pan);
        else this.volume.disconnect(this.pan);

        // toggles linked channel
        if (this.link && updateLink) channels[linkIndex(this.index)].toggleMute(false);
    }

    updateHtml() {
        let label = this.htmlElement.querySelector(".channel-label");
        label.innerHTML = this.label == "" ? CHANNEL_NAMES[this.index] : this.label;
        label.style.backgroundColor = COLOR_BACKGROUND[this.labelColor];
        label.style.color = COLOR_TEXT[this.labelColor];
        if (this.pan) this.setPan(this.pan.pan.value * 100);
        this.setVolume(Math.log2(this.volume.gain.value) * 6);
    }

    updatemeterAnalyser() {
        if (this.htmlElement.style.display != "flex") return;
        let sampleBuffer = new Float32Array(32);
        this.meterAnalyser.getFloatTimeDomainData(sampleBuffer);
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
            channels[linkIndex(this.index)].setPan(this.index % 2 == 0 ? 100 : -100);
        }
    }

    async loadImpulseResponse(file) {
        try {
            const response = await fetch(file);
            const arrayBuffer = await response.arrayBuffer();
            const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
            this.effect.buffer = decodedAudio;
          } 
          catch (error) { console.error("Impulse response failed to load"); }
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

function linkIndex(index) {
    index = Number(index);
    if (index < 16) return index + (index % 2 ? -1 : 1);
    else if (index >= 21 && index <= 24) return index + (index % 2 ? 1 : -1);
    else console.error("Invalid index '" + index + "' passed to linkIndex()");
}

let channels = [];
for (let i in CHANNEL_NAMES) {
    channels.push(new Channel(i));
}

// inter-channel routing
// fx sends
for (let i = 0; i < 16; i++) { ///currently cant send fx to fx
    if (i != 17) channels[i].preFX1.connect(channels[25].preEq);
    if (i != 18) channels[i].preFX2.connect(channels[26].preEq);
    if (i != 19) channels[i].preFX3.connect(channels[27].preEq);
    if (i != 20) channels[i].preFX4.connect(channels[28].preEq);
}

// fx returns
channels[25].volume.connect(channels[17].preEq);
channels[26].volume.connect(channels[18].preEq);
channels[27].volume.connect(channels[19].preEq);
channels[28].volume.connect(channels[20].preEq);

// main
for (let i = 0; i < channels.length; i++) {
    if (i >= 25 && i <= 29) continue;
    if (channels[i].pan) channels[i].pan.connect(channels[29].preEq);
    else channels[i].volume.connect(channels[29].preEq);
}
channels[29].volume.connect(audioContext.destination);