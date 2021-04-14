/**
 * @file CountriesTable
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfoTable from '../InfoTable/InfoTable';
import Constants from '../../constants';
import getLocationsByCountry from '../../utils/getLocationsByCountry';

/**
 * This component displays a sorted table of countries by number of data centers, with data
 * retrieved from dashboard.internetcomputer.org/api.
 */
 class CountriesTable extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string
  };

  /**
   * Create a CountriesTable object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);

    this.state = {
      locationsByCountryMap: null,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {   
    this.getLocationsByCountry();
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, className } = this.props;
    
    return (
      <InfoTable
        breakpoint={breakpoint}
        className={className}
        headerRow={[
          {value: 'Country', isAltColor: true, isRightAligned: false},
          {value: 'DCs', isAltColor: false, isRightAligned: true},
          {value: 'Nodes', isAltColor: false, isRightAligned: true}
        ]}
        getBodyRows={this.getBodyRows}
      />
    );
  }

  /**
   * Return an array of objects that describe the body rows, where each object contains:
   *  mapKey: A unique key that identifies the row.
   *  cells: An array of objects that describe the cells of the row, where each object contains:
   *    value: String containing the value of the cell.
   *    isAltColor: Use the alternate color for the text of the cell.
   *    isRightAligned: True to right align the table cell content.
   * @return {Array} An array of objects that describe the body rows.
   * @protected
   */
  getBodyRows() {
    const { error, locationsByCountryMap } = this.state;

    if (error >= Constants.NETWORK_ERROR_THRESHOLD) {
      return [{
        mapKey: 0,
        cells: [{value: 'Network error', isAltColor: false, isRightAligned: false}]
      }];
    }
    else if (locationsByCountryMap === null || locationsByCountryMap.size === 0) {
      return [{
        mapKey: 0,
        cells: [{value: 'Loading...', isAltColor: false, isRightAligned: false}]
      }];
    }
    else {
      let bodyRows = Array.from(locationsByCountryMap, ([country, locations]) => {
        const numDataCenters = locations.length;
        const numNodes = locations.map(location => location.numNodes).reduce((accumulator, currentValue) => accumulator + currentValue);
        return {
          mapKey: country,
          cells: [
            {value: country, isAltColor: true, isRightAligned: false},
            {value: numDataCenters.toLocaleString(), isAltColor: false, isRightAligned: true},
            {value: numNodes.toLocaleString(), isAltColor: false, isRightAligned: true}
          ]
        };
      });

      // Sort by descending number of nodes.
      bodyRows.sort((x, y) => (y.cells[2].value - x.cells[2].value));

      return bodyRows;
    }
  }

  /**
   * Get the locations organized by country name.
   * @private
   */
  getLocationsByCountry() {
    getLocationsByCountry()
      .then(res => {
        this.setState({
          locationsByCountryMap: res,
          error: 0
        });
      })
      .catch(() => {
        this.setState(prevState => ({
          error: prevState.error + 1
        }));
      });
  }
}

export default CountriesTable;
