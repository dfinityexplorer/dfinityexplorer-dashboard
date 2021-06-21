/**
 * @file DataCentersTable
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import InfoTable, { InfoTableTextColor } from '../InfoTable/InfoTable';
import Constants from '../../constants';

/**
 * This component displays a table with data centers info retrieved from
 * dashboard.internetcomputer.org/api.
 */
class DataCentersTable extends Component {
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
     * Callback fired when the value of the Simulation switch changes.
     */    
    handleSimulationSwitchChange: PropTypes.func.isRequired,
    /**
     * True if the simulation switch is checked, otherwise false.
     */    
    isSimulationOn: PropTypes.bool.isRequired
  };

  /**
   * Create a DataCentersTable object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);

    this.state = {
      memoryTotal: {count: -1, error: 0},
      numberOfBoundaryNodes: {count: -1, error: 0},
      numberOfCpuCores: {count: -1, error: 0},
      numberOfDataCenters: {count: -1, error: 0},
      numberOfNodes: {count: -1, error: 0},
      numberOfNodeProviders: {count: -1, error: 0},
      numberOfSubnets: {count: -1, error: 0}
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    this.getNumberOfDataCenters();
    this.getNumberOfNodeProviders();
    this.getNumberOfSubnets();
    this.getNumberOfNodes();
    this.getNumberOfBoundaryNodes();
    this.getNumberOfCpuCores();
    this.getMemoryTotal();
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
    const {
      numberOfBoundaryNodes,
      numberOfCpuCores,
      numberOfDataCenters,
      numberOfNodes,
      numberOfNodeProviders,
      numberOfSubnets
    } = this.state;

    return [
      {
        mapKey: 0,
        cells: this.getRowCells(numberOfDataCenters, 'Data Centers')
      },
      {
        mapKey: 1,
        cells: this.getRowCells(numberOfNodeProviders, 'Node Providers')
      },
      {
        mapKey: 2,
        cells: this.getRowCells(numberOfSubnets, 'Subnets')
      },
      {
        mapKey: 3,
        cells: this.getRowCells(numberOfNodes, 'Active Nodes')
      },
      {
        mapKey: 4,
        cells: this.getRowCells(numberOfBoundaryNodes, 'Boundary Nodes')
      },
      {
        mapKey: 5,
        cells: this.getRowCells(numberOfCpuCores, 'CPU Cores')
      },
      {
        mapKey: 6,
        cells: this.getRowCellsMemoryTotal()
      },
      {
        mapKey: 7,
        cells: this.getRowCellsAvgNodes()
      },
      {
        mapKey: 8,
        cells: this.getRowCellsAvgCores()
      },
      {
        mapKey: 9,
        cells: this.getRowCellsAvgMemory()
      },
      {
        mapKey: 10,
        cells: this.getRowCellsSimulationSwitch()
      }
    ];
  }

  /**
   * Get the memory total.
   * @private
   */
  getMemoryTotal() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-memory-total`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_memory_total.length === 1 && res.data.ic_memory_total[0].length === 2) {
          const memoryTotal = {
            count: parseInt(res.data.ic_memory_total[0][1]),
            error: 0
          };
          this.setState({
            memoryTotal: memoryTotal
          });
        }
      })
      .catch(() => {
        this.setState(({ memoryTotal }) => ({
          memoryTotal: {
            ...memoryTotal,
            error: memoryTotal.error + 1
          }
        }));
      });
  }

  /**
   * Get the number of nodes.
   * @private
   */
  getNumberOfBoundaryNodes() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/boundary-nodes-count`;
    axios.get(url)
      .then(res => {
        if (res.data.boundary_nodes_count.length === 2) {
          const numberOfBoundaryNodes = {
            count: parseInt(res.data.boundary_nodes_count[1]),
            error: 0
          };
          this.setState({
            numberOfBoundaryNodes: numberOfBoundaryNodes
          });
        }
      })
      .catch(() => {
        this.setState(({ numberOfBoundaryNodes }) => ({
          numberOfBoundaryNodes: {
            ...numberOfBoundaryNodes,
            error: numberOfBoundaryNodes.error + 1
          }
        }));
      });
  }

  /**
   * Get the number of CPU cores.
   * @private
   */
  getNumberOfCpuCores() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-cpu-cores`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_cpu_cores.length === 1 && res.data.ic_cpu_cores[0].length === 2) {
          const numberOfCpuCores = {
            count: parseInt(res.data.ic_cpu_cores[0][1]),
            error: 0
          };
          this.setState({
            numberOfCpuCores: numberOfCpuCores
          });
        }
      })
      .catch(() => {
        this.setState(({ numberOfCpuCores }) => ({
          numberOfCpuCores: {
            ...numberOfCpuCores,
            error: numberOfCpuCores.error + 1
          }
        }));
      });
  }

  /**
   * Get the number of data centers.
   * @private
   */
  getNumberOfDataCenters() {
    const url = `https://ic-api.internetcomputer.org/api/locations`;
    axios.get(url)
      .then(res => {
        // Create an array of data center locations.
        let locations = res.data.map((value) => {
          return {
            numNodes: parseInt(value.total_nodes)
          };
        });

        // Remove data center locations without any nodes.
        locations = locations.filter((location) => {
          return location.numNodes > 0;
        });

        const numberOfDataCenters = {
          count: locations.length,
          error: 0
        };
        this.setState({
          numberOfDataCenters: numberOfDataCenters
        });
    })
    .catch(() => {
      this.setState(({ numberOfDataCenters }) => ({
        numberOfDataCenters: {
          ...numberOfDataCenters,
          error: numberOfDataCenters.error + 1
        }
      }));
    });
  }

  /**
   * Get the number of nodes.
   * @private
   */
  getNumberOfNodes() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-nodes-count`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_nodes_count.length === 1 && res.data.ic_nodes_count[0].length === 2) {
          const numberOfNodes = {
            count: parseInt(res.data.ic_nodes_count[0][1]),
            error: 0
          };
          this.setState({
            numberOfNodes: numberOfNodes
          });
        }
      })
      .catch(() => {
        this.setState(({ numberOfNodes }) => ({
          numberOfNodes: {
            ...numberOfNodes,
            error: numberOfNodes.error + 1
          }
        }));
      });
  }

  /**
   * Get the number of node providers.
   * @private
   */
   getNumberOfNodeProviders() {
    const url = `https://ic-api.internetcomputer.org/api/node-providers/count`;
    axios.get(url)
      .then(res => {
        if (res.data.node_providers.length === 1) {
          const numberOfNodeProviders = {
            count: parseInt(res.data.node_providers[0].node_providers),
            error: 0
          };
          this.setState({
            numberOfNodeProviders: numberOfNodeProviders
          });
        }
      })
      .catch(() => {
        this.setState(({ numberOfNodeProviders }) => ({
          numberOfNodeProviders: {
            ...numberOfNodeProviders,
            error: numberOfNodeProviders.error + 1
          }
        }));
      });
  }

  /**
   * Get the number of subnets.
   * @private
   */
  getNumberOfSubnets() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-subnet-total`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_subnet_total.length === 2) {
          const numberOfSubnets = {
            count: parseInt(res.data.ic_subnet_total[1]),
            error: 0
          };
          this.setState({
            numberOfSubnets: numberOfSubnets
          });
        }
      })
      .catch(() => {
        this.setState(({ numberOfSubnets }) => ({
          numberOfSubnets: {
            ...numberOfSubnets,
            error: numberOfSubnets.error + 1
          }
        }));
      });
  }
  
  /**
   * Return the table cells for the specfied "numberOf" row.
   * @param {Object} numberOf The "numberOf" object.
   * @param {String} description The description text of the "numberOf" object.
   * @return {Array} the table cells for the specfied "numberOf" row.
   * @private
   */
  getRowCells(numberOf, description) {
    let countText;
    if (numberOf.error >= Constants.NETWORK_ERROR_THRESHOLD)
      countText = 'Network error';
    else if (numberOf.count === -1)
      countText = 'Loading...';
    else
      countText = numberOf.count.toLocaleString();

    return [
      {value: description, color: InfoTableTextColor.LINK, isRightAligned: false},
      {value: countText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the average cores per node row.
   * @return {Array} the table cells for the average cores per node row.
   * @private
   */
  getRowCellsAvgCores() {
    const { numberOfCpuCores, numberOfNodes } = this.state;

    let avgCoresText;
    if (numberOfCpuCores.error >= Constants.NETWORK_ERROR_THRESHOLD ||
      numberOfNodes.error >= Constants.NETWORK_ERROR_THRESHOLD)
      avgCoresText = 'Network error';
    else if (numberOfCpuCores.count === -1 || numberOfNodes.count === -1)
      avgCoresText = 'Loading...';
    else {
      const avgCores = numberOfCpuCores.count / numberOfNodes.count;                                    
      avgCoresText = Math.round(avgCores).toLocaleString();
    }

    return [
      {value: 'Avg Node Cores', color: InfoTableTextColor.LINK, isRightAligned: false},
      {value: avgCoresText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the average memory per node row.
   * @return {Array} the table cells for the average memory per node row.
   * @private
   */
  getRowCellsAvgMemory() {
    const { memoryTotal, numberOfNodes } = this.state;

    let avgMemoryText;
    if (memoryTotal.error >= Constants.NETWORK_ERROR_THRESHOLD ||
      numberOfNodes.error >= Constants.NETWORK_ERROR_THRESHOLD)
      avgMemoryText = 'Network error';
    else if (memoryTotal.count === -1 || numberOfNodes.count === -1)
      avgMemoryText = 'Loading...';
    else {
      const avgMemoryTb = memoryTotal.count / numberOfNodes.count / 1000000000000;                                    
      avgMemoryText = avgMemoryTb.toFixed(2) + 'TB';
    }

    return [
      {value: 'Avg Node Memory', color: InfoTableTextColor.LINK, isRightAligned: false},
      {value: avgMemoryText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the average nodes per data center row.
   * @return {Array} the table cells for the average nodes per data center row.
   * @private
   */
  getRowCellsAvgNodes() {
    const { numberOfDataCenters, numberOfNodes } = this.state;

    let avgNodesText;
    if (numberOfDataCenters.error >= Constants.NETWORK_ERROR_THRESHOLD ||
      numberOfNodes.error >= Constants.NETWORK_ERROR_THRESHOLD)
      avgNodesText = 'Network error';
    else if (numberOfDataCenters.count === -1 || numberOfNodes.count === -1)
      avgNodesText = 'Loading...';
    else {
      const avgNodes = numberOfNodes.count / numberOfDataCenters.count;                                    
      const avgNodesPercent = numberOfDataCenters.count / numberOfNodes.count * 100;                                    
      avgNodesText =
        Math.round(avgNodes).toLocaleString() + ' (' + avgNodesPercent.toFixed(1) + '%)';
    }

    return [
      {value: 'Avg DC Nodes', color: InfoTableTextColor.LINK, isRightAligned: false},
      {value: avgNodesText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the memoryTotal row.
   * @return {Array} the table cells for the memoryTotal row.
   * @private
   */
  getRowCellsMemoryTotal() {
    const { memoryTotal } = this.state;

    let memoryTotalText;
    if (memoryTotal.error >= Constants.NETWORK_ERROR_THRESHOLD)
      memoryTotalText = 'Network error';
    else if (memoryTotal.count === -1)
      memoryTotalText = 'Loading...';
    else {
      const memoryTotalPb = memoryTotal.count / 1000000000000000;                                    
      memoryTotalText = memoryTotalPb.toFixed(3) + 'PB';
    }

    return [
      {value: 'Memory', color: InfoTableTextColor.LINK, isRightAligned: false},
      {value: memoryTotalText, isRightAligned: true}
    ];
  }

  /**
   * Return the table cells for the simulation switch row.
   * @return {Array} the table cells for the simulation switch row.
   * @private
   */
  getRowCellsSimulationSwitch() {
    const { handleSimulationSwitchChange, isSimulationOn } = this.props;
    return [
      {value: 'Simulation', color: InfoTableTextColor.LINK, isRightAligned: false},
      {
        isRightAligned: true,
        switch: {
          isChecked: isSimulationOn,
          name: 'simulation',
          onChange: handleSimulationSwitchChange
        }
      }
    ];
  }
}

export default DataCentersTable;
