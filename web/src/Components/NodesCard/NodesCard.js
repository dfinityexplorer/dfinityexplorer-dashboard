/**
 * @file NodesCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import DashCard from '../DashCard/DashCard';
import Constants from '../../constants';

/**
 * This component displays a dashboard card with the current number of nodes retrieved from
 * dashboard.internetcomputer.org/api.
 */
 class NodesCard extends Component {
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
   * Create a NodesCard object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      numberOfNodes: -1,
      error: 0
    };
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {    
    this.getNumberOfNodes();
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let { cardIndex, className } = this.props;
    let { numberOfNodes, error } = this.state;
    
    let numberOfNodesText;
    if (error >= Constants.NETWORK_ERROR_THRESHOLD)
      numberOfNodesText = 'Network error';
    else if (numberOfNodes === -1)
      numberOfNodesText = 'Loading...';
    else
      numberOfNodesText = numberOfNodes.toLocaleString();

    return (
      <DashCard
        className={className}
        cardIndex={cardIndex}
        title='Nodes'
        value={numberOfNodesText}
        svgIconPath={Constants.ICON_SVG_PATH_NODES}
      />
    );
  }

  /**
   * Get the number of nodes.
   * @private
   */
  getNumberOfNodes() {
    const url = `https://ic-api.internetcomputer.org/api/metrics/ic-nodes-count`;
    axios.get(url)
      .then(res => {
        if (res.data.ic_nodes_count.length === 2) {
          let { numberOfNodes } = this.state;
          const newNumberOfNodes = parseInt(res.data.ic_nodes_count[1]);
          if (newNumberOfNodes > numberOfNodes) {
            this.setState({
              numberOfNodes: newNumberOfNodes,
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
  }
}

export default NodesCard;
