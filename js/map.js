mapboxgl.accessToken =
  "pk.eyJ1IjoiaHlhZnVtaSIsImEiOiJjbG1xNnBmcGwwMG1oMmxvZXY3aXk0cjZwIn0.VqDSZnJW59A-ORUAp0gq-Q";
const bounds = [
  [13.777728, 44.854024], // Southwest coordinates
  [13.852966, 44.908517], // Northeast coordinates
];

//Initialize some stuff
let currentMarkers = [];
let filteredProjectList;
let locationList;
let ProjectList;
let map;

// Retrieve projects
let req = new XMLHttpRequest();

req.onreadystatechange = () => {
  if (req.readyState == XMLHttpRequest.DONE) {

    const result = JSON.parse(req.responseText);

    ProjectList = result.record;
    filteredProjectList = ProjectList;

    locationList = updateLocationList();

    // Initialize map stuff

    map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/standard-beta", // style URL
      center: [13.805493, 44.899077], // starting position [lng, lat]
      zoom: 17, // starting zoom
      maxBounds: bounds,
      pitch: 65,
      bearing: 160
    });

    (async () => {
      map.on("load", function () {
        map.setConfigProperty(
          "basemap",
          "lightPreset",
          "dusk",
          "showPointOfInterestLabels",
          false,
          "showPlaceLabels",
          false,
          "showRoadLabels",
          false
        );
      });

      await map.once('load');

      updateMarkers();
      
      document.getElementById('loading-wrapper').classList.add('loading-done');
    })();

    map.addControl(new mapboxgl.NavigationControl());
    

  }
};

req.open("GET", "https://api.jsonbin.io/v3/b/650c61c912a5d3765981205a", true);
req.setRequestHeader("X-Master-Key", "$2a$10$Tw5DZmmLnLrkxrfVWRwguucmIGDPN7Mo4FZAImYzSUZvyR8mH9x4u");
req.send();



//Get a project by its slug (name), this is used by the location list object
function getProject(slug) {
  if (filteredProjectList.filter((x) => x.slug === slug).length == 0) {
    return null;
  } else {
    return filteredProjectList.filter((x) => x.slug === slug);
  }

}

//Get matching projects by providing area coordinates
function getProjects(coord1, coord2) {

  if (filteredProjectList.filter((x) => x.longitude === coord1).length === 0) {
    return null;
  } else {
    return filteredProjectList.filter((x) => x.longitude === coord1 && x.latitude === coord2);
  }

}

// Filter projects by attribute
function filterProjects(type) {
  if (currentMarkers !== null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
  }

  if (type === "reset") {
    filteredProjectList = ProjectList;
  } else {
    filteredProjectList = ProjectList.filter((x) => x.type.includes(type));
  }
  locationList = updateLocationList();
  updateMarkers();
}

function filterProjectsBySense(sense) {
  if (currentMarkers !== null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
  }

  if (sense === "reset") {
    filteredProjectList = ProjectList;
  } else {
    filteredProjectList = ProjectList.filter((x) => x.senses.includes(sense));
  }
  locationList = updateLocationList();
  updateMarkers();
}

function updateLocationList() {
  return {
    type: "ProjectCollection",
    areas: [
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.8078657, 44.8837266],
        },
        properties: {
          projects: [getProjects(13.8078657, 44.8837266)],
          description: "this is an area",
        },
      }
    ],
  };
}

function updateMarkers() {

  for (const area of locationList.areas) {


    // create a HTML element for each feature
    const el = document.createElement("div");

    if (area.properties.projects.some((el) => el !== null)) {
      el.projects = area;
      el.className = "marker";

      let index = 0;
      let projectList = area.properties.projects[0]


      for(project of projectList) {


        index++;


        switch(index){
          
          case 1: {
            el.classList.add('marker-1');
            break;
          } 
          case 2: {
            el.classList.add('marker-2');
            break;
          }
          case 3: {
            el.classList.add('marker-3');
            break;
          }
          case 4: {
            el.classList.add('marker-4');
            break;
          }
          case 5: {
            el.classList.add('marker-5');
            break;
          }
          default: {
            break;
          }
  
        }
      }
      el.addEventListener("click", () => openDialog(projectList, area.geometry.coordinates));

      // make a marker for each feature and add to the map
      newMarker = new mapboxgl.Marker(el)
        .setLngLat(area.geometry.coordinates)
        .addTo(map);
      currentMarkers.push(newMarker);

      el.classList.add("marker-animation");

    } else {
      continue;
    }
  }
}

function expandView(id1, id2, id3, id4, id5, id6) {

  console.log(id1);
  console.log(id2);
  console.log(id3);
  console.log(id4);
  console.log(id5);
  console.log(id6);


    setTimeout(function() {
      document.getElementById(id1).classList.add('project-overview-active');
      document.getElementById(id3).classList.add('project-overview-image-active');
    }, 100);

    setTimeout(function() {
      document.getElementById(id2).classList.add('project-overview-description-active');
    }, 300);

    document.getElementById(id5).classList.remove('project-overview-description-active');
    setTimeout(function() {
      document.getElementById(id6).classList.remove('project-overview-image-active');
      document.getElementById(id4).classList.remove('project-overview-active');
    }, 100);

}

function openOverview() {
  document.getElementById('project-overview').classList.add('project-overview-opened');
}

function closeDialog() {
  let dialog = document.getElementById('overview-dialog');
  dialog.classList.remove('open-dialog');
  document.getElementById('dimmer').classList.remove('dimmer-active');
  const el = document.getElementById("card-container");
  el.innerHTML = '';
}

function closeOverview() {
  document.getElementById('project-overview').classList.remove('project-overview-opened');
}


function openDialog(projects, coordinates) {

  let dialog = document.getElementById('overview-dialog');

  setTimeout(function() {
    document.getElementById('dimmer').classList.add('dimmer-active');
    dialog.classList.add('open-dialog');
  }, 500);


  console.log(projects);
    map.flyTo({
    center: [coordinates[0], coordinates[1]],
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });


  const el = document.getElementById("card-container");

  for (project of projects) {
    if (project !== null) {
      const item = document.createElement("ul");
      item.innerHTML = populateDetails(project);
      el.appendChild(item);
    }
  }
}

function populateDetails(project) {
  const senses = [];

  for (let sense of project.senses) {
    senses.push(`<div>${sense}</div>`);
  }

  const details = `
      <div class="project-card" onclick="openOverview()">
        <div class="project-card-title">
          <div class="popup-title">${project.name}</div>
        </div>
        <div class="project-card-image">
        </div>
      </div>
    `;
  return details;
}

