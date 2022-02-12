/**
 * @file MessagesCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with messages per second retrieved from
 * ic-api.internetcomputer.org.
 */
class MessagesCard extends Component {
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
   * Create a MessagesCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      messagesPerSecond: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    // Update the messages time using intervals.
    this.pollForMessagesTime();
    this.interval = setInterval(
      () => { this.pollForMessagesTime() },
      Constants.MESSAGES_TIME_POLL_INTERVAL_MS);
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
    let { messagesPerSecond, error } = this.state;
    
    let messagesTimeText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      messagesTimeText = 'Network error';
    else if (messagesPerSecond === -1)
      messagesTimeText = 'Loading...';
    else
      messagesTimeText = messagesPerSecond.toFixed(1) + ' mps';

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Message Throughput'
        value={messagesTimeText}
        svgIconPath={Constants.ICON_SVG_PATH_MPS}
      />
    );
  }

  /**
   * Update the messages time.
   * @private
   */
  pollForMessagesTime() {
    const url =
      'https://ic-api.internetcomputer.org/api/v3/message-execution-rate';
    axios.get(url)
      .then(res => {
        if (res.data.message_execution_rate.length === 1 && res.data.message_execution_rate[0].length >= 2) {
          const messagesPerSecond = parseFloat(res.data.message_execution_rate[0][1]);
          this.setState({
            messagesPerSecond: messagesPerSecond,
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

export default MessagesCard;
