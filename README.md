# VC-Funding-Map

## Project Overview
This project was developed to get a general idea of Venture Capital funding throughout the world, to hopefully identify some key statistics or trends involving that funding. The data visualizations included in this web application showcase broad data aggregations across 3600+ cities on every continent (except Antartica) in an effort to find general funding trends. 

The data was primarily sourced from [Kaggle.com](https://www.kaggle.com/) as a replication of [Crunchbase](https://www.crunchbase.com/) data from the years prior to 2015. This data was supplemented by geocoding location data using the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start). More details about the data are relayed in the following section.

## Data Sources & Cleaning

The primary source of our data was the **investments_VC.csv** file available on the Kaggle website [here](https://www.kaggle.com/arindam235/startup-investments-crunchbase). This file includes all the startup names, total funding amounts, funding per round, start date, date of last funding, city, state, region, country, etc. that were used to create the data visualizations in this application. This data was cleaned from approximately 50,000 entries to about 37,000 entries by requiring valid, non-null values for the **country_code**, **city**, and **total_funding** columns. Additionally, the dates in the data set were limited to the years 2005 through the end of 2014, in order to get a more recent snapshot of VC funding throughout the world. As a side note, we did initially consider getting more recent data from Crunchbase.com, but downloading the data we wanted as a .csv file using their dashboard query tool required an "Enterprise" level account, which cost money and required a valid company and pre-defined application and use case for their data. This would be a good starting place for a more complete look at recent VC funding of startups in 2015 and after, but we could not afford that higher, "Enterprise" level of access for this basic project.

In addition to the data provided by Kaggle from Crunchbase, we needed to add a couple of columns for the geographical coordinates (Latitude and Longitude) of each city in the dataset. We aggregated the data by each city, so that the funding for each round and total funding represented the cumulative sum of all the funding for all startups in one city, and added a **company_count** column that represented the total number of distinct startups in a city. This reduced the data set to approximately 3800 cities spread throughout the world, and we then used the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/start) to gather all the coordinate data (Latitude and Longitude) based on the city and country names. Aggregating the data by city in this way allowed us to plot all datapoints and analyze broad trends in the data relatively easily, without encountering major performance problems with our visualizations.

## Database Selection & Loading

## Visualizations

### Cluster Map

### Country Choropleth

### City Funding Rounds Bar Chart

## Presentation

## Result Highlights

## Possible Issues