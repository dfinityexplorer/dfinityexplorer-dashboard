/**
 * @file Footer
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { loadCSS } from 'fg-loadcss';
import {
  Checkbox,
  Grid,
  Icon,
  IconButton,
  SvgIcon,
  Toolbar,
  Typography
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import ResponsiveComponent from '../ResponsiveComponent/ResponsiveComponent';
import { Breakpoints, getBreakpoint } from '../../utils/breakpoint';
import Constants from '../../constants';

const FooterToolbar = styled(Toolbar)`
  && {
    left: 0;
    right: 0;
    bottom: 0;
    height: ${Constants.FOOTER_HEIGHT + 'px'};
    padding-left: 0px;
    padding-right: 0px;
    text-align: center;
    background: ${props => props.theme.colorFooterBackground};
    color: ${props => props.theme.colorFooterTextIcon};
  }
`;

const OneThirdGrid = styled(Grid)`
  && {
    width: 33.33%;
  }
`;

const LeftThirdGrid = styled(OneThirdGrid)`
  && {
    margin-left: ${Constants.FOOTER_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        margin-left: ${Constants.FOOTER_MARGIN_XS + 'px'};
      `
    }
  }
`;

const RightThirdGrid = styled(OneThirdGrid)`
  && {
    margin-right: ${Constants.FOOTER_MARGIN_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        margin-right: ${Constants.FOOTER_MARGIN_XS + 'px'};
      `
    }
  }
`;

const FooterTypography = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: 12px;
  }
`;

const FooterA = styled.a`
  && {
    color: ${props => props.theme.colorFooterTextIcon};
    text-decoration: underline;
    &:hover {
      cursor: pointer;
    }
  }
`;

const AwesomeIconButtonGrid = styled(Grid)`
  && {
    // Look into why this is needed!!!
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        min-width: 35px;
      `
    }
  }
`;

const AwesomeIconButton = styled(IconButton)`
  && {
    &:hover {
      background: ${props => fade(props.theme.colorIconButtonHover, props.theme.opacityActionHover)};
      color: ${props => props.theme.colorIconButtonHover};
      /* Reset on touch devices. */
      @media (hover: none) {
        background: inherit;
        color: inherit;
      }
    }
  }
`;

const AwesomeIcon = styled(Icon)`
  && {
    font-size: 20px;
  }
`;

const ThemeCheckbox = styled(Checkbox)`
  && {
    width: 26px;
    height: 26px;
    color: ${props => props.theme.colorFooterTextIcon};
    &:hover {
      background: ${props => fade(props.theme.colorIconButtonHover, props.theme.opacityActionHover)};
      color: ${props => props.theme.colorIconButtonHover};
      /* Reset on touch devices. */
      @media (hover: none) {
        background: inherit;
        color: ${props => props.theme.colorFooterTextIcon};
      }
    }
  }
`;

const ThemeSvgIcon = styled(SvgIcon)`
  && {
    margin-top: -1px;
    font-size: 17px;
  }
`;

/**
 * The Footer provides information related to the current screen.
 */
class Footer extends ResponsiveComponent {
  static propTypes = {
    /**
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired,
    /**
     * Callback fired when the value of the theme checkbox changes.
     */    
    handleThemeChange: PropTypes.func.isRequired,
    /**
     * Object containing information about the current react-router location.
     */
    location: PropTypes.object.isRequired
  };

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    super.componentDidMount();

    loadCSS(Constants.URI_CDN_FONT_AWESOME, document.querySelector('#insertion-point-jss'));
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const breakpoint = getBreakpoint();
    return (
      <FooterToolbar>
        <LeftThirdGrid
          container
          direction='row'
          justify='flex-start'
          alignItems='center'
          breakpoint={breakpoint}
        >
          <Grid item>
            <FooterTypography color='inherit'>
              {this.getCopyrightText()}
            </FooterTypography>
          </Grid>
        </LeftThirdGrid>
        <OneThirdGrid container direction='column' justify='center' alignItems='center'>
          { this.props.location.pathname === '/' &&
            <Grid item>
              <FooterTypography color='inherit'>Site Under Development</FooterTypography>
              <FooterTypography color='inherit'>
                {'('}
                <FooterA href={Constants.URI_ABOUT_NOMICS} target='_blank' rel='noopener noreferrer'>
                  {this.getNomicsText()}
                </FooterA>
                {')'}
              </FooterTypography>
            </Grid>
          }
        </OneThirdGrid>
        <RightThirdGrid
          container direction='row'
          justify='flex-end'
          alignItems='center'
          wrap='nowrap'
          breakpoint={breakpoint}
        >
          <AwesomeIconButtonGrid item breakpoint={breakpoint}>
            <AwesomeIconButton
              color='inherit'
              href={Constants.URI_TWITTER_ICP_EXPLORER}
              target='_blank'
              rel='noopener noreferrer'
            >
              <AwesomeIcon className='fa fa-twitter' />
            </AwesomeIconButton>
          </AwesomeIconButtonGrid>
          <AwesomeIconButtonGrid item breakpoint={breakpoint}>
            <AwesomeIconButton
              color='inherit'
              href={Constants.URI_GITHUB_DFINITY_EXPLORER_PROJECT}
              target='_blank'
              rel='noopener noreferrer'
            >
              <AwesomeIcon className='fa fa-github' />
            </AwesomeIconButton>
          </AwesomeIconButtonGrid>
          <AwesomeIconButtonGrid item breakpoint={breakpoint}>
            <ThemeCheckbox
              color='default'
              checked={this.props.isThemeDark}
              icon={
                <ThemeSvgIcon>
                  <path d={Constants.ICON_SVG_PATH_THEME_LIGHT} />
                </ThemeSvgIcon>
              }
              checkedIcon={
                <ThemeSvgIcon>
                  <path d={Constants.ICON_SVG_PATH_THEME_DARK} />
                </ThemeSvgIcon>
              }
              onChange={this.props.handleThemeChange}
            />
          </AwesomeIconButtonGrid>
        </RightThirdGrid>
      </FooterToolbar>
    );
  }

  /**
   * Return the copyright text.
   * @return {String} the copyright text.
   * @private
   */
   getCopyrightText() {
    const year = (new Date()).getFullYear();
    const breakpoint = getBreakpoint();
    switch (breakpoint) {
      case Breakpoints.XS:
        return `© ${year} IC Explorer`;
      case Breakpoints.SM:
        return `© ${year} Internet Computer Explorer`;
      default:
        return `© ${year} Internet Computer Explorer | All rights reserved`;
    }
  }

  /**
   * Return the Nomics attribution link text.
   * @return {String} The Nomics attribution link text.
   * @private
   */
  getNomicsText() {
    const breakpoint = getBreakpoint();
    switch (breakpoint) {
      case Breakpoints.XS:
        return 'Pricing Data By Nomics';
      default:
        return 'Crypto Market Cap & Pricing Data Provided By Nomics';
    }
  }
};

export default withRouter(Footer);
