/**
 * @file CyclesCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the cycles burned retrieved from
 * ic-api.internetcomputer.org/api.
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
      cycleBurnRate: -1,
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
    let { cycleBurnRate, error } = this.state;
    
    let cyclesBurnRateText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      cyclesBurnRateText = 'Network error';
    else if (cycleBurnRate === -1)
      cyclesBurnRateText = 'Loading...';
    else {
      cyclesBurnRateText =
      (cycleBurnRate / 1000000000).toLocaleString(
        undefined, { 'minimumFractionDigits': 1, 'maximumFractionDigits': 1 }) +
      'B Cycles/s';
    }

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Cycle Burn Rate'
        value={cyclesBurnRateText}
        svgIconPath={Constants.ICON_SVG_PATH_CYCLES_BURNED}
      />
    );
  }

  /**
   * Update the cycles burned.
   * @private
   */
  pollForCyclesBurned() {
    const url = 'https://ic-api.internetcomputer.org/api/v3/metrics/cycle-burn-rate';
    axios.get(url)
      .then(res => {
        if (res.data.cycle_burn_rate[0].length === 2) {
          this.setState({
            cycleBurnRate: parseInt(res.data.cycle_burn_rate[0][1]),
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
