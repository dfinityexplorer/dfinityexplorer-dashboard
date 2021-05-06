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
 * dashboard.internetcomputer.org/api.
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
      error: 0
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
      Constants.BLOCK_TIME_CARD_POLL_INTERVAL_MS);
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
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      blockTimeText = 'Network error';
    else if (blocksPerSecond === -1)
      blockTimeText = 'Loading...';
    else
      blockTimeText = blocksPerSecond.toFixed(1) + ' bps';

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Block Rate'
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
    const url = `https://ic-api.internetcomputer.org/api/metrics/block-rate`;
    axios.get(url)
      .then(res => {
        if (res.data.block_rate.length === 1 && res.data.block_rate[0].length === 2) {
          const blocksPerSecond = parseFloat(res.data.block_rate[0][1]);
          this.setState({
            blocksPerSecond: blocksPerSecond,
            error: 0
          });
        }
      })
      .catch(() => {
        this.setState(prevState => ({
          error: prevState.error + 1
        }));
      });
  }
}

export default BlockTimeCard;
