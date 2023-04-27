/**
 * @file IcpMetricsTable
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import InfoTable, { InfoTableTextColor } from '../InfoTable/InfoTable';
import Constants from '../../constants';

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
      circulatingSupplyIcp: {value: null, error: 0},
      //pricing!!!dilutedCap: {value: null, error: 0},
      //pricing!!!marketCap: {value: null, error: 0},
      totalStakedIcp: {value: null, error: 0},
      totalSupplyIcp: {value: null, error: 0}
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    this.getCirculatingSupply();
    //pricing!!!this.getNomicsMetrics(); 
    this.getNnsMetrics();
    this.getTotalSupply();

    // Poll for new data using intervals.
    this.interval = setInterval(
      () => {
        this.getCirculatingSupply();
        //pricing!!!this.getNomicsMetrics(); 
        this.getNnsMetrics();
        this.getTotalSupply();
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
    //pricing!!!const { dilutedCap, marketCap } = this.state;

    return [
      /*pricing!!!{
        mapKey: 0,
        cells: this.getRowCellsDollarMetric('Market Cap', marketCap)
      },
      {
        mapKey: 1,
        cells: this.getRowCellsDollarMetric('Fully Diluted Market Cap', dilutedCap)
      },*/
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
        cells: this.getRowCellsTotalStaked()
      }
    ];
  }

  /**
   * Get the circulating supply.
   * @private
   */
  getCirculatingSupply() {
    const url = 'https://ledger-api.internetcomputer.org/supply/circulating/latest';
    axios.get(url)
      .then(res => {
        const circulatingSupplyIcp = {
          value: parseInt(res.data[1]) / 100000000,
          error: 0
        };
        this.setState({
          circulatingSupplyIcp: circulatingSupplyIcp
        });
      })
      .catch(() => {
        this.setState(({ circulatingSupplyIcp }) => ({
          circulatingSupplyIcp: {
            ...circulatingSupplyIcp,
            error: circulatingSupplyIcp.error + 1
          }
        }))
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
        // Dissolving Neurons ICP
        const dissolvingNeuronsE8s = res.data.metrics.find(element => {
          return element.name === 'governance_dissolving_neurons_e8s_count'
        });
        const dissolvingNeuronsIcp = parseInt(dissolvingNeuronsE8s.samples[0].value) / 100000000;

        // Not Dissolving Neurons ICP
        const notDissolvingNeuronsE8s = res.data.metrics.find(element => {
          return element.name === 'governance_not_dissolving_neurons_e8s_count'
        });
        const notDissolvingNeuronsIcp =
          parseInt(notDissolvingNeuronsE8s.samples[0].value) / 100000000;

        const totalStakedIcp = {
          value: dissolvingNeuronsIcp + notDissolvingNeuronsIcp,
          error: 0
        };
        this.setState({
          totalStakedIcp: totalStakedIcp
        });
      })
      .catch(() => {
        this.setState(({ totalStakedIcp }) => ({
          totalStakedIcp: {
            ...totalStakedIcp,
            error: totalStakedIcp.error + 1
          }
        }))
      });
  }

  /**
   * Get the metrics that come from Nomics.
   * @private
   */
  /*pricing!!!getNomicsMetrics() {
    const url =
      `https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=ICP&interval=1d`;
    axios.get(url)
      .then(res => {
        const _totalSupplyIcp = parseFloat(res.data[0].max_supply);
        const dilutedCap = {
          value: _totalSupplyIcp * parseFloat(res.data[0].price),
          error: 0
        };
        const marketCap = {
          value: parseFloat(res.data[0].market_cap),
          error: 0
        };
        this.setState({
          dilutedCap: dilutedCap,
          marketCap: marketCap
        });
      })
      .catch(() => {
        this.setState(({ dilutedCap, marketCap }) => ({
          dilutedCap: {
            ...dilutedCap,
            error: dilutedCap.error + 1
          },
          marketCap: {
            ...marketCap,
            error: marketCap.error + 1
          }
        }));
      });
  }*/

  /**
   * Get the total supply.
   * @private
   */
  getTotalSupply() {
    const url = 'https://ledger-api.internetcomputer.org/supply/total/latest';
    axios.get(url)
      .then(res => {
        const totalSupplyIcp = {
          value: parseInt(res.data.[1]) / 100000000,
          error: 0
        };
        this.setState({
          totalSupplyIcp: totalSupplyIcp
        });
      })
      .catch(() => {
        this.setState(({ totalSupplyIcp }) => ({
          totalSupplyIcp: {
            ...totalSupplyIcp,
            error: totalSupplyIcp.error + 1
          }
        }))
      });
  }

  /**
   * Return the table cells for the Circulating Supply row.
   * @return {Array} the table cells for the Circulating Supply row.
   * @private
   */
  getRowCellsCirculatingSupply() {
    const { circulatingSupplyIcp, totalSupplyIcp } = this.state;

    let metricText;
    if (circulatingSupplyIcp.error >= Constants.NETWORK_ERROR_THRESHOLD
      || totalSupplyIcp.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (circulatingSupplyIcp.value === null || totalSupplyIcp.value === null)
      metricText = 'Loading...';
    else
      metricText = Math.round(circulatingSupplyIcp.value).toLocaleString() + ' ICP';

    return [
      {value: 'Circulating Supply', color: InfoTableTextColor.GRAY, isRightAligned: false},
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
   * Return the table cells for the Total Staked row.
   * @return {Array} the table cells for the Total Staked row.
   * @private
   */
  getRowCellsTotalStaked() {
    const { totalStakedIcp, totalSupplyIcp } = this.state;

    let metricText;
    if (totalStakedIcp.error >= Constants.NETWORK_ERROR_THRESHOLD
      || totalSupplyIcp.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (totalStakedIcp.value === null || totalSupplyIcp.value === null)
      metricText = 'Loading...';
    else {
      const totalStakedPercent = totalStakedIcp.value / totalSupplyIcp.value * 100;
      metricText =
        Math.round(totalStakedIcp.value).toLocaleString() +
        ' ICP (' + totalStakedPercent.toFixed(1) + '%)';
    }

    return [
      {value: 'Total Staked', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the Total Supply row.
   * @param {String} description The description text of the metric object.
   * @param {Object} metric The metric object.
   * @return {Array} The table cells for the Total Supply row.
   * @private
   */
  getRowCellsTotalSupply() {
    const { totalSupplyIcp } = this.state;

    let metricText;
    if (totalSupplyIcp.error >= Constants.NETWORK_ERROR_THRESHOLD)
      metricText = 'Network error';
    else if (totalSupplyIcp.value === null)
      metricText = 'Loading...';
    else {
      metricText =
      totalSupplyIcp.value.toLocaleString(
          undefined, {'minimumFractionDigits': 0, 'maximumFractionDigits': 0}) + ' ICP';
    }

    return [
      {value: 'Total Supply', color: InfoTableTextColor.GRAY, isRightAligned: false},
      {value: metricText, isRightAligned: true}
    ];
  }
}

export default IcpMetricsTable;
