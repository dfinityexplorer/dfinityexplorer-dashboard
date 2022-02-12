/**
 * @file DashCard
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
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

const ImgDiv = styled.div`
  && {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 30px;
    margin-bottom: 34px;
    margin-left: 30px;
    margin-right: 30px;
    width: 42px;
    height: 42px;
  }
`;

const ImgCard = styled.img`
  && {
    max-width: 42px;
    max-height: 42px;
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
    font-size: 26px;
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
     * The d attribute of an SvgIcon path.
     */
    svgIconPath: DashCard.imageIsRequired,
    /**
     * The src attribute of an img element.
     */
    iconImageSrc: DashCard.imageIsRequired,
    /**
     * The title string of the card.
     */
    title: PropTypes.string.isRequired,
    /**
     * The value string or element of the card.
     */
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]).isRequired
  };

  /**
   * Validate that either svgIconPath or iconImageSrc is defined.
   * @param {Object} props The props of the component.
   * @returns {Error} Error if neither svgIconPath nor iconImageSrc is defined.
   */
  static imageIsRequired(props) {
    if (!props.svgIconPath && !props.iconImageSrc)
      return new Error('Either svgIconPath or iconImageSrc is required.');

    if (props.svgIconPath && typeof props.svgIconPath !== 'string')
      return new Error('Invalid prop svgIconPath. Expected string.');

    if (props.iconImageSrc && typeof props.iconImageSrc !== 'string')
      return new Error('Invalid prop iconImageSrc. Expected string.');
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
      iconImageSrc,
      title,
      value
    } = this.props;

    return (
      <Paper className={className} elevation={1}>
        <Grid container direction='row' justify='flex-start' alignItems='center' wrap='nowrap'>
          <Grid item>
            {(typeof svgIconPath === 'string') ?
              <SvgIconCard cardindex={cardIndex}>
                <path d={svgIconPath} />
              </SvgIconCard> :
              <ImgDiv>
                <ImgCard
                  src={iconImageSrc}
                  alt='ICP logo'
                />
              </ImgDiv>
            }
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
