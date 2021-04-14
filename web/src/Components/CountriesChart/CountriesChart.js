/**
 * @file CountriesChart
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import PieChart from '../PieChart/PieChart';
import getLocationsByCountry from '../../utils/getLocationsByCountry';

/**
 * This component displays a pie chart showing the number of data centers per country.
 */
class CountriesChart extends PieChart { 
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string,
    /**
     * The height of the chart (not including the title).
     */
    chartHeight: PropTypes.number.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };
  
  /**
   * Create a CountriesChart object.
   * @constructor
   */
  constructor(props) {
    super(props);

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
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    const { error } = this.state;
    let title = 'Data Centers By Country';
    if (error)
      title += ' - Network Error'
    return title;
  }

  /**
   * Return an array of objects that describe the chart data, where each object contains:
   *  fill: Fill color for the cell.
   *  mapKey: A unique key that identifies the cell.
   *  name: String containing the name of the cell.
   *  value: Number The numeric value of the cell.
   * @return {Array} An array of objects that describe the chart data.
   * @protected
   */
  getData() {
    const { locationsByCountryMap } = this.state;
    const { theme } = this.props;

    if (locationsByCountryMap !== null) {
      // TODO: Decide on a max number of cells, with the leftovers falling into an "Other" category!!!
      const data = Array.from(locationsByCountryMap, ([country, locations]) => {
        const numDataCenters = locations.length;
        return {
          fill: null,
          mapKey: country,
          name: country,
          value: numDataCenters
        };
      });

      // Sort by descending number of nodes.
      data.sort((x, y) => (y.value - x.value));

      // Set the colors on the sorted array.
      data.forEach((entry, index) => {
        entry.fill = theme.colorPieChart[index % theme.colorPieChart.length];
      });  

      return data;
    }
    else
      return [];
  }

  /**
   * Set the chart data[] array based on the locations organized by country name.
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

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(CountriesChart);
