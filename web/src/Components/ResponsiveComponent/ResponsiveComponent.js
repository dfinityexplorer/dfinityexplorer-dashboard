/**
 * @file ResponsiveComponent
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import { Component } from 'react';
import { throttle } from 'throttle-debounce';

/**
 * Base class component which re-renders when the window is resized.
 */
class ResponsiveComponent extends Component {
  /**
   * Create a ResponsiveComponent object.
   * @constructor
   */
  constructor() {
    super();

    // Bind to make 'this' work in callbacks.
    this.handleWindowResize = this.handleWindowResize.bind(this);

    // Throttle the calls to handleWindowResize() so that we're not constantly re-rendering.
    this.throttledHandleWindowResize = throttle(200, true, this.handleWindowResize);
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree).
   * @public
   */
  componentDidMount() {
    window.addEventListener('resize', this.throttledHandleWindowResize);
  }

  /**
   * Invoked by React immediately before a component is unmounted and destroyed.
   * @public
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledHandleWindowResize);
  }

  /**
   * Force the component to re-render when the window is resized.
   * @private
   */
  handleWindowResize() {
    this.forceUpdate();
  }
};

export default ResponsiveComponent;
