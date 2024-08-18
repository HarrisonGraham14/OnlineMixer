class Knob {
    htmlElement;
    updateFunction;

    currentTouch = null;
    changeFunction = this.changeInput.bind(this);
    endFunction = this.endInput.bind(this);

    min;
    max;
    rawValue; // [0, 1]
    value;
    units;
    decimalPlaces;

    constructor(htmlElement, updateFunction, min=0, max=1, value=0, units="dB", decimalPlaces = 1, usable = true) {
        this.htmlElement = htmlElement;
        this.updateFunction = updateFunction;

        this.units = units;
        this.decimalPlaces = decimalPlaces;

        this.min = min;
        this.max = max;
        this.setValue(value);

        if (usable) {
            this.htmlElement.addEventListener("mousedown", this.startInput.bind(this), event);
            this.htmlElement.addEventListener("touchstart", this.startInput.bind(this), event);
        }
    }

    updateValue() {
        this.value = this.min + this.rawValue * (this.max - this.min);
        
        // update visuals
        this.htmlElement.querySelector(".input-knob-dial").style.transform = "rotate(" + (270 * this.rawValue - 45) + "deg)"; 
        this.htmlElement.querySelector(".input-knob-mask-3").dataset.lowerHalf = this.rawValue < 0.5;
        let maskString = (this.rawValue > 0.5 ? "linear-gradient(to left, transparent 50%, red 50%), " : "" ) + "linear-gradient(" + (270 * this.rawValue + 135) + "deg, transparent 50%, red 50%)";
        this.htmlElement.querySelector(".input-knob-highlight").style.mask = maskString;
        this.htmlElement.querySelector(".input-knob-highlight").style.webkitMask = maskString; 
        this.htmlElement.querySelector(".input-knob-readout").innerHTML = (this.value > 0 && this.units == "dB" ? "+" : "") + this.value.toFixed(this.decimalPlaces) + " " + this.units;
    }

    setValue(value) {
        this.rawValue = (value - this.min) / (this.max - this.min);
        this.updateValue();
    }

    startInput(event) {
        if (event.type == "mousedown") {
            document.addEventListener("mousemove", this.changeFunction, event);
            document.addEventListener("mouseup", this.endFunction, event);
        }
        else if (event.type == "touchstart") {
            this.currentTouch = event.changedTouches[0];
            document.addEventListener("touchmove", this.changeFunction, event);
            document.addEventListener("touchend", this.endFunction, event);
        }
    }

    changeInput(event) {
        let deltaX;
        let deltaY;
        if (event.type == "mousemove") {
            deltaX = event.movementX;
            deltaY = event.movementY;
        }
        else if (event.type == "touchmove") {
            if (this.currentTouch == null) {
                document.removeEventListener("touchmove", this.changeFunction);
                document.removeEventListener("touchend", this.endFunction);
                return;
            }
            for (let touch of event.changedTouches) {
                if (touch.identifier == this.currentTouch.identifier) {
                    deltaX = touch.pageX - this.currentTouch.pageX;
                    deltaY = touch.pageY - this.currentTouch.pageY;
                    this.currentTouch = touch;
                    break;
                }
            }
        }

        this.rawValue += (deltaX - deltaY) / (this.htmlElement.clientWidth * 10);
        if (this.rawValue < 0) this.rawValue = 0;
        if (this.rawValue > 1) this.rawValue = 1;

        this.updateValue();
        this.updateFunction(this.value);
    }

    endInput(event) {
        if (event.type == "mouseup") {
            document.removeEventListener("mousemove", this.changeFunction);
            document.removeEventListener("mousemove", this.endFunction);
        }
        else if (event.type == "touchend") {
            if (this.currentTouch == null) {
                document.removeEventListener("touchmove", this.changeFunction);
                document.removeEventListener("touchend", this.endFunction);
                return;
            }
            for (let touch of event.changedTouches) {
                if (touch.identifier == this.currentTouch.identifier) {
                    this.currentTouch = null;
                    document.removeEventListener("touchmove", this.changeFunction);
                    document.removeEventListener("touchend", this.endFunction);
                    return;
                }
            }
        }
    }
}

let overviewGainKnob = new Knob(document.querySelector(".input-knob"), (value) => {
    channels[currentChannel].gain.gain.value = Math.pow(2, value / 6);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].gain.gain.value = Math.pow(2, value / 6);
}, -12, 60, 0);

let dynamicsThresholdKnob = new Knob(document.querySelector(".dynamic-knob-threshold"), (value) => {
    channels[currentChannel].compressor.setThreshold(value);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setThreshold(value);
}, -60, 0, -60);

let dynamicsRatioKnob = new Knob(document.querySelector(".dynamic-knob-ratio"), (value) => {
    channels[currentChannel].compressor.setRatio(value);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setRatio(value);
}, 1.1, 20, 1.1, "");

let dynamicsKneeKnob = new Knob(document.querySelector(".dynamic-knob-knee"), (value) => {
    channels[currentChannel].compressor.setKnee(value);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setKnee(value);
}, 0, 5, 0, "", 0);

let dynamicsAttackKnob = new Knob(document.querySelector(".dynamic-knob-attack"), (value) => {
    channels[currentChannel].compressor.setAttack(value / 1000);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setAttack(value / 1000);
}, 0, 120, 24, "ms", 0);

let dynamicsHoldKnob = new Knob(document.querySelector(".dynamic-knob-hold"), (value) => {
}, 0.02, 2000, 0.2, "ms", 2, false);

let dynamicsReleaseKnob = new Knob(document.querySelector(".dynamic-knob-release"), (value) => {
    channels[currentChannel].compressor.setRelease(value / 1000);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setRelease(value / 1000);
}, 5, 200, 19, "ms", 0);

let dynamicsGainKnob = new Knob(document.querySelector(".dynamic-knob-gain"), (value) => {
    channels[currentChannel].compressor.setGain(value);
    if (channels[currentChannel].link) channels[linkedIndex(currentChannel)].compressor.setGain(value);
}, 0, 24, 0);

let dynamicsMixKnob = new Knob(document.querySelector(".dynamic-knob-mix"), (value) => {
    channels[currentChannel].compressor.setMix(value / 100);
}, 0, 100, 100, "%");

let dynamicsKeyKnob = new Knob(document.querySelector(".dynamic-knob-key"), (value) => {
}, 20, 20000, 20, "Hz", 1, false);