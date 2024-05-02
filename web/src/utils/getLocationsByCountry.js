/**
 * @file getLocationsByCountry
 * @copyright Copyright (c) 2018-2023 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import axios from 'axios';

/**
 * Get a map of country names to location objects, with locations retrieved from
 * ic-api.internetcomputer.org/api.
 * @return {Map} A map of country names to location objects.
 */
export default async function getLocationsByCountry() {
  // Future enhancement: Get the country name by latitude/longitude using an API such as:
  // http://geodb-cities-api.wirefreethought.com/docs/api/find-near-location
  const cityToCountryMap = new Map();
  cityToCountryMap.set('Alabma', 'USA'); // sic
  cityToCountryMap.set('Allentown', 'USA');
  cityToCountryMap.set('Antwerp', 'Belgium');
  cityToCountryMap.set('Atlanta', 'USA');
  cityToCountryMap.set('Barreiro', 'Portugal');
  cityToCountryMap.set('Bogota', 'Colombia');
  cityToCountryMap.set('Boston', 'USA');
  cityToCountryMap.set('Brussels', 'Belgium');
  cityToCountryMap.set('Bucharest', 'Romania');
  cityToCountryMap.set('CABA', 'Argentina');
  cityToCountryMap.set('California', 'USA');
  cityToCountryMap.set('Cape Town', 'South Africa');
  cityToCountryMap.set('Chicago', 'USA');
  cityToCountryMap.set('Colombo', 'Sri Lanka');
  cityToCountryMap.set('Dallas', 'USA');
  cityToCountryMap.set('Frankfurt', 'Germany');
  cityToCountryMap.set('Fremont', 'USA');
  cityToCountryMap.set('Gauteng', 'South Africa');
  cityToCountryMap.set('Geneva', 'Switzerland');
  cityToCountryMap.set('Greater Noida', 'India');  
  cityToCountryMap.set('HongKong', 'China'); // sic
  cityToCountryMap.set('Houston', 'USA');
  cityToCountryMap.set('Jacksonville', 'USA');
  cityToCountryMap.set('Las Vegas', 'USA');
  cityToCountryMap.set('Lisbon', 'Portugal');
  cityToCountryMap.set('Ljubljana', 'Slovenia');
  cityToCountryMap.set('London', 'United Kingdom');
  cityToCountryMap.set('Madrid', 'Spain');
  cityToCountryMap.set('Maribor', 'Slovenia');
  cityToCountryMap.set('Marseille', 'France');
  cityToCountryMap.set('Melbourne', 'Australia');
  cityToCountryMap.set('Miami', 'USA');
  cityToCountryMap.set('Munich', 'Germany');
  cityToCountryMap.set('Navi Mumbai', 'India');
  cityToCountryMap.set('New Delhi', 'India');
  cityToCountryMap.set('New York', 'USA');
  cityToCountryMap.set('Normandie', 'France');
  cityToCountryMap.set('Orlando', 'USA');
  cityToCountryMap.set('Panama City', 'Panama');
  cityToCountryMap.set('Panvel', 'India');
  cityToCountryMap.set('Paris', 'France');
  cityToCountryMap.set('Phoenix', 'USA');
  cityToCountryMap.set('Portland', 'USA');
  cityToCountryMap.set('Praha', 'Czech Republic');
  cityToCountryMap.set('Quebec', 'Canada');
  cityToCountryMap.set('Quebec l', 'Canada'); // sic
  cityToCountryMap.set('Queensland', 'Australia');
  cityToCountryMap.set('Riga', 'Latvia');
  cityToCountryMap.set('San Jose', 'USA');
  cityToCountryMap.set('San José', 'Costa Rica');
  cityToCountryMap.set('Seoul', 'South Korea');
  cityToCountryMap.set('Siauliai', 'Lithuania');
  cityToCountryMap.set('Singapore', 'Singapore');
  cityToCountryMap.set('Sterling', 'USA');
  cityToCountryMap.set('South Moravian Region', 'Czech Republic');
  cityToCountryMap.set('Stockholm', 'Sweden');
  cityToCountryMap.set('Tallinn', 'Estonia');
  cityToCountryMap.set('Tampa', 'USA');
  cityToCountryMap.set('Tbilisi', 'Georgia');
  cityToCountryMap.set('Tel Aviv', 'Israel');
  cityToCountryMap.set('Tokyo', 'Japan');
  cityToCountryMap.set('Toronto', 'Canada');
  cityToCountryMap.set('Utah', 'USA');
  cityToCountryMap.set('Vancouver', 'Canada');
  cityToCountryMap.set('Vilnius', 'Lithuania');
  cityToCountryMap.set('Warszawa', 'Poland');
  cityToCountryMap.set('Zagreb', 'Croatia');
  cityToCountryMap.set('Zurich', 'Switzerland');

  try {
    const url = 'https://ic-api.internetcomputer.org/api/v3/data-centers';
    const res = await axios.get(url);

    // Create an array of data center locations.
    let locations = res.data.data_centers.map((value) => {
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
