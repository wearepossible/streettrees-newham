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

        layerChange(Object.keys(layers)[0]); // Set the default layer to the first one

        // Activate collapsible button
        document.getElementsByClassName("collapsible")[0].addEventListener("click", function () {

            // Toggle the active class to change the style
            this.classList.toggle("active");
            let content = this.nextElementSibling;

            // Toggle the display of the content
            if (content.style.display === "block") {
            content.style.display = "none";
            } else {
            content.style.display = "block";
            }

            // Change text in methodbtn id button
            const methodBtn = document.getElementById("methodbtn");
            if (methodBtn.innerHTML === "+ Show methodology") {
                methodBtn.innerHTML = "- Hide methodology";
            } else {
                methodBtn.innerHTML = "+ Show methodology";
            }
        });

        map.setLayoutProperty('newham-highways', 'visibility', 'visible');
    })
    .catch(error => console.error('Error loading layers:', error));

// Set up the map
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/wearepossible/cm9bgnnoa004601quh5e8a558', // style URL
    center: [0.037, 51.528], // starting position [lng, lat]
    zoom: 12 // starting zoom
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

    // Turn on the layer you want
    map.setLayoutProperty(chosenLayer, 'visibility', 'visible');
    
    // Turn off all other layers
    for (let layer of Object.keys(layers)) {
        if (layer === chosenLayer) continue; // Skip the chosen layer
        map.setLayoutProperty(layer, 'visibility', 'none'); // Hide all other layers
    }

    // Change the legend of the map to the chosen layer
    const legendImg = document.getElementById('legend-img');
    legendImg.src = `legend/${chosenLayer}.svg`;
    legendImg.alt = `${layers[chosenLayer].web_title} legend`;

    // Add the description and the source
    document.getElementById('layer-desc').innerHTML = layers[chosenLayer].web_desc;
    document.getElementById('layer-source').innerHTML = layers[chosenLayer].web_source;

    if (chosenLayer == 'tree_cover') {
        // Set zoom to 13 if it's lower than that, keep current location
        if (map.getZoom() < 13) {
            map.flyTo({ center: map.getCenter(), zoom: 13 });
        }
    }
}

// Create variables to hold the details of the location
let locID, loc, locLat, locLng;

// Click to zoom to a location
map.on('click', function (e) {

    // Save location of click
    let locLat = e.lngLat.lat.toFixed(5);
    let locLng = e.lngLat.lng.toFixed(5);

    // Zoom to location
    map.flyTo({ center: [locLng, locLat], zoom: 12 });
});