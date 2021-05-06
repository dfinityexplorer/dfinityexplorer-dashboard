/**
 * @file EarthTooltip
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import { Circle, Layer, Line, Stage } from 'react-konva';
import EarthTooltipTable from '../EarthTooltipTable/EarthTooltipTable';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const KonvaDiv = styled.div`
  && {
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }
`;

const TableDiv = styled.div`
  && {
    width: ${Constants.DATA_CENTERS_PAGE_TOOLTIP_CARD_WIDTH_SM_AND_UP + 'px'};
    position: absolute;
    pointer-events: none;
    z-index: 1;
    left: ${props => props.x + 'px'};
    top: ${props => props.y + 'px'};
    // Add drawer width offset for SM breakpoint with the desktop drawer open, since props.x starts
    // from 0 at the drawer edge for this case. There are likely more elegant ways of accounting for
    // this.
    ${({ breakpoint, isDesktopDrawerOpen, x }) =>
      ((breakpoint === Breakpoints.SM && isDesktopDrawerOpen) && `
        left: ${x + Constants.DRAWER_WIDTH + 'px'};
      `) ||
      (breakpoint === Breakpoints.XS && `
        width: ${Constants.DATA_CENTERS_PAGE_TOOLTIP_CARD_WIDTH_XS + 'px'};
      `)
    }
  }
`;

const TableEarthTooltip = styled(EarthTooltipTable)`
  && {
    background: ${props => props.theme.colorDataCentersCardBackground};
  }
`;

/**
 * This component displays a tooltip for the DfinityEarth component.
 */
class EarthTooltip extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The tooltip city, or null for tooltip undefined, not visible. With object members:
     *  name (String): The name of the city.
     *  lat (Number): The latitude of the city.
     *  lng (Number): The longitude of the city.
     *  dataCenters: Array of data centers objects, with object members:
     *    name (String): The name of the data center (a.k.a., node operator).
     *    numNodes (Number): The number of nodes in the data center.
    */
    city: PropTypes.object,
    /**
     * The height of the component using the tooltip.
     */
    height: PropTypes.number.isRequired,
    /**
     * True if the desktop drawer (large screens) is open. Optional, applies only to
     * dfinityexplorer.org.
     */    
    isDesktopDrawerOpen: PropTypes.bool,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired,
    /**
     * The width of the component using the tooltip.
     */
    width: PropTypes.number.isRequired,
    /**
     * The x position of the tooltip.
     */    
    x: PropTypes.number.isRequired,
    /**
     * The y position of the tooltip.
     */
    y: PropTypes.number.isRequired
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, city, height, isDesktopDrawerOpen, theme, width, x, y } = this.props;

    const tooltipCardWidth = breakpoint === Breakpoints.XS ?
      Constants.DATA_CENTERS_PAGE_TOOLTIP_CARD_WIDTH_XS :
      Constants.DATA_CENTERS_PAGE_TOOLTIP_CARD_WIDTH_SM_AND_UP;
    const cityCircleARadius = 12;
    const cityCircleBRadius = cityCircleARadius * 2;
    const lineXYlength = 35;

    // If tooltip is to left, negate x coordinates.
    const xCoordMult = x < width / 2 ? 1 : -1;

    return (
      city != null &&
        <Fragment>
          <KonvaDiv>
            <Stage width={width} height={height}>
              <Layer>
                <Circle
                  x={x}
                  y={y}
                  width={cityCircleARadius}
                  height={cityCircleARadius}
                  fill={theme.colorDataCentersTooltip}
                  stroke={theme.colorDataCentersTooltip}
                />
                <Circle
                  x={x}
                  y={y}
                  width={cityCircleBRadius}
                  height={cityCircleBRadius}
                  stroke={theme.colorDataCentersTooltip}
                />
                <Line
                  x={x}
                  y={y}
                  lineCap='round'
                  lineJoin='round'
                  points={[
                    0,
                    0,
                    xCoordMult * lineXYlength,
                    -lineXYlength,
                    xCoordMult * (tooltipCardWidth + lineXYlength - 1),
                    -lineXYlength
                  ]}
                  stroke={theme.colorDataCentersTooltip}
                />
              </Layer>
            </Stage>
          </KonvaDiv>
          <TableDiv
            breakpoint={breakpoint}
            isDesktopDrawerOpen={isDesktopDrawerOpen}
            x={
              xCoordMult === 1 ?
                x + lineXYlength :
                x + xCoordMult * lineXYlength - tooltipCardWidth
            }
            // Not sure why XS adjustment is necessary.
            y={y + 30 - (breakpoint === Breakpoints.XS ? 8 : 0)}
          >
            <TableEarthTooltip breakpoint={breakpoint} city={city} />
          </TableDiv>
        </Fragment>
    );
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(EarthTooltip);
