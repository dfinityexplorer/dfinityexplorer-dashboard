/**
 * @file globalStyle
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { createGlobalStyle } from 'styled-components';
import Constants from '../constants';

/**
 * StyledComponent that handles global styles.
 */
export const GlobalStyle = createGlobalStyle`
   body {
    margin: 0;
    padding: 0;
    background: ${
      props => props.isPageDataCenters ?
        props.theme.colorDataCentersPageBackground : props.theme.colorBodyBackground
    };
   }
`;

/**
 * The styled-components ThemeProvider light theme.
 */
export const themeLight = {
  // Should use constants for all!!!
  isDark: false,
  colorAboutBackgroundPrimary: '#FFFFFF',
  colorAboutBackgroundSecondary: '#F8F9FA', // Google Analytics (verified), Wikipedia (verified)
  colorAboutHeaderText: '#FFFFFF',
  colorAboutTwitterBackground: '#FFFFFF',
  colorAppBarBackground: '#FFFFFF',
  colorAppBarTextButton: Constants.COLOR_LIGHT_TEXT_FADED, // (#4D4D4D)
  colorAppBarIcpText: Constants.COLOR_LIGHT_BODY_TEXT_GOOGLE,
  colorAppBarExplorerText: Constants.COLOR_DFINITY_BLUE_700,
  colorBodyBackground: '#F8F9FA', // Wikipedia (verified)
  colorBodyButtonBackground: Constants.COLOR_DFINITY_BLUE_700,
  colorBodyButtonText: Constants.COLOR_TEXT_LIGHT,
  colorBodyButtonHoverBackground: Constants.COLOR_DFINITY_BLUE_500,
  colorBodyButtonHoverText: Constants.COLOR_TEXT_LIGHT,
  colorBodySwitchTrackBackground: null, // use default
  colorBodyText: Constants.COLOR_LIGHT_BODY_TEXT_GOOGLE,
  colorBodyTextDim: Constants.COLOR_LIGHT_BODY_TEXT_DIM_GOOGLE,
  colorBodyTextLink: Constants.COLOR_DFINITY_BLUE_700,
  colorDashCardBackground: '#FFFFFF',
  colorDashCardIcon: [Constants.COLOR_DFINITY_BLUE_700, '#9440A6', '#F79308', '#DA005E'], // Ori's purple and orange
  colorDashCardIconOpacity: 1.0,
  colorDataCentersCardBackground: 'rgba(255, 255, 255, 0.85)',
  colorDataCentersGlobeAtmosphere: Constants.COLOR_DFINITY_BLUE_700,
  colorDataCentersGlobePoint: Constants.COLOR_MATERIAL_PALETTE_LIGHT_GREEN_700_LIGHT,
  colorDataCentersPageBackground: '#F8F9FA', // Wikipedia (verified)
  colorDataCentersTooltip: Constants.COLOR_MATERIAL_PALETTE_LIGHT_GREEN_700_LIGHT,
  colorDrawerBackground: '#FFFFFF',
  colorDrawerBackgroundTransparent: 'rgba(255, 255, 255, 0.85)',
  colorDrawerDivider: Constants.COLOR_LIGHT_DRAWER_DIVIDER_GOOGLE,
  colorDrawerIcon: Constants.COLOR_LIGHT_DRAWER_ICON_GOOGLE,
  colorDrawerIconTextSelected: Constants.COLOR_DFINITY_BLUE_700,
  colorDrawerText: Constants.COLOR_LIGHT_DRAWER_TEXT_GOOGLE,
  colorChartBackground: '#FFFFFF',
  colorChartTooltipBackground: 'rgba(255, 255, 255, 0.96)',
  colorChartAxes: Constants.COLOR_LIGHT_BODY_TEXT_DIM_GOOGLE,
  colorChartGrid: Constants.COLOR_LIGHT_DRAWER_DIVIDER_GOOGLE,
  colorChartText: Constants.COLOR_LIGHT_BODY_TEXT_DIM_GOOGLE,
  colorChartLine: Constants.COLOR_DFINITY_BLUE_700,
  colorChartActiveDotStroke: '#FFFFFF',
  colorIconButtonHover: '#000000',
  colorInfoTableTextGray: Constants.COLOR_LIGHT_DRAWER_TEXT_GOOGLE,
  colorTableBackgroundPrimary: '#FFFFFF',
  colorTableRowBorder: Constants.COLOR_LIGHT_DRAWER_DIVIDER_GOOGLE,
  colorTableTextDim: '#909090', // YouTube, footer text dim (verified)
  colorFooterBackground: '#F5F5F5',
  colorFooterTextIcon: '#909090', // YouTube (verified)
  colorPieChart: [
    Constants.COLOR_DFINITY_BLUE_400,
    Constants.COLOR_DFINITY_BLUE_500,
    Constants.COLOR_DFINITY_BLUE_600,
    Constants.COLOR_DFINITY_BLUE_700,
    Constants.COLOR_DFINITY_BLUE_800,
    Constants.COLOR_DFINITY_BLUE_900,
    Constants.COLOR_DFINITY_BLUE_100,
    Constants.COLOR_DFINITY_BLUE_200,
    Constants.COLOR_DFINITY_BLUE_300],
  colorPriceTextNegative: Constants.COLOR_PRICE_TEXT_NEGATIVE_CMC,
  colorPriceTextPositive: Constants.COLOR_PRICE_TEXT_POSITIVE_CMC,
  colorSearchText: Constants.COLOR_LIGHT_BODY_TEXT_GOOGLE,
  colorSearchIcon: '#9E9E9E', //  Material Design icon(verified)
  opacityActionDisabled: 0.26, // Material-UI createPalette.js theme.palette.action.disabled light theme
  opacityActionHover: 0.08 // Material-UI createPalette.js theme.palette.action.hoverOpacity light theme
}

/**
 * The styled-components ThemeProvider dark theme.
 */
export const themeDark = {
  isDark: true,
  colorAboutBackgroundPrimary: Constants.COLOR_DARK_BODY_DARKER_MAC_OS,
  colorAboutBackgroundSecondary: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorAboutHeaderText: '#FFFFFF',
  colorAboutTwitterBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorAppBarBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorAppBarTextButton: Constants.COLOR_DARK_TEXT_FADED,
  colorAppBarIcpText: Constants.COLOR_DARK_TEXT,
  colorAppBarExplorerText: Constants.COLOR_DFINITY_LIGHT_ORANGE,
  colorBodyBackground: Constants.COLOR_DARK_BODY_DARKER_MAC_OS,
  colorBodyButtonBackground: Constants.COLOR_DFINITY_BLUE_600,
  colorBodyButtonText: Constants.COLOR_DARK_TEXT_MAC_OS,
  colorBodyButtonHoverBackground: Constants.COLOR_DFINITY_BLUE_500,
  colorBodyButtonHoverText: Constants.COLOR_TEXT_LIGHT,
  colorBodySwitchTrackBackground: '#535353', // this is darkened t0 #333333 by Switch code
  colorBodyText: Constants.COLOR_DARK_TEXT_MAC_OS,
  colorBodyTextDim: Constants.COLOR_DARK_TEXT_MAC_OS,
  colorBodyTextLink: Constants.COLOR_DFINITY_BLUE_600,
  colorDashCardBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorDashCardIcon: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  colorDashCardIconOpacity: 0.5,
  colorDataCentersCardBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS_ALPHA_85,
  colorDataCentersGlobeAtmosphere: Constants.COLOR_DFINITY_BLUE_600,
  colorDataCentersGlobePoint: Constants.COLOR_DFINITY_BLUE_600,
  colorDataCentersPageBackground: '#000000',
  colorDataCentersTooltip: Constants.COLOR_DFINITY_BLUE_600,
  colorDrawerBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorDrawerBackgroundTransparent: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS_ALPHA_85,
  colorDrawerDivider: Constants.COLOR_DARK_DRAWER_DIVIDER_YOUTUBE,
  colorDrawerIcon: Constants.COLOR_DARK_TEXT_FADED,
  colorDrawerIconTextSelected: '#FFFFFF',
  colorDrawerText: Constants.COLOR_DARK_TEXT_FADED,
  colorChartBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorChartTooltipBackground: 'rgba(38, 38, 38, 0.96)',
  colorChartAxes: Constants.COLOR_DARK_FOOTER_TEXT_ICON_NETFLIX,
  colorChartGrid: Constants.COLOR_DARK_DRAWER_DIVIDER_MAC_OS,
  colorChartText: Constants.COLOR_DARK_TEXT_FADED,
  colorChartLine: Constants.COLOR_DFINITY_BLUE_600,
  colorChartActiveDotStroke: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorIconButtonHover: Constants.COLOR_DARK_TEXT,
  colorInfoTableTextGray: Constants.COLOR_DARK_TEXT_FADED,
  colorTableBackgroundPrimary: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorTableRowBorder: Constants.COLOR_DARK_DRAWER_DIVIDER_YOUTUBE,
  colorTableTextDim: '#717171', // YouTube (Dark), footer text dim (verified)
  colorFooterBackground: Constants.COLOR_DARK_BODY_LIGHTER_MAC_OS,
  colorFooterTextIcon: Constants.COLOR_DARK_FOOTER_TEXT_ICON_NETFLIX,
  colorPieChart: [
    Constants.COLOR_DFINITY_BLUE_800,
    Constants.COLOR_DFINITY_BLUE_700,
    Constants.COLOR_DFINITY_BLUE_600,
    Constants.COLOR_DFINITY_BLUE_500,
    Constants.COLOR_DFINITY_BLUE_400,
    Constants.COLOR_DFINITY_BLUE_300,
    Constants.COLOR_DFINITY_BLUE_200,
    Constants.COLOR_DFINITY_BLUE_100,
    Constants.COLOR_DFINITY_BLUE_900
  ],
  colorPriceTextNegative: Constants.COLOR_PRICE_TEXT_NEGATIVE_CMC,
  colorPriceTextPositive: Constants.COLOR_PRICE_TEXT_POSITIVE_CMC,
  colorSearchText: Constants.COLOR_LIGHT_BODY_TEXT_GOOGLE,
  colorSearchIcon: '#9E9E9E', //  Material Design icon (verified)
  opacityActionDisabled: 0.3, // Material-UI createPalette.js theme.palette.action.disabled dark theme
  opacityActionHover: 0.1 // Material-UI createPalette.js theme.palette.action.hoverOpacity dark theme
}
