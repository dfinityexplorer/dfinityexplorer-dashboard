/**
 * @file DashCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Grid,
  Paper,
  SvgIcon,
  Typography
} from '@material-ui/core';
import Constants from '../../constants';

const GridNoWrap = styled(Grid)`
  && {
    /* Setting min-width to 0px allows the Grid to narrow past the implied width of its children. */
    min-width: 0px;
  }
`;

const SvgIconCard = styled(SvgIcon)`
  && {
    /* The combination of margin, padding, and font-size explicitly set the height of the card. */
    margin: 30px;
    font-size: 42px;
    opacity: ${props => props.theme.colorDashCardIconOpacity};
    color: ${props => props.theme.colorDashCardIcon[props.cardindex]};
  }
`;

const TypographyTitle = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-weight: 300;
    font-size: 14px;
  }
`;

const TypographyValue = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-weight: 200;
    font-size: 28px;
  }
`;

/**
 * This component displays a dashboard card.
 */
class DashCard extends Component { 
  static propTypes = {
    /**
     * The index of the card. Used for theming.
     */
    cardIndex: PropTypes.number.isRequired,
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string,
    /**
     * The d attribute of the SvgIcon path.
     */
    svgIconPath: PropTypes.string.isRequired,
    /**
     * Function to subscribe to receive new objects of the card using GraphQL.
     */
    subscribeToNewObjects: PropTypes.func,
    /**
     * The title string of the card.
     */
    title: PropTypes.string.isRequired,
    /**
     * The value string of the card.
     */
    value: PropTypes.string.isRequired
  };

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    // Subscribe to receive new objects of the card using GraphQL.
    if (this.props.subscribeToNewObjects)
      this.props.subscribeToNewObjects();
  }
  
  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    let {
      cardIndex,
      className,
      svgIconPath,
      title,
      value
    } = this.props;

    return (
      <Paper className={className} elevation={1}>
        <Grid container direction='row' justify='flex-start' alignItems='center' wrap='nowrap'>
          <Grid item>
            <SvgIconCard cardindex={cardIndex}>
              <path d={svgIconPath} />
            </SvgIconCard>
          </Grid>
          <GridNoWrap container direction='column' justify='center' alignItems='flex-start'>
            {/* The usage of Grid elements here is required to get Typography noWrap to work. */}
            <Grid container direction='row' justify='flex-start' alignItems='center'>
              <GridNoWrap item>
                <TypographyTitle className={className} noWrap>
                  {title}
                </TypographyTitle>
              </GridNoWrap>
            </Grid>
            <Grid container direction='row' justify='flex-start' alignItems='center'>
              <GridNoWrap item>
                <TypographyValue className={className} noWrap>
                  {value}
                </TypographyValue>
              </GridNoWrap>
            </Grid>
          </GridNoWrap>
        </Grid>
      </Paper>
    );
  }
}

export default DashCard;
