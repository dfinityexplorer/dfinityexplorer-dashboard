/**
 * @file HomePage
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React from "react";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Grid,
  Paper, // Disclaimer!!!
  Typography // Disclaimer!!!
} from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import Fade from 'react-reveal/Fade';
import TrackablePage from '../TrackablePage/TrackablePage'
import BlocksCard from '../BlocksCard/BlocksCard';
import BlockTimeCard from '../BlockTimeCard/BlockTimeCard';
import MessagesCard from '../MessagesCard/MessagesCard';
import PriceCard from '../PriceCard/PriceCard';
import BlocksChart from '../BlocksChart/BlocksChart';
import CanistersChart from '../CanistersChart/CanistersChart';
import MessagesChart from '../MessagesChart/MessagesChart';
import PriceChart from '../PriceChart/PriceChart';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';
import { Fragment } from "react";

const GridSection = styled(Grid)`
  && {
    padding-left: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    padding-right: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    transition: ${'padding ' + duration.standard + 'ms ' + easing.easeInOut};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding-left: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-right: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
      `
    }
  }
`;

const GridSectionCharts2 = styled(GridSection)`
  && {
    padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
  }
`;

const GridCard = styled(Grid)`
  && {
    padding-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG) && `
        width: calc(25% - ${Constants.HOME_PAGE_MARGIN_SM_AND_UP*3/4 + 'px'});
      `) ||
      ((breakpoint === Breakpoints.MD || breakpoint === Breakpoints.SM) && `
        width: calc(50% - ${Constants.HOME_PAGE_MARGIN_SM_AND_UP/2 + 'px'});
      `) ||
      (breakpoint === Breakpoints.XS && `
        padding-top: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        width: 100%;
      `)
    }
  }
`;

const GridChart = styled(Grid)`
  && {
    padding-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      ((breakpoint === Breakpoints.XL || breakpoint === Breakpoints.LG || breakpoint === Breakpoints.MD) && `
        width: calc(50% - ${Constants.HOME_PAGE_MARGIN_SM_AND_UP/2 + 'px'});
      `) ||
      ((breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) && `
        width: 100%;
      `)
    }
  }
`;

const CardBlocks = styled(BlocksCard)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
  }
`;

const CardBlockTime = styled(BlockTimeCard)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
  }
`;

const CardMessages = styled(MessagesCard)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
  }
`;

const CardPrice = styled(PriceCard)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
  }
`;

// Disclaimer!!!
const StyledPaper = styled(Paper)`
  && {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 8px;
    margin-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      (breakpoint === Breakpoints.XS && `
        margin-top: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
      `)
    }
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
  }
`;

// Disclaimer!!!
const TypographyTitle = styled(Typography)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
    color: ${props => props.theme.colorBodyText};
    font-family: ${Constants.FONT_PRIMARY};
    font-weight: 300;
    font-size: 14px;
  }
`;

/**
 * Component for the home page.
 */
class HomePage extends TrackablePage {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    return (
      <div>
        {this.getSectionDisclaimer()}
        {this.getSectionCards()}
        {this.getSectionCharts()}
      </div>
    );
  }

  /**
   * Return the elements for the Disclaimer section based on the current breakpoint.
   * @return {Object} The elements for the Disclaimer section based on the current breakpoint.
   * @private
   */
  getSectionDisclaimer()
  {
    const { breakpoint } = this.props;

    return (
      <GridSection container
        direction='row'
        justify='center'
        alignItems='flex-start'
        breakpoint={breakpoint}
      >
        <StyledPaper elevation={1} breakpoint={breakpoint}>
          <TypographyTitle>
            {'Site Under Development'}
          </TypographyTitle>
        </StyledPaper>
      </GridSection>
    );
  }

  /**
   * Return the elements for the Cards section based on the current breakpoint.
   * @return {Object} The elements for the Cards section based on the current breakpoint.
   * @private
   */
  getSectionCards()
  {
    const { breakpoint } = this.props;

    return (
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
            <CardBlocks cardIndex={0} />
          </Fade>
        </GridCard>
        <GridCard item breakpoint={breakpoint}>
          <Fade
            delay={50}
            timeout={500}
          >
            <CardBlockTime cardIndex={1} />
          </Fade>
        </GridCard>
        <GridCard item breakpoint={breakpoint}>
          <Fade
            delay={100}
            timeout={500}
          >
            <CardMessages cardIndex={2} />
          </Fade>
        </GridCard>
        <GridCard item breakpoint={breakpoint}>
          <Fade
            delay={150}
            timeout={500}
          >
            <CardPrice cardIndex={3} />
          </Fade>
        </GridCard>
      </GridSection>
    );
  }

  /**
   * Return the elements for the Charts section based on the current breakpoint.
   * @return {Object} The elements for the Charts section based on the current breakpoint.
   * @private
   */
  getSectionCharts()
  {
    const { breakpoint } = this.props;

    const chartHeight = 352;
    return (
      <Fragment>
        <GridSection container
          direction='row'
          justify='space-between'
          alignItems='flex-start'
          breakpoint={breakpoint}
        >
          <GridChart item breakpoint={breakpoint}>
            <Fade
              timeout={500}
            >
              <BlocksChart chartHeight={chartHeight} breakpoint={breakpoint} />
            </Fade>
          </GridChart>
          <GridChart item breakpoint={breakpoint}>
            <Fade
              delay={50}
              timeout={500}
            >
              <PriceChart chartHeight={chartHeight} breakpoint={breakpoint} />
            </Fade>
          </GridChart>
        </GridSection>
        <GridSectionCharts2 container
          direction='row'
          justify='space-between'
          alignItems='flex-start'
          breakpoint={breakpoint}
        >
          <GridChart item breakpoint={breakpoint}>
            <Fade
              timeout={500}
            >
              <CanistersChart chartHeight={chartHeight} breakpoint={breakpoint} />
            </Fade>
          </GridChart>
          <GridChart item breakpoint={breakpoint}>
            <Fade
              delay={50}
              timeout={500}
            >
              <MessagesChart chartHeight={chartHeight} breakpoint={breakpoint} />
            </Fade>
          </GridChart>
        </GridSectionCharts2>
      </Fragment>
    );
  }
}

export default HomePage;
