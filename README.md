# VC-Funding-Map

## Project Overview
This project was developed to get a general idea of Venture Capital funding throughout the world, to hopefully identify some key statistics or trends involving that funding. The data visualizations included in this web application showcase broad data aggregations across 3600+ cities on every continent (except Antartica) in an effort to find general funding trends. 

The data was primarily sourced from [Kaggle.com](https://www.kaggle.com/) as a replication of [Crunchbase](https://www.crunchbase.com/) data from the years prior to 2015. This data was supplemented by geocoding location data using the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start). More details about the data are relayed in the following section.

This web application is available [here](https://frozen-dawn-61622.herokuapp.com/), hosted on Heroku as a data dashboard. Enjoy!

## Data Sources & Cleaning

The primary source of our data was the **investments_VC.csv** file available on the Kaggle website [here](https://www.kaggle.com/arindam235/startup-investments-crunchbase). This file includes all the startup names, total funding amounts, funding per round, start date, date of last funding, city, state, region, country, etc. that were used to create the data visualizations in this application. This data was cleaned from approximately 50,000 entries to about 37,000 entries by requiring valid, non-null values for the **country_code**, **city**, and **total_funding** columns. Additionally, the dates in the data set were limited to the years 2005 through the end of 2014, in order to get a more recent snapshot of VC funding throughout the world. As a side note, we did initially consider getting more recent data from Crunchbase.com, but downloading the data we wanted as a .csv file using their dashboard query tool required an "Enterprise" level account, which cost money and required a valid company and pre-defined application and use case for their data. This would be a good starting place for a more complete look at recent VC funding of startups in 2015 and after, but we could not afford that higher, "Enterprise" level of access for this basic project.

In addition to the data provided by Kaggle from Crunchbase, we needed to add a couple of columns for the geographical coordinates (Latitude and Longitude) of each city in the dataset. We aggregated the data by each city, so that the funding for each round and total funding represented the cumulative sum of all the funding for all startups in one city, and added a **company_count** column that represented the total number of distinct startups in a city. This reduced the data set to approximately 3800 cities spread throughout the world, and we then used the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start) to gather all the coordinate data (Latitude and Longitude) based on the city and country names. Aggregating the data by city in this way allowed us to plot all datapoints and analyze broad trends in the data relatively easily, without encountering major performance problems with our visualizations.

## Database Selection & Loading

The type of database selected for this project was PostgreSQL, which is a common, performant SQL dialect that interfaces well with web applications and our data table. Due to time constraints, we did not break up the cleaned data into multiple tables with foreign keys, instead opting for a more monolithic table containing all information in the database. The [SQL_Loader](./SQL_Loader/Sql_Loader.ipynb) Jupyter notebook creates the "vc_funding_db" database within Postgres, and then defines, creates, and populates the "vc_funding" table within that database. As an installation note, you (the user) needs to include a config.py file in the same directory as that notebook, that contains two variables. There needs to be a **user** variable set to your Postgres server username, and a **db_password** variable set to your Postgres server password. These variables are different for every user, so make sure to include your own authentication credentials before trying to run the [SQL_Loader](./SQL_Loader/Sql_Loader.ipynb) notebook! 

Please note that this **config.py** file will also be used when running the application, in order to connect to the database that holds the data for the application's APIs.

As a side note, the "vc_funding" table uses a composite primary key that is comprised of the (country_code, city) pairing of columns. This pair of columns is expected to be unique for all entries into the table, since the data is grouped by city, so each city and country should not have duplicate entries (it would have just been aggregated into one city in that country).

## Visualizations

### Overview

There are three visualizations in this dashboard application: a cluster map, a choropleth with world countries, and bar charts for VC funding rounds. The two geographical maps (the cluster map and choropleth map) were created with the [Leaflet](https://leafletjs.com/) framework on top of a [Mapbox](https://www.mapbox.com/) map, and the bar charts were created using the [Chart.js](https://www.chartjs.org/) framework.

### Cluster Map

The cluster map for this web application is split into four different parts, which can be selected by clicking on the different "overlays" available from the menu on the top right corner of the map, which are shown as radio buttons.

The choices for these overlays are described as follows:

#### startupCount

This value is initially selected when the cluster map loads. This layer shows circular markers that include the number of startups at a location, with the different marker colors depicting different sets of numbers. Green markers are used for values less than 10, yellow markers are used for values less than 100, and orange markers are used for values of 100 and greater. Zooming out causes the markers to group together with their neighbors, creating a cluster marker that represents a larger area on the map. Zooming in causes the markers to split apart into separate, smaller groupings of markers, enabling finer details of startup distribution in an area to be seen.

<img src="./README Images/cluster_map_startup_count.JPG">

#### startupTotalValue

This layer shows markers with circular icons whose colors represent the order of magnitude of total funding at that location (in USD), with the actual amount of total funding as that marker location displayed in text (using scientific notation, since the values get rather large) to four decimal points. The legend for the marker colors is located in the bottom right corner of the map, and uses text as well as numbers to relay the order of magnitude, since looking at a large number with an extra zero or power is not descriptive enough for our purposes. For this layer, it is important to note the differences in marker color first, since that represents different orders of magnitude, and then to look at the number value after that in order to get a good understanding of the approximate VC funding into a geographical area.

<img src="./README Images/cluster_map_total_funding.JPG">

#### startupAverageValue

This layer shows markers with circular icons whose colors represent the order of magnitude of average startup funding at that location (in USD), with the actual amount of average funding as that marker location displayed in text (using scientific notation, since the values get rather large) to four decimal points. The legend for the marker colors is located in the bottom right corner of the map, and uses text as well as numbers to relay the order of magnitude, since looking at a large number with an extra zero or power is not descriptive enough for our purposes. For this layer, it is important to note the differences in marker color first, since that represents different orders of magnitude, and then to look at the number value after that in order to get a good understanding of the approximate average VC funding per startup into a geographical area.

<img src="./README Images/cluster_map_average_funding.JPG">

#### percentageStartupCountWorldwide

This layer shows markers with green circular icons whose areas represent the "market share" of that geographical location's startup count vs. the entire count of startups worldwide, with the precise percentage (to two decimal places) displayed below the marker. As the user zooms out, smaller icons combine into larger markers with higher percentages of the world startup count, and represent larger geographical areas. The reverse is true as the user zooms in on a location - the markers split apart into different locations and give more specific information about the percentage of startups in a smaller geographical area.

<img src="./README Images/cluster_map_market_share.JPG">

### Country Choropleth

### City Funding Rounds Bar Chart

<!-- ## Result Highlights -->

## Application Startup Notes

## APIs

This web application uses two main RESTful APIs to serve JSON data from the PostgreSQL database connected to the Flask server using SQLAlchemy.

### ./samples.json

The first of these APIs is essentially a "full copy" of the database records - which is unusual for an API but was used in this case because our total (cleaned) records include fewer than 4000 rows, and the project had a high time constraints (1-week turnaround time). This API is used to serve the two geographical map visualizations on this dashboard.

This API is available at the route "domain/samples.json", where "domain" represents the server address of the website. 

### ./api/city/[city-name]

The second of these two RESTful APIs is a more traditional, dynamic API that returns all the information for a single city in the database given the city's name as a parameter in the API route.

This API is available at the route "domain/api/city/[city-name]", where "domain" represents the server address of the website and [city-name] represents the variable city name whose data will be returned by the API once the request is received by the Flask app.

## Planned Features