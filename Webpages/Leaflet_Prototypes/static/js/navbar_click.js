$ = jQuery

$(".scriptHandler").each(function() {
    $(this).click(function() {
        $("script").last().remove()
    })
})

$(".dropdownMapButton").each(function() {
    $(this).click(function() {
        //remove current map element and replace with an empty element
        document.querySelector("body").removeChild(document.querySelector("#map"));
        var newMap = document.createElement("div")
        newMap.id = "map"
        document.querySelector("body").appendChild(newMap)
    })
})

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


// Script Appending

let clusterMapEl = document.getElementById("cluster")
clusterMapEl.addEventListener("click", function loadCluster() {
    // To Populate Script
    clusterMap = document.createElement("script")
    clusterMap.type = "text/javascript"
    clusterMap.src = "static/js/logic.js"
    document.querySelector("body").appendChild(clusterMap)
})


let choroplethMapEl = document.getElementById("choro")
choroplethMapEl.addEventListener("click", function loadChoropleth() {
    // To Populate Script
    choroMap = document.createElement("script")
    choroMap.type = "text/javascript"
    choroMap.src = "static/js/logic_choropleth.js"
    document.querySelector("body").appendChild(choroMap)
})

let chartingMapEl = document.getElementById("charting")
chartingMapEl.addEventListener("click", function loadChart() {
    // To Populate Script
    chartScript = document.createElement("script")
    chartScript.type = "text/javascript"
    chartScript.src = "static/js/charting.js"
    document.querySelector("body").appendChild(chartScript)
})