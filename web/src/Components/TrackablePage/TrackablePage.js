/**
 * @file TrackablePage
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import ReactGA from 'react-ga';
import ResponsiveComponent from '../ResponsiveComponent/ResponsiveComponent';

/**
 * Base class component for a page which is trackable by react-ga.
 */
class TrackablePage extends ResponsiveComponent {
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    super.componentDidMount();

    // Scroll to the top on every page change.
    window.scrollTo(0, 0);

    const pathName = this.props.location.pathname + this.props.location.search;
    this.trackPage(pathName);
  }

  /**
   * Invoked by React immediately after updating occurs. This method is not called for the initial
   * render.
   * @param {Object} prevProps The previous props.
   * @public
   */
  componentDidUpdate(prevProps) {
    const currentPathName = prevProps.location.pathname + prevProps.location.search;
    const nextPathName = this.props.location.pathname + this.props.location.search;

    if (currentPathName !== nextPathName)
      this.trackPage(nextPathName);
  }

  /**
   * Track the page using react-ga.
   * @param {String} pathName The path name of the page.
   * @private
   */
  trackPage(pathName) {
    // Track production build, but not development build.
    if (process.env.NODE_ENV === 'production') {
      ReactGA.set({ page: pathName });
      ReactGA.pageview(pathName);
    }
  }
}

export default TrackablePage;
