/**
 * @file DfinityEarth
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import Globe from 'react-globe.gl';
import Fade from 'react-reveal/Fade';
import { SizeMe } from 'react-sizeme';
import { throttle } from 'throttle-debounce';
import EarthTooltip from '../EarthTooltip/EarthTooltip';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';
import dfinityEarthDay from './dfinity-earth-day.jpg'
import dfinityEarthNight from './dfinity-earth-night.jpg'

/**
 * This component is a wrapper that provides width and height props to DfinityEarth.
 */
class DfinityEarthWithSize extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * True if the simulation is on, otherwise false.
     */    
    isSimulationOn: PropTypes.bool.isRequired,
    /**
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, isSimulationOn, isThemeDark, theme } = this.props;
    
    return (
      <SizeMe>{({ size }) => {
        // For breakpoints MD and up, we have a "panel" on the right containing cards. On smaller
        // screen sizes, these cards go under the globe.
        const width = (typeof size.width !== 'undefined') ? size.width : 0;
        let height;
        if (breakpoint === Breakpoints.XL ||
          breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) {
          height = (width !== 0) ?
            width -
              (Constants.DRAWER_WIDTH + Constants.DATA_CENTERS_PAGE_RIGHT_PANEL_WIDTH_MD_AND_UP) :
            0;
        }
        else
          height = width;
        return (
          <DfinityEarth
            breakpoint={breakpoint}
            height={height}
            isSimulationOn={isSimulationOn}
            isThemeDark={isThemeDark}
            theme={theme}
            width={width}
          />);
      }}
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
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The height of the component.
     */
    height: PropTypes.number.isRequired,
    /**
     * True if the simulation is on, otherwise false.
     */    
    isSimulationOn: PropTypes.bool.isRequired,
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
    this.tooltipInterval = null;

    // Bind to make 'this' work in callbacks.
    this.handleZoom = this.handleZoom.bind(this);

    // Throttle the calls to handleZoom() so that we're not constantly changing the pointRadius. A
    // delay of 400ms was chosen so that performance would not be significantly impacted (100ms
    // leads to bad performance), but the pointRadius scaling is noticable with this delay. We could
    // increase this delay more to improve zoom performance.
    this.throttledHandleZoom = throttle(400, true, this.handleZoom);

    this.state = {
      cities: [],
      subnetArcs: [],
      zoomFactor: 1,
      tooltipCity: null,
      error: false
    };
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    if (this.globeEl !== null) {
      // Do not rotate the globe, since it causes onZoom to be triggered constantly, it makes
      // tooltip selection difficult when zoomed in, and it does not add much to the user
      // experience.
      //this.globeEl.controls().autoRotate = true;
      //this.globeEl.controls().autoRotateSpeed = 0.005;
      this.globeEl.pointOfView(Constants.DFINITY_EARTH_MAP_CENTER, 0);

      // Reset zoomFactor to 1, since calling globeEl.pointOfView() does not trigger a call to
      // onZoom.
      this.setState({
        zoomFactor: 1
      });
    }

    const url = `https://dashboard.internetcomputer.org/api/locations`;
    axios.get(url)
      .then(res => {
        // Create an array of data center locations.
        let locations = res.data.map((value) => {
          // Remove any number from end of location name (e.g., "Chicago 2" -> "Chicago").
          const city = value.name.replace(/[\d\' ']+$/, '');
          return {
            key: value.key,
            lat: value.latitude,
            lng: value.longitude,
            city: city,
            numNodes: parseInt(value.total_nodes)
          };
        });

        // Remove data center locations without any nodes.
        locations = locations.filter((location) => {
          return location.numNodes > 0;
        });

        // Organize the locations by city name.
        const locationsByCityMap = new Map();
        locations.forEach((location) => {
          let locationsByCity = locationsByCityMap.get(location.city);
          if (typeof locationsByCity === 'undefined') {
            locationsByCity = [];
            locationsByCityMap.set(location.city, locationsByCity);
          }
          locationsByCity.push(location);
        });

        // Create an array of cities and their data centers. Consider locations within 100km of each
        // other with the same city name to be the same city (using the lat/lng of the first
        // location).
        const cities = [];
        locationsByCityMap.forEach((locationsByCity) => {
          let citiesWithSameName = [];
          locationsByCity.forEach((location) => {
            // Search for existing matching city object.
            let city = citiesWithSameName.find(city =>
              this.calculateDistance(location.lat, location.lng, city.lat, city.lng) <= 100);

            // If no matching city was found, create a new city object and add it to
            // citiesWithSameName[].
            if (typeof city === 'undefined') {
              city = {
                name: location.city,
                lat: location.lat,
                lng: location.lng,
                dataCenters: []
              };
              citiesWithSameName.push(city);
            }

            // Add the data center to the city.
            city.dataCenters.push({key: location.key, numNodes: location.numNodes});
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
                  arcDashInitialGap: Math.random()
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
   * Invoked by React immediately before a component is unmounted and destroyed.
   * @public
   */
  componentWillUnmount() {
    // Clear tooltipInterval if it was not already cleared.
    if (this.tooltipInterval !== null) {
      clearInterval(this.tooltipInterval);
      this.tooltipInterval = null;
    }
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const {
      breakpoint,
      height,
      isSimulationOn,
      isThemeDark,
      theme,
      width
    } = this.props;
    const {
      cities,
      subnetArcs,
      zoomFactor
    } = this.state;
    let { tooltipCity } = this.state;

    const arcOpacity = isThemeDark ? 0.22 : 0.3;
    const showGlobe = cities.length > 0;

    // These colors come from the DFINITY logo.
    const purple = `rgba(99, 38, 132, ${arcOpacity})`;
    const pink = `rgba(237, 30, 121, ${arcOpacity})`;
    const darkOrange = `rgba(241, 90, 36, ${arcOpacity})`;
    const lightOrange = `rgba(251, 176, 59, ${arcOpacity})`;
    const blue = `rgba(41, 171, 226, ${arcOpacity})`;
    let arcColorPairs = [
      [blue, blue],
      [purple, pink],
      [darkOrange, lightOrange],
      [blue, blue],
      [pink, purple],
      [lightOrange, darkOrange]
    ];

    // If the tooltip is active, calculate its screen coordinates.
    let tooltipX;
    let tooltipY;
    if (tooltipCity !== null && this.globeEl !== null) {
      const coords =
        this.globeEl.getScreenCoords(tooltipCity.lat, tooltipCity.lng, tooltipCity.alt);
      tooltipX = coords.x;
      tooltipY = coords.y;
    }
    else {
      tooltipCity = null;
      tooltipX = 0;
      tooltipY = 0;
    }

    // For the cities on the Globe, we use large, transparent label points for the tooltips, so that
    // the user can hover near the city and see the tooltip. We then use smaller, colored points to
    // mark the city locations. By doing this, the city dots can be small, but the tooltips work
    // even if the user is hovering in the general area.
    return (
      <Fragment>
        <EarthTooltip
          breakpoint={breakpoint}
          city={tooltipCity}
          width={width}
          height={height}
          x={tooltipX}
          y={tooltipY}
        />
        <Fade
          timeout={1000}
          when={showGlobe}
        >
          <Globe
            ref={(el) => { this.globeEl = el }}

            globeImageUrl={isThemeDark ? dfinityEarthNight : dfinityEarthDay}
            showGlobe={showGlobe}
            showAtmosphere={isThemeDark ? showGlobe : false}
            atmosphereColor={theme.colorDataCentersGlobeAtmosphere}
            atmosphereAltitude={0.16}
            onGlobeReady={() => {
              if (this.globeEl !== null)
                this.globeEl.controls().maxDistance = 300;
            }}
            animateIn={false}
            backgroundColor='rgba(0,0,0,0)'
            width={width}
            height={height}
            onZoom={this.throttledHandleZoom}
            pointerEventsFilter={obj => {
              // Filter out pointer events for arcs and points so that city labels receive all pointer
              // events when within the labelDotRadius. 
              return (
                !(typeof obj.parent !== 'undefined' && obj.parent.__globeObjType === 'arc') && // not arc
                obj.__globeObjType !== 'points'); // not point
            }}

            arcsData={isSimulationOn ? subnetArcs : []}
            arcStroke={0.5}
            arcDashLength={0.4}
            arcDashGap={1}
            arcDashInitialGap={subnetArc => subnetArc.arcDashInitialGap}
            arcDashAnimateTime={4000}
            arcColor={subnetArc => arcColorPairs[subnetArc.subnetIndex % arcColorPairs.length]}
            arcsTransitionDuration={0}
      
            labelsData={cities}
            labelColor={() => `rgba(0,0,0,0)`}
            labelText={() => ''}
            // Unfortunately, labelDotRadius cannot be changed dynamically at this time. Ideally, we
            // would scale it with zoomFactor as we do for pointRadius, so that the radius would
            // become more precise when zoomed in, allowing for easier hover selection of two cities
            // that are close together (e.g., Fremont and San Jose). As more close-together cities are
            // added, this will become more of an issue.
            // Tried setting labelDotRadius to 0.4 so that Fremont and San Jose could be
            // distinguished from each other, but this setting was not large enough for touch
            // devices, so setting this back to 1 for now.
            labelDotRadius={1}
            onLabelHover={city => {
              if (city !== null) {
                // Set tooltipCity to turn on the tooltip.
                this.setState({
                  tooltipCity: city
                });

                // While the tooltip is active, force the component to re-render every 250ms so that
                // the tooltip moves smoothly along with the rotating globe. While we no longer
                // auto-rotate the globe, it could still be moving from user interaction, so keep
                // this in at an interval of 500ms (was 250ms).
                if (this.tooltipInterval === null)
                  this.tooltipInterval = setInterval(() => this.forceUpdate(), 500);
              }
              else {
                // Stop forcing the component to periodically re-render.
                if (this.tooltipInterval !== null) {
                  clearInterval(this.tooltipInterval);
                  this.tooltipInterval = null;
                }

                // Clear tooltipCity to turn off the tooltip.
                this.setState({
                  tooltipCity: null
                });
              }
            }}

            pointsData={cities}
            pointLabel={''}
            pointColor={() => theme.colorDataCentersGlobePoint}
            pointAltitude={0.015}
            pointRadius={0.5 * zoomFactor}
            pointsMerge={true} // setting to false causes exceptions in three-globe.module.js
          />
        </Fade>
      </Fragment>
    );
  }

  /**
   * Set the zoomFactor based on the current altitude. The zoomFactor is used to scale pointRadius,
   * so that city points appear as the same size to the user regardless of zoom. Without this
   * scaling, the city points get very large when zoomed in.
   * @param {Object} pov GeoCoords object containing the lat, lng, and altitude of the camera point
   * of view.
   * @private
   */
  handleZoom(pov) {
    this.setState({
      zoomFactor: Math.min(pov.altitude / Constants.DFINITY_EARTH_MAP_CENTER.altitude, 2)
    });
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
