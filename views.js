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
    }
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
    overviewChannel.querySelector(".channel-mute").dataset.active = overviewChannel.querySelector(".channel-mute").dataset.active == "true" ? "false" : "true";
    channels[overviewChannel.dataset.channel].toggleMute();
});
overviewChannel.querySelector(".channel-solo").addEventListener("click", () =>  {
    overviewChannel.querySelector(".channel-solo").dataset.active = overviewChannel.querySelector(".channel-solo").dataset.active == "true" ? "false" : "true";
    channels[overviewChannel.dataset.channel].htmlElement.querySelector(".channel-solo").dataset.active = overviewChannel.querySelector(".channel-solo").dataset.active;
});
overviewChannel.querySelector(".fader").addEventListener("input", () =>  {
    channels[overviewChannel.dataset.channel].setVolume(faderValueToDB(overviewChannel.querySelector(".fader").value));
    overviewChannel.querySelector(".channel-fader-level").innerHTML = channels[overviewChannel.dataset.channel].htmlElement.querySelector(".channel-fader-level").innerHTML;
});
overviewPeakMeterBar = overviewChannel.querySelector(".peak-meter-bar")
setInterval(function () { overviewPeakMeterBar.style.height = channels[overviewChannel.dataset.channel].peakMeterBar.style.height; }, 50);

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
            document.querySelector(".overview-button-link").style.visibility = "hidden";
        }

        if (channels[channel].eq) {
            document.querySelector(".overview-view-toggle-bands").dataset.active = channels[currentChannel].htmlElement.querySelector(".channel-eq").dataset.active;
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
    }

    else if (view == sendsView) {
        lowerHeading.innerHTML = "Sends";
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
    let offset = (direction == "next") ? 1 : 33;
    if (currentView == overviewView) currentChannel = (Number(currentChannel) + offset) % 34;
    if (currentView == gateView) do currentChannel = (Number(currentChannel) + offset) % 34; while (!channels[currentChannel].gate);
    if (currentView == dynamicView) do currentChannel = (Number(currentChannel) + offset) % 34; while (!channels[currentChannel].compressor);
    if (currentView == eqView || currentView == sendsView) do currentChannel = (Number(currentChannel) + offset) % 34; while (!channels[currentChannel].eq);
    openView(currentView, currentChannel);
}

function toggleSettings() {
    settingsButton.dataset.active = settingsButton.dataset.active == "false";
    let setVisibility = settingsButton.dataset.active == "true" ? "visible" : "hidden";
    for (let item of document.querySelectorAll(".settings-toggle")) item.style.visibility = setVisibility;
}