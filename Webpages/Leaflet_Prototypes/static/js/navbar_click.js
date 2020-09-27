$ = jQuery

$(".scriptHandler").each(function() {
    $(this).click(function() {
        $("script").last().remove()
        console.log("test")
    })
})

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
    choroMap = document.createElement("script")
    choroMap.type = "text/javascript"
    choroMap.src = "static/js/logic_choroplet.js"
    document.querySelector("body").appendChild(choroMap)
})

