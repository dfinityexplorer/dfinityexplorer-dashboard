/**
 * @file PieChart
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Paper,
  Typography
} from '@material-ui/core';
import shadows from '@material-ui/core/styles/shadows';
import {
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Text,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const TypographyTitle = styled(Typography)`
  && {
    color: ${props => props.theme.colorBodyTextLink};
    padding-top: 8px;
    text-align: center;
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_2};
    font-weight: 500;
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        font-size: ${Constants.MATERIAL_FONT_SIZE_H6};
      `
    }
  }
`;

const StyledPieChart = styled(RechartsPieChart)`
  && {
    margin-top: -10px;
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_CAPTION};
    font-weight: 400;
  }
`;

/**
 * Base class that implements a pie chart component.
 */
class PieChart extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string,
    /**
     * The height of the chart (not including the title).
     */
    chartHeight: PropTypes.number.isRequired,
    /**
     * Indicates whether to render labels.
     */
    label: PropTypes.bool,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };

  /**
   * Return a ReactElement to render for the label.
   * @param {Object} props Label rendering props.
   * @returns {ReactElement} Element to render for the label.
   */
  renderCustomizedLabel(props) {
    return (
      <Text {...props} alignmentBaseline='middle' className='recharts-pie-label-text'>
        {props.name}
      </Text>
    );
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, className, chartHeight, label, theme } = this.props;
    const data = this.getData();
    const tooltipElevation = 2;
    return (
      <Paper className={className} elevation={1}>
        <TypographyTitle breakpoint={breakpoint}>{this.getTitle()}</TypographyTitle>
        { data.length > 0 &&
          <ResponsiveContainer width='100%' height={chartHeight}>
            <StyledPieChart
              // Setting width to 0 here is a workaround for a problem where ResponsiveContainer
              // does not resize correctly from large to small.
              // https://github.com/recharts/recharts/issues/172
              style={{width: 0}}
            >
              <Pie
                data={data}
                dataKey='value'
                label={label ? this.renderCustomizedLabel : undefined}
              >
                {data.map(entry => (
                  <Cell
                    key={entry.mapKey}
                    fill={entry.fill}
                    // fillOpacity is currently hardcoded, but we can make this configurable in the
                    // future if needed.
                    fillOpacity={theme.isDark ? 0.7 : 0.85}
                    stroke={theme.colorChartGrid}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: theme.colorChartTooltipBackground,
                  border: null,
                  borderRadius: 4,
                  fontSize: Constants.MATERIAL_FONT_SIZE_BODY_2,
                  boxShadow: shadows[tooltipElevation]
                }}
                itemStyle={{ color: theme.colorChartLine }}
                labelStyle={{ color: theme.colorBodyText }}
                cursor={{
                  fill: 'transparent',
                  stroke: theme.colorChartGrid
                }}
              />
            </StyledPieChart>
          </ResponsiveContainer>
        }
      </Paper>
    );
  }

  /**
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    throw new Error('PieChart.getTitle() not implemented.');
  }

  /**
   * Return an array of objects that describe the chart data, where each object contains:
   *  fill: Fill color for the cell.
   *  mapKey: A unique key that identifies the cell.
   *  name: String containing the name of the cell.
   *  value: String containing the value of the cell.
   * @return {Array} An array of objects that describe the chart data.
   * @protected
   */
  getData() {
    throw new Error('PieChart.getData() not implemented.');
  }
}

export default PieChart;
