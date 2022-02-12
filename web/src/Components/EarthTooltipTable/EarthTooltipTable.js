/**
 * @file EarthTooltipTable
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InfoTable, { InfoTableTextColor } from '../InfoTable/InfoTable';

/**
 * This component displays a table of data centers for a city, intended for use with the
 * EarthTooltip component.
 */
 class EarthTooltipTable extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The city, with object members:
     *  name (String): The name of the city.
     *  lat (Number): The latitude of the city.
     *  lng (Number): The longitude of the city.
     *  dataCenters: Array of data centers objects, with object members:
     *    name (String): The name of the data center (a.k.a., node operator).
     *    numNodes (Number): The number of nodes in the data center.
    */
    city: PropTypes.object.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string
  };

  /**
   * Create an EarthTooltipTable object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, city, className } = this.props;
    
    return (
      <InfoTable
        breakpoint={breakpoint}
        className={className}
        headerRow={[
          {value: 'Data Center', color: InfoTableTextColor.LINK, isRightAligned: false},
          {value: 'Nodes', isRightAligned: true}
        ]}
        getBodyRows={this.getBodyRows}
        useSmallFontForXS={true}
        title={city.name}
      />
    );
  }

  /**
   * Return an array of objects that describe the body rows, where each object contains:
   *  mapKey: A unique key that identifies the row.
   *  cells: An array of objects that describe the cells of the row, where each object contains:
   *    value: String containing the value of the cell.
   *    color: Use the specified InfoTableTextColor for the text of the cell, or undefined to use
   *      the default color.
   *    isRightAligned: True to right align the table cell content.
   * @return {Array} An array of objects that describe the body rows.
   * @protected
   */
  getBodyRows() {
    const { city } = this.props;
    let bodyRows = city.dataCenters.map((dataCenter, index) => {
      return {
        mapKey: index,
        cells: [
          {value: dataCenter.name, color: InfoTableTextColor.LINK, isRightAligned: false},
          {value: dataCenter.numNodes.toLocaleString(), isRightAligned: true}
        ]
      };
    });

    // Sort by descending number of nodes.
    bodyRows.sort((x, y) => (y.cells[1].value - x.cells[1].value));

    return bodyRows;
  }
}

export default EarthTooltipTable;
