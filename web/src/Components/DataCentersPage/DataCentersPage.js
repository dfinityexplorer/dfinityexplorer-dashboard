/**
 * @file DataCentersPage
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React from "react";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid } from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import Fade from 'react-reveal/Fade';
import CpuCoresCard from '../CpuCoresCard/CpuCoresCard';
import MemoryCard from '../MemoryCard/MemoryCard';
import NodesCard from '../NodesCard/NodesCard';
import SubnetsCard from '../SubnetsCard/SubnetsCard';
import DfinityEarth from '../DfinityEarth/DfinityEarth';
import TrackablePage from '../TrackablePage/TrackablePage'
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const GridEarth = styled(Grid)`
  && {
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        width: 50%;
      `) ||
      ((breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) && `
        width: 100%;
      `)
    }
  }
`;

const GridSection = styled(Grid)`
  && {
    padding-left: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    padding-right: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    transition: ${'padding ' + duration.standard + 'ms ' + easing.easeInOut};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        width: 50%;
      `) ||
      ((breakpoint === Breakpoints.SM) && `
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

const GridCard = styled(Grid)`
  && {
    padding-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        width: 100%;
      `) ||
      ((breakpoint === Breakpoints.SM) && `      
        width: calc(50% - ${Constants.HOME_PAGE_MARGIN_SM_AND_UP/2 + 'px'});
      `) ||
      ((breakpoint === Breakpoints.XS) && `     
        padding-top: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        width: 100%;
      `)
    }
  }
`;

const GridCardLast = styled(GridCard)`
  && {
    padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
  }
`;

const CardCpuCores = styled(CpuCoresCard)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
    color: ${props => props.theme.colorBodyText};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        max-width: ${Constants.DATA_CENTERS_PAGE_CARD_MAX_WIDTH_MD_AND_UP + 'px'};
      `)
    }
  }
`;

const CardMemory = styled(MemoryCard)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
    color: ${props => props.theme.colorBodyText};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        max-width: ${Constants.DATA_CENTERS_PAGE_CARD_MAX_WIDTH_MD_AND_UP + 'px'};
      `)
    }
  }
`;

const CardNodes = styled(NodesCard)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
    color: ${props => props.theme.colorBodyText};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        max-width: ${Constants.DATA_CENTERS_PAGE_CARD_MAX_WIDTH_MD_AND_UP + 'px'};
      `)
    }
  }
`;

const CardSubnets = styled(SubnetsCard)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
    color: ${props => props.theme.colorBodyText};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        max-width: ${Constants.DATA_CENTERS_PAGE_CARD_MAX_WIDTH_MD_AND_UP + 'px'};
      `)
    }
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
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired
  };

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
    const { breakpoint, isThemeDark } = this.props;
    return (
      <Grid container
        direction='row'
        justify='space-between'
        alignItems='center'
      >
        <GridEarth item breakpoint={breakpoint}>
          <DfinityEarth isThemeDark={isThemeDark} />
        </GridEarth>
        <GridSection container
          direction='row'
          justify='space-between'
          alignItems='flex-start'
          breakpoint={breakpoint}
        >
          <GridCard item breakpoint={breakpoint}>
            <Fade
              timeout={500}
            >
              <CardSubnets breakpoint={breakpoint} cardIndex={0} />
            </Fade>
          </GridCard>
          <GridCard item breakpoint={breakpoint}>
            <Fade
              delay={50}
              timeout={500}
            >
              <CardNodes breakpoint={breakpoint} cardIndex={1} />
            </Fade>
          </GridCard>
          <GridCard item breakpoint={breakpoint}>
            <Fade
              delay={100}
              timeout={500}
            >
              <CardCpuCores breakpoint={breakpoint} cardIndex={2} />
            </Fade>
          </GridCard>
          <GridCardLast item breakpoint={breakpoint}>
            <Fade
              delay={150}
              timeout={500}
            >
              <CardMemory breakpoint={breakpoint} cardIndex={3} />
            </Fade>
          </GridCardLast>
        </GridSection>
      </Grid>
    );
  }
}

export default DataCentersPage;
