/**
 * @file App
 * @copyright Copyright (c) 2018-2021 Dylan Miller, Todd Kitchens, an dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component, Fragment } from 'react';
import {
  Route,
  HashRouter
} from 'react-router-dom';
import ReactGA from 'react-ga';
import styled, { ThemeProvider } from 'styled-components';
import { loadCSS } from 'fg-loadcss';
import {
  Grid
} from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import { GlobalStyle, themeLight, themeDark } from './theme/globalStyle';
import HomePage from './Components/HomePage/HomePage';
import DataCentersPage from './Components/DataCentersPage/DataCentersPage';
import AboutPage from './Components/AboutPage/AboutPage';
import DEAppBar from './Components/DEAppBar/DEAppBar';
import Footer from './Components/Footer/Footer';
import Constants from './constants';
import { getBreakpoint, isBreakpointDesktop } from './utils/breakpoint';
import { Breakpoints } from './utils/breakpoint';

// Initialize the react-ga library. We do not need user consent to be GDPR compliant. According to
// Google: "When using Google Analytics Advertising Features, you must also comply with the European
// Union User Consent Policy." Advertising Features are not enabled for DFINITY Explorer. Under the
// GDPR, an IP address is considered Personally Identifiable Information (PII), so we anonymize the
// IP addresses sent to Google Analytics.
ReactGA.initialize(Constants.GOOGLE_ANALYTICS_TRACKING_ID);
ReactGA.set({ anonymizeIp: true });

const ContentDiv = styled.div`
  && {
    // Drawer open/close transition applies to all content within the div whenever margin-left
    // changes.
    transition: ${props =>
      'margin-left ' +
      (props.isDesktopDrawerOpen ? duration.enteringScreen : duration.leavingScreen) +
      'ms ' +
      easing.easeInOut};
    // For the Data Centers page, we always use the full width (i.e., margin-left: '0px'), except
    // for the special case of breakpoint SM with the desktop drawer open, in which case we set
    // margin-left to Constants.DRAWER_WIDTH, so that the globe fills the width to the right of the
    // desktop drawer.
    ${({ breakpoint, isDesktopDrawerOpen, isPageDataCenters }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        margin-left: ${(isDesktopDrawerOpen && !isPageDataCenters) ? Constants.DRAWER_WIDTH + 'px' : '0px'};
      `) ||
      ((breakpoint === Breakpoints.SM) && `
        margin-left: ${isDesktopDrawerOpen ? Constants.DRAWER_WIDTH + 'px' : '0px'};
      `) ||
      ((breakpoint === Breakpoints.XS) && `
        margin-left: 0px;
      `)
    }
  }
`;

const ContentGrid = styled(Grid)`
  && {
    /* The height of the body + footer is the total viewport height - App Bar height. */
    min-height: calc(100vh - ${props => props.appbarheight + 'px'});
  }
`;

const FooterDiv = styled.div`
  && {
    // For the Data Centers page, since we always use the full width for breakpoints MD and higher,
    // we need to set the margin for the footer to Constants.DRAWER_WIDTH when the desktop drawer is
    // open.
    // Future enhancement: Implement margin-left transition to exactly match the drawer slide
    // transition. Attempted to do this, but the transition did not begin until the drawer slide
    // transition was complete.
    ${({ breakpoint, isDesktopDrawerOpen, isPageDataCenters }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        margin-left: ${(isDesktopDrawerOpen && isPageDataCenters) ? Constants.DRAWER_WIDTH + 'px' : '0px'};
      `)
    }
  }
`;

/**
 * Top-level component of the app.
 */
class App extends Component {
  /**
   * Create an App object.
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      routerRef: null,
      appBarHeight: 0,
      isDesktopDrawerEnabled: true,
      isMobileDrawerOpen: false,
      isPageDataCenters: false,
      isThemeDark: true
    };

    // Bind to make 'this' work in callbacks.
    this.setRouterRef = this.setRouterRef.bind(this);
    this.handleAppBarResize = this.handleAppBarResize.bind(this);
    this.handleDesktopDrawerMenuClick = this.handleDesktopDrawerMenuClick.bind(this);
    this.handleMobileDrawerMenuClick = this.handleMobileDrawerMenuClick.bind(this);
    this.handleSetIsPageDataCenters = this.handleSetIsPageDataCenters.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
  }
  
  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    // Load fonts.
    loadCSS(
      Constants.URI_CDN_GOOGLE_FONTS,
      document.querySelector('#insertion-point-jss')
    );
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const {
      appBarHeight,
      isDesktopDrawerEnabled,
      isMobileDrawerOpen,
      isPageDataCenters,
      isThemeDark,
      routerRef
    } = this.state;

    const isDesktopDrawerOpen = isDesktopDrawerEnabled && isBreakpointDesktop();
    const breakpoint = getBreakpoint(isDesktopDrawerOpen);
    /* Breakpoint debug code
    let breakpointText = 'undefined';
    switch (breakpoint) {
      case Breakpoints.XS:
        breakpointText = 'XS';
        break;
      case Breakpoints.SM:
        breakpointText = 'SM';
        break;
      case Breakpoints.MD:
        breakpointText = 'MD';
        break;
      case Breakpoints.LG:
        breakpointText = 'LG';
        break;
      case Breakpoints.XL:
        breakpointText = 'XL';
        break;
    }
    console.log(breakpointText);
    */

    return (
      <Fragment>
        <GlobalStyle isPageDataCenters={isPageDataCenters} theme={this.getTheme()} />
        <ThemeProvider theme={this.getTheme()}>
          <HashRouter ref={this.setRouterRef}>
            <div>
              <DEAppBar
                handleAppBarResize={this.handleAppBarResize}
                handleDesktopDrawerMenuClick={this.handleDesktopDrawerMenuClick}
                handleMobileDrawerMenuClick={this.handleMobileDrawerMenuClick}
                isDesktopDrawerOpen={isDesktopDrawerOpen}
                isDesktopDrawerTransparent={isPageDataCenters}
                isMobileDrawerOpen={isMobileDrawerOpen}
                routerRef={routerRef}
              />
              <ContentDiv
                breakpoint={breakpoint}
                isDesktopDrawerOpen={isDesktopDrawerOpen}
                isMobileDrawerOpen={isMobileDrawerOpen}
                isPageDataCenters={isPageDataCenters}
                /* Workaround to force react-parallax to update when drawer opens/closes. Perhaps */
                /* file an issue with react-parallax that Parallax does not update when */
                /* margin-left changes. */
                onTransitionEnd={() => window.dispatchEvent(new Event('resize'))}
              >
                <ContentGrid
                  container
                  direction='column'
                  justify='space-between'
                  appbarheight={appBarHeight}
                >                 
                  <Route
                    exact path='/'
                    render={(props) => 
                      <HomePage
                        {...props}
                        breakpoint={breakpoint}
                      />
                    }
                  />
                  <Route
                    exact path='/datacenters'
                    render={(props) =>
                      <DataCentersPage
                        {...props}
                        breakpoint={breakpoint}
                        handleSetIsPageDataCenters={this.handleSetIsPageDataCenters}
                        isDesktopDrawerOpen={isDesktopDrawerOpen}
                        isThemeDark={isThemeDark}
                      />
                    }
                  />
                  <Route
                    exact path='/about'
                    render={(props) => 
                      <AboutPage
                        {...props}
                        breakpoint={breakpoint}
                        isDesktopDrawerOpen={isDesktopDrawerOpen}
                        isThemeDark={isThemeDark}
                      />
                    }
                  />
                  <FooterDiv
                    breakpoint={breakpoint}
                    isDesktopDrawerOpen={isDesktopDrawerOpen}
                    isPageDataCenters={isPageDataCenters}
                  >
                    <Footer                  
                      handleThemeChange={this.handleThemeChange}
                      isThemeDark={isThemeDark}
                    />
                  </FooterDiv>
                </ContentGrid>
              </ContentDiv>
            </div>
          </HashRouter>
        </ThemeProvider>
      </Fragment>
    );
  }

  /**
   * Set a reference to the HashRouter element.
   * @public
   */
  setRouterRef(element) {
    this.setState({ routerRef: element });
  };

  /**
   * Callback fired when the App Bar is resized.
   * @private
   */
  handleAppBarResize(height) {
    this.setState({
      appBarHeight: height
    });
  }

  /**
   * Callback fired when the desktop drawer (large screens) menu button is clicked.
   * @private
   */
  handleDesktopDrawerMenuClick(contentRect) {
    this.setState({
      isDesktopDrawerEnabled: !this.state.isDesktopDrawerEnabled
    });
  }

  /**
   * Callback fired when the mobile drawer (small screens) menu button is clicked.
   * @private
   */
  handleMobileDrawerMenuClick(contentRect) {
    this.setState({
      isMobileDrawerOpen: !this.state.isMobileDrawerOpen
    });
  }

  /**
   * Callback fired when the value isPageDataCenters changes.
   * @param {Boolean} isPageDataCenters The value of isPageDataCenters.
   * @public
   */
  handleSetIsPageDataCenters(isPageDataCenters) {
    this.setState({
      isPageDataCenters: isPageDataCenters
    });
  }

  /**
   * Callback fired when the value of the Footer component theme checkbox changes.
   * @param {Object} event The event source of the callback.
   * @param {Number} checked The checked value of the switch.
   * @public
   */
  handleThemeChange(event, checked) {
    this.setState({
      isThemeDark: checked
    });
  }

  /**
   * Return the current theme.
   * @return {Object} The current theme.
   * @private
   */
  getTheme() {
    return this.state.isThemeDark ? themeDark : themeLight;
  }
}

export default App;
