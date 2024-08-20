class Compressor {
    splitter = new GainNode(audioContext);
    node = new DynamicsCompressorNode(audioContext);
    dry = new GainNode(audioContext);
    wet = new GainNode(audioContext);
    gain = new GainNode(audioContext);

    constructor() {
        this.setThreshold(0);
        this.setRatio(1.1);
        this.setKnee(0);
        this.setAttack(0.024);
        this.setRelease(0.019);
        this.setMix(1.0);

        this.splitter.connect(this.node);
        this.splitter.connect(this.dry);
        this.node.connect(this.wet);
        this.wet.connect(this.gain);
        this.dry.connect(this.gain);
    }

    connect(destination) { this.gain.connect(destination); }
    setThreshold(value) { this.node.threshold.setValueAtTime(value, 0); }
    setRatio(value) { this.node.ratio.setValueAtTime(value, 0); }
    setKnee(value) { this.node.knee.setValueAtTime(value, 0); }
    setAttack(value) { this.node.attack.setValueAtTime(value, 0); }
    setRelease(value) { this.node.release.setValueAtTime(value, 0); }
    setGain(value) { this.gain.gain.setValueAtTime(Math.pow(2, value / 6), 0); }

    setMix(value) {
        this.wet.gain.setValueAtTime(value, 0);
        this.dry.gain.setValueAtTime(1 - value, 0);
    }
}

const dynamicReductionBar = document.querySelector(".dynamics-reduction-bar");
let dynamicReductionBarInterval;
function updateDynamicReductionBar() {
    dynamicReductionBar.style.height = Math.min(100, channels[currentChannel].compressor.node.reduction * -2) + "%";
    if (dynamicView.style.display == "none") clearInterval(dynamicReductionBarInterval);
}

function toggleDynamics() {
    let active = channels[currentChannel].htmlElement.querySelector(".channel-dyn").dataset.active == "false";
    channels[currentChannel].htmlElement.querySelector(".channel-dyn").dataset.active = active;
    document.querySelector(".overview-toggle-dynamics").dataset.active = active;
    document.querySelector(".dynamic-button-on").dataset.active = active;

    channels[currentChannel].preCompressor.disconnect();
    channels[currentChannel].preCompressor.connect(active ? channels[currentChannel].compressor.splitter : channels[currentChannel].volume);
}