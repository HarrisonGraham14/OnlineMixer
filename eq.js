class EQ {
    highpass = new BiquadFilterNode(audioContext);
    band1 = new BiquadFilterNode(audioContext);
    band2 = new BiquadFilterNode(audioContext);
    band3 = new BiquadFilterNode(audioContext);
    band4 = new BiquadFilterNode(audioContext);

    constructor() {
        this.highpass.frequency.setValueAtTime(36.4, 0);
        this.highpass.type = "highpass";

        this.band1.frequency.setValueAtTime(112.5, 0);
        this.band1.Q.setValueAtTime(3.5, 0);
        this.band1.gain.setValueAtTime(0, 0);
        this.band1.type = "peaking";

        this.band1.frequency.setValueAtTime(632.5, 0);
        this.band1.Q.setValueAtTime(3.5, 0);
        this.band1.gain.setValueAtTime(0, 0);
        this.band2.type = "peaking";

        this.band1.frequency.setValueAtTime(3556.6, 0);
        this.band1.Q.setValueAtTime(3.5, 0);
        this.band1.gain.setValueAtTime(0, 0);
        this.band3.type = "peaking";

        this.band1.frequency.setValueAtTime(20000, 0);
        this.band1.Q.setValueAtTime(3.5, 0);
        this.band1.gain.setValueAtTime(0, 0);
        this.band4.type = "highshelf";

        this.highpass.connect(this.band1);
        this.band1.connect(this.band2);
        this.band2.connect(this.band3);
        this.band3.connect(this.band4);
    }

    connect(destination) {
        this.band4.connect(destination);
    }
}

let currentChannel = 0;

let chart;
let xValues = [20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 15000, 20000];

google.charts.load('current',{packages:['corechart']});
google.charts.setOnLoadCallback(updateEQGraph);


function updateEQGraph() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Y');
    data.addRows([
    [40, 3],
    [81, 1],
    [122, 1],
    [4213, 1],
    [9810, 2]
    ]);

    var options = {
        backgroundColor: { fill:"transparent" },
        legend: "none",
        chartArea: {width: '95%', height: '90%'},
        
        hAxis: { 
            ticks: [20, 40, 60, 80, 100, 200, 300, 400, 500, 600, 800, { v:1000, f:"1k" }, { v:2000, f:"2k" }, { v:3000, f:"3k" }, { v:4000, f:"4k" }, { v:5000, f:"5k" }, { v:6000, f:"6k" }, { v:8000, f:"8k" }, { v:10000, f:"10k" }, { v:20000, f:"20k" }],
            scaleType: "log",
            gridlines: { color: "#B9BABC" },
            textStyle: { color: "white" }
        },

        vAxis: {
            ticks: [-15, -10, -5, 0, 5, 10, 15],
            gridlines: { color: "#B9BABC" },
            textStyle: { color: "white" }
        }
    };

    if (!chart) chart = new google.visualization.AreaChart(document.querySelector(".eq-view-graph"));
    chart.draw(data, options);
}