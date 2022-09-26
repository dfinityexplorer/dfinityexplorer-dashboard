/**
 * @file CanistersChart
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import AreaChart from '../AreaChart/AreaChart';
import roundDownDateToDay from '../../utils/roundDownDateToDay';

/**
 * This component displays a number of canisters chart with data retrieved from
 * ic-api.internetcomputer.org.
 */
class CanistersChart extends AreaChart {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
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
   * Create a CanistersChart object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      canistersData: [],
      error: false
    };
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    // Get data since Genesis.
    const endDate = new Date();
    const startDate = new Date(2021, 4, 10); // Genesis: 5/10/2021
    const secondsInDay = 24 * 60 * 60;
    const url =
      `https://ic-api.internetcomputer.org/api/v3/metrics/registered-canisters-count?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInDay}`;
    axios.get(url)
      .then(res => {
        let values = res.data.running_canisters;
        const canistersData = values.map((value) => {
          const date = new Date(value[0] * 1000);
          const numCanisters = Math.floor(value[1]);
          return {date: date.getTime(), numCanisters: numCanisters};
        });
        this.setState({
          canistersData: canistersData
        });
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }

  /**
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    const { error } = this.state;
    let title = 'Canisters (Smart Contracts)';
    if (error)
      title += ' - Network Error'
    return title;
  }

  /**
   * Return an optional value to display on the title line.
   * @return {String} An optional value to display on the title line.
   * @protected
   */
  getTitleValue() {
    const { canistersData } = this.state;
    return (canistersData.length > 0) ?
      `${canistersData[canistersData.length - 1].numCanisters.toLocaleString()}` :
      undefined;
  }
  
  /**
   * Return an array of objects that describe the chart data.
   * @return {Array} An array of objects that describe the chart data.
   * @protected
   */
  getData() {
    const { canistersData } = this.state;
    return canistersData;
  }

  /**
   * Return the key of the data to be displayed in the x-axis.
   * @return {String} The key of the data to be displayed in the x-axis.
   * @protected
   */
  getDataKeyX() {
    return 'date';
  }

  /**
   * Return the key of the data to be displayed in the y-axis.
   * @return {String} The key of the data to be displayed in the y-axis.
   * @protected
   */
  getDataKeyY() {
    return 'numCanisters';
  }

  /**
  * Return the minimum value of the domain for the Y-axis.
  * @param {dataMin} value The minumum value of the data.
  * @return {String} The minimum value of the domain for the Y-axis.
  * @protected
  */
  getDomainMinY(dataMin) {
    return Math.floor(dataMin);
  }

  /**
  * Return the maximum value of the domain for the Y-axis.
  * @param {dataMax} value The maximum value of the data.
  * @return {String} The maximum value of the domain for the Y-axis.
  * @protected
  */
  getDomainMaxY(dataMax) {
    return Math.ceil(dataMax);
  }

  /**
   * Return a string for the x-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tick label.
   * @protected
   */
  getGetTickX(value) {
    return new Date(value).toLocaleDateString('default', { timeZone: 'UTC' });
  }

  /**
   * Return a string for the y-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tick label.
   * @protected
   */
  getGetTickY(value) {
    if (value >= 1000) {
      const k = value / 1000;
      return k.toFixed(Number.isInteger(k) ? 0 : 1) + 'k';
    }
    else
      return value;
  }

  /**
   * Return a string for the x-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tooltip label.
   * @protected
   */
  getGetTooltipX(value) {
    return new Date(value).toLocaleDateString('default', { timeZone: 'UTC' });
  }

  /**
   * Return a string for the y-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tooltip label.
   * @protected
   */
  getGetTooltipY(value) {
    return `Canisters: ${value.toLocaleString()}`;
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(CanistersChart);
