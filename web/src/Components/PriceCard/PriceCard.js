/**
 * @file PriceCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';
import icpLogo from '../../media/images/icpLogo.svg';

const SpanPercentChange = styled.span`
  && {
    font-size: 14px;
    font-weight: 300;
    color: ${props => props.isnegative ? props.theme.colorPriceTextNegative : props.theme.colorPriceTextPositive};
  }
`;

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
      percentChange: null,
      price: null,
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
    let { percentChange, price, error } = this.state;
    
    let priceText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      priceText = 'Network error';
    else if (percentChange === null || price === null)
      priceText = 'Loading...';
    else
      priceText =
        <Fragment>
          <span>{'$' + price.toFixed(2) + ' '}</span>
          <SpanPercentChange isnegative={percentChange < 0}>
            {
              (percentChange < 0 ? '\u2193' : '\u2191') +
              ' ' + Math.abs(percentChange).toFixed(2) + '%'
            }
          </SpanPercentChange>
        </Fragment>;
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
    const url =
      `https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=ICP&interval=1d`;
    axios.get(url)
      .then(res => {
        const percentChange = parseFloat(res.data[0]['1d'].price_change_pct) * 100;
        const price = parseFloat(res.data[0].price);
        this.setState({
          percentChange: percentChange,
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
}

export default PriceCard;
