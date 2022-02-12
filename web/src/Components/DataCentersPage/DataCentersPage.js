/**
 * @file DataCentersPage
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid } from '@material-ui/core';
import Fade from 'react-reveal/Fade';
import CountriesChart from '../CountriesChart/CountriesChart';
import CountriesTable from '../CountriesTable/CountriesTable';
import DataCentersTable from '../DataCentersTable/DataCentersTable';
import DfinityEarth from '../DfinityEarth/DfinityEarth';
import TrackablePage from '../TrackablePage/TrackablePage'
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const ChartCountries = styled(CountriesChart)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
  }
`;

const GridEarth = styled.div`
  && {
    width: 100%;
  }
`;

const GridPanel = styled(Grid)`
  && {
    width: ${Constants.DATA_CENTERS_PAGE_RIGHT_PANEL_WIDTH_MD_AND_UP + 'px'};
    padding-right: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.SM) && `      
        padding-left: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
        padding-right: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
        width: 100%;
      `) ||
      ((breakpoint === Breakpoints.XS) && `     
        padding-left: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-right: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        width: 100%;
      `)
    }
  }
`;

const GridPanelCard = styled(Grid)`
  && {
    padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        width: 100%;
      `) ||
      ((breakpoint === Breakpoints.SM) && `      
        width: calc(50% - ${Constants.HOME_PAGE_MARGIN_SM_AND_UP/2 + 'px'});
      `) ||
      ((breakpoint === Breakpoints.XS) && `     
        padding-bottom: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        width: 100%;
      `)
    }
  }
`;

const GridPanelCardFirst = styled(GridPanelCard)`
  && {
    padding-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) && `
        padding-top: 0px;
      `)
    }
  }
`;

const GridPanelCardLast = styled(GridPanelCard)`
  && {
    padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
  }
`;

const TableCountries = styled(CountriesTable)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
  }
`;

const TableDataCenters = styled(DataCentersTable)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
  }
`;

const ContainerDiv = styled.div`
  && {
    display: grid;
    grid-template-columns: ${'1fr ' + Constants.DATA_CENTERS_PAGE_RIGHT_PANEL_WIDTH_MD_AND_UP + 'px'};
    grid-template-rows: 1fr;
  }
`;

const GlobeDiv = styled.div`
  && {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row-start: 1;
  }
`;

const PanelDiv = styled.div`
  && {
    grid-column-start: 2;
    grid-column-end: 3;
    grid-row-start: 1;
    z-index: 1;
  }
`;

/**
 * Component for the data centers page.
 */
class DataCentersPage extends TrackablePage {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * True if the desktop drawer (large screens) is open.
     */    
    isDesktopDrawerOpen: PropTypes.bool.isRequired
  };

  /**
   * Create a DataCentersPage object.
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      isSimulationOn: true
    };

    // Bind to make 'this' work in callbacks.
    this.handleSimulationSwitchChange = this.handleSimulationSwitchChange.bind(this);
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    super.componentDidMount();

    // Use a special background color for this component.
    const { handleSetIsPageDataCenters } = this.props;
    handleSetIsPageDataCenters(true);
  }

  /**
   * Invoked by React immediately before a component is unmounted and destroyed.
   * @public
   */
  componentWillUnmount() {
    // Remove the special background color for this component.
    const { handleSetIsPageDataCenters } = this.props;
    handleSetIsPageDataCenters(false);
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint } = this.props;

    if (breakpoint === Breakpoints.XL ||
      breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) {
      return (
        <ContainerDiv>
          <GlobeDiv>
            { this.getGlobe() } 
          </GlobeDiv>
          <PanelDiv>
            { this.getPanel() }
          </PanelDiv>  
        </ContainerDiv>
      );
    }
    else {
      return (
        <Fragment>
          <GridEarth item breakpoint={breakpoint}>
            { this.getGlobe() }
          </GridEarth>
          { this.getPanel() }
        </Fragment>
      );
    }
  }
  
  /**
   * Return the components that make up the globe.
   * @return The components that make up the globe.
   * @private
   */
  getGlobe() {
    const { breakpoint, isDesktopDrawerOpen, isThemeDark } = this.props;
    const { isSimulationOn } = this.state;
    return (
      <DfinityEarth
        breakpoint={breakpoint}
        isDesktopDrawerOpen={isDesktopDrawerOpen}
        isSimulationOn={isSimulationOn}
        isThemeDark={isThemeDark}
      />);
  }

  /**
   * Return the components that make up the panel, consisting of tables and charts that appear
   * beside or below the globe.
   * @return The components that make up the panel.
   * @private
   */
  getPanel() {
    const { breakpoint } = this.props;
    const { isSimulationOn } = this.state;
    return (
      <GridPanel container
        direction='row'
        justify='space-between'
        alignItems='flex-start'
        breakpoint={breakpoint}
      >
        <GridPanelCardFirst item breakpoint={breakpoint}>
          <Fade
            timeout={500}
          >
            <TableDataCenters
              breakpoint={breakpoint}
              handleSimulationSwitchChange={this.handleSimulationSwitchChange}
              isSimulationOn={isSimulationOn}
            />
          </Fade>
        </GridPanelCardFirst>
        <GridPanelCard item breakpoint={breakpoint}>
          <Fade
            delay={50}
            timeout={500}
          >
            <TableCountries breakpoint={breakpoint} />
          </Fade>
        </GridPanelCard>
        <GridPanelCardLast item breakpoint={breakpoint}>
          <Fade
            delay={100}
            timeout={500}
          >
            <ChartCountries
              breakpoint={breakpoint}
              chartHeight={Constants.DATA_CENTERS_PAGE_RIGHT_PANEL_WIDTH_MD_AND_UP}
            />
          </Fade>
        </GridPanelCardLast>
      </GridPanel>
    );
  }

  /**
   * Callback fired when the value of the DataCentersTable component Simulation switch changes.
   * @param {Object} event The event source of the callback. event.target.checked is the checked
   * value of the switch.
   * @public
   */
   handleSimulationSwitchChange(event) {
    this.setState({
      isSimulationOn: event.target.checked
    });
  }
}

export default DataCentersPage;
