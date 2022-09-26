/**
 * @file NetworkMetricsTable
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import InfoTable, { InfoTableTextColor } from '../InfoTable/InfoTable';
import Constants from '../../constants';
import getMaxAgeBonus from '../../utils/getMaxAgeBonus';

/**
 * This component displays a table with ICP-related info.
 */
class NetworkMetricsTable extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string
  };

  /**
   * Create a NetworkMetricsTable object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);

    this.state = {
      dailyVotingRewards: {value: null, error: 0},
      icpToUsd: {value: null, error: 0},
      internetIdentityAccounts: {value: null, error: 0},
      maxRewardsPercent: {value: null, error: 0},
      nnsProposalCount: {value: null, error: 0},
      totalVotingPower: {value: null, error: 0}
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    this.getInternetIdentityAccounts();
    this.getNomicsMetrics(); 
    this.getNnsMetrics();
    this.getNnsProposalCount();

    // Poll for new data using intervals.
    this.interval = setInterval(
      () => {
        this.getInternetIdentityAccounts();
        this.getNomicsMetrics(); 
        this.getNnsMetrics();
        this.getNnsProposalCount();
      },
      Constants.NETWORK_METRICS_INTERVAL_MS);
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
    const { breakpoint, className } = this.props;
    
    return (
      <InfoTable
        breakpoint={breakpoint}
        className={className}
        getBodyRows={this.getBodyRows}
      />
    );
  }

  /**
   * Return an array of objects that describe the body rows, where each object contains:
   *  mapKey: A unique key that identifies the row.
   *  cells: An array of objects that describe the cells of the row, where each object contains:
   *    value: String containing the value of the cell.
   *    color: Use the specified InfoTableTextColor for the text of the cell, or undefined to use
   *      the default color.
   *    isRightAligned: True to right align the table cell content.
   * @return {Array} An array of objects that describe the body rows.
   * @protected
   */
  getBodyRows() {
    const { internetIdentityAccounts, nnsProposalCount, totalVotingPower } = this.state;

    return [
      {
        mapKey: 0,
        cells: this.getRowCellsMetric('Total Voting Power', totalVotingPower)
      },
      {
        mapKey: 1,
        cells: this.getRowCellsDailyVotingRewards(),
      },
      {
        mapKey: 2,
        cells: this.getRowCellsMaxRewardsPercent()
      },
      {
        mapKey: 3,
        cells: this.getRowCellsMetric('NNS Proposals', nnsProposalCount)
      },
      {
        mapKey: 4,
        cells: this.getRowCellsMetric('Internet Identity Anchors', internetIdentityAccounts)
      }
    ];
  }

  /**
   * Get the number of Internet Identity accounts.
   * @private
   */
  getInternetIdentityAccounts() {
    const url = 'https://ic-api.internetcomputer.org/api/v3/metrics/internet-identity-user-count';
    axios.get(url)
      .then(res => {
        const internetIdentityAccounts = {
          value: parseInt(res.data.internet_identity_user_count[0][1]),
          error: 0
        };
        this.setState({
          internetIdentityAccounts: internetIdentityAccounts
        });
      })
      .catch(() => {
        this.setState(({ internetIdentityAccounts }) => ({
          internetIdentityAccounts: {
            ...internetIdentityAccounts,
            error: internetIdentityAccounts.error + 1
          }
        }));
      });
  }

  /**
   * Get the metrics that come from the NNS.
   * @private
   */
  getNnsMetrics() {
    const url = 'https://ic-api.internetcomputer.org/api/v3/staking-metrics';
    axios.get(url)
      .then(res => {
        // Total Voting Power
        const totalVotingPowerE8s = res.data.metrics.find(element => {
          return element.name === 'governance_voting_power_total'
        });
        const totalVotingPower = {
          value: parseInt(totalVotingPowerE8s.samples[0].value) / 100000000,
          error: 0
        };

        // Daily Voting Rewards Maturity
        const lastRewardEventE8s = res.data.metrics.find(element => {
          return element.name === 'governance_last_rewards_event_e8s'
        });
        const lastRewardEvent = parseInt(lastRewardEventE8s.samples[0].value) / 100000000;
        const dailyVotingRewards = {
          value: lastRewardEvent,
          error: 0
        }

        // Max Annual Voting Rewards
        const dailyRewardPerVotingPowerUnit = lastRewardEvent / totalVotingPower.value;
        const maxAgeBonus = getMaxAgeBonus();
        const maxDissolveDelayBonus = 2;
        const maxDailyReward =
          dailyRewardPerVotingPowerUnit * maxAgeBonus * maxDissolveDelayBonus;
        const maxRewardsPercent = {
          value: maxDailyReward * 365 * 100,
          error: 0
        };

        this.setState({
          dailyVotingRewards: dailyVotingRewards,
          maxRewardsPercent: maxRewardsPercent,
          totalVotingPower: totalVotingPower
        });
      })
      .catch(() => {
        this.setState(({ dailyVotingRewards, maxRewardsPercent, totalVotingPower }) => ({
          dailyVotingRewards: {
            ...dailyVotingRewards,
            error: dailyVotingRewards.error + 1
          },
          maxRewardsPercent: {
            ...maxRewardsPercent,
            error: maxRewardsPercent.error + 1
          },
          totalVotingPower: {
            ...totalVotingPower,
            error: totalVotingPower.error + 1
          }
        }))
      });
  }

  /**
   * Get the NNS proposal count.
   * @private
   */
  getNnsProposalCount() {
    const url = 'https://ic-api.internetcomputer.org/api/v3/metrics/latest-proposal-id';
    axios.get(url)
      .then(res => {
        const nnsProposalCount = {
          value: parseInt(res.data.latest_proposal_id),
          error: 0
        };
        this.setState({
          nnsProposalCount: nnsProposalCount
        });
      })
      .catch(() => {
        this.setState(({ nnsProposalCount }) => ({
          nnsProposalCount: {
            ...nnsProposalCount,
            error: nnsProposalCount.error + 1
          }
        }));
      });
  }

  /**
   * Get the metrics that come from Nomics.
   * @private
   */
  getNomicsMetrics() {
    const url =
      `https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=ICP&interval=1d`;
    axios.get(url)
      .then(res => {
        const icpToUsd = {
          value: parseFloat(res.data[0].price),
          error: 0
        };
        this.setState({
          icpToUsd: icpToUsd
        });
      })
      .catch(() => {
        this.setState(({ icpToUsd }) => ({
          icpToUsd: {
            ...icpToUsd,
            error: icpToUsd.error + 1
          }
        }));
      });
  }

  /**
   * Return the table cells for the Daily Voting Rewards Maturity row.
   * @return {Array} The table cells for the Daily Voting Rewards Maturity row.
   * @private
   */
  getRowCellsDailyVotingRewards() {
    const { dailyVotingRewards, icpToUsd } = this.state;

    let metricText;
    if (dailyVotingRewards.error >= Constants.NETWORK_ERROR_THRESHOLD
      || icpToUsd.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (dailyVotingRewards.value === null || icpToUsd.value === null)
      metricText = 'Loading...';
    else {
      const dailyVotingRewardsUsdM =
        Math.round(icpToUsd.value * dailyVotingRewards.value / 1000000);
      metricText =
        Math.round(dailyVotingRewards.value).toLocaleString() +
        ' ($' +
        dailyVotingRewardsUsdM.toLocaleString(
          undefined, {'minimumFractionDigits': 1, 'maximumFractionDigits': 1}) +
        'M)';
    }

    return [
      {value: 'Daily Voting Rewards Maturity', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the Max Annual Voting Rewards row.
   * @return {Array} The table cells for the Max Annual Voting Rewards row.
   * @private
   */
  getRowCellsMaxRewardsPercent() {
    const { maxRewardsPercent } = this.state;

    let metricText;
    if (maxRewardsPercent.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (maxRewardsPercent.value === null)
      metricText = 'Loading...';
    else {
      metricText = maxRewardsPercent.value.toFixed(1) + '%';
    }

    return [
      {value: 'Max Annual Voting Rewards', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the specified row.
   * @param {String} description The description text of the metric object.
   * @param {Object} metric The metric object.
   * @return {Array} The table cells for the specified row.
   * @private
   */
  getRowCellsMetric(description, metric) {
    let metricText;
    if (metric.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (metric.value === null)
      metricText = 'Loading...';
    else
      metricText = Math.round(metric.value).toLocaleString();

    return [
      {value: description, color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }
}

export default NetworkMetricsTable;
