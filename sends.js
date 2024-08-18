const bus1SendFader = document.querySelector(".sends-channel");
bus1SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[21];
bus1SendFader.querySelector(".fader").disabled = true;

const bus2SendFader = bus1SendFader.cloneNode(true);
bus1SendFader.parentElement.appendChild(bus2SendFader);
bus2SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[22];

const bus3SendFader = bus1SendFader.cloneNode(true);
bus1SendFader.parentElement.appendChild(bus3SendFader);
bus3SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[23];

const bus4SendFader = bus1SendFader.cloneNode(true);
bus1SendFader.parentElement.appendChild(bus4SendFader);
bus4SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[24];

const FX1SendFader = bus1SendFader.cloneNode(true);
bus1SendFader.parentElement.appendChild(FX1SendFader);
FX1SendFader.style.backgroundColor = "#295D73";
FX1SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[25];
FX1SendFader.querySelector(".fader").disabled = false;

const FX2SendFader = FX1SendFader.cloneNode(true);
FX1SendFader.parentElement.appendChild(FX2SendFader);
FX2SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[26];

const FX3SendFader = FX1SendFader.cloneNode(true);
FX1SendFader.parentElement.appendChild(FX3SendFader);
FX3SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[27];

const FX4SendFader = FX1SendFader.cloneNode(true);
FX1SendFader.parentElement.appendChild(FX4SendFader);
FX4SendFader.querySelector(".channel-label-const").innerHTML = CHANNEL_NAMES[28];

function updateSendFader(fader){
    let dB = faderValueToDB(fader.value);
    fader.parentElement.querySelector(".channel-fader-level").innerHTML = dB <= -90 ? "-&infin;" : (dB > 0 ? "+" : "") + Number(dB).toFixed(1);
    
    if (fader.parentElement.parentElement == FX1SendFader) {
        channels[currentChannel].preFX1.gain.setValueAtTime(Math.pow(2, dB / 6), 0);
    }

    else if (fader.parentElement.parentElement == FX2SendFader) {
        channels[currentChannel].preFX2.gain.setValueAtTime(Math.pow(2, dB / 6), 0);
    }

    else if (fader.parentElement.parentElement == FX3SendFader) {
        channels[currentChannel].preFX3.gain.setValueAtTime(Math.pow(2, dB / 6), 0);
    }

    else if (fader.parentElement.parentElement == FX4SendFader) {
        channels[currentChannel].preFX4.gain.setValueAtTime(Math.pow(2, dB / 6), 0);
    }
}