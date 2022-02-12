/**
 * @file PriceChart
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import AreaChart from '../AreaChart/AreaChart';
import Constants from '../../constants';
 
/**
 * This component displays a chart of Candle objects with data retrieved from api.nomics.com.
 */
class PriceChart extends AreaChart {

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
  * Create a PriceChart object.
  * @constructor
  */
  constructor(props) {
    super(props);

    this.state = {
      priceData: [],
      error: false
    };
  }
   
  /**
  * Invoked by React immediately after a component is mounted (inserted into the tree). 
  * @public
  */
  componentDidMount() {
    // Get a two weeks of daily data.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    const url =
      `https://api.nomics.com/v1/candles?key=${Constants.NOMICS_API_KEY}&interval=1h&currency=ICP&start=${this.dateToRfc3339(startDate)}`;
    axios.get(url)
      .then(res => {
        if (res.data.length > 0) {
          const priceData = res.data.map((candle) => {
            const date = new Date(candle.timestamp);
            const price = parseFloat(candle.close);
            return {date: date.getTime(), price: price};
          });
          this.setState({
            priceData: priceData
          });
        }
        else
          console.log("Exchange data not found.");
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
    let title = 'Price - ICP';
    if (error)
      title += ' - Network Error'
    return title;
  }
 
  /**
  * Return an array of objects that describe the chart data.
  * @return {Array} An array of objects that describe the chart data.
  * @protected
  */
  getData() {
    const { priceData } = this.state;
    return priceData;
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
    return 'price';
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
    return new Date(value).toLocaleDateString('default');
  }

  /**
  * Return a string for the y-axis tick label corresponding to the specified value.
  * @param {Any} value The value of the data.
  * @return {String} The string for the y-axis tick label.
  * @protected
  */
  getGetTickY(value) {
    return `$${value.toFixed(2)}`;
  }
 
  /**
  * Return a string for the x-axis tooltip label corresponding to the specified value.
  * @param {Any} value The value of the data.
  * @return {String} The string for the x-axis tooltip label.
  * @protected
  */
  getGetTooltipX(value) {
    // Display date/time with no seconds.
    return new Date(value).toLocaleString(
      'default',
      {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute:'2-digit'});
  }

  /**
  * Return a string for the y-axis tooltip label corresponding to the specified value.
  * @param {Any} value The value of the data.
  * @return {String} The string for the y-axis tooltip label.
  * @protected
  */
  getGetTooltipY(value) {
    return `ICP: $${value.toFixed(2)}`;
  }

  /**
   * Return a string for the date in RFC 3339 (URI escaped) format.
   * @param {Object} date The date to create the string for.
   * @return {String} A string for the date in RFC 3339 (URI escaped) format.
   * @private
   */
  dateToRfc3339(date) {
    // Use toISOString(), removing the fraction of seconds (i.e, after decimal point).
    const isoNoFraction = date.toISOString().split('.')[0] + 'Z'

    // Escape all ':' characters.
    return isoNoFraction.replace(/:/g, '%3A');
  }
}
 
 // Use the withTheme HOC so that we can use the current theme outside styled components.
 export default withTheme(PriceChart);
