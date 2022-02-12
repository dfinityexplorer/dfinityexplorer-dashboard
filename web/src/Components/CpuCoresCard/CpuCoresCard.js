/**
 * @file CpuCoresCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the current number of CPU cores retrieved from
 * dashboard.internetcomputer.org/api.
 */
 class CpuCoresCard extends Component {
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
   * Create a CpuCoresCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      numberOfCpuCores: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    this.getNumberOfCpuCores();
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let { cardIndex, className } = this.props;
    let { numberOfCpuCores, error } = this.state;
    
    let numberOfCpuCoresText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      numberOfCpuCoresText = 'Network error';
    else if (numberOfCpuCores === -1)
      numberOfCpuCoresText = 'Loading...';
    else
      numberOfCpuCoresText = numberOfCpuCores.toLocaleString();

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='CPU Cores'
        value={numberOfCpuCoresText}
        svgIconPath={Constants.ICON_SVG_PATH_CPU_CORES}
      />
    );
  }

  /**
   * Get the number of CPU cores.
   * @private
   */
  getNumberOfCpuCores() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-cpu-cores`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_cpu_cores.length === 2) {
          let { numberOfCpuCores } = this.state;
          const newNumberOfCpuCores = parseInt(res.data.ic_cpu_cores[1]);
          if (newNumberOfCpuCores > numberOfCpuCores) {
            this.setState({
              numberOfCpuCores: newNumberOfCpuCores,
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

export default CpuCoresCard;
