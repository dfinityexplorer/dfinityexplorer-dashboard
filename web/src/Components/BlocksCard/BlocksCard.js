/**
 * @file BlocksCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the current block height retrieved from
 * ic-api.internetcomputer.org/api.
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
      prevBlockHeight: -1,
      error: 0
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
    let { blockHeight, error, prevBlockHeight } = this.state;
    
    let blockHeightText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      blockHeightText = 'Network error';
    else if (blockHeight === -1)
      blockHeightText = 'Loading...';

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Blocks'
        value={blockHeightText ?
          blockHeightText :
          <CountUp
            duration={(Constants.BLOCKS_CARD_POLL_INTERVAL_MS + 100) / 1000}
            start={prevBlockHeight}
            end={blockHeight}
            useEasing={false}
            formattingFn={value => value.toLocaleString()}
          />
        }
        svgIconPath={Constants.ICON_SVG_PATH_BLOCK}
      />
    );
  }

  /**
   * Update the block height.
   * @private
   */
  pollForBlockHeight() {
    const url = 'https://ic-api.internetcomputer.org/api/v3/block-heights';
    axios.get(url)
      .then(res => {
        if (res.data.block_height.length === 1 && res.data.block_height[0].length === 2) {
          let { blockHeight } = this.state;
          const newBlockHeight = res.data.block_height[0][1];
          if (newBlockHeight > blockHeight) {
            this.setState(prevState => ({
              prevBlockHeight:
                prevState.prevBlockHeight !== -1 ? prevState.blockHeight : newBlockHeight,
              blockHeight: newBlockHeight,
              error: 0
            }));  
          }
        }
      })
      .catch(() => {
        this.setState(prevState => ({
          error: prevState.error + 1
        }));
      });
  }
}

export default BlocksCard;
