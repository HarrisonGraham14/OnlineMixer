class Scene {
    folder = "";
    trackNames = [];
    trackColors = [];
    trackVolumes = [];
    trackPans = [];

    constructor(folder) {
        this.folder = folder;
        this.trackNames = CHANNEL_NAMES.slice(0, 16);
        this.trackColors = Array(16).fill(0);
        this.trackVolumes = Array(14).fill(-Infinity);
        this.trackPans = Array(16).fill(0);
        this.trackExists = Array(16).fill(true);
    }

    addNames(trackNames) { this.trackNames = trackNames.concat(this.trackNames.slice(trackNames.length, 16)); }
    addColors(trackColors) { this.trackColors = trackColors.concat(this.trackColors.slice(trackColors.length, 16)); }
    addVolumes(trackVolumes) { this.trackVolumes = trackVolumes.concat(this.trackVolumes.slice(trackVolumes.length, 16)); }
    addPans(trackPans) { this.trackPans = trackPans.concat(this.trackPans.slice(trackPans.length, 16)); }

    load() {

        // channels with -inf gain are assumed not to have a source
        let loadChannels = [];
        for (i in this.trackVolumes) if (this.trackVolumes[i] != -Infinity) loadChannels.push(i);
        loadAudio(this.folder, loadChannels);

        for (let i = 0; i < 16; i++) {
            channels[i].label = this.trackNames[i];
            channels[i].labelColor = this.trackColors[i];
            channels[i].setVolume(this.trackVolumes[i]);
            channels[i].setPan(this.trackPans[i]);
        }
        loadLayer(0);
    }
}

const SCENE_GoodGoodFather = new Scene("./audio/Good Good Father");
SCENE_GoodGoodFather.addNames(["Vox Lead", "Vox Back 1", "Vox Back 2", "CH 04", "CH 05", "CH 06", "CH 07", "Bass", "Guit Aco", "CH 10", "Guit Elec L", "Guit Elec R", "Keys L", "Keys R", "Drums L", "Drums R"]);
SCENE_GoodGoodFather.addColors([6, 2, 4, 0, 0, 0, 0, 5, 6, 0, 2, 2, 4, 4, 3, 3]);
SCENE_GoodGoodFather.addVolumes([-8, -14, -14, -Infinity, -Infinity, -Infinity, -Infinity, -13.5, -13, -Infinity, -18.5, -18.5, -14, -14, -11.5, -11.5]);
SCENE_GoodGoodFather.addPans([0, -20, 20, 0, 0, 0, 0, 0, -30, 0, -40, 100, -100, 100, -50, 50]);

SCENE_GoodGoodFather.load();