/**
 * @file StakedChart
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { withTheme } from 'styled-components';
import axios from 'axios';
import PieChart from '../PieChart/PieChart';

/**
 * This component displays a pie chart showing Staked ICP by neuron state.
 */
class StakedChart extends PieChart { 
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string,
    /**
     * The height of the chart (not including the title).
     */
    chartHeight: PropTypes.number.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };
  
  /**
   * Create a StakedChart object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      dissolvedNeuronsIcp: null,
      dissolvingNeuronsIcp: null,
      error: 0,
      notDissolvingNeuronsIcp: null
    };
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    this.getNnsMetrics();
  }

  /**
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    const { error } = this.state;
    let title = 'Staked ICP';
    if (error)
      title += ' - Network Error'
    return title;
  }

  /**
   * Return an array of objects that describe the chart data, where each object contains:
   *  fill: Fill color for the cell.
   *  mapKey: A unique key that identifies the cell.
   *  name: String containing the name of the cell.
   *  value: Number The numeric value of the cell.
   * @return {Array} An array of objects that describe the chart data.
   * @protected
   */
  getData() {
    const { dissolvedNeuronsIcp, dissolvingNeuronsIcp, notDissolvingNeuronsIcp } = this.state;
    const { theme } = this.props;

    if (dissolvedNeuronsIcp !== null && dissolvingNeuronsIcp !== null
      && notDissolvingNeuronsIcp !== null) {

      const data = [{
          fill: theme.colorPieChart[2],
          mapKey: 0,
          name: 'Non-Dissolving',
          value: Math.round(notDissolvingNeuronsIcp)
        }, {
          fill: theme.colorPieChart[3],
          mapKey: 1,
          name: 'Dissolving',
          value: Math.round(dissolvingNeuronsIcp)
        }, {
          fill: theme.colorPieChart[4],
          mapKey: 2,
          name: 'Dissolved',
          value: Math.round(dissolvedNeuronsIcp)
        }
      ];

      return data;
    }
    else
      return [];
  }

  /**
   * Get the metrics that come from the NNS.
   * @private
   */
   getNnsMetrics() {
    const url = 'https://ic-api.internetcomputer.org/api/nns/metrics';
    axios.get(url)
      .then(res => { 
        // Dissolved Neurons ICP
        const dissolvedNeuronsE8s = res.data.metrics.find(element => {
          return element.name === 'governance_dissolved_neurons_e8s'
        });
        const dissolvedNeuronsIcp = parseInt(dissolvedNeuronsE8s.samples[0].value) / 100000000;

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

        this.setState({
          error: 0,
          dissolvedNeuronsIcp: dissolvedNeuronsIcp,
          dissolvingNeuronsIcp: dissolvingNeuronsIcp,
          notDissolvingNeuronsIcp: notDissolvingNeuronsIcp,
        });
      })
      .catch(() => {
        this.setState(prevState => ({
          error: prevState.error + 1
        }));
      });
  }   
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(StakedChart);
