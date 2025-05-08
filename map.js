// Access token
mapboxgl.accessToken = 'pk.eyJ1Ijoid2VhcmVwb3NzaWJsZSIsImEiOiJja2tncjNkdGMxODJ3MnBxdWllMXhncDV2In0.ud6gHlMUoxsJS5yDPdXtaA';

// Layers data
layersUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5jzUJAofHQvZUdzm4SHq4tlIh0wuI9Der5_LiKqZVbuFN5bNiN_pME6ODFsYhYrUS8jw_LTrlQR2l/pub?output=tsv";

let layers = {};

// Load the layers data from the Google Sheets URL
fetch(layersUrl)
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n').slice(1);
        rows.forEach(row => {
            layers[row.split('\t')[0]] = {
                key: row.split('\t')[0],
                web_title: row.split('\t')[4],
                web_desc: row.split('\t')[5],
                web_source: row.split('\t')[6]
            }
        })
        delete layers.area; // hard delete this one
        console.log(layers);

        // Add a dropdown layer selector
        const layerSelector = document.getElementById('layer-selector');

        // Remove existing options
        while (layerSelector.firstChild) {
            layerSelector.removeChild(layerSelector.firstChild);
        }

        // When it's changed, call the layerChange function
        layerSelector.onchange = function () {
            const selectedLayer = layerSelector.value;
            console.log("switching to layer: " + selectedLayer);
            layerChange(selectedLayer);
        }

        // Add options to the dropdown
        for (let layer of Object.keys(layers)) {
            const option = document.createElement('option');
            option.value = layer;
            option.textContent = layers[layer].web_title;
            layerSelector.appendChild(option);
        }
    })
    .catch(error => console.error('Error loading layers:', error));

// Set up the map
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/wearepossible/cm9bgnnoa004601quh5e8a558', // style URL
    center: [-0.12, 51.51], // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// Add the search control to the map.
map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Function to switch layers
const layerChange = (chosenLayer) => {

    // Turn off all layers
    for (let layer of Object.keys(layers)) {
        map.setLayoutProperty(layer, 'visibility', 'none');
        //document.getElementById(layer).style.display = "none";
        //document.getElementById(`btn-${layer}`).style.background = "#BF0978";
        //document.getElementById(`btn-${layer}`).style.color = "#ffffff";
        //document.getElementById(`btn-${layer}`).style.outline = "none";
    }

    // Turn on the layer you want
    map.setLayoutProperty(chosenLayer, 'visibility', 'visible');
    //document.getElementById(chosenLayer).style.display = "block";
    //document.getElementById(`btn-${chosenLayer}`).style.background = "#ffffff";
    //document.getElementById(`btn-${chosenLayer}`).style.color = "#BF0978";
    //document.getElementById(`btn-${chosenLayer}`).style.outline = "2px solid #BF0978";

}

// Create variables to hold the details of the location
let locID, loc, locLat, locLng;

// Click to place a parklet
map.on('click', function (e) {

    // Save location of click
    locLat = e.lngLat.lat.toFixed(5);
    locLng = e.lngLat.lng.toFixed(5);

    // Zoom to location
    map.flyTo({ center: [locLng, locLat], zoom: 12 });
});