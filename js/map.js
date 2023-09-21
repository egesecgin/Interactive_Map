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
  if (filteredProjectList.filter((x) => x.longtitude === coord1).length == 0) {
    return null;
  } else {
    return filteredProjectList.filter((x) => x.longtitude === coord1 && filteredProjectList.filter((x) => x.lattitude === coord2));
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

///test from now on till this comment ends
function filterProjectsByYear(year) {
  year = parseInt(year, 10);

  let areas = updateLocationList().areas;

  let filteredAreas = areas.filter(area => area.year === year);

  console.log(`Filtered ${filteredAreas.length} areas for year ${year}`);

 
  currentMarkers.forEach(marker => {
    console.log('Removing a marker');
    marker.remove();
  });

  currentMarkers = [];

  filteredAreas.forEach(area => {
    let marker = createMarker(area.geometry.coordinates);
    currentMarkers.push(marker);
  });

  console.log(`Created ${currentMarkers.length} markers for year ${year}`);
}


let yearButtons = [
  document.querySelector('.year-btn-2018'),
  document.querySelector('.year-btn-2019'),
  document.querySelector('.year-btn-2021'),
  document.querySelector('.year-btn-2022'),
];

yearButtons.forEach(button => {
  button.addEventListener('click', () => {
    let year = button.textContent;
    console.log(`Button for year ${year} clicked`);
    filterProjectsByYear(year);
  });
});
//andy needed here sorry ND you are doing most of the things even tho i work for hours i have no idea what i am doing thanks ND for everything

function updateLocationList() {
  return {
    type: "ProjectCollection",
    areas: [
      {
        type: "Location",
        year: 2018,
        geometry: {
          type: "Point",
          coordinates: [13.8078657, 44.8837266],
        },
        properties: {
          projects: [getProjects(13.8078657, 44.8837266), getProject("cocoon")],
          description: "this is an area",
        },
      },
      {
        type: "Location",
        year: 2019,
        geometry: {
          type: "Point",
          coordinates: [13.812157, 44.891861],
        },
        properties: {
          projects: [getProject("the-essence-of-casa-matta")],
        },
      },
      {
        type: "Location",
        year: 2021,
        geometry: {
          type: "Point",
          coordinates: [13.809157, 44.894861],
        },
        properties: {
          projects: [getProject("lithic-technology"), getProject("layerz")],
        },
      },
      {
        type: "Location",
        year: 2022,
        geometry: {
          type: "Point",
          coordinates: [13.802157, 44.891861],
        },
        properties: {
          projects: [getProject("project-soba"), getProject("exosensor")],
        },
      },
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

      for(project of area.properties.projects) {

        if(project !== null) {
          index++;
        }

        switch(index){
          case 1: {
            el.classList.add('marker-1');
            break;
          } 
          case 2: {
            el.classList.add('marker-2');
            console.log(project);
            break;
          }
          default: {
            break;
          }
  
        }
      }
      el.addEventListener("click", () => openDialog(el.projects));

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

function openDialog(projects) {
    map.flyTo({
    center: [projects.geometry.coordinates[0], projects.geometry.coordinates[1]],
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });


  let areaProjectList = projects.properties.projects;

  const el = document.getElementById("project-overview");

  for (project of areaProjectList) {
    if (project !== null) {
      const item = document.createElement("li");
      item.innerHTML = populateDetails(project[0]);
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
      <div>
        <div>Name: ${project.name}</span>
        <div>Type: ${project.type}</div>
        <div>ID: ${project.id}</div>
        ${senses.join("")}
      </div>
    `;
  return details;
}

