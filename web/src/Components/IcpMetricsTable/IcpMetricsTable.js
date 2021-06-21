/**
 * @file IcpMetricsTable
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import InfoTable, { InfoTableTextColor } from '../InfoTable/InfoTable';
import Constants from '../../constants';
import getMaxAgeBonus from '../../utils/getMaxAgeBonus';
import { Breakpoints } from '../../utils/breakpoint';

/**
 * This component displays a table with ICP-related info.
 */
class IcpMetricsTable extends Component {
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
   * Create a IcpMetricsTable object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);

    this.state = {
      circulatingSupply: {value: null, error: 0},
      dilutedCap: {value: null, error: 0},
      lockedInNeurons: {minValue: null, maxValue: null, error: 0},
      marketCap: {value: null, error: 0},
      totalSupply: {value: null, error: 0}
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {  
    this.getNomicsMetrics(); 
    this.getNnsMetrics();

    // Poll for new data using intervals.
    this.interval = setInterval(
      () => {
        this.getNomicsMetrics(); 
        this.getNnsMetrics();
      },
      Constants.ICP_METRICS_INTERVAL_MS);
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
    const { dilutedCap, marketCap } = this.state;

    return [
      {
        mapKey: 0,
        cells: this.getRowCellsDollarMetric('Market Cap', marketCap)
      },
      {
        mapKey: 1,
        cells: this.getRowCellsDollarMetric('Fully Diluted Market Cap', dilutedCap)
      },
      {
        mapKey: 2,
        cells: this.getRowCellsTotalSupply()
      },
      {
        mapKey: 3,
        cells: this.getRowCellsCirculatingSupply()
      },
      {
        mapKey: 4,
        cells: this.getRowCellsLockedInNeurons()
      }
    ];
  }

  /**
   * Get the metrics that come from the NNS.
   * @private
   */
  getNnsMetrics() {
    const url = 'https://ic-api.internetcomputer.org/api/nns/metrics';
    axios.get(url)
      .then(res => {
        // Calculate ICP Locked in Neurons as a range. It is not currently possible to obtain the
        // exact value.
        const totalVotingPowerE8s = res.data.metrics.find(element => {
          return element.name === 'governance_voting_power_total'
        });
        const totalVotingPower = parseInt(totalVotingPowerE8s.samples[0].value) / 100000000;
        const maxAgeBonus = getMaxAgeBonus();
        const maxDissolveDelayBonus = 2;
        const lockedInNeurons = {
          minValue: totalVotingPower / (maxAgeBonus * maxDissolveDelayBonus),
          maxValue: totalVotingPower,
          error: 0
        };
        this.setState({
          lockedInNeurons: lockedInNeurons
        });
      })
      .catch(() => {
        this.setState(({ lockedInNeurons }) => ({
          lockedInNeurons: {
            ...lockedInNeurons,
            error: lockedInNeurons.error + 1
          }
        }))
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
        const circulatingSupply = {
          value: parseFloat(res.data[0].circulating_supply),
          error: 0
        };
        const _totalSupply = parseFloat(res.data[0].max_supply);
        const dilutedCap = {
          value: _totalSupply * parseFloat(res.data[0].price),
          error: 0
        };
        const marketCap = {
          value: parseFloat(res.data[0].market_cap),
          error: 0
        };
        const totalSupply = {
          value: _totalSupply,
          error: 0
        };
        this.setState({
          circulatingSupply: circulatingSupply,
          dilutedCap: dilutedCap,
          marketCap: marketCap,
          totalSupply: totalSupply
        });
      })
      .catch(() => {
        this.setState(({ circulatingSupply, dilutedCap, marketCap, totalSupply }) => ({
          circulatingSupply: {
            ...circulatingSupply,
            error: circulatingSupply.error + 1
          },
          dilutedCap: {
            ...dilutedCap,
            error: dilutedCap.error + 1
          },
          marketCap: {
            ...marketCap,
            error: marketCap.error + 1
          },
          totalSupply: {
            ...totalSupply,
            error: totalSupply.error + 1
          }
        }));
      });
  }

  /**
   * Return the table cells for the Circulating ICP Supply row.
   * @return {Array} the table cells for the Circulating Supply row.
   * @private
   */
  getRowCellsCirculatingSupply() {
    const { circulatingSupply, totalSupply } = this.state;

    let metricText;
    if (circulatingSupply.error >= Constants.NETWORK_ERROR_THRESHOLD
      || totalSupply.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (circulatingSupply.value === null || totalSupply.value === null)
      metricText = 'Loading...';
    else {
      const circulatingSupplyPercent = circulatingSupply.value / totalSupply.value * 100;                                    
      metricText =
        Math.round(circulatingSupply.value).toLocaleString() +
        ' (' + circulatingSupplyPercent.toFixed(1) + '%)';
    }

    return [
      {value: 'Circulating ICP Supply', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the specified dollar-value row.
   * @param {String} description The description text of the metric object.
   * @param {Object} metric The metric object.
   * @return {Array} The table cells for the specified dollar-value row.
   * @private
   */
  getRowCellsDollarMetric(description, metric) {
    let metricText;
    if (metric.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (metric.value === null)
      metricText = 'Loading...';
    else
      metricText = '$' + Math.round(metric.value).toLocaleString();

    return [
      {value: description, color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the ICP Locked in Neurons row.
   * @return {Array} The table cells for the ICP Locked in Neurons row.
   * @private
   */
  getRowCellsLockedInNeurons() {
    const { breakpoint } = this.props;
    const { lockedInNeurons, totalSupply } = this.state;

    let metricText;
    if (lockedInNeurons.error >= Constants.NETWORK_ERROR_THRESHOLD
      || totalSupply.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (lockedInNeurons.minValue === null || totalSupply.value === null)
      metricText = 'Loading...';
    else {
      const lockedInNeuronsMinM = Math.round(lockedInNeurons.minValue / 1000000);
      const lockedInNeuronsMaxM = Math.round(lockedInNeurons.maxValue / 1000000);
      const lockedInNeuronsMinPercent =
        Math.round(lockedInNeurons.minValue / totalSupply.value * 100);                                    
      const lockedInNeuronsMaxPercent =
        Math.round(lockedInNeurons.maxValue / totalSupply.value * 100);                                    
      metricText =
        lockedInNeuronsMinM.toLocaleString(
          undefined, {'minimumFractionDigits': 0, 'maximumFractionDigits': 0}) +
        (breakpoint === Breakpoints.XS ? 'M-' : 'M - ') +
        lockedInNeuronsMaxM.toLocaleString(
          undefined, {'minimumFractionDigits': 0, 'maximumFractionDigits': 0}) +
        'M (' +
        lockedInNeuronsMinPercent.toLocaleString() +
        (breakpoint === Breakpoints.XS ? '%-' : '% - ') +
        lockedInNeuronsMaxPercent.toLocaleString() +
        '%)';
    }

    return [
      {value: 'ICP Locked in Neurons', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the Total ICP Supply row.
   * @param {String} description The description text of the metric object.
   * @param {Object} metric The metric object.
   * @return {Array} The table cells for the specified ICP-value row.
   * @private
   */
  getRowCellsTotalSupply() {
    const { totalSupply } = this.state;

    let metricText;
    if (totalSupply.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (totalSupply.value === null)
      metricText = 'Loading...';
    else {
      metricText =
        totalSupply.value.toLocaleString(
          undefined, {'minimumFractionDigits': 0, 'maximumFractionDigits': 0});
    }

    return [
      {value: 'Total ICP Supply', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }
}

export default IcpMetricsTable;
