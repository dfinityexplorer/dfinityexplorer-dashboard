/**
 * @file MessagesCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with messages per second retrieved from
 * dashboard.dfinity.network.
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
   * Create a BlockTimeCard object.
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
        title='Avg Messages'
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
    // Get 6 hours of hourly data. Ideally, we would get 10 minutes of minute data, but
    // dashboard.dfinity.network did not return any data with those settings. This seems
    // like it was due to service down time.
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 360);
    const endDate = new Date();
    const secondsInHour = 60 * 60;
    const url =
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D%22${Constants.IC_RELEASE}%22%2C%20ic_subnet%3D~%22.%2B%22%7D))&start=${startDate.getTime() / 1000}&end=${endDate.getTime() / 1000}&step=${secondsInHour}`;
    axios.get(url)
      .then(res => {
        if (res.data.data.result.length && res.data.data.result[0].values.length) {
          const values = res.data.data.result[0].values;
          const firstValue = values[0];
          const lastValue = values[values.length-1];
          const numMessages = Math.max(Math.floor(lastValue[1] - firstValue[1]), 0);
          const seconds = Math.max(lastValue[0] - firstValue[0], 1);
          this.setState({
            messagesPerSecond: numMessages / seconds,
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
