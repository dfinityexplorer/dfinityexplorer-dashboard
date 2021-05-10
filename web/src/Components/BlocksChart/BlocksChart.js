/**
 * @file BlocksChart
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import BarChart from '../BarChart/BarChart';
import Constants from '../../constants';
// 2weeks!!!import roundDownDateToDay from '../../utils/roundDownDateToDay';

/**
 * This component displays a number of blocks chart with data retrieved from
 * ic-api.internetcomputer.org.
 */
class BlocksChart extends BarChart { 
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
   * Create a BlocksChart object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      blocksData: [],
      prevDate: null,
      error: false
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the blocks data using intervals.
    this.pollForInitialBlocks();
    this.interval = setInterval(
      () => { this.pollForMoreBlocks() },
      Constants.BLOCKS_CHART_POLL_INTERVAL_MS);
  }

  /**
   * Invoked by React immediately before a component is unmounted and destroyed.
   * @public
   */
  componentWillUnmount() {
    clearInterval(this.interval);
    this.interval = null;
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  /*2weeks!!!componentDidMount() {
    // Get a two weeks of daily data. Note that there is currently a bug in
    // dashboard.dfinity.network where the last entry returned for this query is one day ago, not
    // now.
    const endDate = roundDownDateToDay(new Date());
    const startDate = new Date(endDate.getTime());
    startDate.setDate(endDate.getDate() - 15);
    const secondsInDay = 24 * 60 * 60;
    const url =
      //New API!!!`https://ic-api.internetcomputer.org/api/metrics/block?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInDay}&ic=${Constants.IC_RELEASE}`;
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D%22${Constants.IC_RELEASE}%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInDay}`;
      //NO IC_RELEASE: `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D~%22.%2B%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInDay}`;
    axios.get(url)
      .then(res => {
        let values = res.data.data.result[0].values; // new API: res.data.block!!!
        // Use values[0] to get the starting block height.
        let prevHeight = Math.floor(values[0][1]);
        const blocksData = values.slice(1).map((value) => {
          const date = new Date(value[0] * 1000);
          const height = Math.floor(value[1]);
          const numBlocks = Math.max(height - prevHeight, 0);
          prevHeight = height;
          return {date: date.getTime(), numBlocks: numBlocks};
        });
        this.setState({
          blocksData: blocksData
        });
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }*/

  /**
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    const { error } = this.state;
    let title = 'Blocks';
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
    const { blocksData } = this.state;
    return blocksData;
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
    return 'numBlocks';
  }

  /**
   * Return a string for the x-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tick label.
   * @protected
   */
  getGetTickX(value) {
    //2weeks!!!return new Date(value).toLocaleDateString('default', { timeZone: 'UTC' });
    return new Date(value).toLocaleTimeString();
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
    //2weeks!!!return new Date(value).toLocaleString('default', { timeZone: 'UTC' });
    return new Date(value).toLocaleTimeString();
  }

  /**
   * Return a string for the y-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tooltip label.
   * @protected
   */
  getGetTooltipY(value) {
    return `Blocks: ${value.toLocaleString()}`;
  }

  /**
   * Return The duration of the chart animation.
   * @param {Any} value The value of the data.
   * @protected
   */
  getAnimationDuration() {
    return 0;
  }

  /**
   * Poll for the initial blocks.
   * @private
   */
  pollForInitialBlocks() {
    let endDate = new Date();
    endDate = new Date(endDate.getTime() - 1 * 60000); // 1 minute ago to avoid API time discrepancy
    const startDate = new Date(endDate.getTime() - 2 * 60000); // 2 minutes ago
    const seconds = Constants.BLOCKS_CHART_POLL_INTERVAL_MS / 1000;
    const url =
      `https://ic-api.internetcomputer.org/api/metrics/block?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${seconds}`;
    axios.get(url)
      .then(res => {
        let values = res.data.block;
        // Use values[0] to get the starting block height.
        let prevHeight = Math.floor(values[0][1]);
        const blocksData = values.slice(1).map((value) => {
          const date = new Date(value[0] * 1000);
          const height = Math.floor(value[1]);
          const numBlocks = Math.max(height - prevHeight, 0);
          prevHeight = height;
          return {date: date.getTime(), numBlocks: numBlocks};
        });
        this.setState({
          blocksData: blocksData,
          prevDate: endDate
        });
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }

  /**
   * Poll for more blocks.
   * @private
   */
  pollForMoreBlocks() {
    const { prevDate } = this.state;
    let endDate = new Date();
    endDate = new Date(endDate.getTime() - 1 * 60000); // 1 minute ago to avoid API time discrepancy
    const startDate = prevDate;
    const seconds = 1;
    const url =
      `https://ic-api.internetcomputer.org/api/metrics/block?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${seconds}`;
    axios.get(url)
      .then(res => {
        const values = res.data.block;
        if (values.length >= 0) {
          const prevHeight = Math.floor(values[0][1]);
          const curHeight = Math.floor(values[values.length - 1][1]);
          const date = new Date(values[values.length - 1][0] * 1000);
          const numBlocks = Math.max(curHeight - prevHeight, 0);
          const blocks = {date: date.getTime(), numBlocks: numBlocks};
          this.setState(prevState => ({
            blocksData: prevState.blocksData.slice(1).concat(blocks),
            prevDate: endDate
          }));  
        }
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(BlocksChart);
