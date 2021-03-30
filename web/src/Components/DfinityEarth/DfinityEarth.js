/**
 * @file DfinityEarth
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import Globe from 'react-globe.gl';
import Fade from 'react-reveal/Fade';
import { SizeMe } from 'react-sizeme';

/**
 * This component is a wrapper that provides width and height props to DfinityEarth.
 */
class DfinityEarthWithSize extends Component {
  static propTypes = {
    /**
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired,
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { isThemeDark, theme } = this.props;
    
    return (
      <SizeMe>{({ size }) =>
        <DfinityEarth
          height={(typeof size.width !== 'undefined') ? size.width : 0}
          isThemeDark={isThemeDark}
          theme={theme}
          width={(typeof size.width !== 'undefined') ? size.width : 0}
        />
      }
      </SizeMe> 
    );
  }
}

/**
 * This component displays DFINITY Earth, a visualization of Internet Computer data centers on a 3D
 * globe, using data retrieved from dashboard.internetcomputer.org/api.
 */
class DfinityEarth extends Component { 
  static propTypes = {
    /**
     * The height of the component.
     */
    height: PropTypes.number.isRequired,
    /**
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired,
    /**
     * The width of the component.
     */
    width: PropTypes.number.isRequired
  };
  
  /**
   * Create a DfinityEarth object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.globeEl = null;

    this.state = {
      cities: [],
      subnetArcs: [],
      error: false
    };
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    const MAP_CENTER = { lat: 23.5, lng: -84.3880, altitude: 2.1 }; // Atlanta longitude
    if (this.globeEl != null) {
      this.globeEl.controls().autoRotate = true;
      this.globeEl.controls().autoRotateSpeed = 0.05;
      this.globeEl.pointOfView(MAP_CENTER, 0);
    }

    const url = `https://dashboard.internetcomputer.org/api/locations`;
    axios.get(url)
      .then(res => {
        // Create an array of data center locations.
        let locations = res.data.map((value) => {
          return {
            key: value.key,
            lat: value.latitude,
            lng: value.longitude,
            name: value.name,
            totalNodes: value.total_nodes
          };
        });

        // Remove data center locations without any nodes.
        locations = locations.filter((location) => {
          return location.totalNodes > 0;
        });

        // Organize the locations by city name.
        const locationsByNameMap = new Map();
        locations.forEach((location) => {
          let locationsByName = locationsByNameMap.get(location.name);
          if (typeof locationsByName === 'undefined') {
            locationsByName = [];
            locationsByNameMap.set(location.name, locationsByName);
          }
          locationsByName.push(location);
        });

        // Create an array of cities and their data centers. Consider locations within 100km of each
        // other with the same name to be the same city (using the lat/lng of the first location).
        const cities = [];
        locationsByNameMap.forEach((locationsByName) => {
          let citiesWithSameName = [];
          locationsByName.forEach((location) => {
            // Search for existing matching city object.
            let city = citiesWithSameName.find(city =>
              this.calculateDistance(location.lat, location.lng, city.lat, city.lng) <= 100);

            // If no matching city was found, create a new city object and add it to
            // citiesWithSameName[].
            if (typeof city === 'undefined') {
              city = {
                name: location.name,
                lat: location.lat,
                lng: location.lng,
                dataCenters: []
              };
              citiesWithSameName.push(city);
            }

            // Add the data center to the city.
            city.dataCenters.push({key: location.key, totalNodes: location.totalNodes});
          });

          // Append citiesWithSameName[] to cities.
          cities.push(...citiesWithSameName);
        });


        // Create a random set of unique subnets.
        const nodesPerSubnet = 7; // use a Constants value for this!!!
        const numberOfSubnets = 8; // consider using /api/metrics/ic-subnet-total!!!
        const subnets = new Set();
        let i = 0;
        while (subnets.size !== numberOfSubnets) {
          let nodes = Array(locations.length).fill().map((_, index) => index);
          nodes.sort(() => Math.random() - 0.5);
          nodes = nodes.slice(0, nodesPerSubnet);
          nodes.sort((x, y) => (x - y));
          subnets.add(nodes);
          // Trivial check for infinite loop.
          if (i++ > subnets * 10)
            break;
        }

        // Create an array of subnet arcs, connecting all nodes within each subnet. If two nodes in
        // a subnet have the same lat/lng (two separate data centers, but at the same lat/lng), they
        // are not connected by an arc.
        let subnetIndex = 0;
        const subnetArcs = [];
        subnets.forEach((subnet) => {
          for (let i = 0; i < subnet.length; i++) {
            for (let j = i + 1; j < subnet.length; j++) {
              if (locations[subnet[i]].lat !== locations[subnet[j]].lat &&
                locations[subnet[i]].lng !== locations[subnet[j]].lng)
              {
                subnetArcs.push({
                  subnetIndex: subnetIndex,
                  startLat: locations[subnet[i]].lat,
                  startLng: locations[subnet[i]].lng,
                  endLat: locations[subnet[j]].lat,
                  endLng: locations[subnet[j]].lng,
                  startName: locations[subnet[i]].name,
                  endName: locations[subnet[j]].name
                });
              }
            }
          }
          subnetIndex++;
        });

        this.setState({
          cities: cities,
          subnetArcs: subnetArcs
        });
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { height, isThemeDark, theme, width } = this.props;
    const { cities, subnetArcs } = this.state;

    const OPACITY = isThemeDark ? 0.22 : 0.3;
    let showGlobe = cities.length > 0;

    // These colors come from the DFINITY logo.
    const purple = `rgba(99, 38, 132, ${OPACITY})`;
    const pink = `rgba(237, 30, 121, ${OPACITY})`;
    const darkOrange = `rgba(241, 90, 36, ${OPACITY})`;
    const lightOrange = `rgba(251, 176, 59, ${OPACITY})`;
    const blue = `rgba(41, 171, 226, ${OPACITY})`;
    const lightOrangeOpaque = `rgb(251, 176, 59)`;
    let arcColorPairs = [
      [blue, blue],
      [purple, pink],
      [darkOrange, lightOrange],
      [blue, blue],
      [pink, purple],
      [lightOrange, darkOrange]
    ];

    // For the cities on the Globe, we use large, transparent label points for the tooltips, so that
    // the user can hover near the city and see the tooltip. We then use smaller, colored points to
    // mark the city locations. By doing this, the city dots can be small, but the tooltips work
    // even if the user is hovering in the general area.
    // TODO: Adjust the size of the "large, transparent label points" based on map zoom, so that
    // they get smaller as you zoom in. This way, tooltips will work for two points that are very
    // close together if you zoom in enough. Ideally, we would also merge such tooltips when zoomed
    // out. It would also make sense to adjust the size of the "smaller, colored points" based on
    // map zoom!!!
    return (
      <Fade
        timeout={1000}
        when={showGlobe}
      >
      <Globe
        ref={(el) => { this.globeEl = el }}

        globeImageUrl={theme.uriGlobeEarthImage}
        showGlobe={showGlobe}
        showAtmosphere={showGlobe}
        animateIn={false}
        backgroundColor='rgba(0,0,0,0)'
        width={width}
        height={height}

        arcsData={subnetArcs}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={1}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={4000}
        arcColor={(subnetArc) => arcColorPairs[subnetArc.subnetIndex % arcColorPairs.length]}
        arcsTransitionDuration={0}
  
        labelsData={cities}
        labelColor={() => `rgba(0,0,0,0)`}
        labelText={() => ''}
        labelLabel={city => {
          let labelHtml = `<div>${city.name}</div>`;
          // If there is more than one data center in a city, append the key to each nodes line.
          if (city.dataCenters.length === 1) {
            labelHtml +=
              `<div>${city.dataCenters[0].totalNodes} node${city.dataCenters[0].totalNodes > 1 ? 's' : ''}</div>`;
          }
          else {
            city.dataCenters.forEach((dataCenter) => {
              labelHtml +=
                `<div>${dataCenter.totalNodes} node${dataCenter.totalNodes > 1 ? 's' : ''} (${dataCenter.key})</div>`;
            });
          }
          return labelHtml;
        }} 
        labelDotRadius={d => 1}

        pointsData={cities}
        pointColor={() => lightOrangeOpaque}
        pointAltitude={0}
        pointRadius={0.3}
        pointsMerge={true}
      />
      </Fade>
    );
  }

  /**
   * Calculates the distance in km between two points using the Haversine formula. 
   * @param {Number} lat1 Latitude of the first point.
   * @param {Number} lng1 Longitude of the first point.
   * @param {Number} lat2 Latitude of the second point.
   * @param {Number} lng2 Longitude of the second point.
   * @return {Number} The distance in km between the two points.
   * @private
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    if (lat1 === lat2 && lng1 === lng2) {
      return 0;
    }
    const dLat = this.deg2rad(lat2-lat1);
    const dLon = this.deg2rad(lng2-lng1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const earthRadiusKm = 6371;
    const distanceKm = earthRadiusKm * c;
    return distanceKm;
  }
  
  /**
   * Converts degrees to radians. 
   * @param {Number} deg The angle in degrees.
   * @return {Number} The angle in radians.
   * @private
   */
  deg2rad(deg) {
    return deg * Math.PI / 180;
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(DfinityEarthWithSize);
