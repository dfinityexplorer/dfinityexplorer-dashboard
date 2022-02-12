/**
 * @file TablePager
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components';
import {
  Grid,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  TableCell,
  Toolbar,
  Typography
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const StyledTableCell = styled(TableCell)`
  && {
    &:last-child {
      border-bottom: 0;
      padding: 0px;
    }
  }
`;

const StyledToolbar = styled(Toolbar)`
  && {
    color: ${props => props.theme.colorBodyTextDim};
    min-height: auto;
    padding-left: 2px;
    padding-right: 2px;
  }
`;

const TypographyCaption = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_CAPTION};
    /* Padding to align rows text and count text with rows per page number for non-XS breakpoints. */
    padding-bottom: 1px;
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding-bottom: 0px;
      `
    }
  }
`;

const TypographyRows = styled(TypographyCaption)`
  && {
    margin-top: -1px;
    margin-left: 6px;
    margin-right: 14px;
    ${({ breakpoint }) =>
      (breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) && `
        margin-right: 7px;
      `
    }
  }
`;

const TypographyCount = styled(TypographyCaption)`
  && {
    margin-left: 41px;
    margin-right: 2px;
    ${({ breakpoint }) =>
      (breakpoint === Breakpoints.SM && `
        margin-left: 20px;
      `) ||
      (breakpoint === Breakpoints.XS && `
        margin-left: 20px;
        margin-right: 6px;
      `)
    }
  }
`;

const StyledSelect = styled(({ ...other }) => (
    <Select
      classes={{
        icon: 'icon',
        root: 'root',
        selectMenu: 'selectMenu'
      }}
      {...other}
    />
  ))`
  && {
    color: ${props => props.theme.colorBodyTextDim};
    padding-left: 4px;
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_CAPTION};
    & .icon {
      color: ${props => props.theme.colorBodyTextDim};
      /* Move icon up for non-XS breakpoints. */
      ${({ breakpoint }) =>
        breakpoint !== Breakpoints.XS && `
          top: 0px;
        `
      }
    }
    & .root {
      /**
       * Used to move the rows per page number and the down arrow farther apart. Note that when this
       * was set to a negative number to move them closer together, it caused problems (number
       * abbreviated with ellipses) for a rows per page number with more than two digits (more than
       * 99 rows per page).
       */
      margin-right: 2px;
    }
    & .selectMenu {
      /* Vertically center rows per page number. Not sure why it is not already centered. */
      vertical-align: middle;
      display: table-cell;
    }
  }
`;

const StyledMenuItem = styled(MenuItem)`
  && {
    color: ${props => props.theme.colorBodyTextDim};
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_2};
  }
`;

const StyledIconButton = styled(IconButton)`
  && {
    padding: ${
      ((Constants.TABLE_ROW_HEIGHT_SM_AND_UP - Constants.MATERIAL_UI_ICON_BUTTON_FONT_SIZE) / 2) + 'px'
    };
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding: ${
          ((Constants.TABLE_ROW_HEIGHT_XS - Constants.MATERIAL_UI_ICON_BUTTON_FONT_SIZE) / 2) + 'px'
        };
      `
    }
    &:disabled {
      color: ${props => fade(props.theme.colorBodyTextDim, props.theme.opacityActionDisabled)};
    }
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

const StyledIconButtonNotLast = styled(StyledIconButton)`
  && {
    margin-right: 4px;
  }
`;

/**
 * Component that provides table pagination actions. The Material-UI TablePaginationActions
 * component is basic (e.g., no first and last buttons) and does not provide enough access for
 * styling (e.g., IconButton cannot by styled).
 */
class TablePagerActions extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The total number of rows.
     */
    count: PropTypes.number.isRequired,
    /**
     * Callback fired when the page is changed.
     * @param {Number} pageIndex The index of the new page.
     */
    onChangePage: PropTypes.func.isRequired,
    /**
     * The zero-based index of the current page.
     */
    pageIndex: PropTypes.number.isRequired,
    /**
     * The number of rows per page.
     */
    pageSize: PropTypes.number.isRequired
  };
  
  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const {
      breakpoint,
      count,
      onChangePage,
      pageIndex,
      pageSize,
      ...other
    } = this.props;

    const lastPage = Math.ceil(count / pageSize) - 1;
    return (
      <div {...other}>
        <StyledIconButtonNotLast
          breakpoint={breakpoint}
          color='inherit'
          onClick={() => onChangePage(0)}
          disabled={pageIndex === 0}
          aria-label="First Page"
        >
          <FirstPageIcon />
        </StyledIconButtonNotLast>
        <StyledIconButtonNotLast
          breakpoint={breakpoint}
          color='inherit'
          onClick={() => onChangePage(pageIndex - 1)}
          disabled={pageIndex === 0}
          aria-label="Previous Page"
        >
          <KeyboardArrowLeft />
        </StyledIconButtonNotLast>
        <StyledIconButtonNotLast
          breakpoint={breakpoint}
          color='inherit'
          onClick={() => onChangePage(pageIndex + 1)}
          disabled={pageIndex >= lastPage}
          aria-label="Next Page"
        >
          <KeyboardArrowRight />
        </StyledIconButtonNotLast>
        <StyledIconButton
          breakpoint={breakpoint}
          color='inherit'
          onClick={() => onChangePage(Math.max(0, lastPage))}
          disabled={pageIndex >= lastPage}
          aria-label="Last Page"
        >
          <LastPageIcon />
        </StyledIconButton>
      </div>
    );
  }
}

/**
 * A TableCell-based component for placing inside a TableFooter for pagination. The Material-UI
 * TablePagination component does not provide enough access for styling (e.g., its pop-up menu
 * cannot be fully styled at this time), so we implement our own Material Design pagination
 * component.
 * 
 * Spacing is styled to match table at console.firebase.google.com/.../authentication/users
 * 
 */
class TablePager extends Component {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * The total number of rows.
     */
    count: PropTypes.number.isRequired,
    /**
     * Callback fired when the page is changed.
     * @param {Number} pageIndex The index of the new page.
     */
    onChangePage: PropTypes.func.isRequired,
    /**
     * Callback fired when the number of rows per page is changed.
     * @param {Number} pageSize The number of rows per page.
     */
    onChangePageSize: PropTypes.func,
    /**
     * The zero-based index of the current page.
     */
    pageIndex: PropTypes.number.isRequired,
    /**
     * The number of rows per page.
     */
    pageSize: PropTypes.number.isRequired,
    /**
     * Customizes the options of the rows per page select field. If less than two options are
     * available, no select field will be displayed.
     */
    rowsPerPageOptions: PropTypes.array.isRequired,
    /**
     * The styled-components theme.
     */
    theme: PropTypes.object.isRequired
  };

  /**
   * Invoked by React immediately after updating occurs. This method is not called for the initial
   * render.
   * @public
   */
  componentDidUpdate() {
    const { count, onChangePage, pageIndex, pageSize } = this.props;
    const newLastPage = Math.max(0, Math.ceil(count / pageSize) - 1);
    if (pageIndex > newLastPage) {
      onChangePage(newLastPage);
    }
  }
  
  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const colSpan = 1000; // span all table columns
    return (
      <StyledTableCell colSpan={colSpan} padding='checkbox'>
        {this.getToolbar()}
      </StyledTableCell>
    );
  }

  /**
   * Return the elements for the Toolbar component.
   * @return {Object} The elements for the Toolbar component.
   * @private
   */
  getToolbar() {
    const { breakpoint } = this.props;
    return (
      breakpoint === Breakpoints.XS ?
        // For XS, put the actions buttons on a second row, and center both rows.
        <StyledToolbar>
          <Grid container direction='column' justify='flex-start' alignItems='center'>
            <Grid container direction='row' justify='center' alignItems='center' wrap='nowrap'>
              {this.getRowsSelectCount()}
            </Grid>
            <Grid container direction='row' justify='center' alignItems='center' wrap='nowrap'>
              {this.getActions()}
            </Grid>
          </Grid>
        </StyledToolbar>
      :
        <StyledToolbar>
          <Grid container direction='row' justify='flex-end' alignItems='center' wrap='nowrap'>
            {this.getRowsSelectCount()}
            {this.getActions()}
          </Grid>
        </StyledToolbar>
    );
  }

  /**
   * Return the elements for the rows text, the Select component, and the count text.
   * @return {Object} The elements for the rows text, the Select component, and the count text.
   * @private
   */
  getRowsSelectCount() {
    const {
      breakpoint,
      onChangePageSize,
      pageSize,
      rowsPerPageOptions,
      theme
    } = this.props;
    const rowsText = (breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) ?
      'Rows:' : 'Rows per page:';
    return (
      <Fragment>  
        {rowsPerPageOptions.length > 1 && (
          <Fragment>
            <TypographyRows breakpoint={breakpoint} color='inherit'>
              {rowsText}
            </TypographyRows>
            <StyledSelect
              breakpoint={breakpoint}
              input={<InputBase />}
              value={pageSize}
              onChange={event => onChangePageSize(event.target.value)}
              // Unable to style the Menu background using styled-components.
              MenuProps={{
                PaperProps: {style: {background: theme.colorTableBackgroundPrimary}}
              }}
            >
              {rowsPerPageOptions.map(rowsPerPageOption => (
                <StyledMenuItem
                  key={rowsPerPageOption}
                  value={rowsPerPageOption}
                >
                  {rowsPerPageOption}
                </StyledMenuItem>
              ))}
            </StyledSelect>
          </Fragment>
        )}
        <TypographyCount breakpoint={breakpoint} color='inherit'>
          {this.getCountText()}
        </TypographyCount>
      </Fragment>
    );
  }

  /**
   * Return the text for the count (e.g., 1-10 of 120).
   * @return {Object} The text for the count.
   * @private
   */
  getCountText() {
    const {
      breakpoint,
      count,
      pageIndex,
      pageSize
    } = this.props;

    const from = count === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min(count, (pageIndex + 1) * pageSize);

    let total;
    if (breakpoint === Breakpoints.SM || breakpoint === Breakpoints.XS) {
      if (count >= 1000000000) {
        const t = count / 1000000000;
        total = t.toFixed(Number.isInteger(t) ? 0 : 1) + 'T';
      }
      else if (count >= 1000000) {
        const m = count / 1000000;
        total = m.toFixed(Number.isInteger(m) ? 0 : 1) + 'M';
      }
      else if (count >= 1000) {
        const k = count / 1000;
        total = k.toFixed(Number.isInteger(k) ? 0 : 1) + 'k';
      }
      else
      total = count.toFixed(0);
    }
    else
      total = count.toLocaleString();

    return `${from.toLocaleString()}-${to.toLocaleString()} of ${total}`;
  }

  /**
   * Return the elements for the TablePagerActions component.
   * @return {Object} The elements for the TablePagerActions component.
   * @private
   */
  getActions() {
    const {
      breakpoint,
      count,
      onChangePage,
      pageIndex,
      pageSize
    } = this.props;
    return (
      <TablePagerActions
        breakpoint={breakpoint}
        count={count}
        onChangePage={onChangePage}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
    );
  }
}

// Use the withTheme HOC so that we can use the current theme outside styled components.
export default withTheme(TablePager);
