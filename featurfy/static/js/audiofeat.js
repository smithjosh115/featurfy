let savedTracksList = [];
let savedTracksDic = {};

let filteredSongs = [];
let filteredSongsDic = {};
let numFilteredSongsInPlaylist = 0;
let numFilteredSongsSaved = 0;
let lastfilteredSongsIndex = 0;

let myPlaylistSongs = [];
let lastPlaylistSongsIndex = 0;

let genreDic = {};
let genreList = [];
let selectedGenres = [];

let graphMap = {}

class Graph{
    constructor(min, max, name) {
        this.name = name
        this.sliderMinPrev = min;
        this.sliderMin = min;
        this.sliderMax = max;
        this.min = min;
        this.max = max + 1;
        this.yAxisMax = 0;
        this.yAxisOverallMax = 0;
        this.songOccurances = [];
        this.graphRanges = [];
        this.backgroundColor = [];
        this.borderColor = [];
        this.featureToSongs = {};
        this.colorStrings = [
            {
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgb(255, 99, 132)"
            },
            {
                backgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgb(255, 159, 64)"
            },
            {
                backgroundColor: "rgba(255, 205, 86, 0.2)",
                borderColor: "rgb(255, 205, 86)"
            },
            {
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgb(75, 192, 192)"
            },
            {
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgb(54, 162, 235)"
            },
            {
                backgroundColor:  "rgba(153, 102, 255, 0.2)",
                borderColor: "rgb(153, 102, 255)"
            },
            {
                backgroundColor: "rgba(201, 203, 207, 0.2)",
                borderColor: "rgb(201, 203, 207)"
            }
        ];
        this.setValues();
    }

    setValues(){
        let count = 0;
        for (let i = this.min; i < this.max; i++) {
            this.songOccurances.push(0);
            this.graphRanges.push(i.toString());
            this.backgroundColor.push(this.colorStrings[count]['backgroundColor']);
            this.borderColor.push(this.colorStrings[count]['borderColor']);
            this.featureToSongs[i.toString()] = [];

            ++count;
            if(count == 7){
                count = 0;
            }
        }
    }

    get getGraphRanges(){
        return this.graphRanges;
    }

    getGraphRangesSlice(sliceMin, sliceMax){
        return this.graphRanges.slice(sliceMin, sliceMax + 1);
    }

    getGraphRangesSliderChange(){
        return this.getGraphRangesSlice(this.sliderMin, this.sliderMax)
    }

    get getSongOccurances() {
        return this.songOccurances;
    }

    getSongOccurancesSlice(sliceMin, sliceMax){
        return this.songOccurances.slice(sliceMin, sliceMax + 1);
    }

    get getBackgroundColor(){
        return this.backgroundColor;
    }

    get getBorderColor(){
        return this.borderColor;
    }

    get getFeatureToSongs(){
        return this.featureToSongs;
    }

    get getYaxisMax(){
        return this.yAxisMax
    }

    get getSliderMin(){
        return this.sliderMin
    }

    get getSliderMax(){
        return this.sliderMax
    }

    get getSliderMinPrev(){
        return this.sliderMinPrev
    }

    setSliderMinMax(sliderMin, sliderMax){
        this.sliderMin = sliderMin;
        this.sliderMax = sliderMax;
    }

    setSliderMinPrev(sliderMinPrev){
        this.sliderMinPrev = sliderMinPrev;
    }

    addFeatureToSong(featureVal, songId){
        console.log(featureVal);
        console.log(songId);
        console.log(this.featureToSongs);
        this.featureToSongs[featureVal].push(songId);
    }

    addSongOccurances(){
        let axisMax = 0;
        for (let i = this.min; i < this.max; i++) {
            this.songOccurances[i] = this.featureToSongs[i.toString()].length;
            if(axisMax <= this.featureToSongs[i.toString()].length){
                axisMax = this.featureToSongs[i.toString()].length;
            }
        }
        this.yAxisMax = Math.ceil(axisMax / 10) * 10;
        this.yAxisOverallMax = Math.ceil(axisMax / 10) * 10;
    }

    checkMinSlide(){
        if(this.sliderMin != this.sliderMinPrev){
            // Keep graph colors constant at each label
            let backgroundColorMinChange = [];
            let borderColorListMinChange = [];
            let minSliderModIndex = mod(this.sliderMin, 7) - 1

            if(minSliderModIndex < 0){
                minSliderModIndex = 6
            }
            for (let i = this.min; i < this.max; i++) {
                backgroundColorMinChange.push(this.colorStrings[minSliderModIndex]['backgroundColor'])
                borderColorListMinChange.push(this.colorStrings[minSliderModIndex]['borderColor'])
                ++minSliderModIndex;
                if(minSliderModIndex == 7){
                    minSliderModIndex = 0;
                }
            }
            
            this.sliderMinPrev = this.sliderMin;
            return [backgroundColorMinChange, borderColorListMinChange];
        }
        return [];
    }

    featureFilter(feat1, feat2, feat3){
        let tempMax = 0;
        let songOccurancesFilter = [];
        for (let i = this.sliderMin; i < this.sliderMax + 1; i++) {
            let numSongsInRange = 0;
            for(let songId of this.featureToSongs[i.toString()]){     
                if(selectedGenres.length != 0){
                    for(let trackGenre of savedTracksDic[songId]['genres']){
                        if((graphMap[feat1].getSliderMin <=  savedTracksDic[songId][feat1] && savedTracksDic[songId][feat1] <= graphMap[feat1].getSliderMax) &&
                        (graphMap[feat2].getSliderMin <=  savedTracksDic[songId][feat2] && savedTracksDic[songId][feat2] <= graphMap[feat2].getSliderMax) &&
                        (graphMap[feat3].getSliderMin <=  savedTracksDic[songId][feat3] && savedTracksDic[songId][feat3] <= graphMap[feat3].getSliderMax) &&
                        selectedGenres.includes(trackGenre)){
                            ++numSongsInRange;
                            if(!filteredSongsDic.hasOwnProperty([songId])){
                                filteredSongs.push(songId);
                                filteredSongsDic[songId] = true;
                                // FIX THIS: create dictionary for myPlaylist songs so this is O(1) not O(#songs in playlist)
                                if(myPlaylistSongs.includes(songId)){
                                    ++numFilteredSongsInPlaylist;
                                }
                            }
                            break
                        }
                    }
                }
                else{
                    if((graphMap[feat1].getSliderMin <=  savedTracksDic[songId][feat1] && savedTracksDic[songId][feat1] <= graphMap[feat1].getSliderMax) &&
                        (graphMap[feat2].getSliderMin <=  savedTracksDic[songId][feat2] && savedTracksDic[songId][feat2] <= graphMap[feat2].getSliderMax) &&
                        (graphMap[feat3].getSliderMin <=  savedTracksDic[songId][feat3] && savedTracksDic[songId][feat3] <= graphMap[feat3].getSliderMax)){
                        if(!filteredSongsDic.hasOwnProperty([songId])){
                            filteredSongs.push(songId);
                            filteredSongsDic[songId] = true;
                            // FIX THIS: create dictionary for myPlaylist songs so this is O(1) not O(#songs in playlist)
                            if(myPlaylistSongs.includes(songId)){
                                ++numFilteredSongsInPlaylist;
                            }
                        }
                        ++numSongsInRange;
                    } 
                }
            }
            if(tempMax <= numSongsInRange){
                tempMax = numSongsInRange;
            }
            songOccurancesFilter.push(numSongsInRange);
        }

        // this.yAxisMax = Math.ceil(tempMax / 10) * 10;
        if(tempMax <= (this.yAxisOverallMax / 4)){
            this.yAxisMax = Math.ceil((this.yAxisOverallMax / 4) / 10) * 10;
        }
        else if(tempMax <= (this.yAxisOverallMax / 2)){
            this.yAxisMax = Math.ceil((this.yAxisOverallMax / 2) / 10) * 10;
        }
        else{
            this.yAxisMax = this.yAxisOverallMax
        }
        return songOccurancesFilter;
    }
}

class Bpm extends Graph{
    constructor(min, max, name){
        super(min, max, name)
    }
}

class Valence extends Graph{
    constructor(min, max, name){
        super(min, max, name)
    }
}

class Energy extends Graph{
    constructor(min, max, name){
        super(min, max, name)
    }
}

class Danceability extends Graph{
    constructor(min, max, name){
        super(min, max, name)
    }
}

let bpm = new Bpm(0, 240, 'bpm');
let valence =new Valence(0, 100, 'valence');
let energy = new Energy(0, 100, 'energy');
let danceability = new Danceability(0, 100, 'danceability');

graphMap['bpm'] = bpm;
graphMap['valence'] = valence;
graphMap['energy'] = energy;
graphMap['danceability'] = danceability;

let configBpm = {
    type: 'bar',
    data: {
        labels: bpm.getGraphRanges.slice(0, 241),
        datasets:[{
            label: "Beats Per Minute",
            data: bpm.getSongOccurances,
            fill:false,
            backgroundColor: bpm.getBackgroundColor,
            borderColor: bpm.getBorderColor,
            borderWidth:1
        }]
    },
    options: {
        title: {
            fontStyle: '',
            fontColor: "#000000",
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            display: true,
            text: 'Beats Per Minute',
        },
        legend:{
            display: false,
        },
        scales:{
            yAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    beginAtZero:true,
                    max: 80
                },
                scaleLabel:{
                    display: true,
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    labelString: 'Number of Songs'
                }
            }],
            xAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                },
            }],
        }
    }
}

let configValence = {
    type: 'bar',
    data: {
        labels: valence.getGraphRanges.slice(0,101),
        datasets:[{
            label: "Valence",
            data: valence.getSongOccurances,
            fill: false,
            backgroundColor: valence.getBackgroundColor,
            borderColor: valence.getBorderColor,
            borderWidth:1
        }]
    },
    options: {
        title: {
            fontStyle: '',
            fontColor: "#000000",
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            display: true,
            text: 'Valence',
        },
        legend:{
            display: false,
        },
        scales:{
            yAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    beginAtZero:true,
                    max: 80
                },
                scaleLabel:{
                    display: true,
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    labelString: 'Number of Songs'
                }
            }],
            xAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                },
            }],
        }
    }
}

let configEnergy = {
    type: 'bar',
    data: {
        labels: energy.getGraphRanges.slice(0, 101),
        datasets:[{
            label: "Energy",
            data: energy.getSongOccurances,
            fill:false,
            backgroundColor: energy.getBackgroundColor,
            borderColor: energy.getBorderColor,
            borderWidth:1
        }]
    },
    options: {
        title: {
            fontStyle: '',
            fontColor: "#000000",
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            display: true,
            text: 'Energy',
        },
        legend:{
            display: false,
        },
        scales:{
            yAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    beginAtZero:true,
                    max: 80
                },
                scaleLabel:{
                    display: true,
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    labelString: 'Number of Songs'
                }
            }],
            xAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                },
            }],
        }
    }
}

let configDanceability = {
    type: 'bar',
    data: {
        labels: danceability.getGraphRanges.slice(0, 101),
        datasets:[{
            label: "Danceability",
            data: danceability.getSongOccurances,
            fill:false,
            backgroundColor: danceability.getBackgroundColor,
            borderColor: danceability.getBorderColor,
            borderWidth:1
        }]
    },
    options: {
        title: {
            fontStyle: '',
            fontColor: "#000000",
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            display: true,
            text: 'Danceability',
        },
        legend:{
            display: false,
        },
        scales:{
            yAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    beginAtZero:true,
                    max: 80
                },
                scaleLabel:{
                    display: true,
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    labelString: 'Number of Songs'
                }
            }],
            xAxes:[{
                ticks:{
                    fontColor: "#000000",
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                },
            }],
        }
    }
}

var ctx = document.getElementById('bpmChart').getContext('2d');
var bpmBarChart = new Chart(ctx, configBpm)

var ctx = document.getElementById('valenceChart').getContext('2d');
var valenceBarChart = new Chart(ctx, configValence)

var ctx = document.getElementById('energyChart').getContext('2d');
var energyBarChart = new Chart(ctx, configEnergy)

var ctx = document.getElementById('danceabilityChart').getContext('2d');
var danceabilityBarChart = new Chart(ctx, configDanceability)

$('#my-playlist-name').on('input', function(ele) { 
    if($(this).val() === ''){
       $('#my-playlist-tab').html('My Playlist');
    }
    else{
        $('#my-playlist-tab').html($(this).val())
    }
});

$("#my-playlist-name").click(function() {
    if($("#my-playlist-name").hasClass("is-invalid")){
        $("#my-playlist-name").removeClass("is-invalid")
    }
});

$("#bpm-zoom").click(function() {
    if($("#bpm-zoom").hasClass('fa-plus')){
        $("#bpm-zoom").removeClass("fa-plus").addClass("fa-minus");
        $("#bpm-col").removeClass("col-6").addClass("col-12");
    }
    else if($("#bpm-zoom").hasClass('fa-minus')){
        $("#bpm-zoom").removeClass("fa-minus").addClass("fa-plus");
        $( "#bpm-col" ).removeClass( "col-12" ).addClass( "col-6" );
    }
});

$("#valence-zoom").click(function() {
    if($("#valence-zoom").hasClass('fa-plus')){
        $("#valence-zoom").removeClass("fa-plus").addClass("fa-minus");
        $("#valence-col").removeClass("col-6").addClass("col-12");
    }
    else if($("#valence-zoom").hasClass('fa-minus')){
        $("#valence-zoom").removeClass("fa-minus").addClass("fa-plus");
        $( "#valence-col" ).removeClass( "col-12" ).addClass( "col-6" );
    }
});

$("#energy-zoom").click(function() {
    if($("#energy-zoom").hasClass('fa-plus')){
        $("#energy-zoom").removeClass("fa-plus").addClass("fa-minus");
        $("#energy-col").removeClass("col-6").addClass("col-12");
    }
    else if($("#energy-zoom").hasClass('fa-minus')){
        $("#energy-zoom").removeClass("fa-minus").addClass("fa-plus");
        $( "#energy-col" ).removeClass( "col-12" ).addClass( "col-6" );
    }
});

$("#danceability-zoom").click(function() {
    if($("#danceability-zoom").hasClass('fa-plus')){
        $("#danceability-zoom").removeClass("fa-plus").addClass("fa-minus");
        $("#danceability-col").removeClass("col-6").addClass("col-12");
    }
    else if($("#danceability-zoom").hasClass('fa-minus')){
        $("#danceability-zoom").removeClass("fa-minus").addClass("fa-plus");
        $( "#danceability-col" ).removeClass( "col-12" ).addClass( "col-6" );
    }
});

$("#bpm-help").click(function() {
    if($('#bpm-description').css('display') === 'none'){
        $('#bpm-description').show();
    }
    else{
        $('#bpm-description').css('display', 'none');
    }
});

$("#valence-help").click(function() {
    if($('#valence-description').css('display') === 'none'){
        $('#valence-description').show();
    }
    else{
        $('#valence-description').css('display', 'none')
    }
    
});

$("#energy-help").click(function() {
    if($('#energy-description').css('display') === 'none'){
        $('#energy-description').show();
    }
    else{
        $('#energy-description').css('display', 'none')
    }
    
});

$("#danceability-help").click(function() {
    if($('#danceability-description').css('display') === 'none'){
        $('#danceability-description').show();
    }
    else{
        $('#danceability-description').css('display', 'none')
    }
    
});

$("#songs").scroll(function(){
    if(($("#songs")[0].scrollHeight - $("#songs").innerHeight() - 200) <= $("#songs").scrollTop()){
        if($("#filtered-songs-tab").hasClass('active')){
            createFilteredSongDisplay();
        }
        else{
            createPlaylistSongDisplay();
        }
    }
});

$(document).on("click", "i.fa-heart", function(ele) {
    let getSongId = ele.target.id.split("-");
    if(ele.target.id === "heart-all-icon"){
        // Switch select all heart to close icon
        $("#" + ele.target.id).remove();
        $("#all-col").append("<i id='close-all-icon' style='color: red;' class='fa fa-close'></i>");
        $("#all-text").text("Remove all");
        addAllFilteredToPlaylist();

    }
    else{
        //FIX THIS: only swap icons from filtered song display if song is in group of songs that are currently being displayed
        // Remove heart icon from filtered display
        $("#" + ele.target.id).remove();
        // Add close icon to filtered display
        $("#icon-" + getSongId[1] + "-filtered").append("<i id='close-" + getSongId[1] + "-filtered' style='color: red;' class='fa fa-close'></i>");
        addSongToPlaylist(getSongId[1]);

        if(numFilteredSongsSaved === filteredSongs.length){
            $("#all-col").empty();
            $("#all-col").append("<i id='close-all-icon' style='color: red;' class='fa fa-close'></i>");
            $("#all-text").text("Remove all");
        }
    }
});

function addSongToPlaylist(songId){
    myPlaylistSongs.push(songId); 
    $("#my-playlist-song-count-col").text("Songs: " + (myPlaylistSongs.length).toString())
    
    let element = $("#song-" + songId + "-filtered").clone();
    // Change ids for div and icon and icon div to my-playlist ids
    element.attr("id", "song-" + songId + "-my-playlist");
    element.find("#close-" + songId + "-filtered").attr("id", "close-" + songId + "-my-playlist")
    element.find("#icon-" + songId + "-filtered").attr("id", "icon-" + songId + "-my-playlist")
    // Add song to my playlist display
    $("#" + "my-playlist-ordered-list").prepend(element); 
    
    if(myPlaylistSongs.length >= 11){
        let removeLastDisplayedElement = $("#song-" + myPlaylistSongs[lastPlaylistSongsIndex] + "-my-playlist").remove();
        ++lastPlaylistSongsIndex
    }

    if(filteredSongs.includes(songId)){
        ++numFilteredSongsSaved;
    }
}

$(document).on("click", "i.fa-close", function(ele) {
    if(ele.target.id === "close-all-icon"){
        // Remove all filtered songs
        // Switch remove all close to heart icon
        $("#" + ele.target.id).remove();
        $("#all-col").append("<i id='heart-all-icon' style='color: white;' class='fa fa-heart'></i>");
        $("#all-text").text("Select all");
        removeAllFilteredFromPlaylist();
    }
    else if(ele.target.id === "my-playlist-all-icon"){
        // Remove all playlist songs
        let myPlaylistSongsCopy = myPlaylistSongs.slice();
        for (let songId of myPlaylistSongsCopy) {
            //FIX THIS: only swap icons from filtered song display if song is in group of songs that are currently being displayed
            // Remove close icon from filtered display
            $("#close-" + songId + "-filtered").remove();
            // Add heart icon to filtered display
            $("#icon-" + songId + "-filtered").append("<i id='heart-" + songId + "-filtered' class='fa fa-heart'></i>");
            removeSongFromPlaylist(songId);
        }

        if(numFilteredSongsSaved < filteredSongs.length){
            $("#all-col").empty();
            $("#all-col").append("<i id='heart-all-icon' style='color: white;' class='fa fa-heart'></i>");
            $("#all-text").text("Select all");
        }
    }
    else{
        // Remove single song manually 
        let getSongId = ele.target.id.split("-");
        //FIX THIS: only swap icons from filtered song display if song is in group of songs that are currently being displayed
        // Remove close icon from filtered display
        $("#close-" + getSongId[1] + "-filtered").remove();
        // Add heart icon to filtered display
        $("#icon-" + getSongId[1] + "-filtered").append("<i id='heart-" + getSongId[1] + "-filtered' class='fa fa-heart'></i>");

        removeSongFromPlaylist(getSongId[1]);

        if(numFilteredSongsSaved < filteredSongs.length){
            $("#all-col").empty();
            $("#all-col").append("<i id='heart-all-icon' style='color: white;' class='fa fa-heart'></i>");
            $("#all-text").text("Select all");
        }
    }
});

function removeSongFromPlaylist(songId){
    if(lastPlaylistSongsIndex > 0){
        let removeSongIndex = myPlaylistSongs.indexOf(songId)
        if(removeSongIndex >= lastPlaylistSongsIndex){

            let songHtml = htmlSongPlaylistFactory(myPlaylistSongs[lastPlaylistSongsIndex - 1]);
            $("#my-playlist-ordered-list").append(songHtml);

            if (removeSongIndex > -1) {
               myPlaylistSongs.splice(removeSongIndex, 1);
            }
            $("#my-playlist-song-count-col").text("Songs: " + (myPlaylistSongs.length).toString())
            $("#song-" + songId + "-my-playlist").remove();
            --lastPlaylistSongsIndex;
        }
        else{
            if (removeSongIndex > -1) {
               myPlaylistSongs.splice(removeSongIndex, 1);
            }
            --lastPlaylistSongsIndex;
        }
    }
    else{
        let removeSongIndex = myPlaylistSongs.indexOf(songId)
        if (removeSongIndex > -1) {
           myPlaylistSongs.splice(removeSongIndex, 1);
        }
        $("#my-playlist-song-count-col").text("Songs: " + (myPlaylistSongs.length).toString())
        $("#song-" + songId + "-my-playlist").remove();
    }
    if(filteredSongs.includes(songId)){
        --numFilteredSongsSaved;
    }
}

$("#create-playlist-button" ).click(function() {
    if($("#my-playlist-name").val() === ''){
        let invalid = 'is-invalid';
        $("#my-playlist-name").addClass(invalid)
        return
    }
    let playlistName = $("#my-playlist-name").val();

    let requestBody = {
        tracks: myPlaylistSongs,
        name: playlistName  
    }

    let request = new Request('/api/v1/createbpmplaylist/', {
        method: 'POST', 
        credentials: 'same-origin',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(requestBody)
    });
    fetch(request)
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            let successAlert = "<div style='margin-bottom: 0px; font-size: 90%' class='alert alert-success alert-dismissible text-left'> \
                                    <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> \
                                    Playlist successfully created! \
                                </div>";
            $("#my-playlist-ordered-list").prepend(successAlert);
        })
        .catch((error) => {
            let dangerAlert = "<div style='margin-bottom: 0px; font-size: 90%' class='alert alert-danger alert-dismissible text-left'> \
                                    <a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> \
                                    Oops! An error occured. Please try again. \
                                </div>";
            $("#my-playlist-ordered-list").prepend(dangerAlert);
        })
    
});

$(document).ready(function(){
    let request = new Request('/api/v1/createbpmplaylist/', {
        method: 'GET', 
        credentials: 'same-origin',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
    fetch(request)
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {

            genreDic = data.genre_dic
            genreList = data.genre_list

            for(let item of  data.genre_list){
                let dataTokenString = item.split(' ').join('-');
                $("#genre-selector").append("<option title='Filter songs by genre' data-tokens=" + dataTokenString + ">" + item + "</option>")
            }
            $('.selectpicker').selectpicker('refresh');
            $('#load-spinner').css("display", "none");
            // $("#genre-selector").append("<option title='Filter songs by genre' data-tokens=" + "select" + ">" + "select" + "</option>")

            /*
            Create dictionary of bpm vals to list of songs 
            */
            savedTracksList = data.saved_tracks_list
            savedTracksDic = data.saved_tracks_dic

            for(let item of data.saved_tracks_list){
                filteredSongs.push(item);

                // Add song id to bpm mapping
                console.log(item);
                console.log(Math.round(data.saved_tracks_dic[item]['bpm']));

                bpm.addFeatureToSong(Math.round(data.saved_tracks_dic[item]['bpm']).toString(), item);
                valence.addFeatureToSong(Math.round(data.saved_tracks_dic[item]['valence'] * 100).toString(), item);
                savedTracksDic[item]['valence'] = savedTracksDic[item]['valence'] * 100;
                energy.addFeatureToSong(Math.round(data.saved_tracks_dic[item]['energy'] * 100).toString(), item);
                savedTracksDic[item]['energy'] = savedTracksDic[item]['energy'] * 100;
                danceability.addFeatureToSong(Math.round(data.saved_tracks_dic[item]['danceability'] * 100).toString(), item);
                savedTracksDic[item]['danceability'] = savedTracksDic[item]['danceability'] * 100;
            }
            bpm.addSongOccurances();
            valence.addSongOccurances();
            energy.addSongOccurances();
            danceability.addSongOccurances();

            // Update graphs with song occurance values
            bpmBarChart.options.scales.yAxes[0].ticks.max = bpm.getYaxisMax;
            bpmBarChart.data.datasets[0].data = bpm.getSongOccurancesSlice(0, 210);
            bpmBarChart.update();

            valenceBarChart.options.scales.yAxes[0].ticks.max = valence.getYaxisMax
            valenceBarChart.data.datasets[0].data = valence.getSongOccurancesSlice(0, 100);
            valenceBarChart.update();

            energyBarChart.options.scales.yAxes[0].ticks.max = energy.getYaxisMax;
            energyBarChart.data.datasets[0].data = energy.getSongOccurancesSlice(0, 100);
            energyBarChart.update();

            danceabilityBarChart.options.scales.yAxes[0].ticks.max = danceability.getYaxisMax;
            danceabilityBarChart.data.datasets[0].data = danceability.getSongOccurancesSlice(0, 100);
            danceabilityBarChart.update();

            createFilteredSongDisplay();

            $("#filtered-song-count").text("Songs: " + (filteredSongs.length).toString());
            $("#left-load").hide();
            $("#left-graphs").show();
            
        })
        .catch(error => console.log(error));
});

$(document).ready(function() {
    // Bpm slider
    $("#slider-bpm").slider({
        min: 0,
        max: 210,
        step: 1,
        values: [0, 210],
        slide: function(event, ui) {
            $("#bpm-min-slider").text(ui.values[0].toString());
            $("#bpm-max-slider").text(ui.values[1].toString());
            bpm.setSliderMinMax(ui.values[0], ui.values[1])
        }
    });
    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider-bpm").slider("values", $this.data("index"), $this.val());
    });

    // Valence slider 
    $("#slider-valence").slider({
        min: 0,
        max: 100,
        step: 1,
        values: [0, 100],
        slide: function(event, ui) {
            $("#valence-min-slider").text(ui.values[0].toString());
            $("#valence-max-slider").text(ui.values[1].toString());
            valence.setSliderMinMax(ui.values[0], ui.values[1])
        }
    });

    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider-valence").slider("values", $this.data("index"), $this.val());
    });

    // Energy slider 
    $("#slider-energy").slider({
        min: 0,
        max: 100,
        step: 1,
        values: [0, 100],
        slide: function(event, ui) {
            $("#energy-min-slider").text(ui.values[0].toString());
            $("#energy-max-slider").text(ui.values[1].toString());
            energy.setSliderMinMax(ui.values[0], ui.values[1])
        }
    });
    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider-energy").slider("values", $this.data("index"), $this.val());
    });

    // Dacaebility slider 
    $("#slider-danceability").slider({
        min: 0,
        max: 100,
        step: 1,
        values: [0, 100],
        slide: function(event, ui) {
            $("#danceability-min-slider").text(ui.values[0].toString());
            $("#danceability-max-slider").text(ui.values[1].toString());
            danceability.setSliderMinMax(ui.values[0], ui.values[1])
        }
    });
    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider-danceability").slider("values", $this.data("index"), $this.val());
    });

});

$('#genre-selector').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    let decodeGenre = decodeEntities(e.currentTarget[clickedIndex].innerHTML)
    let idString = decodeEntities(e.currentTarget[clickedIndex].innerHTML).split(' ').join('-');
    if(isSelected){
        $("#genre-row").append("<div id='" + idString +"' style='margin: 0px 5px 5px 5px;' class='btn btn-dark btn-sm rounded-buttons'>" +  decodeGenre + "</div>")
        selectedGenres.push(decodeGenre);
        updateGraphsSliderChange('genre');
    }
    else{
        let index = selectedGenres.indexOf(decodeGenre);
        if (index > -1) {
            selectedGenres.splice(index, 1);
            updateGraphsSliderChange('genre');
        }
        document.getElementById(idString).remove();
    }
});

$("#slider-bpm").mouseup(function() {
    let backBorderColors = bpm.checkMinSlide();
    if(Array.isArray(backBorderColors) && backBorderColors.length){
        bpmBarChart.data.datasets[0].backgroundColor = backBorderColors[0]
        bpmBarChart.data.datasets[0].borderColor = backBorderColors[1]
    }
    updateGraphsSliderChange('bpm');
});

$("#slider-valence").mouseup(function() {
    let backBorderColors = valence.checkMinSlide();
    if(Array.isArray(backBorderColors) && backBorderColors.length){
        valenceBarChart.data.datasets[0].backgroundColor = backBorderColors[0]
        valenceBarChart.data.datasets[0].borderColor = backBorderColors[1]
    }
    updateGraphsSliderChange('valence');
});

$("#slider-energy").mouseup(function() {
    let backBorderColors = energy.checkMinSlide();
    if(Array.isArray(backBorderColors) && backBorderColors.length){
        energyBarChart.data.datasets[0].backgroundColor = backBorderColors[0]
        energyBarChart.data.datasets[0].borderColor = backBorderColors[1]
    }
    updateGraphsSliderChange('energy');
});

$("#slider-danceability").mouseup(function() {
    let backBorderColors = danceability.checkMinSlide();
    if(Array.isArray(backBorderColors) && backBorderColors.length){
        danceabilityBarChart.data.datasets[0].backgroundColor = backBorderColors[0]
        danceabilityBarChart.data.datasets[0].borderColor = backBorderColors[1]
    }
    updateGraphsSliderChange('danceability');
});


function updateGraphsSliderChange(featureSlid) {
    filteredSongs = [];
    filteredSongsDic = {};
    lastfilteredSongsIndex = 0;
    numFilteredSongsInPlaylist = 0;
    numFilteredSongsSaved = 0;

    const myNode = document.getElementById("filtered-songs-ordered-list");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

    if(featureSlid === 'bpm'){
        bpmBarChart.data.labels = bpm.getGraphRangesSliderChange();
    }
    else if(featureSlid === 'valence'){
        valenceBarChart.data.labels = valence.getGraphRangesSliderChange();
    }
    else if(featureSlid === 'energy'){
        energyBarChart.data.labels = energy.getGraphRangesSliderChange();
    }
    else if(featureSlid === 'danceability'){
        danceabilityBarChart.data.labels = danceability.getGraphRangesSliderChange();
    }

    bpmBarChart.data.datasets[0].data = bpm.featureFilter('valence', 'energy', 'danceability');
    bpmBarChart.options.scales.yAxes[0].ticks.max = bpm.getYaxisMax

    valenceBarChart.data.datasets[0].data = valence.featureFilter('bpm', 'energy', 'danceability');
    valenceBarChart.options.scales.yAxes[0].ticks.max = valence.getYaxisMax;

    energyBarChart.data.datasets[0].data = energy.featureFilter('bpm', 'valence', 'danceability');
    energyBarChart.options.scales.yAxes[0].ticks.max = energy.getYaxisMax;

    danceabilityBarChart.data.datasets[0].data = danceability.featureFilter('bpm', 'valence', 'energy');
    danceabilityBarChart.options.scales.yAxes[0].ticks.max = danceability.getYaxisMax;

    bpmBarChart.update();
    valenceBarChart.update();
    energyBarChart.update();
    danceabilityBarChart.update();

    if(numFilteredSongsInPlaylist === filteredSongs.length && filteredSongs.length !== 0){
        $("#all-col").empty();
        $("#all-col").append("<i id='close-all-icon' style='color: red;' class='fa fa-close'></i>");
        $("#all-text").text("Remove all");
    }
    else{
        $("#all-col").empty();
        $("#all-col").append("<i id='heart-all-icon' style='color: white;' class='fa fa-heart'></i>");
        $("#all-text").text("Select all");
    }
    numFilteredSongsSaved += numFilteredSongsInPlaylist;
    $("#filtered-song-count").text("Songs: " + (filteredSongs.length).toString());
    createFilteredSongDisplay();
}

function createFilteredSongDisplay(){
    if(lastfilteredSongsIndex === filteredSongs.length){
        return;
    }
    
    let filteredSongsSlice = filteredSongs.slice(lastfilteredSongsIndex, lastfilteredSongsIndex + 10)
    for(let songId of filteredSongsSlice){
        let songHtml = htmlSongFactory(songId);
        $("#filtered-songs-ordered-list").append(songHtml);
    }

    if(lastfilteredSongsIndex + 10 > filteredSongs.length){
        lastfilteredSongsIndex += (filteredSongs.length - lastfilteredSongsIndex);
    }
    else{
        lastfilteredSongsIndex += 10;
    }
}

function htmlSongFactory(songId){
    let name = savedTracksDic[songId]['name'];
    let bpmVal = Math.round(savedTracksDic[songId]['bpm'])
    let valenceVal = Math.round(savedTracksDic[songId]['valence']);
    let energyVal = Math.round(savedTracksDic[songId]['energy']);
    let danceabilityVal = Math.round(savedTracksDic[songId]['danceability']);

    let artistString = '';
    let genresString = '';
    for(let item of savedTracksDic[songId]['artists']){
        artistString += item + ', ';
    }

    for(let item of savedTracksDic[songId]['genres']){
        genresString += "<div class='btn btn-success btn-sm small-genres rounded-buttons'>" + item + "</div>"
    }

    let iconString = "<i id='heart-" + songId + "-filtered' class='fa fa-heart'></i>"
    if(myPlaylistSongs.includes(songId)){
        iconString = "<i id='close-" + songId + "-filtered' style='color: red;' class='fa fa-close'></i>"
    }

    let song = 
    "<div style='margin-left: 0px; margin-right: 0px;' id='song-" + songId + "-filtered' class='row align-items-center song'> \
        <div style='width: 100%; margin-left: 0px; margin-right: 0px;' class='row align-items-center'> \
            <div id='icon-" + songId + "-filtered' class='col-1 text-center'> \
                " + iconString + " \
            </div> \
            <div class='col'> \
                <div class='row'> \
                    <div class='col text-left'> \
                        <div id='song-name'>" + name + "</div> \
                    </div> \
                </div> \
                <div class='row'> \
                    <div class='col text-left'> \
                        <div id='artist-name'>" + artistString + "</div> \
                    </div> \
                </div> \
            </div> \
        </div> \
        <div class='row' style='width: 100%; margin-left: 0px; margin-right: 0px; margin-top: 5px;'> \
            <div class='col text-left mini-display-features'> \
                Bpm: " + bpmVal.toString() + " \
            </div> \
            <div class='col text-left mini-display-features'> \
                Valence: " + valenceVal.toString() + " \
            </div> \
            <div class='col text-left mini-display-features'> \
                Energy: " + energyVal.toString() + "\
            </div> \
            <div class='col text-left mini-display-features'> \
                Dance: " + danceabilityVal.toString() + " \
            </div> \
        </div> \
        <div class='row' style='width: 100%; margin-left: 0px; margin-right: 0px;'> \
            <div class='col text-left'> \
            " + genresString + " \
            </div> \
        </div> \
    </div> ";

    return song;
}


function createPlaylistSongDisplay(){

    if(lastPlaylistSongsIndex <= 0){
        return;
    }

    let minSliceIndex = 0
    if((lastPlaylistSongsIndex - 10) > 0){
        minSliceIndex = lastPlaylistSongsIndex - 10;
    }
    let myPlaylistSongsSlice = myPlaylistSongs.slice(minSliceIndex, lastPlaylistSongsIndex);
    for(let i = myPlaylistSongsSlice.length - 1; i >= 0; i--){
        let songHtml = htmlSongPlaylistFactory(myPlaylistSongsSlice[i]);
        $("#my-playlist-ordered-list").append(songHtml);
    }

    lastPlaylistSongsIndex = minSliceIndex;
}

function htmlSongPlaylistFactory(songId){
    let name = savedTracksDic[songId]['name'];
    let bpmVal = Math.round(savedTracksDic[songId]['bpm'])
    let valenceVal = Math.round(savedTracksDic[songId]['valence']);
    let energyVal = Math.round(savedTracksDic[songId]['energy']);
    let danceabilityVal = Math.round(savedTracksDic[songId]['danceability']);


    let artistString = '';
    let genresString = '';
    for(let item of savedTracksDic[songId]['artists']){
        artistString += item + ', ';
    }

    for(let item of savedTracksDic[songId]['genres']){
        genresString += "<div class='btn btn-success btn-sm small-genres rounded-buttons'>" + item + "</div>"
    }

    let song = 
    "<div style='margin-left: 0px; margin-right: 0px;' id='song-" + songId + "-my-playlist' class='row align-items-center song'> \
        <div style='width: 100%; margin-left: 0px; margin-right: 0px;' class='row align-items-center'> \
            <div id='icon-" + songId + "-my-playlist' class='col-1 text-center'> \
                <i id='close-" + songId + "-my-playlist' style='color: red;' class='fa fa-close'></i> \
            </div> \
            <div class='col'> \
                <div class='row'> \
                    <div class='col text-left'> \
                        <div id='song-name'>" + name + "</div> \
                    </div> \
                </div> \
                <div class='row'> \
                    <div class='col text-left'> \
                        <div id='artist-name'>" + artistString + "</div> \
                    </div> \
                </div> \
            </div> \
        </div> \
        <div class='row' style='width: 100%; margin-left: 0px; margin-right: 0px; margin-top: 5px;'> \
            <div class='col text-left mini-display-features'> \
                Bpm: " + bpmVal.toString() + " \
            </div> \
            <div class='col text-left mini-display-features'> \
                Valence: " + valenceVal.toString() + " \
            </div> \
            <div class='col text-left mini-display-features'> \
                Energy: " + energyVal.toString() + "\
            </div> \
            <div class='col text-left mini-display-features'> \
                Dance: " + danceabilityVal.toString() + " \
            </div> \
        </div> \
        <div class='row' style='width: 100%; margin-left: 0px; margin-right: 0px;'> \
            <div class='col text-left'> \
            " + genresString + " \
            </div> \
        </div> \
    </div> ";

    return song;
}

function addAllFilteredToPlaylist(){
    for(let i = filteredSongs.length - 1; i >= 0; i--){
        if(!myPlaylistSongs.includes(filteredSongs[i])){
            if(i < lastfilteredSongsIndex){
                // Remove heart icon from filtered display
                $("#heart-" + filteredSongs[i] + "-filtered").remove();
                // Add close icon to filtered display
                $("#icon-" + filteredSongs[i] + "-filtered").append("<i id='close-" + filteredSongs[i] + "-filtered' style='color: red;' class='fa fa-close'></i>");
            }
            addSongToPlaylist(filteredSongs[i]);
        }
    } 
}

function removeAllFilteredFromPlaylist(){
    for(let i = 0; i < filteredSongs.length; i++){
        if(myPlaylistSongs.includes(filteredSongs[i])){
            if(i < lastfilteredSongsIndex){
                // Remove close icon from filtered display
                $("#close-" + filteredSongs[i] + "-filtered").remove();
                // Add heart icon to filtered display
                $("#icon-" + filteredSongs[i] + "-filtered").append("<i id='heart-" + filteredSongs[i] + "-filtered' class='fa fa-heart'></i>");
            }
            removeSongFromPlaylist(filteredSongs[i]);
        }
    }
}

// Mod Helper since JavaScript cant do negative mod 
function mod(n, m) {
  return ((n % m) + m) % m;
}

// Decode special characters in html back to text
function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}