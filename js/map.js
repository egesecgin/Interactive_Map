mapboxgl.accessToken = 'pk.eyJ1IjoiaHlhZnVtaSIsImEiOiJjbG1xNnBmcGwwMG1oMmxvZXY3aXk0cjZwIn0.VqDSZnJW59A-ORUAp0gq-Q';
const bounds = [
  [13.777728, 44.854024], // Southwest coordinates
  [13.852966, 44.908517] // Northeast coordinates
];


const ProjectList = [{id: 1, slug: 'project_1', type: 'installation', name: 'krill', description: 'Project Description', senses: ['haptic', 'visual']},
                    {id: 2, slug: 'project_2', type: 'installation',name: 'crayfish', description: 'Project Description', senses: ['haptic', 'visual']},
                    {id: 3, slug: 'project_3', type: 'performance',name: 'prawn', description: 'Project Description', senses: ['visual']},
                    {id: 4, slug: 'project_4', type: 'performance',name: 'lobster', description: 'Project Description', senses: ['haptic', 'visual']},
                    {id: 5, slug: 'project_5', type: 'installation',name: 'langoustine', description: 'Project Description', senses: ['visual']},
                    {id: 6, slug: 'project_6', type: 'installation',name: 'shrimp', description: 'Project Description', senses: ['haptic', 'visual']},
                    {id: 7, slug: 'project_7', type: 'performance',name: 'crab', description: 'Project Description', senses: ['haptic']}
                  ];
                  


let filteredProjectList = ProjectList;
let currentMarkers=[];

//Get a project by its slug (name), this is used by the location list object
function getProject(slug){
  if (filteredProjectList.filter(x => x.slug === slug).length == 0) {
    return null
  } else {
    return (filteredProjectList.filter(x => x.slug === slug));
  }
}

// Filter projects by attribute
function filterProjects(type){
  if(type === 'reset') {
    filteredProjectList = ProjectList;
  } else {
    if (currentMarkers!==null) {
      for (var i = currentMarkers.length - 1; i >= 0; i--) {
        currentMarkers[i].remove();
      }
    }

    filteredProjectList = ProjectList.filter(x => x.type === type);
  }
  updateLocationList();
  updateMarkers();
}

function filterProjectsBySense(sense){
  if(sense === 'reset') {
    filteredProjectList = ProjectList;
  } else {
    if (currentMarkers!==null) {
      for (var i = currentMarkers.length - 1; i >= 0; i--) {
        currentMarkers[i].remove();
      }
    }
    filteredProjectList = ProjectList.filter(x => x.senses.includes(sense));
    console.log(filteredProjectList);
  }
  updateLocationList();
  updateMarkers();
}


  let locationList;
  updateLocationList();

  function updateLocationList(){
     locationList = {
      type: 'ProjectCollection',
      features: [
        {
          type: 'Location',
          geometry: {
            type: 'Point',
            coordinates: [13.802957, 44.895861]
          },
          properties: {
            projects: [getProject('project_1'), getProject('project_2')]
          }
        },
        {
          type: 'Location',
          geometry: {
            type: 'Point',
            coordinates: [13.812157, 44.891861]
          },
          properties: {
            projects: [getProject('project_4')]
          }
        },
        {
          type: 'Location',
          geometry: {
            type: 'Point',
            coordinates: [13.809157, 44.894861]
          },
          properties: {
            projects: [getProject('project_3'), getProject('project_5')]
          }
        },
        {
          type: 'Location',
          geometry: {
            type: 'Point',
            coordinates: [13.802157, 44.891861]
          },
          properties: {
            projects: [getProject('project_6'), getProject('project_7')]
          }
        },
      ]
    };
  }


// Initialize map stuff
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/standard-beta', // style URL
    center: [13.806243, 44.884439], // starting position [lng, lat]
    zoom: 17, // starting zoom
    maxBounds: bounds,
    pitch: 60
});
map.addControl(new mapboxgl.NavigationControl());
updateMarkers();

// This updates markers and is used by the filtering system
function updateMarkers(){
  for (const feature of locationList.features) {
    // create a HTML element for each feature
    const el = document.createElement('div');

    console.log(feature.properties);


    if(feature.properties.projects.some(el => el !== null))  {

      el.projects = feature;
      el.className = 'marker';
      el.addEventListener("click", ()=> openDialog(el.projects));
  
  
      // make a marker for each feature and add to the map
      newMarker = new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
      currentMarkers.push(newMarker);

      el.classList.add('marker-animation');

    } else {
      continue
    }
}
}

function openDialog(projects){

  let areaProjectList = projects.properties.projects;

  const wrapper = document.getElementById('project-overview');

  for (project of areaProjectList){
    if(project !== null) {
      const item = document.createElement("li");
      item.innerHTML = populateDetails(project[0]);
      wrapper.appendChild(item);
    }
  
  }

}


function populateDetails(project) {

  const senses = [];

  for (let sense of project.senses) {
    senses.push(`<div>${sense}</div>`);
  }

  const details = `
      <div>
        <div>Name: ${project.name}</span>
        <div>Type: ${project.type}</div>
        <div>ID: ${project.id}</div>
        ${senses.join("")}
      </div>
    `;
  return details;
}





// Load the map with defined presets
map.on('load', function() {

map.setConfigProperty('basemap', 'lightPreset', 'dawn', 'showPointOfInterestLabels', false, 'showPlaceLabels', false, 'showRoadLabels', false);
});







