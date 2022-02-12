/**
 * @file AreaChart
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
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
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const StyledPaper = styled(Paper)`
  && {
    background: ${props => props.theme.colorChartBackground};
    padding-right: 16px;
    padding-bottom: 16px;
  }
`;

const TitleDiv = styled.div`
  && {
    display: flex;
    justify-content: space-between;
  }
`;

const TypographyTitle = styled(Typography)`
  && {
    color: ${props => props.theme.colorBodyText};
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 15px;
    text-align: left;
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_H6};
    font-weight: 300;
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        font-size: ${Constants.MATERIAL_FONT_SIZE_H6};
      `
    }
  }
`;

const StyledAreaChart = styled(RechartsAreaChart)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_CAPTION};
    font-weight: 400;
  }
`;

/**
 * Base class that implements an area chart component.
 */
class AreaChart extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The height of the chart (not including the title).
     */
    chartHeight: PropTypes.number.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint, chartHeight, theme } = this.props;
    const data = this.getData();
    const titleValue = this.getTitleValue();
    const tooltipElevation = 2;
    return (
      <StyledPaper elevation={1}>
        <TitleDiv>
          <TypographyTitle breakpoint={breakpoint}>{this.getTitle()}</TypographyTitle>
          { titleValue !== undefined &&
            <TypographyTitle breakpoint={breakpoint}>{this.getTitleValue()}</TypographyTitle>
          }
        </TitleDiv>
        { data.length > 0 &&
          <ResponsiveContainer width='100%' height={chartHeight}>
            <StyledAreaChart
              data={data}
              margin={{ top: 0, right: 0, left: 4, bottom: 0 }}
              // Setting width to 0 here is a workaround for a problem where ResponsiveContainer
              // does not resize correctly from large to small.
              // https://github.com/recharts/recharts/issues/172
              style={{width: 0}}
            >
              <defs>
                <linearGradient id='colorY' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={theme.colorChartLine} stopOpacity={0.2}/>
                  <stop offset='95%' stopColor={theme.colorChartLine} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={theme.colorChartGrid}
                vertical={false}
              />
              <XAxis
                dataKey={this.getDataKeyX()}
                stroke={theme.colorChartAxes}
                tick={{ fill: theme.colorChartText }}
                tickFormatter={(tick) => this.getGetTickX(tick)}
                tickMargin={8}
                tickSize={6}
              />
              <YAxis
                domain={[
                  dataMin => this.getDomainMinY(dataMin),
                  dataMax => this.getDomainMaxY(dataMax)
                ]}
                stroke={theme.colorChartAxes}
                tick={{ fill: theme.colorChartText }}
                tickFormatter={(tick) => this.getGetTickY(tick)}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(value) => this.getGetTooltipX(value)}
                formatter={(value) => [this.getGetTooltipY(value)]}
                contentStyle={{
                  background: theme.colorChartTooltipBackground,
                  border: null,
                  borderRadius: 4,
                  fontSize: Constants.MATERIAL_FONT_SIZE_BODY_2,
                  boxShadow: shadows[tooltipElevation]
                }}
                itemStyle={{ color: theme.colorChartLine }}
                labelStyle={{ color: theme.colorBodyText }}
                cursor={{ stroke: theme.colorChartGrid }}
                animationDuration={300}
              />
              <Area
                type='monotone'
                dataKey={this.getDataKeyY()}
                stroke={theme.colorChartLine}
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorY)'
                activeDot={{ stroke: theme.colorChartActiveDotStroke, r: 5 }}
                animationDuration={1000}
              />
            </StyledAreaChart>
          </ResponsiveContainer>
        }
      </StyledPaper>
    );
  }

  /**
   * Return the title of the chart.
   * @return {String} The title of the chart.
   * @protected
   */
  getTitle() {
    throw new Error('AreaChart.getTitle() not implemented.');
  }

  /**
   * Return an optional value to display on the title line.
   * @return {String} An optional value to display on the title line.
   * @protected
   */
  getTitleValue() {
    return undefined;
  }

  /**
   * Return an array of objects that describe the chart data.
   * @return {Array} An array of objects that describe the chart data.
   * @protected
   */
  getData() {
    throw new Error('AreaChart.getData() not implemented.');
  }

  /**
   * Return the key of the data to be displayed in the x-axis.
   * @return {String} The key of the data to be displayed in the x-axis.
   * @protected
   */
  getDataKeyX() {
    throw new Error('AreaChart.getDataKeyX() not implemented.');
  }

  /**
   * Return the key of the data to be displayed in the y-axis.
   * @return {String} The key of the data to be displayed in the y-axis.
   * @protected
   */
  getDataKeyY() {
    throw new Error('AreaChart.getDataKeyY() not implemented.');
  }

  /**
   * Return the minimum value of the domain for the Y-axis.
   * @param {dataMin} value The minumum value of the data.
   * @return {String} The minimum value of the domain for the Y-axis.
   * @protected
   */
  getDomainMinY(dataMin) {
    throw new Error('AreaChart.getDomainMinY() not implemented.');
  }

  /**
   * Return the maximum value of the domain for the Y-axis.
   * @param {dataMax} value The maximum value of the data.
   * @return {String} The maximum value of the domain for the Y-axis.
   * @protected
   */
  getDomainMaxY(dataMax) {
    throw new Error('AreaChart.getDomainMaxY() not implemented.');
  }

  /**
   * Return a string for the x-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tick label.
   * @protected
   */
  getGetTickX(value) {
    throw new Error('AreaChart.getGetTickX() not implemented.');
  }

  /**
   * Return a string for the y-axis tick label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tick label.
   * @protected
   */
  getGetTickY(value) {
    throw new Error('AreaChart.getGetTickY() not implemented.');
  }

  /**
   * Return a string for the x-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the x-axis tooltip label.
   * @protected
   */
  getGetTooltipX(value) {
    throw new Error('AreaChart.getGetTooltipX() not implemented.');
  }

  /**
   * Return a string for the y-axis tooltip label corresponding to the specified value.
   * @param {Any} value The value of the data.
   * @return {String} The string for the y-axis tooltip label.
   * @protected
   */
  getGetTooltipY(value) {
    throw new Error('AreaChart.getGetTooltipY() not implemented.');
  }
}

export default AreaChart;
