/**
 * @file PriceCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with price data retrieved from api.nomics.com.
 */
class PriceCard extends Component {
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
   * Create a PriceCard object.
   * @constructor
   */
  constructor(props) {
    super(props);
  
    this.state = {
      price: 0,
      error: false
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the price using intervals.
    this.pollForPrice();
    this.interval = setInterval(
      () => { this.pollForPrice() },
      Constants.PRICE_POLL_INTERVAL_MS);
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
    let { price, error } = this.state;
    
    let priceText;
    if (error)
      priceText = 'Network error';
    else if (price === 0)
      priceText = 'Loading...';
    else
      priceText = '$' + price.toFixed(2);

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Price - ICP (IOU)'
        value={priceText}
        svgIconPath={Constants.ICON_SVG_PATH_PRICE}
      />
    );
  }

  /**
   * Update the price.
   * @private
   */
  pollForPrice() {
    const url =
      `https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=DFN&interval=1d`;
    axios.get(url)
      .then(res => {
        const price = parseFloat(res.data[0].price);
        this.setState({
          price: price,
          error: false
        });
      })
      .catch(() => {
        this.setState({
          error: true,
        });
      });
  }
}

export default PriceCard;
