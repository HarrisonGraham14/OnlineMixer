class Scene {
    folder = "";
    channelNames = [];
    channelColors = [];
    channelVolumes = [];
    channelPans = [];
    linkedChannels = [];

    constructor(folder) {
        this.folder = folder;
        this.channelNames = CHANNEL_NAMES.slice(0, 16);
        this.channelColors = Array(16).fill(0);
        this.channelVolumes = Array(14).fill(-Infinity);
        this.channelPans = Array(16).fill(0);
        this.channelExists = Array(16).fill(true);
    }

    addNames(channelNames) { this.channelNames = channelNames.concat(this.channelNames.slice(channelNames.length, 16)); }
    addColors(channelColors) { this.channelColors = channelColors.concat(this.channelColors.slice(channelColors.length, 16)); }
    addVolumes(channelVolumes) { this.channelVolumes = channelVolumes.concat(this.channelVolumes.slice(channelVolumes.length, 16)); }
    addPans(channelPans) { this.channelPans = channelPans.concat(this.channelPans.slice(channelPans.length, 16)); }

    load() {

        // channels with -inf gain are assumed not to have a source
        let loadChannels = [];
        for (i in this.channelVolumes) if (this.channelVolumes[i] != -Infinity) loadChannels.push(i);
        loadAudio(this.folder, loadChannels);

        for (i in this.linkedChannels) {
            channels[this.linkedChannels[i]].setLink(true);
        }

        for (let i = 0; i < 16; i++) {
            channels[i].label = this.channelNames[i];
            channels[i].labelColor = this.channelColors[i];
            channels[i].setVolume(this.channelVolumes[i]);
            channels[i].setPan(this.channelPans[i]);
        }

        loadLayer(0);
    }
}

const SCENE_GoodGoodFather = new Scene("./audio/Good Good Father");
SCENE_GoodGoodFather.addNames(["Vox Lead", "Vox Back 1", "Vox Back 2", "CH 04", "CH 05", "CH 06", "CH 07", "Bass", "Guit Aco", "CH 10", "Guit Elec L", "Guit Elec R", "Keys L", "Keys R", "Drums L", "Drums R"]);
SCENE_GoodGoodFather.addColors([6, 2, 4, 0, 0, 0, 0, 5, 6, 0, 2, 2, 4, 4, 3, 3]);
SCENE_GoodGoodFather.addVolumes([-8, -14, -14, -Infinity, -Infinity, -Infinity, -Infinity, -13.5, -13, -Infinity, -18.5, -18.5, -14, -14, -11.5, -11.5]);
SCENE_GoodGoodFather.addPans([0, -20, 20, 0, 0, 0, 0, 0, -30, 0, -40, 100, -100, 100, -50, 50]);
SCENE_GoodGoodFather.linkedChannels = [11, 13, 15];

SCENE_GoodGoodFather.load();