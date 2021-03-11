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
      secondsPerBlock: -1,
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
    let { secondsPerBlock, error } = this.state;
    
    let blockTimeText;
    if (error)
      blockTimeText = 'Network error';
    else if (secondsPerBlock === -1)
      blockTimeText = 'Loading...';
    else
      blockTimeText = secondsPerBlock.toFixed(1) + ' s';

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Avg Block Time'
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
    // Get one day of hourly data. Ideally, we would get 10 minutes of minute data, but
    // dashboard.dfinity.network did not return any data with those settings.
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    const secondsInHour = 60 * 60;
    const url =
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D%22${Constants.IC_RELEASE}%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${startDate.getTime() / 1000}&end=${endDate.getTime() / 1000}&step=${secondsInHour}`;
    axios.get(url)
      .then(res => {
        if (res.data.data.result.length && res.data.data.result[0].values.length) {
          const values = res.data.data.result[0].values;
          const firstValue = values[0];
          const lastValue = values[values.length-1];
          const numBlocks = Math.max(Math.floor(lastValue[1] - firstValue[1]), 1);
          const seconds = Math.max(lastValue[0] - firstValue[0], 0);
          this.setState({
            secondsPerBlock: seconds / numBlocks
          });
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
