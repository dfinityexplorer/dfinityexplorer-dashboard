/**
 * @file CyclesCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the cycles burned retrieved from
 * dashboard.internetcomputer.org/api.
 */
 class CyclesCard extends Component {
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
   * Create a CyclesCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      cyclesBurned: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the cycles burned using intervals.
    this.pollForCyclesBurned();
    this.interval = setInterval(
      () => { this.pollForCyclesBurned() },
      Constants.CYCLES_CARD_POLL_INTERVAL_MS);
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
    let { cyclesBurned, error } = this.state;
    
    let cyclesBurnedText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      cyclesBurnedText = 'Network error';
    else if (cyclesBurned === -1)
      cyclesBurnedText = 'Loading...';
    else {
      const trillionCyclesBurned = cyclesBurned / 1000000000000;
      cyclesBurnedText = trillionCyclesBurned.toFixed(3) + 'T';
    }

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Cycles Burned'
        value={cyclesBurnedText}
        svgIconPath={Constants.ICON_SVG_PATH_CYCLES_BURNED}
      />
    );
  }

  /**
   * Update the cycles burned.
   * @private
   */
  pollForCyclesBurned() {
    const url =
      `https://ic-api.internetcomputer.org/api/metrics/cycles-burned`;
    axios.get(url)
      .then(res => {
        if (res.data.cycles_burned.length === 2) {
          let { cyclesBurned } = this.state;
          const newCyclesBurned = parseInt(res.data.cycles_burned[1]);
          if (newCyclesBurned > cyclesBurned) {
            this.setState({
              cyclesBurned: newCyclesBurned,
              error: 0
            });
          }
        }
        // Special case for "{cycles_burned: 0}", which occurs pre-Genesis as networks are changed
        // around. This should not be needed post-Genesis.
        else if (res.data.cycles_burned === 0) {
          this.setState({
            cyclesBurned: 0,
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

export default CyclesCard;
