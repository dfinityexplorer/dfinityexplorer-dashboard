/**
 * @file BlocksChart
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import BarChart from '../BarChart/BarChart';
import Constants from '../../constants';

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
    return new Date(value).toLocaleTimeString();
  }

  /**
   * Return a string for the y-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tooltip label.
   * @protected
   */
  getGetTooltipY(value) {
    return `New Blocks: ${value.toLocaleString()}`;
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
    endDate = new Date(endDate.getTime() - 5 * 60 * 1000); // 5 minutes ago to avoid API time discrepancy
    const startDate = new Date(endDate.getTime() - 60 * 60 * 1000); // 65 minutes ago
    const seconds = Constants.BLOCKS_CHART_POLL_INTERVAL_MS / 1000; // 1 minute
    const url =
      `https://ic-api.internetcomputer.org/api/v3/metrics/block-height?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${seconds}`;
    axios.get(url)
      .then(res => {
        let values = res.data.block_height;
        values.pop(); // Workaround: Throw away last value, always higher than it should be.
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
          error: false
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
  async pollForMoreBlocks() {
    // * 5!!!
    const endDate = new Date((new Date()).getTime() - 5 * 60 * 1000 ); // 5 minutes ago to avoid API time discrepancy
    const startDate = new Date(endDate.getTime() - 60 * 1000); // 6 minutes ago
    const seconds = Constants.BLOCKS_CHART_POLL_INTERVAL_MS / 1000; // 1 minute
    const url =
      `https://ic-api.internetcomputer.org/api/v3/metrics/block-height?start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${seconds}`;
    await axios.get(url)
      .then(res => {
        const values = res.data.block_height;
        if (values.length >= 2) {
          const prevHeight = Math.floor(values[values.length - 2][1]);
          const curHeight = Math.floor(values[values.length - 1][1]);
          const date = new Date(values[values.length - 1][0] * 1000);
          const numBlocks = Math.max(curHeight - prevHeight, 0);
          const blocks = {date: date.getTime(), numBlocks: numBlocks};
          this.setState(prevState => ({
            blocksData: prevState.blocksData.slice(1).concat(blocks),
            error: false
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
