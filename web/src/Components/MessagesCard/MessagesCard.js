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
   * Create a MessagesCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // "No Historical Messages" fix!!!this.messages = [];
    // "No Historical Messages" fix!!!this.lastMessageHeight = 0;

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
      messagesTimeText = 'Loading...'; // 'Calculating...' for "No Historical Messages" fix!!!
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
   * "No Historical Messages" fix: Too glitchy at this time!!!
   * Update the messages time.
   * 
   * This version was added for the "No Historical Messages" fix!!! This method of calculating the
   * message time is intended to be temporary until we receive more reliable API data.
   * @private
   *
  pollForMessagesTime() {
    // Get 10 minutes of minute data. If there is an API to get just the current message height, we
    // should use it here.
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 10);
    const endDate = new Date();
    const secondsInMinute = 60;
    const url =
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D%22${Constants.IC_RELEASE}%22%2C%20ic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInMinute}`;
      //NO IC_RELEASE: `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D~%22.%2B%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInMinute}`;
    axios.get(url)
      .then(res => {
        if (res.data.data.result.length && res.data.data.result[0].values.length >= 2) {
          const values = res.data.data.result[0].values;
          // Temporary workaround fix: Use second to last value, since dashboard.dfinity.network
          // seems to have a bug where the last value isn't always reliable (not sure if this is
          // true for messages query, but it is for blocks query)!!!
          const lastValue = values[values.length-2];
          const newMessageHeight = Math.floor(lastValue[1]);

          // Reset calculation if we get a major glitch in the API data.
          const maxExpectedMessagesPerSecond = 100000; //arbitrary!!!
          const maxExpectedMessagesPerInterval =
            Constants.MESSAGES_TIME_POLL_INTERVAL_MS / 1000 * maxExpectedMessagesPerSecond;
          const resetCalculation =
            newMessageHeight < this.lastMessageHeight ||
            newMessageHeight > this.lastMessageHeight + maxExpectedMessagesPerInterval;
          if (resetCalculation)
            this.messages = [];
          this.lastMessageHeight = newMessageHeight;
  
          // Add a message object for this message to the messages[] array.
          const message = {
            height: newMessageHeight,
            timestamp: new Date(),
          };
          this.messages.push(message);

          // Remove messages that have expired, so that we calculate messages per second based on
          // only the last X minutes. The goal here is to minimize the time a minor API data glitch
          // will affect the messages per second value.
          const expireMs = 60 * 1000; // one minute
          const expiredDate = new Date(message.timestamp.getTime() - expireMs);
          while (this.messages[0].timestamp < expiredDate)
            this.messages.shift();

          let messagesPerSecond;
          if (this.messages.length >= 2) {
            const numMessages =
              this.messages[this.messages.length-1].height - this.messages[0].height;
            const seconds =
              (this.messages[this.messages.length-1].timestamp - this.messages[0].timestamp) / 1000;
            messagesPerSecond = numMessages / seconds;
            console.log('numMessages: ', numMessages); //!!!
            console.log('seconds: ', seconds); //!!!
          }
          else
            messagesPerSecond = -1;
          
          if (resetCalculation) {
            console.log('Glitch!'); //!!!
            console.log(values);//!!!
            // Do not set messagesPerSecond when resetting calculation, avoiding "Calculating...".
            this.setState({
              error: 0
            });
          }
          else {
            this.setState({
              messagesPerSecond: messagesPerSecond,
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
  }*/

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
      `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D%22${Constants.IC_RELEASE}%22%2C%20ic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInHour}`;
      //NO IC_RELEASE: `https://dashboard.dfinity.network/api/datasources/proxy/2/api/v1/query_range?query=sum%20(avg%20by%20(ic_subnet)%20(message_state_transition_completed_ic_duration_seconds_count%7Bic%3D~%22.%2B%22%2Cic_subnet%3D~%22.%2B%22%7D))&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}&step=${secondsInHour}`;
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
