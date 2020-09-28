$ = jQuery

$(".scriptHandler").each(function() {
    $(this).click(function() {
        $("script").last().remove()
        console.log("test")
    })
})

let clusterMapEl = document.getElementById("cluster")
clusterMapEl.addEventListener("click", function loadCluster() {
    //remove current map element and replace with an empty element
    document.querySelector("body").removeChild(document.querySelector("#map"));
    var newMap = document.createElement("div")
    newMap.id = "map"
    document.querySelector("body").appendChild(newMap)

    // To Populate Script
    clusterMap = document.createElement("script")
    clusterMap.type = "text/javascript"
    clusterMap.src = "static/js/logic.js"
    document.querySelector("body").appendChild(clusterMap)
})


let choroplethMapEl = document.getElementById("choro")
choroplethMapEl.addEventListener("click", function loadChoropleth() {
    //remove current map element and replace with an empty element
    document.querySelector("body").removeChild(document.querySelector("#map"));
    var newMap = document.createElement("div")
    newMap.id = "map"
    document.querySelector("body").appendChild(newMap)

    // To Populate Script
    choroMap = document.createElement("script")
    choroMap.type = "text/javascript"
    choroMap.src = "static/js/logic_choropleth.js"
    document.querySelector("body").appendChild(choroMap)
})

