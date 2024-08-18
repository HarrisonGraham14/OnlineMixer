const panOverlay = document.querySelector(".pan-overlay");
const panSlider = document.querySelector(".pan-slider");
const panReadout = document.querySelector(".pan-readout");

function openPanner(channel) {
    panOverlay.dataset.channel = channel;
    panAmount = Math.round(channels[channel].pan.pan.value * 100);
    panOverlay.style.display = "block";
    panSlider.value = panAmount;
    panReadout.innerHTML = "Pan: " + panAmount;
}

function updatePanner() {
    panReadout.innerHTML = "Pan: " + panSlider.value;
    channels[panOverlay.dataset.channel].setPan(Number(panSlider.value));

    if (currentChannel == panOverlay.dataset.channel) {
        overviewChannel.querySelector(".channel-pan-bar").style.width = channels[panOverlay.dataset.channel].htmlElement.querySelector(".channel-pan-bar").style.width;
        overviewChannel.querySelector(".channel-pan-bar").style.left = channels[panOverlay.dataset.channel].htmlElement.querySelector(".channel-pan-bar").style.left;

        sendsView.querySelector(".channel-pan-bar").style.width = channels[panOverlay.dataset.channel].htmlElement.querySelector(".channel-pan-bar").style.width;
        sendsView.querySelector(".channel-pan-bar").style.left = channels[panOverlay.dataset.channel].htmlElement.querySelector(".channel-pan-bar").style.left;
    }
}

const linkOverlay = document.querySelector(".link-overlay");
const linkButton = document.querySelector(".overview-button-link");

function linkButtonPressed() {
    if (channels[currentChannel].link) {
        channels[currentChannel].setLink(false);
        linkButton.dataset.active = false;
        return;
    }
    if (currentChannel >= 16) return; ///temp
    let lowerChannel = Math.min(Number(currentChannel), linkIndex(currentChannel));
    let label1 = channels[lowerChannel].label == "" ? CHANNEL_NAMES[lowerChannel] : channels[lowerChannel].label;
    let label2 = channels[lowerChannel + 1].label == "" ? CHANNEL_NAMES[lowerChannel + 1] : channels[lowerChannel + 1].label;
    linkOverlay.querySelector("p").innerHTML = "Do you want to link " + label1 + " and " + label2 + " ?";
    linkOverlay.style.display = "flex";
}

function confirmLink() {
    linkOverlay.style.display = "none";
    channels[currentChannel].setLink(true);
    linkButton.dataset.active = true;
}

const overviewView = document.querySelector(".overview-view");
const gateView = document.querySelector(".gate-view");
const eqView = document.querySelector(".eq-view");
const dynamicView = document.querySelector(".dynamic-view");
const sendsView = document.querySelector(".sends-view");

const upperHeading = document.querySelector(".heading-upper");
const lowerHeading = document.querySelector(".heading-lower");
const backButton = document.querySelector(".back-button");
const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");
const settingsButton = document.querySelector(".settings-button");

// overview channel setup
let overviewChannel = document.querySelector(".overview-channel")
overviewChannel.querySelector(".channel-mute").addEventListener("click", () =>  {
    overviewChannel.querySelector(".channel-mute").dataset.active = overviewChannel.querySelector(".channel-mute").dataset.active == "false";
    channels[overviewChannel.dataset.channel].toggleMute();
});
overviewChannel.querySelector(".channel-solo").addEventListener("click", () =>  {
    overviewChannel.querySelector(".channel-solo").dataset.active = overviewChannel.querySelector(".channel-solo").dataset.active == "false";
    channels[overviewChannel.dataset.channel].htmlElement.querySelector(".channel-solo").dataset.active = overviewChannel.querySelector(".channel-solo").dataset.active;
});
overviewChannel.querySelector(".fader").addEventListener("input", () =>  {
    channels[overviewChannel.dataset.channel].setVolume(faderValueToDB(overviewChannel.querySelector(".fader").value));
    overviewChannel.querySelector(".channel-fader-level").innerHTML = channels[overviewChannel.dataset.channel].htmlElement.querySelector(".channel-fader-level").innerHTML;
});
overviewPeakMeterBar = overviewChannel.querySelector(".peak-meter-bar")
setInterval(function () { if (channels[overviewChannel.dataset.channel].peakMeterBar) overviewPeakMeterBar.style.height = channels[overviewChannel.dataset.channel].peakMeterBar.style.height; }, 50);

let currentView;

function openView(view, channel) {
    currentChannel = channel;
    currentView = view;
    view.style.display = "flex";
    
    upperHeading.innerHTML = CHANNEL_NAMES[currentChannel] + " " + channels[currentChannel].label;

    if (view == overviewView) {
        lowerHeading.innerHTML = "Overview";
        overviewChannel.dataset.channel = channel;
        overviewChannel.querySelector(".channel-label").innerHTML = channels[channel].label == "" ? CHANNEL_NAMES[channel] : channels[channel].label;
        overviewChannel.querySelector(".channel-label").style.color = COLOR_TEXT[channels[channel].labelColor];
        overviewChannel.querySelector(".channel-label").style.backgroundColor = COLOR_BACKGROUND[channels[channel].labelColor];
        overviewChannel.querySelector(".channel-pan-bar").style.width = channels[channel].htmlElement.querySelector(".channel-pan-bar").style.width;
        overviewChannel.querySelector(".channel-pan-bar").style.left = channels[channel].htmlElement.querySelector(".channel-pan-bar").style.left;
        overviewChannel.querySelector(".channel-solo").dataset.active = channels[channel].htmlElement.querySelector(".channel-solo").dataset.active;
        overviewChannel.querySelector(".channel-fader-level").innerHTML = channels[channel].htmlElement.querySelector(".channel-fader-level").innerHTML;
        overviewChannel.querySelector(".fader").value = channels[channel].htmlElement.querySelector(".fader").value;
        overviewChannel.querySelector(".channel-mute").dataset.active = channels[channel].htmlElement.querySelector(".channel-mute").dataset.active;
        overviewChannel.querySelector(".channel-label-const").innerHTML = channels[channel].htmlElement.querySelector(".channel-label-const").innerHTML;
        linkButton.dataset.active = channels[channel].link;
        
        if (channels[channel].gain) {
            overviewGainKnob.htmlElement.style.visibility = "visible";
            overviewGainKnob.setValue(Math.log2(channels[channel].gain.gain.value) * 6);
        }
        else {
            overviewGainKnob.htmlElement.style.visibility = "hidden";
        }

        if (channel < 16) {
            document.querySelector(".overview-button-phase").style.visibility = "visible";
            document.querySelector(".overview-button-phantom").style.visibility = "visible";
            document.querySelector(".overview-button-link").style.visibility = "visible";
        }
        else {
            document.querySelector(".overview-button-phase").style.visibility = "hidden";
            document.querySelector(".overview-button-phantom").style.visibility = "hidden";
            document.querySelector(".overview-button-link").style.visibility = (channel < 21 || channel > 24) ? "hidden" : "visible";
        }

        if (channels[channel].gate) {
            for (let item of document.querySelectorAll(".overview-gate>*")) item.style.visibility = "visible";
            overviewGateThresholdKnob.setValue
        }
        else {
            for (let item of document.querySelectorAll(".overview-gate>*")) item.style.visibility = "hidden";
        }

        if (channels[channel].eq) {
            for (let item of document.querySelectorAll(".overview-eq>*")) item.style.visibility = "visible";
            document.querySelector(".overview-view-toggle-bands").dataset.active = channels[currentChannel].htmlElement.querySelector(".channel-eq").dataset.active;
        }
        else {
            for (let item of document.querySelectorAll(".overview-eq>*")) item.style.visibility = "hidden";
        }

        if (channels[channel].compressor) {
            for (let item of document.querySelectorAll(".overview-dyn>*")) item.style.visibility = "visible";
            document.querySelector(".overview-toggle-dynamics").dataset.active = channels[currentChannel].htmlElement.querySelector(".channel-dyn").dataset.active;
        }
        else {
            for (let item of document.querySelectorAll(".overview-dyn>*")) item.style.visibility = "hidden";
        }

        if (channels[channel].preFX1) {
            for (let item of document.querySelectorAll(".overview-sends>*")) item.style.visibility = "visible";
        }
        else {
            for (let item of document.querySelectorAll(".overview-sends>*")) item.style.visibility = "hidden";
        }
    }

    else if (view == gateView) {
        lowerHeading.innerHTML = "Gate";
    }

    else if (view == eqView) {
        lowerHeading.innerHTML = "EQ";
        updateEQGraph();
        setEQHandlePositions();
        if (currentHandle) currentHandle.dataset.active = "false";
        currentHandle = null;
        eqTouches = [];

        document.querySelector(".eq-view-toggle-bands").dataset.active = channels[currentChannel].htmlElement.querySelector(".channel-eq").dataset.active;
        document.querySelector(".eq-view-toggle-highpass").dataset.active = channels[currentChannel].eq.highpassActive;
        document.querySelector(".rta-channel-select").innerHTML = (channels[currentChannel].label == "" ? CHANNEL_NAMES[currentChannel] : channels[currentChannel].label) + " &#11015;";
    }

    else if (view == dynamicView) {
        lowerHeading.innerHTML = "Dynamic";
        document.querySelector(".dynamic-button-on").dataset.active = channels[currentChannel].htmlElement.querySelector(".channel-dyn").dataset.active;
        dynamicsThresholdKnob.setValue(channels[channel].compressor.node.threshold.value);
        dynamicsRatioKnob.setValue(channels[channel].compressor.node.ratio.value);
        dynamicsKneeKnob.setValue(channels[channel].compressor.node.knee.value);
        dynamicsAttackKnob.setValue(channels[channel].compressor.node.attack.value * 1000);
        dynamicsReleaseKnob.setValue(channels[channel].compressor.node.release.value * 1000);
        dynamicsGainKnob.setValue(Math.log2(channels[channel].compressor.gain.gain.value) * 6);
        dynamicsMixKnob.setValue(channels[currentChannel].compressor.wet.gain.value * 100);
        dynamicReductionBarInterval = setInterval(updateDynamicReductionBar, 20);
    }

    else if (view == sendsView) {
        lowerHeading.innerHTML = "Sends";
        sendsView.querySelector(".channel-pan-bar").style.width = channels[channel].htmlElement.querySelector(".channel-pan-bar").style.width;
        sendsView.querySelector(".channel-pan-bar").style.left = channels[channel].htmlElement.querySelector(".channel-pan-bar").style.left;
        bus1SendFader.querySelector(".fader").value = dbToFaderValue(-Infinity);
        bus2SendFader.querySelector(".fader").value = dbToFaderValue(-Infinity);
        bus3SendFader.querySelector(".fader").value = dbToFaderValue(-Infinity);
        bus4SendFader.querySelector(".fader").value = dbToFaderValue(-Infinity);
        FX1SendFader.querySelector(".fader").value = dbToFaderValue(Math.log2(channels[channel].preFX1.gain.value) * 6);
        FX2SendFader.querySelector(".fader").value = dbToFaderValue(Math.log2(channels[channel].preFX2.gain.value) * 6);
        FX3SendFader.querySelector(".fader").value = dbToFaderValue(Math.log2(channels[channel].preFX3.gain.value) * 6);
        FX4SendFader.querySelector(".fader").value = dbToFaderValue(Math.log2(channels[channel].preFX4.gain.value) * 6);
        
        bus1SendFader.querySelector(".sends-fader-label").innerHTML = channels[21].label == "" ? CHANNEL_NAMES[21] : channels[21].label;
        bus2SendFader.querySelector(".sends-fader-label").innerHTML = channels[22].label == "" ? CHANNEL_NAMES[22] : channels[22].label;
        bus3SendFader.querySelector(".sends-fader-label").innerHTML = channels[23].label == "" ? CHANNEL_NAMES[23] : channels[23].label;
        bus4SendFader.querySelector(".sends-fader-label").innerHTML = channels[24].label == "" ? CHANNEL_NAMES[24] : channels[24].label;
        FX1SendFader.querySelector(".sends-fader-label").innerHTML = channels[25].label == "" ? CHANNEL_NAMES[25] : channels[25].label;
        FX2SendFader.querySelector(".sends-fader-label").innerHTML = channels[26].label == "" ? CHANNEL_NAMES[26] : channels[26].label;
        FX3SendFader.querySelector(".sends-fader-label").innerHTML = channels[27].label == "" ? CHANNEL_NAMES[27] : channels[27].label;
        FX4SendFader.querySelector(".sends-fader-label").innerHTML = channels[28].label == "" ? CHANNEL_NAMES[28] : channels[28].label;
    }

    backButton.style.display = "block";
    nextButton.style.display = "block";
    prevButton.style.display = "block";
    if (view != overviewView && view != eqView) settingsButton.style.display = "block";
}

function closeView() {
    if (sendsView.style.display == "flex") sendsView.style.display = "none";
    else if (dynamicView.style.display == "flex") dynamicView.style.display = "none";
    else if (eqView.style.display == "flex") eqView.style.display = "none";
    else if (gateView.style.display == "flex") gateView.style.display = "none";
    else if (overviewView.style.display == "flex") overviewView.style.display = "none";

    if (overviewView.style.display == "flex")  {
        lowerHeading.innerHTML = "Overview";
        openView(overviewView, currentChannel);
    }

    else {
        upperHeading.innerHTML = "Mixer View";
        lowerHeading.innerHTML = "LR Mix";

        backButton.style.display = "none";
        nextButton.style.display = "none";
        prevButton.style.display = "none";
    }
    settingsButton.style.display = "none";
}

function viewSwitch(direction) {
    let offset = (direction == "next") ? 1 : 29;
    if (currentView == overviewView) currentChannel = (Number(currentChannel) + offset) % 30;
    if (currentView == gateView) do currentChannel = (Number(currentChannel) + offset) % 30; while (!channels[currentChannel].gate);
    if (currentView == dynamicView) do currentChannel = (Number(currentChannel) + offset) % 30; while (!channels[currentChannel].compressor);
    if (currentView == eqView) do currentChannel = (Number(currentChannel) + offset) % 30; while (!channels[currentChannel].eq);
    if (currentView == sendsView) do currentChannel = (Number(currentChannel) + offset) % 30; while (!channels[currentChannel].preFX1);
    openView(currentView, currentChannel);
}

function toggleSettings() {
    settingsButton.dataset.active = settingsButton.dataset.active == "false";
    let setVisibility = settingsButton.dataset.active == "true" ? "visible" : "hidden";
    for (let item of document.querySelectorAll(".settings-toggle")) item.style.visibility = setVisibility;
    document.querySelector(".sends-routing").style.display = settingsButton.dataset.active == "true" ? "flex" : "none";
    for (let item of document.querySelectorAll(".sends-channel")) item.dataset.settings = settingsButton.dataset.active == "true";
}