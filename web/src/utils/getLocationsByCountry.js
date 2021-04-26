/**
 * @file getLocationsByCountry
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import axios from 'axios';

/**
 * Get a map of country names to location objects, with locations retrieved from
 * dashboard.internetcomputer.org/api.
 * @return {Map} A map of country names to location objects.
 */
export default async function getLocationsByCountry() {
  // Future enhancement: Get the country name by latitude/longitude using an API such as:
  // http://geodb-cities-api.wirefreethought.com/docs/api/find-near-location
  const cityToCountryMap = new Map();
  cityToCountryMap.set('Antwerp', 'Belgium');
  cityToCountryMap.set('Atlanta', 'USA');
  cityToCountryMap.set('Atlanta 2', 'USA');
  cityToCountryMap.set('Allentown', 'USA');
  cityToCountryMap.set('Vancouver', 'Canada');
  cityToCountryMap.set('Brussels', 'Belgium');
  cityToCountryMap.set('Brussels 2', 'Belgium');
  cityToCountryMap.set('Bucharest', 'Romania');
  cityToCountryMap.set('Chicago', 'USA');
  cityToCountryMap.set('Chicago 2', 'USA');
  cityToCountryMap.set('Chicago 3', 'USA');
  cityToCountryMap.set('Zurich', 'Switzerland');
  cityToCountryMap.set('Dallas', 'USA');
  cityToCountryMap.set('Fremont', 'USA');
  cityToCountryMap.set('Geneva', 'Switzerland');
  cityToCountryMap.set('Geneva 2', 'Switzerland');
  cityToCountryMap.set('Houston', 'USA');
  cityToCountryMap.set('Jacksonville', 'USA');
  cityToCountryMap.set('Las Vegas', 'USA');
  cityToCountryMap.set('Munich', 'Germany');
  cityToCountryMap.set('New York', 'USA');
  cityToCountryMap.set('Orlando', 'USA');
  cityToCountryMap.set('Phoenix', 'USA');
  cityToCountryMap.set('Portland', 'USA');
  cityToCountryMap.set('Singapore', 'Singapore');
  cityToCountryMap.set('Singapore 2', 'Singapore');
  cityToCountryMap.set('Singapore 3', 'Singapore');
  cityToCountryMap.set('San Jose', 'USA');
  cityToCountryMap.set('Sterling', 'USA');
  cityToCountryMap.set('Toronto', 'Canada');
  cityToCountryMap.set('Toronto 2', 'Canada');
  cityToCountryMap.set('Tampa', 'USA');
  cityToCountryMap.set('Zurich 2', 'Switzerland');
  cityToCountryMap.set('Zurich 3', 'Switzerland');
  cityToCountryMap.set('Zurich 4', 'Switzerland');

  try {
    const url = `https://ic-api.internetcomputer.org/api/locations`;
    const res = await axios.get(url);

    // Create an array of data center locations.
    let locations = res.data.map((value) => {
      // Remove any number from end of location name (e.g., "Chicago 2" -> "Chicago").
      const city = value.name.replace(/[\d\' ']+$/, '');
      return {
        city: city,
        numNodes: parseInt(value.total_nodes)
      };
    });

    // Remove data center locations without any nodes.
    locations = locations.filter((location) => {
      return location.numNodes > 0;
    });

    // Organize the locations by country.
    const locationsByCountryMap = new Map();
    locations.forEach(location => {
      let country = cityToCountryMap.get(location.city);
      if (typeof country === 'undefined')
        country = 'Other'; // if we get this, we need to add this city to cityToCountryMap

      let locationsByCountry = locationsByCountryMap.get(country);
      if (typeof locationsByCountry === 'undefined') {
        locationsByCountry = [];
        locationsByCountryMap.set(country, locationsByCountry);
      }
      locationsByCountry.push(location);
    });

    return locationsByCountryMap;
  }
  catch {
    return null;
  }
}
