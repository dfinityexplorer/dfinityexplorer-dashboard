/**
 * @file SubnetsCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the current number of subnets retrieved from
 * dashboard.internetcomputer.org/api.
 */
 class SubnetsCard extends Component {
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
   * Create a SubnetsCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      numberOfSubnets: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    this.getNumberOfSubnets();
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let { cardIndex, className } = this.props;
    let { numberOfSubnets, error } = this.state;
    
    let numberOfSubnetsText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      numberOfSubnetsText = 'Network error';
    else if (numberOfSubnets === -1)
      numberOfSubnetsText = 'Loading...';
    else
      numberOfSubnetsText = numberOfSubnets.toLocaleString();

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Subnets'
        value={numberOfSubnetsText}
        svgIconPath={Constants.ICON_SVG_PATH_SUBNETS}
      />
    );
  }

  /**
   * Get the number of subnets.
   * @private
   */
  getNumberOfSubnets() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-subnet-total`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_subnet_total.length === 2) {
          let { numberOfSubnets } = this.state;
          const newNumberOfSubnets = parseInt(res.data.ic_subnet_total[1]);
          if (newNumberOfSubnets > numberOfSubnets) {
            this.setState({
              numberOfSubnets: newNumberOfSubnets,
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

export default SubnetsCard;
