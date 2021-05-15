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
import icpLogo from '../../media/images/icpLogo.svg';

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
      error: 0
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
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      priceText = 'Network error';
    else if (price === 0)
      priceText = 'Loading...';
    else
      priceText = '$' + price.toFixed(2);

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Price - ICP'
        value={priceText}
        iconImageSrc={icpLogo}
      />
    );
  }

  /**
   * Update the price.
   * @private
   */
  pollForPrice() {
    //currencies!!!const url =
      //currencies!!!`https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=ICP&interval=1d`;
    let startDate = new Date();
    startDate = new Date(startDate.getTime() - 5 * 60000); // 5 minutes ago
    const url =
      `https://api.nomics.com/v1/exchange_candles?key=${Constants.NOMICS_API_KEY}&interval=1m&exchange=gdax&market=ICP-USD&start=${this.dateToRfc3339(startDate)}`;
    axios.get(url)
      .then(res => {
        const price = parseFloat(res.data[res.data.length-1].close);//currencies!!!parseFloat(res.data[0].price);
        this.setState({
          price: price,
          error: 0
        });
      })
      .catch(() => {
        this.setState(prevState => ({
          error: prevState.error + 1
        }));
      });
  }

  /**
   * Return a string for the date in RFC 3339 (URI escaped) format.
   * @param {Object} date The date to create the string for.
   * @return {String} A string for the date in RFC 3339 (URI escaped) format.
   * @private
   */
  dateToRfc3339(date) { // Duplicated function, move to utils!!!
    // Use toISOString(), removing the fraction of seconds (i.e, after decimal point).
    const isoNoFraction = date.toISOString().split('.')[0] + 'Z'

    // Escape all ':' characters.
    return isoNoFraction.replace(/:/g, '%3A');
  }
}

export default PriceCard;
