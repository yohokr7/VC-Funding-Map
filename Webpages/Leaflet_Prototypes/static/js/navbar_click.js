$ = jQuery

// Script Removal
$(".scriptHandler").each(function() {
    $(this).click(function() {
        $("script").last().remove()
    })
})

// Appending Body for Maps
$(".dropdownMapButton").each(function() {
    $(this).click(function() {
        //remove current map element and replace with an empty element
        document.querySelector("body").removeChild(document.querySelector("#map"));
        var newMap = document.createElement("div")
        newMap.id = "map"
        document.querySelector("body").appendChild(newMap)
    })
})

// Appending Body for Maps
$(".dropdownChartButton").each(function() {
    $(this).click(function() {
        //remove current map element and replace with an empty element
        document.querySelector("body").removeChild(document.querySelector("#map"));
        var newMap = document.createElement("canvas")
        newMap.id = "map"
        newMap.classList.add("myChart")
        newMap.width="400" 
        newMap.height="200"
        document.querySelector("body").appendChild(newMap)
    })
})


// Script Appending For Mapping
let clusterMapEl = document.getElementById("cluster")
clusterMapEl.addEventListener("click", function loadCluster() {
    // To Populate Script
    clusterMap = document.createElement("script")
    clusterMap.type = "text/javascript"
    clusterMap.src = "static/js/populating_page/logic.js"
    document.querySelector("body").appendChild(clusterMap)
})


let choroplethMapEl = document.getElementById("choro")
choroplethMapEl.addEventListener("click", function loadChoropleth() {
    // To Populate Script
    choroMap = document.createElement("script")
    choroMap.type = "text/javascript"
    choroMap.src = "static/js/populating_page/logic_choropleth.js"
    document.querySelector("body").appendChild(choroMap)
})


// Script Appending For Charting
let date = Date.now().toString()

let chartingUSEl = document.getElementById("chartingUSAll")
chartingUSEl.addEventListener("click", function loadChart() {
    // To Populate Script
    chartUSScript = document.createElement("script")
    chartUSScript.type = "text/javascript"
    chartUSScript.src = "static/js/populating_page/charting_US_all.js?t=" + date
    document.querySelector("body").appendChild(chartUSScript)
})

let chartingGlobalEl = document.getElementById("chartingGlobalAll")
chartingGlobalEl.addEventListener("click", function loadChart() {
    // To Populate Script
    chartGlobalScript = document.createElement("script")
    chartGlobalScript.type = "text/javascript"
    chartGlobalScript.src = "static/js/populating_page/charting_global_all.js?t=" + date
    document.querySelector("body").appendChild(chartGlobalScript)
})

let chartingUSAvgEl = document.getElementById("chartingUSAvg")
chartingUSAvgEl.addEventListener("click", function loadChart() {
    // To Populate Script
    chartUSAvgScript = document.createElement("script")
    chartUSAvgScript.type = "text/javascript"
    chartUSAvgScript.src = "static/js/populating_page/charting_US_avg.js?t=" + date
    document.querySelector("body").appendChild(chartUSAvgScript)
})

let chartingGlobalAvgEl = document.getElementById("chartingGlobalAvg")
chartingGlobalAvgEl.addEventListener("click", function loadChart() {
    // To Populate Script
    chartGlobalAvgScript = document.createElement("script")
    chartGlobalAvgScript.type = "text/javascript"
    chartGlobalAvgScript.src = "static/js/populating_page/charting_global_avg.js?t=" + date
    document.querySelector("body").appendChild(chartGlobalAvgScript)
})