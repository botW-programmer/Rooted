const API_KEY = 'AIzaSyAqMujpkFtfzXqEIpv8ptHUOgwh2ePnM3Q';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const wordInput = document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const resultsCard = document.getElementById('results-card');
const resultTitle = document.getElementById('result-title');
const journeyMap = document.getElementById('journey-map');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const toggleMapBtn = document.getElementById('toggle-map-btn');
const map2D = document.getElementById('map');
const map3D = document.getElementById('globe-map');

let map;
let markerGroup;
let worldGlobe; 
let is3D = false; 

function initMap() {
    map = L.map('map', {
        minZoom: 2,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        noWrap: true
    }).addTo(map);
    
    markerGroup = L.layerGroup().addTo(map);

    const customLabel = L.divIcon({
        className: 'custom-map-label', html: 'Palestine', iconSize: [100, 20], iconAnchor: [50, 10]
    });
    L.marker([31.9474, 35.2272], {icon: customLabel}).addTo(map);

    worldGlobe = Globe()(map3D)
        .globeImageUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=') 
        .backgroundColor('rgba(0,0,0,0)') 
        .showAtmosphere(true)
        .atmosphereColor('#aad576') 
        .atmosphereAltitude(0.15)
        .arcColor(() => '#aad576') 
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500) 
        .pointColor(() => '#4a5d23') 
        .pointAltitude(0.08) 
        .pointRadius(0.8)
        .pointLabel('label')
        .onPointClick(point => {
            worldGlobe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.2 }, 800);
        });

    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countries => {
            worldGlobe.polygonsData(countries.features)
                .polygonCapColor(() => '#9cb4c4') 
                .polygonSideColor(() => 'rgba(156, 180, 196, 0.1)') 
                .polygonStrokeColor(() => '#ffffff'); 
        });
        
    // refresh check
    setTimeout(() => { resizeMaps(); }, 300);
}

function drawMapRoute() {
    markerGroup.clearLayers();
    
    const steps = document.querySelectorAll('.timeline li');
    const latLngs = [];
    const arcData = [];
    const pointData = [];

    steps.forEach((step, index) => {
        const lat = parseFloat(step.getAttribute('data-lat'));
        const lng = parseFloat(step.getAttribute('data-lng'));
        const langInfo = step.querySelector('.lang')?.textContent || "Path Marker";

        if (!isNaN(lat) && !isNaN(lng)) {
            const coordinates = [lat, lng];
            latLngs.push(coordinates);

            L.marker(coordinates).bindPopup(`<b>Step ${index + 1}:</b> ${langInfo}`).addTo(markerGroup);
            pointData.push({ lat: lat, lng: lng, label: langInfo });

            if (index > 0) {
                const prevLat = parseFloat(steps[index - 1].getAttribute('data-lat'));
                const prevLng = parseFloat(steps[index - 1].getAttribute('data-lng'));
                arcData.push({ startLat: prevLat, startLng: prevLng, endLat: lat, endLng: lng });
            }
        }
    });

    if (latLngs.length > 0) {
        L.polyline(latLngs, { color: '#93c45a', weight: 4, dashArray: '6, 10' }).addTo(markerGroup);
        map.fitBounds(L.polyline(latLngs).getBounds(), { padding: [40, 40] });

        if (worldGlobe) {
            worldGlobe.pointsData(pointData).arcsData(arcData);
            worldGlobe.pointOfView({ 
                lat: latLngs[latLngs.length - 1][0], 
                lng: latLngs[latLngs.length - 1][1], 
                altitude: 2.3 
            }, 1000);
        }
    }
}

const offlinePaths = {
    "coffee": "<ul class='timeline'><li data-lat='9.145' data-lng='40.4896'><span class='lang'>Arabic (Yemen, 15th Century)</span><br><span class='old-word'>Qahwah</span><p>Originally referred to a type of wine, but later became the name for the brewed beverage made from roasted beans.</p></li><li data-lat='41.008' data-lng='28.978'><span class='lang'>Ottoman Turkish (16th Century)</span><br><span class='old-word'>Kahve</span><p>The beverage spread through the Ottoman Empire, and the pronunciation shifted.</p></li><li data-lat='52.367' data-lng='4.904'><span class='lang'>Dutch (17th Century)</span><br><span class='old-word'>Koffie</span><p>Dutch traders introduced the drink to Europe, adapting the Turkish word into their own language.</p></li><li data-lat='51.507' data-lng='-0.127'><span class='lang'>English (Late 16th Century)</span><br><span class='old-word'>Coffee</span><p>The word finally entered the English language, solidifying its modern form and sparking a coffeehouse revolution.</p></li></ul>"
};

async function traceWordPath() {
    const word = wordInput.value.trim();
    if (!word) return; 

    searchBtn.textContent = "Tracing...";
    searchBtn.disabled = true;
    resultsCard.classList.remove('hidden');
    
    if (map) {
        setTimeout(() => { map.invalidateSize(); }, 150);
    }

    resultTitle.textContent = word;
    journeyMap.innerHTML = "<em>Plotting map pathways...</em>";

    const promptText = `Trace the etymological journey and history of the English word "${word}" from its earliest known origin to modern English. Format STRICTLY as raw HTML. Return an unordered list with the class "timeline" (<ul class="timeline">). Each major step in its journey across countries/regions must be an <li> tag. CRITICAL INSTRUCTION: Every <li> tag MUST include "data-lat" and "data-lng" attributes containing the approximate modern geographic latitude and longitude coordinates for that region (e.g., <li data-lat="15.5" data-lng="48.5">). Inside each <li>, you MUST provide: 1) <span class="lang">[Language and Era]</span> 2) <br> 3) <span class="old-word">[The historical version of the word]</span> 4) <p>[A brief 1-2 sentence explanation of how the meaning or spelling changed]</p>. Do NOT use markdown. Do not include any text outside the <ul>.`;
    
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) 
        });

        if (!response.ok) throw new Error("API Route Failure");

        const data = await response.json();
        journeyMap.innerHTML = data.candidates[0].content.parts[0].text;
        drawMapRoute();
        
    } catch (error) {
        const lowerWord = word.toLowerCase();
        if (offlinePaths[lowerWord]) {
            journeyMap.innerHTML = offlinePaths[lowerWord];
            drawMapRoute();
        } else {
            journeyMap.innerHTML = "<p><em>System Note:</em> The live API link is resting. Search for 'Coffee' to trigger the pre-rendered spatial fallback track!</p>";
        }
    }

    searchBtn.textContent = "Trace Path";
    searchBtn.disabled = false;
}

function resizeMaps() {
    if (worldGlobe && map3D) {
        worldGlobe.width(map3D.clientWidth);
        worldGlobe.height(map3D.clientHeight);
    }
    if (map) {
        map.invalidateSize();
    }
}

toggleMapBtn.addEventListener('click', () => {
    if (!worldGlobe) return; 
    is3D = !is3D; 
    
    if (is3D) {
        map2D.classList.add('map-invisible');
        map3D.classList.remove('map-invisible');
        toggleMapBtn.textContent = "Switch to 2D Map";
        
        setTimeout(() => { resizeMaps(); }, 100);
    } else {
        map3D.classList.add('map-invisible');
        map2D.classList.remove('map-invisible');
        toggleMapBtn.textContent = "Switch to 3D Globe";

        setTimeout(() => { resizeMaps(); }, 100); 
    }
});

window.addEventListener('resize', resizeMaps);

searchBtn.addEventListener('click', traceWordPath);
wordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') traceWordPath(); });

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove('open');
    }
});

initMap();