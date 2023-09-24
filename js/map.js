mapboxgl.accessToken =
  "pk.eyJ1IjoiaHlhZnVtaSIsImEiOiJjbG1xNnBmcGwwMG1oMmxvZXY3aXk0cjZwIn0.VqDSZnJW59A-ORUAp0gq-Q";
const bounds = [
  [13.776767, 44.868209], // Southwest coordinates
  [13.845318, 44.901900], // Northeast coordinates
];

//Initialize some stuff
let currentMarkers = [];
let filteredProjectList;
let locationList;
let ProjectList;
let map;
let dialogOpen = false;

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
      bearing: 160,
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

      await map.once("load");

      updateMarkers();

      document.getElementById("loading-wrapper").classList.add("loading-done");
    })();
  }
};

req.open("GET", "https://api.jsonbin.io/v3/b/650ee18912a5d376598211d3", true);
req.setRequestHeader("X-Master-Key", "$2a$10$Tw5DZmmLnLrkxrfVWRwguucmIGDPN7Mo4FZAImYzSUZvyR8mH9x4u");
req.send();

function getGoogleImageID(url) {
  if (url.includes("drive")) {
    const checker = /\d([A-Za-z0-9\-\_]+)\w+/;
    let result = url.match(checker);

    const validUrl = "https://drive.google.com/uc?export=view&id=" + result[0];

    console.log(validUrl);
    return validUrl;
  } else {
    return url;
  }
}

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
    return filteredProjectList.filter(
      (x) => x.longitude === coord1 && x.latitude === coord2
    );
  }
}

function getProject(id) {
  if (filteredProjectList.filter((x) => x.id === id).length === 0) {
    return null;
  } else {
    return filteredProjectList.filter((x) => x.id === id);
  }
}

// Filter projects by type
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

// Filter projects by sense
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

// Filter projects by year
function filterProjectsByYear(year) {
  if (currentMarkers !== null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
  }

  if (year === "reset") {
    filteredProjectList = ProjectList;
  } else {
    filteredProjectList = ProjectList.filter((x) => x.Year == year);
  }
  locationList = updateLocationList();
  updateMarkers();
}

function updateMarkers() {
  for (const area of locationList.areas) {
    // create a HTML element for each feature
    const el = document.createElement("div");

    if (area.properties.projects.some((el) => el !== null)) {
      el.projects = area;
      el.className = "marker";

      let index = 0;
      let projectList = area.properties.projects[0];

      for (project of projectList) {
        index++;

        switch (index) {
          case 1: {
            el.classList.add("marker-1");
            break;
          }
          case 2: {
            el.classList.add("marker-2");
            break;
          }
          case 3: {
            el.classList.add("marker-3");
            break;
          }
          case 4: {
            el.classList.add("marker-4");
            break;
          }
          case 5: {
            el.classList.add("marker-5");
            break;
          }
          default: {
            break;
          }
        }
      }
      el.addEventListener("click", () => openDialog(projectList, area));

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
  setTimeout(function () {
    document.getElementById(id1).classList.add("project-overview-active");
    document.getElementById(id3).classList.add("project-overview-image-active");
  }, 100);

  setTimeout(function () {
    document
      .getElementById(id2)
      .classList.add("project-overview-description-active");
  }, 300);

  document
    .getElementById(id5)
    .classList.remove("project-overview-description-active");
  setTimeout(function () {
    document
      .getElementById(id6)
      .classList.remove("project-overview-image-active");
    document.getElementById(id4).classList.remove("project-overview-active");
  }, 100);
}

function openOverview(id) {
  const project = getProject(id)[0];
  document.getElementById('project-overview').classList.add('project-overview-opened');
  document.getElementById('project-overview-title').innerHTML = project.name;
  document.getElementById('project-overview-image-pula').src = getGoogleImageID(project.img_pula);
  document.getElementById('project-overview-image-zurich').src = getGoogleImageID(project.img_toni);
  document.getElementById('project-overview-description-pula').innerHTML = project.description;
  document.getElementById('project-overview-description-zurich').innerHTML = project.translation;

  document.getElementById('gallery-1').src = project.pula_gallery1;
  document.getElementById('gallery-2').src = project.pula_gallery2;
  document.getElementById('gallery-3').src = project.pula_gallery3;
  document.getElementById('gallery-4').src = project.pula_gallery4;

  document.getElementById('gallery-5').src = project.toni_gallery1;
  document.getElementById('gallery-6').src = project.toni_gallery2;
  document.getElementById('gallery-7').src = project.toni_gallery3;
  document.getElementById('gallery-8').src = project.toni_gallery4;


}

function closeDialog() {
  dialogOpen = false;

  let dialog = document.getElementById('overview-dialog');
  dialog.classList.add('close-dialog');

  setTimeout(function() {
    dialog.classList.remove('open-dialog');
    dialog.classList.remove('close-dialog');
  }, 300);

  document.getElementById("dimmer").classList.remove("dimmer-active");
  const el = document.getElementById("card-container");
  el.innerHTML = "";
}

function closeOverview() {


  
  let overview = document.getElementById('project-overview');
  overview.classList.add('close-project-overview');


  setTimeout(function() {
    overview.classList.remove('close-project-overview');
    overview.classList.remove('project-overview-opened');
    overview.scrollTop = 0;


    document.getElementById('project-overview-title').innerHTML = "";
    document.getElementById('project-overview-image-pula').src = "";
    document.getElementById('project-overview-image-zurich').src = "";
    document.getElementById('project-overview-description-pula').innerHTML = "";
    document.getElementById('project-overview-description-zurich').innerHTML = "";
  
    document.getElementById('project-overview-image-pula').classList.remove('project-overview-image-active');
    document.getElementById('project-overview-image-zurich').classList.remove('project-overview-image-active');
    document.getElementById('project-overview-zurich').classList.remove('project-overview-active');
  
    document.getElementById('project-overview-description-pula').classList.remove('project-overview-description-active');
    document.getElementById('project-overview-description-zurich').classList.remove('project-overview-description-active');
    document.getElementById('project-overview-pula').classList.remove('project-overview-active');
  
    
  }, 300);


}

function openDialog(projects, area) {
  dialogOpen = true;

  let dialog = document.getElementById("overview-dialog");

  let video_player = document.getElementById("video-player");
  video_player.classList.remove("stop-video");
  video_player.innerHTML = `<iframe class="area-video" src="${area.properties.areavideo}?autoplay=1&nocontrols=1" frameborder="0" allow="autoplay"></iframe>`;

  setTimeout(function () {
    document.getElementById("dimmer").classList.add("dimmer-active");
    dialog.classList.add("open-dialog");
  }, 500);

  map.flyTo({
    center: [area.geometry.coordinates[0], area.geometry.coordinates[1]],
    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
  });

  document.getElementById("location-title-text").innerHTML =
    "About " + area.properties.areaname;
  document.getElementById("location-description-text").innerHTML =
    area.properties.areadescription;

  let image_container = document.getElementById("history-image-container");
  image_container.innerHTML = "";

  for (imageUrl of area.properties.areaimg) {
    console.log(imageUrl);
    const image = document.createElement("ul");
    image.innerHTML = `<img class="history-image" src="${getGoogleImageID(
      imageUrl
    )}" alt="">`;
    image_container.appendChild(image);
  }

  const el = document.getElementById("card-container");

  for (project of projects) {
    if (project !== null) {
      const item = document.createElement("ul");
      item.innerHTML = populateDetails(project);
      el.appendChild(item);
    }
  }

  setTimeout(function () {
    console.log(dialogOpen);
    if (dialogOpen === true) {
      document.getElementById("video-player").classList.add("stop-video");
    }
  }, 4000);
}

function populateDetails(project) {
  const senses = [];

  for (let sense of project.senses) {
    switch(sense) {
      case "Visual": {
        senses.push(`<img class="sense-icon" src="./assets/visual.svg">`)
      }
      case "Auditive": {
        senses.push(`<img class="sense-icon" src="./assets/auditive.svg">`)
      }
      case "Touch": {
        senses.push(`<img class="sense-icon" src="./assets/haptic.svg">`)
      }   
    }

  }

  const details = `
      <div class="project-card" onclick="openOverview(${project.id})">

        <div class="project-card-title">
          <div class="card-title">${project.name}</div>
        </div>

        <div class="project-card-image-container">
          <img class="project-card-image" src="${getGoogleImageID(project.img_pula)}" alt="">

          <div class="project-card-icons">
            ${senses.join("")}
          </div>

        </div>
      </div>
    `;
  return details;
}

//Over here it has to link to something from the project overview tab :)

// Transition video

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
          areaname: "Fort Valmaggiore",
          areadescription:
            "The Valmaggiore Fort, built between 1884 and 1886 at an elevation of 36.3 meters above sea level overlooking Žunac Bay, is a formidable fortress. It features two open bunkers armed with powerful coastal guns, including two 28 cm D/35 guns and two 15 cm D/35 guns. Active from 1886 to 1945, with a later reactivation from 1950 to 1959, it remarkably sustained only minor damage during German bombings in 1945. In 2014, the fort underwent restoration, including new iron doors. Constructed primarily from concrete and steel, it boasts an extensive underground tunnel system leading to a casemate chamber. Despite Italian attempts to demolish it in the 1930s, the Valmaggiore Fort miraculously retains its near-pristine condition, serving as a testament to its era's architectural and engineering prowess and preserving its military legacy.",
          areaimg: [
            "https://i.ytimg.com/vi/AA9vULS8WsY/maxresdefault.jpg",
            "https://drive.google.com/uc?export=view&id=1nNBkOZGSTwKoo-vl6FSsuobrGpZEUfor",
            "https://i.ytimg.com/vi/HGQoNFiuoXQ/maxresdefault.jpg",
          ],
          areavideo: ["https://streamable.com/e/7vkcdb"],
        },
      },

      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.797712, 44.890232],
        },
        properties: {
          projects: [getProjects(13.797712, 44.890232)],
          areaname: "Wavebreaker of Fort Punta Cristo",
          areadescription:
            "The wave breaker, located in front of Fort Punta Cristo, embodies Pula's historical and architectural richness. Fort Punta Cristo, a 19th-century Austro-Hungarian fort in Štinjan, is the region's largest Austro-Hungarian fortification, spanning over ten thousand square meters with 270 rooms. Its strategic position offers sweeping views of Pula Bay, the adjacent wave breaker, and the sea's horizon. After years of neglect post-World War II, recent restoration efforts have revived it. Today, Punta Christo Fortress thrives as a cultural center, hosting concerts, exhibitions, and events, offering a blend of history and contemporary culture for tourists and enthusiasts to enjoy.",
          areaimg: [
            "https://www.istria-culture.com/storage/upload/poi/istra_culture_540_11429.jpg",
            "https://d1bvpoagx8hqbg.cloudfront.net/originals/fort-punta-christo-pula-00f4dd47deb7628b612447abd2c2cb7c.jpg",
            "https://www.pulainfo.hr/wp/wp-content/uploads/2017/05/1291886046_2.jpg",
          ],
          areavideo: ["https://streamable.com/e/4qhisb"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.802001, 44.892189],
        },
        properties: {
          projects: [getProjects(13.802001, 44.892189)],
          areaname: "Stinjanska Uvala",
          areadescription:
            "The wave breaker, located in front of Fort Punta Cristo, embodies Pula's historical and architectural richness. Fort Punta Cristo, a 19th-century Austro-Hungarian fort in Štinjan, is the region's largest Austro-Hungarian fortification, spanning over ten thousand square meters with 270 rooms. Its strategic position offers sweeping views of Pula Bay, the adjacent wave breaker, and the sea's horizon. After years of neglect post-World War II, recent restoration efforts have revived it. Today, Punta Christo Fortress thrives as a cultural center, hosting concerts, exhibitions, and events, offering a blend of history and contemporary culture for tourists and enthusiasts to enjoy.",
          areaimg: [
            "https://media.istra24.hr/istra24-hr/image/upload/c_limit,h_800,w_1200/q_auto:eco/f_jpg/kamenolom_%C5%A1tinjanska_uvala_hacm7c5l4p",
          ],
          areavideo: ["https://streamable.com/e/an3fos"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.81706, 44.876499],
        },
        properties: {
          projects: [getProjects(13.81706, 44.876499)],
          areaname: "St. Katarina",
          areadescription:
            "The Katarina Naval Base in northern Croatia, nestled on the edge of Pula Bay, has a rich history. Abandoned in the early 1990s during Yugoslavia's dissolution, it's now a magnet for history enthusiasts. Originally part of the Austro-Hungarian defense system, it expanded during Italian rule, covering 6 kilometers of coastline with numerous structures. Despite some age and abandonment, it retains a unique urbex charm, bearing scars from the Yugoslavian war. Plans are underway to transform it into a marina harbor while preserving its heritage. The Katarina Naval Base reflects Croatia's maritime history and potential for renewal, a symbol of resilience.",
          areaimg: [
            "https://www.geotech.hr/wp-content/uploads/2017/07/Untitled.png",
            "https://49fe30bb3aa7406c16dc-5c968119d095dc32d807923c59347cc2.ssl.cf1.rackcdn.com/2013.495.1683_1.jpg",
            "https://pepperurbex.com/wp-content/uploads/2019/09/Naval-Base-Pula-1-van-1-12.jpg",
          ],
          areavideo: ["https://streamable.com/e/v6nxrn"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.8458, 44.884172],
        },
        properties: {
          projects: [getProjects(13.8458, 44.884172)],
          areaname: "Valelunga, Napušteni kompleks",
          areadescription:
            'Beneath Plješevica Mountain in Pula, Croatia, lies the "Abandoned Complex" or Napušteni kompleks, a massive underground facility built during the Cold War. Spanning 216,000 square meters, it was designed to withstand nuclear threats and includes tunnels, hangars, and a hospital. Today, it\'s a magnet for urban explorers, offering a glimpse into this secretive era of preparedness. Napušteni kompleks is a testament to human ingenuity and the enduring specter of global conflict, inviting you to discover its echoes from a bygone era. Above ground, a few abandoned buildings are slowly succumbing to nature.',
          areaimg: [
            "https://lh3.googleusercontent.com/p/AF1QipM9Ys0RfF9tc8TWxh8aLArf5rLtKVCA-HChdrLG=s0",
            "https://drive.google.com/uc?export=view&id=1nNBkOZGSTwKoo-vl6FSsuobrGpZEUfor",
            "https://blog.dnevnik.hr/viatrix/slike/m/20200830_104207.jpg",
          ],
          areavideo: ["https://streamable.com/e/fxknal"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.811706, 44.900627],
        },
        properties: {
          projects: [getProjects(13.811706, 44.900627)],
          areaname: "Hidrobaza, Casino, Austro Hungarian ruins",
          areadescription:
            "In the rugged northwest of Pula, Istria, Fortified Group Barbariga is a testament to Austro-Hungarian military prowess. Built from 1898 to 1914, spanning 150 hectares, it guarded the Fažana Channel entrance and Pula's military port. Featuring seven solid forts, four semi-permanent forts, and auxiliary structures, it's a masterpiece of stone, concrete, steel, and brick construction. The austere yet precise architecture includes imposing entrances and formidable artillery openings. Adventurers can explore tunnels and enjoy panoramic views. The fortress hosts events, blending history with contemporary vibrancy. Discover history and entertainment at Istria's largest fortification, Fortified Group Barbariga.",
          areaimg: [
            "https://lh3.googleusercontent.com/p/AF1QipOyHUN3dYyJx6NGh-VreQIIgowGcJrG-LGFU7S8=s0",
            "https://lh3.googleusercontent.com/p/AF1QipPXWzIlKMPSoypijH3BIi2NkoIqHC_r1zMinngP=s0",
            "https://lh3.googleusercontent.com/p/AF1QipOHFWPanCySfpOYqglhce8_PS3AJS1vcIArW2AI=s0",
          ],
          areavideo: ["https://streamable.com/e/5f02it"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.805028, 44.888939],
        },
        properties: {
          projects: [getProjects(13.805028, 44.888939)],
          areaname: "stinjanska uvala",
          areadescription:
            "Stinjanska Uvala boasts a charming small coastal area adorned with smooth, glistening stones, creating a picturesque and tranquil seascape. Not only the coastline, but also the underwater area contain stunning parts of nature.",
          areaimg: [
            "https://lh3.googleusercontent.com/p/AF1QipPOloxLlWENvKT-aarNdTLmcG4TXV43CgJ2VPA0=s0",
          ],
          areavideo: ["https://streamable.com/e/5xyz62"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.844743, 44.884314],
        },
        properties: {
          projects: [getProjects(13.844743, 44.884314)],
          areaname: "Valelunga, Napušteni kompleks",
          areadescription:
            "Beneath Croatia's Plješevica Mountain in Pula lies the \"Abandoned Complex\" or Napušteni kompleks. This vast underground facility served as Yugoslavia's Cold War frontline defense. It features tunnels, hangars, and even a hospital, all designed to withstand nuclear threats. Today, it attracts urban explorers seeking a glimpse into this secretive and tense era. Venture into its dimly lit passages and cavernous chambers to witness a testament to human ingenuity and the enduring specter of global conflict. On the surface, a few buildings remain, some possibly unrelated to the complex's history.",
          areaimg: [
            "https://drive.google.com/uc?export=view&id=1mKTqV8PMlv1Po5kYUUBHLTZwbEbiR8fx",
          ],
          areavideo: ["https://streamable.com/e/xyojru"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.844331, 44.884262],
        },
        properties: {
          projects: [getProjects(13.844331, 44.884262)],
          areaname: "Valelunga, Napušteni kompleks",
          areadescription:
            'Beneath Plješevica Mountain in Pula, Croatia, lies the "Abandoned Complex" or Napušteni kompleks, a vast underground facility from Yugoslavia\'s Cold War era. It was built to withstand nuclear threats and now attracts urban explorers curious about this secretive time. As you navigate its tunnels and chambers, you can sense the tension of a divided world. Napušteni kompleks stands as a testament to human ingenuity amidst the specter of global conflict. Above ground, a few aging buildings remain, gradually reclaimed by nature.',
          areaimg: [
            "https://drive.google.com/uc?export=view&id=1mKTqV8PMlv1Po5kYUUBHLTZwbEbiR8fx",
          ],
          areavideo: ["https://streamable.com/e/05qxo8"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.8031883, 44.8961591],
        },
        properties: {
          projects: [getProjects(13.8031883, 44.8961591)],
          areaname: "Wavebreaker of Fort Punta Cristo",
          areadescription:
            "The wave breaker in front of Fort Punta Cristo embodies Pula's historical and architectural richness. Fort Punta Cristo, a 19th-century Austro-Hungarian fort on Štinjan's Kristo peninsula, is the region's largest Austro-Hungarian fortification, covering over ten thousand square meters with 270 rooms. Its strategic location provides panoramic views of Pula Bay, the adjacent wave breaker, and the sea, including Muzil and Brijuni islands. Surrounded by a moat and accessible through three gateways leading to intricate underground spaces, the fort was abandoned and neglected post-World War II but has recently been restored. Today, Punta Christo Fortress thrives as a cultural center, hosting concerts, exhibitions, and events, offering a blend of history and contemporary culture for tourists and enthusiasts to enjoy. This transformation reflects Pula's rich heritage while embracing its modern cultural scene.",
          areaimg: [
            "https://www.istria-culture.com/storage/upload/poi/istra_culture_540_11429.jpg",
            "https://d1bvpoagx8hqbg.cloudfront.net/originals/fort-punta-christo-pula-00f4dd47deb7628b612447abd2c2cb7c.jpg",
            "https://www.pulainfo.hr/wp/wp-content/uploads/2017/05/1291886046_2.jpg",
          ],
          areavideo: ["https://streamable.com/e/tdwovh"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.821033, 44.87904],
        },
        properties: {
          projects: [getProjects(13.821033, 44.87904)],
          areaname: "St. Katarina",
          areadescription:
            "Sitting along the northern edge of Pula Bay, the Katarina Naval Base, a monumental naval stronghold in northern Croatia, carries a rich history. Abandoned during Yugoslavia's dissolution in the early 1990s, this site beckons explorers seeking history and urban adventure.Originally part of the Austro-Hungarian defense system for Pula, it expanded during Italian rule, adding to its historical significance. Stretching over 6 kilometers of coastline, it boasts around a hundred structures, linked to the mainland by a remarkable 250-meter-long bridge.Though time has aged it, lending an air of abandonment to some parts, the base retains a unique urbex charm for adventurers. The scars of the Yugoslavian war linger, particularly in the higher sea-facing windows, bearing witness to the site's tumultuous past. Since Croatia's formation, the base has languished in disuse and decay, yet it holds cultural heritage status. Despite this recognition, plans are afoot to transform the area into a bustling marina harbor, blending its rich history with a promising future. Katarina Naval Base serves as a portal to Croatia's maritime heritage and stands as a symbol of resilience. It offers a glimpse into the nation's history, wartime struggles, and the potential for rebirth.",
          areaimg: [
            "https://pepperurbex.com/wp-content/uploads/2019/09/Naval-Base-Pula-1-van-1-21-768x512.jpg",
            "https://pepperurbex.com/wp-content/uploads/2019/09/Naval-Base-Pula-1-van-1-16-768x512.jpg",
          ],
          areavideo: ["https://streamable.com/e/v6nxrn"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.833997, 44.88589],
        },
        properties: {
          projects: [getProjects(13.833997, 44.88589)],
          areaname: "Valelunga, Magazin",
          areadescription:
            "This wide building in Valelunga boasts six rooms and it was used for storage. Due to its construction, it gives off very strong echo.",
          areaimg: [
            "https://drive.google.com/uc?export=view&id=1fBIRvdlUnu4ff894auhPFhHUvKekXHAm",
            "https://drive.google.com/uc?export=view&id=1S2L07j8xSUlgOhfNnXQUsNp5yTkXhCVg",
          ],
          areavideo: ["https://streamable.com/e/rcb5vz"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.833159, 44.885917],
        },
        properties: {
          projects: [getProjects(13.833159, 44.885917)],
          areaname: "Valelunga, Magazin",
          areadescription:
            "This wide building in Valelunga boasts six rooms and it was used for storage. Due to its construction, it gives off very strong echo.",
          areaimg: [
            "https://drive.google.com/uc?export=view&id=1fBIRvdlUnu4ff894auhPFhHUvKekXHAm",
            "https://drive.google.com/uc?export=view&id=1S2L07j8xSUlgOhfNnXQUsNp5yTkXhCVg",
          ],
          areavideo: ["https://streamable.com/e/l675lb"],
        },
      },
      {
        type: "Location",
        geometry: {
          type: "Point",
          coordinates: [13.836202, 44.884708],
        },
        properties: {
          projects: [getProjects(13.836202, 44.884708)],
          areaname: "Štinjan (Pula)",
          areadescription:
            "At the coastline of Štinjan (Pula), there are walls, which used to separate Valelunga from the outside. These Walls are still standing, but they definitely have seen better days.",
          areaimg: [
            "https://drive.google.com/uc?export=view&id=1MHH3nuLIcyxreUu2ZLe82kU76pNIkQNR",
          ],
          areavideo: ["https://streamable.com/e/dsvumu"],
        },
      },
    ],
  };
}
