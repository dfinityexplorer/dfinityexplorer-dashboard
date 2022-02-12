/**
 * @file MemoryCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the memory total retrieved from
 * dashboard.internetcomputer.org/api.
 */
 class MemoryCard extends Component {
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
   * Create a MemoryCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      memoryTotal: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    this.getMemoryTotal();
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let { cardIndex, className } = this.props;
    let { memoryTotal, error } = this.state;
    
    let memoryTotalText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      memoryTotalText = 'Network error';
    else if (memoryTotal === -1)
      memoryTotalText = 'Loading...';
    else {
      const memoryTotalPb = memoryTotal / 1000000000000000;                                    
      memoryTotalText = memoryTotalPb.toFixed(3) + 'PB';
    }

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Memory'
        value={memoryTotalText}
        svgIconPath={Constants.ICON_SVG_PATH_MEMORY}
      />
    );
  }

  /**
   * Get the memory total.
   * @private
   */
  getMemoryTotal() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-memory-total`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_memory_total.length === 2) {
          let { memoryTotal } = this.state;
          const newMemoryTotal = parseInt(res.data.ic_memory_total[1]);
          if (newMemoryTotal > memoryTotal) {
            this.setState({
              memoryTotal: newMemoryTotal,
              error: 0
            });
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

export default MemoryCard;
