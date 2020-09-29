var cities = ["Beijing", "London", "Moscow", "Shanghai", "Bangalore"];
var avgEquityFunding = []; var avgDebtFunding = [];

var countryCode = ["CHN", "GBR", "RUS", "CHN", "IND"];

//Need to wait for all API requests to be submitted
//And the data arrays for each funding round to populate
//And then can load the chart!
Promise.all(cities.map((a, i) => cityDataFetch(a, i)))
    .then(values => {
        values.forEach(addChart)
    })
    .then(() => myChart())

function cityDataFetch(city, index){
    return new Promise((resolve, reject) => {
        fetch(`./api/city/${countryCode[index]}/${city}`).then(response => resolve(response.json()))
    })
}

function addChart(response) {
    avgEquityFunding.push(
        (response["seed"]
        +response["angel"]
        +response["venture"] 
        +response["round_A"]
        +response["round_B"]
        +response["round_C"]
        +response["round_D"]
        +response["round_E"]
        +response["round_F"]
        +response["round_G"]
        +response["round_H"]
        +response["private_equity"])
        /response["company_count"]
    )
    avgDebtFunding.push(
        response["debt_financing"]
        /response["company_count"]
    )
}



var ctx = document.getElementsByClassName('myChart');
var myChart = () => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cities,
            datasets: [{
                label: 'Average Equity Funding',
                data: avgEquityFunding,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            },
            {
                label: 'Average Debt Funding',
                data: avgDebtFunding,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }
    ],
        options: {
            scales: {
                offset: true,
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }})
};

