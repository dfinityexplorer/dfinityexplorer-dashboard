/**
 * @file BlocksCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the current block height retrieved from
 * dashboard.dfinity.network.
 */
 class BlocksCard extends Component {
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
   * Create a BlocksCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      blockHeight: -1,
      error: false
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the block height using intervals.
    this.pollForBlockHeight();
    this.interval = setInterval(
      () => { this.pollForBlockHeight() },
      Constants.BLOCKS_CARD_POLL_INTERVAL_MS);
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
    let { blockHeight, error } = this.state;
    
    let blockHeightText;
    if (error)
      blockHeightText = 'Network error';
    else if (blockHeight === -1)
      blockHeightText = 'Loading...';
    else
      blockHeightText = blockHeight.toLocaleString();

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Blocks'
        value={blockHeightText}
        svgIconPath={Constants.ICON_SVG_PATH_BLOCK}
      />
    );
  }

  /**
   * Update the block height.
   * @private
   */
  pollForBlockHeight() {
    // Get 10 minutes of minute data. If there is an API to get just the current block height, we
    // should use it here.
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 10);
    const endDate = new Date();
    const secondsInMinute = 60;
    const url =
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(artifact_pool_consensus_height_stat%7Bic%3D%22${Constants.IC_RELEASE}%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${startDate.getTime() / 1000}&end=${endDate.getTime() / 1000}&step=${secondsInMinute}`;
    axios.get(url)
      .then(res => {
        if (res.data.data.result.length && res.data.data.result[0].values.length) {
          const values = res.data.data.result[0].values;
          const lastValue = values[values.length-1];
          const blockHeight = Math.floor(lastValue[1]);
          this.setState({
            blockHeight: blockHeight
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

export default BlocksCard;
