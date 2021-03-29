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
      locations: [],
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
            name: value.name, // I should add a 1 or 2 to the end of this for cities with the same name!!!
            totalNodes: value.total_nodes
          };
        });

        // Remove data center locations without any nodes.
        locations = locations.filter((location) => {
          return location.totalNodes > 0;
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
          locations: locations,
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
    const { locations, subnetArcs } = this.state;

    const OPACITY = isThemeDark ? 0.22 : 0.3;
    let showGlobe = locations.length > 0;

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
  
        labelsData={locations}
        labelColor={() => `rgba(0,0,0,0)`}
        labelText={() => ''}
        labelLabel={location => `
          <div>${location.name}</div>
          <div>${location.totalNodes} nodes</div>
        `} 
        labelDotRadius={d => 1}

        pointsData={locations}
        pointColor={() => lightOrangeOpaque}
        pointAltitude={0}
        pointRadius={0.3}
        pointsMerge={true}
      />
      </Fade>
    );
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(DfinityEarthWithSize);
