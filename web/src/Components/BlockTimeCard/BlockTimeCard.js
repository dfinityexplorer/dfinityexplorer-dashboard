/**
 * @file BlockTimeCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with seconds per block retrieved from
 * dashboard.dfinity.network.
 */
class BlockTimeCard extends Component {
  static propTypes = {
    /**
     * The index of the card. Used for theming.
     */
    cardIndex: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string
  };

  /**
   * Create a BlockTimeCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      blocksPerSecond: -1,
      error: false
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the block time using intervals.
    this.pollForBlockTime();
    this.interval = setInterval(
      () => { this.pollForBlockTime() },
      Constants.BLOCK_TIME_POLL_INTERVAL_MS);
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
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let { cardIndex, className } = this.props;
    let { blocksPerSecond, error } = this.state;
    
    let blockTimeText;
    if (error)
      blockTimeText = 'Network error';
    else if (blocksPerSecond === -1)
      blockTimeText = 'Loading...';
    else
      blockTimeText = blocksPerSecond.toFixed(1) + ' bps';

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Avg Blocks'
        value={blockTimeText}
        svgIconPath={Constants.ICON_SVG_PATH_BLOCK_TIME}
      />
    );
  }

  /**
   * Update the block time.
   * @private
   */
  pollForBlockTime() {
    /* KEEP for now
    // Get one day of hourly data. Ideally, we would get 10 minutes of minute data, but
    // dashboard.dfinity.network results are inconsistent with those settings.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    const secondsInHour = 60 * 60;*/
    // Get 10 minutes of minute data. This is still sometimes glitchy, but we'll try it out
    // temporarily.
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 10);
    const endDate = new Date();
    const secondsInMinute = 60;
    const url =
      //IC_RELEASE: `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D%22${Constants.IC_RELEASE}%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${startDate.getTime() / 1000}&end=${endDate.getTime() / 1000}&step=${secondsInMinute}`;
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D~%22.%2B%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInMinute}`;
    axios.get(url)
      .then(res => {
        if (res.data.data.result.length && res.data.data.result[0].values.length >= 2) {
          const values = res.data.data.result[0].values;
          const firstValue = values[0];
          // Temporary workaround fix when using 10 minutes of minute data: Use second to last
          // value, since dashboard.dfinity.network seems to have a bug where the last value isn't
          // always reliable. Note >= 2 above as well, rather than >= 1.!!!
          const lastValue = values[values.length-2];
          const numBlocks = Math.max(Math.floor(lastValue[1] - firstValue[1]), 0);
          const seconds = Math.max(lastValue[0] - firstValue[0], 1);
          const blocksPerSecond = numBlocks / seconds;
          if (blocksPerSecond > 0) { // ignore glitchy data from API
            this.setState({
              blocksPerSecond: blocksPerSecond,
              error: false
            });
          }
        }
      })
      .catch(() => {
        this.setState({
          error: true
        });
      });
  }
}

export default BlockTimeCard;
