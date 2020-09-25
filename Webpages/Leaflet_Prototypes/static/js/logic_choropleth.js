
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

let overlays = {
    // "countries": L.layerGroup()
    // "startupTotalValue": L.markerClusterGroup({
    //     iconCreateFunction: function (cluster) {
    //     return L.divIcon({ html: '<b>' + (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[0])
    //         .reduce((a, b) => (a + b)).toExponential(4) + '</b>' });
    // }}),
    // "startupAverageValue": L.markerClusterGroup({
    //     iconCreateFunction: function (cluster) {
    //         return L.divIcon({
    //             html: '<b>' + getAvgFunding(cluster).toExponential(4) + '</b>'
    //         });
    //     }
    // }),
    // "percentageStartupCountWorldwide": L.markerClusterGroup({
    //     iconCreateFunction: function (cluster) {
    //         return L.divIcon({
    //             html: '<b>' + (((cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[1])
    //                 .reduce((a, b) => (a + b))) / allStartupsTotalCount * 100).toFixed(2) + '</b>'
    //         });
    //     }
    // })
}

//function to give average funding values for each cluster marker
//too complicated for one-line code
function getAvgFunding(cluster) {
    let total_money = (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[0])
        .reduce((a, b) => (a + b))
    let total_companies = (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[1])
        .reduce((a, b) => (a + b))
    
    return total_money/total_companies
}

// // Create a legend to display information about our map
// var info = L.control({
//     position: "bottomright"
// });

// // When the layer control is added, insert a div with the class of "legend"
// info.onAdd = function () {
//     var div = L.DomUtil.create("div", "legend");
//     return div;
// };

// // // Adding tile layer
// // L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
// //     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
// //     maxZoom: 18,
// //     id: "mapbox.streets",
// //     accessToken: API_KEY
// // }).addTo(myMap);




// // Add the info legend to the map
// info.addTo(myMap);


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

        //set the initial layer
        addedLayers[0].click()
    }).then(() => {
        // Add legend (don't forget to add the CSS from index.html)
        let legend = L.control({ position: 'bottomright' })
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend')
            var limits = overlays["second_tier_company_count"].options.limits
            var colors = overlays["second_tier_company_count"].options.colors
            var labels = []
            console.log("add Legend!")

            // Add min & max
            div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
                <div class="max">' + limits[limits.length - 1] + '</div></div>'

            limits.forEach(function (limit, index) {
                labels.push('<li style="background-color: ' + colors[index] + '"></li>')
            })

            div.innerHTML += '<ul>' + labels.join('') + '</ul>'
            return div
        }
        legend.addTo(myMap)
    })

    
    


