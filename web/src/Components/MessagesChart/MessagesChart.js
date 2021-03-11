/**
 * @file MessagesChart
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import AreaChart from '../AreaChart/AreaChart';
import Constants from '../../constants';

/**
 * This component displays a number of messages chart with data retrieved from
 * dashboard.dfinity.network.
 */
class MessagesChart extends AreaChart { 
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
   * Create a MessagesChart object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      messagesData: [],
      error: false
    };
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    // Get 24 hours of hourly data. Daily data does not currently work, because
    // dashboard.dfinity.network returns glitchy data for some days within past week.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    const secondsInHour = 60 * 60;
    const url =
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D%22${Constants.IC_RELEASE}%22%2C%20ic_subnet%3D~%22.%2B%22%7D))&start=${startDate.getTime() / 1000}&end=${endDate.getTime() / 1000}&step=${secondsInHour}`;
    axios.get(url)
      .then(res => {
        let values = res.data.data.result[0].values;
        // Use values[0] to get the starting number of messages.
        let prevTotal = Math.floor(values[0][1]);
        const messagesData = values.slice(1).map((value) => {
          const date = new Date(value[0] * 1000);
          const total = Math.floor(value[1]);
          const numMessages = Math.max(total - prevTotal, 0);
          prevTotal = total;
          return {date: date.getTime(), numMessages: numMessages};
        });
        this.setState({
          messagesData: messagesData
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
    let title = 'Message History';
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
    const { messagesData } = this.state;
    return messagesData;
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
    return 'numMessages';
  }

  /**
   * Return the minimum value of the domain for the Y-axis.
   * @param {dataMin} value The minumum value of the data.
   * @return {String} The minimum value of the domain for the Y-axis.
   * @protected
   */
  getDomainMinY(dataMin) {
    return Math.floor(dataMin / 100) * 100;
  }

  /**
   * Return the maximum value of the domain for the Y-axis.
   * @param {dataMax} value The maximum value of the data.
   * @return {String} The maximum value of the domain for the Y-axis.
   * @protected
   */
  getDomainMaxY(dataMax) {
    return Math.ceil(dataMax / 100) * 100;
  }

  /**
   * Return a string for the x-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tick label.
   * @protected
   */
  getGetTickX(value) {
    return new Date(value).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
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
    return new Date(value).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Return a string for the y-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tooltip label.
   * @protected
   */
  getGetTooltipY(value) {
    return `New Messages: ${value.toLocaleString()}`;
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(MessagesChart);
