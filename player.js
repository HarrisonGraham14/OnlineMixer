const audioContext = new AudioContext();

const playButton = document.querySelector(".play-button");
const playerBar = document.querySelector(".player-bar");
const playerTime = document.querySelector(".player-time");

let playState = "loading";

function loadAudio(folder, tracks=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    playState = "loading";
    for (i of tracks) {
        let trackPath = folder + "/Track " + (i < 9 ? "0" : "") + (Number(i) + 1) + ".ogg";
        channels[i].audio.src = trackPath;
        channels[i].audio.loop = true;
        channels[i].audio.load();
    }
}

function play() {
    if (audioContext.state == "suspended") audioContext.resume();

    // don't allow play before tracks have loaded
    for (let i = 0; i < 16; i++) {
        if (channels[i].audio.readyState != 0 && channels[i].audio.readyState != 4) {
            buffer();
            return;
        }
    }

    for (let i = 0; i < 16; i++) {
        if (channels[i].audio.readyState == 0) continue;
        channels[i].audio.play();
        channels[i].audio.currentTime = channels[0].audio.currentTime;
    }
    playState = "playing";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/pause.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "pause";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "none";
}

function pause() {
    for (let i = 0; i < 16; i++) channels[i].audio.pause();
    playState = "paused";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/play.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "play";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "none";
}

function buffer() {
    for (let i = 0; i < 16; i++) channels[i].audio.pause();
    if (playState == "playing" || playState == "loading-play") playState = "loading-play";
    else playState = "loading";
    playButton.getElementsByClassName("play-button-image")[0].src = "./images/loading.png";
    playButton.getElementsByClassName("play-button-image")[0].alt = "loading audio...";
    playButton.getElementsByClassName("play-button-image")[0].style.animation = "spin 2s linear infinite";
}

playButton.addEventListener("click", () => {
    if (playState == "paused") play();
    else if (playState == "playing") pause();
});

playerBar.addEventListener("input", (event) => {
    for (let i = 0; i < 16; i++) channels[i].audio.currentTime = playerBar.value;
    buffer();
});

function updatePlayer() {

    // Checks if tracks are loading
    if (playState == "loading" || playState == "loading-play") {
        for (let i = 1; i < 16; i++) {
            if (channels[i].audio.readyState != 0 && channels[i].audio.readyState != 4) break;
            else if (i == 16 - 1) {
                if (playState == "loading") pause();
                else if (playState == "loading-play") play();
            }
        }
    }

    let currentTime = channels[0].audio.currentTime;
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    playerTime.innerHTML = minutes + ":" + seconds; 
    if (audioContext.state == "suspended") return;

    playerBar.value = currentTime;
    playerBar.max = channels[0].audio.duration;
    
    // Keeps tracks in sync
    for (let i = 1; i < 16; i++) {
        if (Math.abs(channels[i].audio.currentTime - channels[0].audio.currentTime) > 0.1) {
            channels[i].audio.currentTime = channels[0].audio.currentTime;
        }
    }
}
setInterval(updatePlayer, 100);