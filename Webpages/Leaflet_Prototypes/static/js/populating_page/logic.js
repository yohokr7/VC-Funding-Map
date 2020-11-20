// Creating map object
var myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 8,
    worldCopyJump: true
});

//make the layers for controlling the map
var baseLayers = {
    "Regular": L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    })
}

var overlays = {
    "startupCount": L.markerClusterGroup(),
    "startupTotalValue": L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: `<svg width="${30}" height="${30}">`+
                    `<circle cx="${15}" cy="${15}" r="${15}" stroke="black" stroke-width="1" fill=${getTotalFundingColor(getTotalFunding(cluster))} />`
                                 +`</svg>`
                    + '<b>$' + getTotalFunding(cluster).toExponential(4) + '</b>',
            iconAnchor: L.point([15, 15]),
            className: "circleIcon"
        });
    }}),
        
    "startupAverageValue": L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: `<svg width="${30}" height="${30}">` +
                    `<circle cx="${15}" cy="${15}" r="${15}" stroke="black" stroke-width="1" fill=${getAvgFundingColor(getAvgFunding(cluster))} />`
                    + `</svg>`
                    + '<b>$' + getAvgFunding(cluster).toExponential(4) + '</b>',
                iconAnchor: L.point([15, 15]),
                className: "circleIcon"
            });
        }
    }),
    "percentageStartupCountWorldwide": L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            let countPercent = getWorldCountPercent(cluster);
            let sqrtCountPercent = Math.sqrt(countPercent)
            return L.divIcon({
                html: `<svg width="${10 * sqrtCountPercent}" height="${10 * sqrtCountPercent}">` +
                    `<circle cx="${5 * sqrtCountPercent}" cy="${5 * sqrtCountPercent}" r="${5 * sqrtCountPercent}" stroke="black" stroke-width="1" fill="green" />`
                    + `</svg>`
                    + '<b>' + countPercent + '%</b>',
                iconAnchor: L.point([5 * sqrtCountPercent, 5 * sqrtCountPercent]),
                className: "circleIcon"
            });
        }
    }),
    "percentageStartupFundingWorldwide": L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            let countPercent = getWorldFundingPercent(cluster);
            let sqrtCountPercent = Math.sqrt(countPercent)
            console.log(countPercent)
            return L.divIcon({
                html: `<svg width="${10 * sqrtCountPercent}" height="${10 * sqrtCountPercent}">` +
                    `<circle cx="${5 * sqrtCountPercent}" cy="${5 * sqrtCountPercent}" r="${5 * sqrtCountPercent}" stroke="black" stroke-width="1" fill="blue" />`
                    + `</svg>`
                    + '<b>' + countPercent + '%</b>',
                iconAnchor: L.point([5 * sqrtCountPercent, 5 * sqrtCountPercent]),
                className: "circleIcon"
            });
        }
    })
}

//function to give total funding values for each cluster marker
function getTotalFunding(cluster) {
    return (cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[0])
        .reduce((a, b) => (a + b))
}

//generate array of colors for the total funding cluster markers, 
//based on orders of magnitude (base 10)
var totalFundingScale = chroma.scale(['yellow', 'red']).mode('rgb').colors(7)

//get cluster marker color based on total funding amount
function getTotalFundingColor(val) {
    let num = Math.floor((Math.log10(val))) - 5
    return totalFundingScale[num]
}

//generate array of colors for the average funding cluster markers, 
//based on orders of magnitude (base 10)
var avgFundingScale = chroma.scale(["yellow", "red"]).mode("lch").colors(5)

//get cluster marker color based on average funding amount
function getAvgFundingColor(val) {
    let num = Math.floor((Math.log10(val))) - 4
    return avgFundingScale[num]
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

//startup count worldwide percentage calculation function 
function getWorldCountPercent(cluster) {
    return (((cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[1])
        .reduce((a, b) => (a + b))) / allStartupsTotalCount * 100).toFixed(2)
}


//startup funding worldwide percentage calculation function 
function getWorldFundingPercent(cluster) {
    return (((cluster.getAllChildMarkers()).map((a) => valueLookup.get(a.getLatLng().toString())[0])
        .reduce((a, b) => (a + b))) / allStartupsTotalFunding * 100).toFixed(2)
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

L.control.layers(baseLayers, overlays).addTo(myMap)


// Add the info legend to the map
info.addTo(myMap);


var valueLookup = new Map();
var allStartupsTotalCount = 0;
var allStartupsTotalFunding = 0;

fetch("./samples.json").then(response => response.json()).then(function addResults(obj) {
    for (let item of Object.values(obj)) {
        let lat = item["Latitude"]
        let lng = item["Longitude"]
        //add company count marker numbers
        for (let i = 0; i<item["company_count"]; i++) {
            overlays["startupCount"].addLayer(L.marker([lat, lng]))
        }

        //setup markers for funding values
        overlays["startupTotalValue"].addLayer(L.marker([lat, lng]))
        //setup markers for average funding 
        overlays["startupAverageValue"].addLayer(L.marker([lat, lng]))
        //setup markers for percentage of worldwide startup count 
        //use custom divIcons to show marker circles and percentages for initial clusters/single companies
        let countPercent = (item["company_count"] / allStartupsTotalCount * 100).toFixed(2)
        let sqrtCountPercent = Math.sqrt(countPercent)
        overlays["percentageStartupCountWorldwide"].addLayer(L.marker([lat, lng], 
            {
                icon: L.divIcon({
                    html: `<svg width="${10 * sqrtCountPercent}" height="${10 * sqrtCountPercent}">` +
                        `<circle cx="${5 * sqrtCountPercent}" cy="${5 * sqrtCountPercent}" r="${5 * sqrtCountPercent}" stroke="black" stroke-width="1" fill="green" />`
                        + `</svg>`
                        + '<b>' + countPercent + '%</b>',
                    iconAnchor: L.point([5 * sqrtCountPercent, 5 * sqrtCountPercent]),
                    className: "circleIcon"
                })
            }))

        //setup markers for percentage of worldwide funding
        countPercent = (item["funding_total_usd"] / allStartupsTotalFunding * 100).toFixed(2)
        sqrtCountPercent = Math.sqrt(countPercent)
        overlays["percentageStartupFundingWorldwide"].addLayer(L.marker([lat, lng], 
            {
                icon: L.divIcon({
                    html: `<svg width="${10 * sqrtCountPercent}" height="${10 * sqrtCountPercent}">` +
                        `<circle cx="${5 * sqrtCountPercent}" cy="${5 * sqrtCountPercent}" r="${5 * sqrtCountPercent}" stroke="black" stroke-width="1" fill="blue" />`
                        + `</svg>`
                        + '<b>' + countPercent + '%</b>',
                    iconAnchor: L.point([5 * sqrtCountPercent, 5 * sqrtCountPercent]),
                    className: "circleIcon"
                })
            }))

        //add coordinates key to relate to total funding for marker, as well as the number of companies there
        valueLookup.set(L.latLng(lat, lng).toString(), [item["funding_total_usd"], item["company_count"]])

        //increase the total startup count variable, to track count of all startups combined
        allStartupsTotalCount+=item["company_count"]
        allStartupsTotalFunding += item["funding_total_usd"]
    }
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

    overlayLegendSelector.addEventListener("change", function(e) {
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
    "startupCount": () => {console.log("Startup Count Selected!")},
    "startupTotalValue": () => {
        addLegend("Total Funding ($)", ["Hundreds of Thousands (10^5)",
            "Millions (10^6)", "Tens of Millions (10^7)", "Hundreds of Millions (10^8)", "Billions (10^9)",
            "Tens of Billions (10^10)", "Hundreds of Billions (10^11)"], totalFundingScale)
    },
    "startupAverageValue": () => {
        addLegend("Average Startup Funding ($)", ["> Ten Thousand (10^4)",
            "> Hundred Thousand (10^5)", "> Million (10^6)", "> Ten Million (10^7)", "> Hundred Million (10^8)"], 
            avgFundingScale)
    },
    "percentageStartupCountWorldwide": () => {console.log("Company Count Percentage Selected!")}
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

    for (let i = 0; i<size; i++) {
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
    while(legend_el.children.length > 0) {
        legend_el.removeChild(legend_el.firstChild)
    }
}