
// Creating map object
let myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 8,
    worldCopyJump: true
});

//make the layers for controlling the map
let baseLayers = {
    "Regular": L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    })
}

let overlays = {}

//function to give average funding values for each cluster marker
//too complicated for one-line code
function getAvgFunding(cluster) {
    let total_money = (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[0])
        .reduce((a, b) => (a + b))
    let total_companies = (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[1])
        .reduce((a, b) => (a + b))
    
    return total_money/total_companies
}

// Create a legend to display information about our map
var info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    return div;
};


// Add the info legend to the map
info.addTo(myMap);


let valueLookup = new Map();
let allStartupsTotalCount = 0;
let updatedCountryGeoJSON;
let usData = [0, 0]

function addCountry(country){
    let coords = country.geometry.coordinates.map(a => a.map((b) => b.map(c => c.reverse())))
    overlays["countries"].addLayer(L.polyline(coords, { color: 'red' }))
}


// fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
// .then(a => a.json()).then((a) => {
//     console.log(a)
//     for (let country of a.features) {
//         addCountry(country)
//     }
//     updatedCountryGeoJSON = a
// }).then(fetch("../../Test_Data / full_table.json").then(response => response.json()))

Promise.all([fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
    .then(a => a.json()), fetch("../../Test_Data/full_table.json").then(response => response.json())])
    .then(([countryGeoJSON, ourData]) => {
        console.log([countryGeoJSON, ourData])
        //first group our data by country
        //and sum all companies and their funding
        let countryAggregated = {}
        for (let item of Object.values(ourData)) {
            if(!(item["country_code"] in countryAggregated)) {
                let company_count = Object.values(ourData).filter(a => a["country_code"]===item["country_code"]).reduce((a, b)=> a+b["company_count"], 0)
                let total_funding = Object.values(ourData).filter(a => a["country_code"]===item["country_code"]).reduce((a, b)=> a+b["funding_total_usd"], 0)
                countryAggregated[item["country_code"]] = [company_count, total_funding]
            }
        }
        //now combine data aggregated by country with 
        //countryGeoJSON data
        let updateFeatures = []
        for (let item of countryGeoJSON["features"]) {
            if(item["properties"]["ISO_A3"] in countryAggregated) {
                item["properties"]["company_count"] = countryAggregated[item["properties"]["ISO_A3"]][0]
                item["properties"]["funding_total_usd"] = countryAggregated[item["properties"]["ISO_A3"]][1]
                // console.log(item)
            }
            else {
                item["properties"]["company_count"] = 0
                item["properties"]["funding_total_usd"] = 0
            }
            updateFeatures.push(item)
        }

        //remove USA from calculation for one of the views (so that second-tier startup results show)
        countryGeoJSON.features = updateFeatures

        overlays["country_company_count"] = L.choropleth(countryGeoJSON, {
            valueProperty: 'company_count', // which property in the features to use
            scale: ['white', 'blue'], // chroma.js scale - include as many as you like
            steps: 5, // number of breaks or steps in range
            mode: 'e', // q for quantile, e for equidistant, k for k-means
            style: {
                color: '#fff', // border color
                weight: 2,
                fillOpacity: 0.8
            },
            onEachFeature: function (feature, layer) {
                let popupHTML = "<p>" + getCountryName(feature.properties["ISO_A2"]) + "</p>"
                //add country name to popup
                popupHTML += "<p>Company Count: " + feature.properties["company_count"] + "</p>"
                // console.log(popupHTML)
                layer.bindPopup(popupHTML)
            }
        })

        return [countryGeoJSON, ourData]
    })
    .then(([countryGeoJSON, ourData]) => {
        // console.log(countryGeoJSON)
        for (let item of countryGeoJSON["features"]) {
            if(item["properties"]["ISO_A3"] === "USA") {
                usData[0] = item["properties"]["company_count"]
                item["properties"]["company_count"] = 0
                // console.log(item)
            }
        }

        overlays["second_tier_company_count"] = L.choropleth(countryGeoJSON, {
            valueProperty: 'company_count', // which property in the features to use
            scale: ['white', 'blue'], // chroma.js scale - include as many as you like
            steps: 7, // number of breaks or steps in range
            mode: 'e', // q for quantile, e for equidistant, k for k-means
            style: {
                color: '#fff', // border color
                weight: 2,
                fillOpacity: 0.8
            },
            onEachFeature: function (feature, layer) {
                let popupHTML = "<p>" + getCountryName(feature.properties["ISO_A2"]) + "</p>"
                //add country name to popup
                if (getCountryName(feature.properties["ISO_A2"]) !== "United States") {
                    popupHTML += "<p>Company Count: " + feature.properties["company_count"] + "</p>"
                }
                // console.log(popupHTML)
                layer.bindPopup(popupHTML)
            }
        })

        return [countryGeoJSON, ourData]
    }).then(([countryGeoJSON, ourData]) => {

        //calculate average funding value and add a property
        for(let item of countryGeoJSON["features"]) {
            if(item["properties"]["ISO_A3"] === "USA") {
                item["properties"]["company_count"] = usData[0]
            }
            if (item["properties"]["company_count"] !== 0) {
                item["properties"]["avg_startup_funding"] = (item["properties"]["funding_total_usd"]) / item["properties"]["company_count"]
            }
            else {
                item["properties"]["avg_startup_funding"] = 0
            }
            
        }

        console.log(countryGeoJSON)

        overlays["average_funding_usd"] = L.choropleth(countryGeoJSON, {
            valueProperty: 'avg_startup_funding', // which property in the features to use
            scale: ['white', 'blue'], // chroma.js scale - include as many as you like
            steps: 5, // number of breaks or steps in range
            mode: 'k', // q for quantile, e for equidistant, k for k-means
            style: {
                color: '#fff', // border color
                weight: 2,
                fillOpacity: 0.8
            },
            onEachFeature: function (feature, layer) {
                let popupHTML = "<p>" + getCountryName(feature.properties["ISO_A2"]) + "</p>"
                //add country name to popup
                // if (getCountryName(feature.properties["ISO_A2"]) !== "United States") {
                popupHTML += `<p>Funding Amount: $${((feature.properties["avg_startup_funding"]).toExponential(2))}</p>`
                // }
                // console.log(popupHTML)
                layer.bindPopup(popupHTML)
            }
        })

        L.control.layers(baseLayers, overlays).addTo(myMap)
    }).then(() => {
        //set initial base layer and overlays here
        document.querySelector(".leaflet-control-layers-base").firstElementChild.click()
        let addedLayers = document.querySelector(".leaflet-control-layers-overlays").children

        for (let i = 0; i < addedLayers.length; i++) {
            let inputEl = addedLayers[i].querySelector("input")
            inputEl.type = "radio"
            inputEl.name = "separateLayers"
        }

        //setup event listener to add legend as necessary
        let overlayLegendSelector = document.querySelector(".leaflet-control-layers-overlays")

        overlayLegendSelector.addEventListener("change", function (e) {
            removeLegend()
            let currSelected = e.target.parentElement.children.item(1).textContent.trim()
            console.log(currSelected)
            if (currSelected in legendMapRelations) {
                legendMapRelations[currSelected]()
            }
            e.stopPropagation()
        })

        //set the initial layer
        addedLayers[0].click()
    })

    

//create an object to choose cases for whether a legend should be added or not
legendMapRelations = {
    "country_company_count": () => {
        addLegend("Company Count", overlays["country_company_count"]
        .options.limits.map((a, i, arr) => {
            return i===0 ? Math.floor(a) : Math.floor(arr[i-1]) +" - " + Math.floor(a)
        }), 
        overlays["country_company_count"].options.colors)
    },
    "second_tier_company_count": () => {
        addLegend("Company Count (Tier II)", overlays["second_tier_company_count"]
            .options.limits.map((a, i, arr) => {
                return i === 0 ? Math.floor(a) : Math.floor(arr[i - 1]) + " - " + Math.floor(a)
            }), 
            overlays["second_tier_company_count"].options.colors)
    },
    "average_funding_usd": () => {
        let arrSize = overlays["average_funding_usd"].options.limits.length;
        addLegend("Average Funding ($)", overlays["average_funding_usd"]
            .options.limits.filter((a, i) => i < arrSize-1).map((a, i, arr) => {
                return i === 0 ? Math.floor(a) : Math.floor(arr[i - 1]).toExponential(1) + " - " + Math.floor(a).toExponential(1)
            }), 
            overlays["average_funding_usd"].options.colors)
    }
}


// Add legend to map - function defined here
function makeSwatch(color, size) {
    let colorSwatch = document.createElement("span")
    // colorSwatch.style.width = size + "px";
    // colorSwatch.style.height = size + "px";
    colorSwatch.setAttribute("width", size)
    colorSwatch.setAttribute("height", size)
    colorSwatch.style.backgroundColor = color;

    let text = ""

    for (let i = 0; i < size; i++) {
        text += " "
    }

    colorSwatch.textContent = text;
    return colorSwatch

}


function addLegend(title, colorDepths, colors) {
    let legend_el = document.querySelector(".legend");
    let headerNote = document.createElement("h3")
    headerNote.textContent = title
    legend_el.appendChild(headerNote);

    for (let i = 0; i < colorDepths.length; i++) {
        let colorSwatch = makeSwatch(colors[i], 4)

        //create text element to add
        let curr_level = document.createElement("div")


        curr_level.textContent = ` ${colorDepths[i]}`
        legend_el.appendChild(curr_level);


        curr_level.prepend(colorSwatch);
    }

    // Add final color and largest value category
    let lastInd = colorDepths.length
    let colorSwatch = makeSwatch(colors[lastInd], 4)


    // let currLevel = document.createElement("div");
    // currLevel.textContent = ` > ${colorDepths[lastInd-1]}`
    legend_el.appendChild(currLevel);
    currLevel.prepend(colorSwatch)

}

function removeLegend() {
    let legend_el = document.querySelector(".legend");
    while (legend_el.children.length > 0) {
        legend_el.removeChild(legend_el.firstChild)
    }
}

