const ProjectList = [{id: 1, name: 'Project name', description: 'Project Description', type: 1, senses: [0,1]},
                    {id: 2, name: 'Project name', description: 'Project Description', type: 2, senses: [0,1]}];

mapboxgl.accessToken = 'pk.eyJ1IjoiaHlhZnVtaSIsImEiOiJjbG1xNnBmcGwwMG1oMmxvZXY3aXk0cjZwIn0.VqDSZnJW59A-ORUAp0gq-Q';

const bounds = [
    [13.777728, 44.854024], // Southwest coordinates
    [13.852966, 44.908517] // Northeast coordinates
];

const locationList = {
    type: 'ProjectCollection',
    features: [
      {
        type: 'Location',
        geometry: {
          type: 'Point',
          coordinates: [13.802957, 44.895861]
        },
        properties: {
          projects: [{id: 1, type: 'installation'}, {id: 2,type: 'installation'}]
        }
      },
      {
        type: 'Location',
        geometry: {
          type: 'Point',
          coordinates: [13.800957, 44.885861]
        },
        properties: {
          projects: [{id: 3, type: 'performance'}, {id: 4,type: 'installation'}]
        }
      },
      {
        type: 'Location',
        geometry: {
          type: 'Point',
          coordinates: [13.800457, 44.881861]
        },
        properties: {
          projects: [{id: 3, type: 'performance'}]
        }
      },
    ]
  };

const filteredLocationList = locationList;



const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/standard-beta', // style URL
    center: [13.806243, 44.884439], // starting position [lng, lat]
    zoom: 17, // starting zoom
    maxBounds: bounds,
    pitch: 60
});


map.addControl(new mapboxgl.NavigationControl());




for (const feature of filteredLocationList.features) {
    // create a HTML element for each feature
    console.log(feature);
    const el = document.createElement('div');
    el.projects = feature;
    el.className = 'marker';
    el.addEventListener("click", ()=> console.log(el.projects));


    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
}




// Call the function initially with no category selected
map.on('load', function() {

map.setConfigProperty('basemap', 'lightPreset', 'dawn', 'showPointOfInterestLabels', false, 'showPlaceLabels', false, 'showRoadLabels', false);
});







