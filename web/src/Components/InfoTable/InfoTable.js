/**
 * @file InfoCard
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const StyledSwitch = styled(Switch)`
  && {
    // Shrink margins vertically to fit in table cell.
    margin-top: -5px;
    margin-bottom: -5px;
    // Thumb unchecked
    & .MuiSwitch-colorPrimary {
      color: ${props => props.theme.colorBodyButtonText};
    }
    // Thumb checked
    & .MuiSwitch-colorPrimary.Mui-checked {
      color: ${props => props.theme.colorBodyButtonBackground};
    }
    // Track unchecked
    & .MuiSwitch-colorPrimary + .MuiSwitch-track {
      background: ${props => props.theme.colorBodySwitchTrackBackground};
    }
    // Track checked
    & .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track {
      background: ${props => props.theme.colorBodyButtonBackground};
    }
  }
`;

const StyledTable = styled(Table)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
  }
`;

const StyledTableCell = styled(TableCell)`
  && {
    border-top-style: ${props => props.showborders ? 'solid' : null};
    border-top-width: ${props => props.showborders ? props.showborders + 'px' : null};
    border-color: ${props => props.showborders ? props.theme.colorTableRowBorder : 'transparent'};
    color: ${props => props.isaltcolor === 'true' ?
      props.theme.colorBodyTextLink : props.theme.colorBodyText};
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_2};
    white-space: nowrap;
    ${({ breakpoint, usesmallfontforxs }) =>
      ((breakpoint === Breakpoints.XS && usesmallfontforxs) && `
        font-size: ${Constants.MATERIAL_FONT_SIZE_CAPTION};
      `)
    }
  }
`;

const StyledTableRow = styled(TableRow)`
  && {
    height: ${Constants.INFO_TABLE_ROW_HEIGHT_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        height: ${Constants.INFO_TABLE_ROW_HEIGHT_XS + 'px'};
      `
    }
  }
`;

const TableRowFooter = styled(StyledTableRow)`
  && {
    border-top-color: ${props => props.theme.colorTableRowBorder};
    border-top-style: solid;
    border-top-width: 2px;
    height: ${Constants.INFO_TABLE_ROW_HEIGHT_SM_AND_UP / 2 + 'px'};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        height: ${Constants.INFO_TABLE_ROW_HEIGHT_XS / 2 + 'px'};
      `
    }
  }
`;

const TableCellHeader = styled(StyledTableCell)`
  && {
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-color: ${props => props.theme.colorTableRowBorder};
    color: ${props => props.isaltcolor === 'true' ?
      props.theme.colorBodyTextLink : props.theme.colorBodyTextDim};
    font-weight: 500;
  }
`;

const TypographyTitle = styled(Typography)`
  && {
    color: ${props => props.theme.colorBodyText};
    padding-top: 8px;
    padding-bottom: 4px;
    padding-left: 15px;
    text-align: left;
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_H6};
    font-weight: 300;
  }
`;

/**
 * This component displays a static table of information.
 */
class InfoTable extends Component {
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
     * Return an array of objects that describe the body rows, where each object contains:
     *  mapKey: A unique key that identifies the row.
     *  cells: An array of objects that describe the cells of the row, where each object contains:
     *    value: String containing the value of the cell, or undefined if switch is defined.
     *    isAltColor: Use the alternate color for the text of the cell.
     *    isRightAligned: True to right align the table cell content.
     *    switch: Optional object that describes a switch to place in the cell, where each object
     *    contains:
     *      isChecked: If true, the switch is checked.
     *      name: The name of the switch, included in the onChange() callback.
     *      onChange: Callback fired when the state is changed. Function signature:
     *        function(event: object) => void
     *          event.target.name (String): The name of the switch.
     *          event.target.checked (Boolean): The new checked state.
     * @return {Array} An array of objects that describe the body rows.
     */
    getBodyRows: PropTypes.func.isRequired,
    /**
     * Optional array of objects that describe the cells of a header row, where each object
     * contains:
     *  value: String containing the value of the cell.
     *  isAltColor: Use the alternate color for the text of the cell.
     *  isRightAligned: True to right align the table cell content.
     */
    headerRow: PropTypes.array,
    /**
     * Optionally specifies to show table footer.
     */
    showFooter: PropTypes.bool,
    /**
     * Optionally specifies to show row borders.
     */
    showRowBorders: PropTypes.bool,
    /**
     * Optionally specifies to use a small for for the XS breakpoint.
     */
    useSmallFontForXS: PropTypes.bool,
    /**
     * The optional title of the table.
     */
    title: PropTypes.string
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { className, title } = this.props;
    return (
      <Paper className={className} elevation={1}>
        {
          (typeof title !== 'undefined') &&
            <TypographyTitle>{title}</TypographyTitle>
        }
        <StyledTable>
          <TableHead>
            {this.getHeaderRowElement()}
          </TableHead>
          <TableBody>
            {this.getBodyRowElements()}
          </TableBody>
          <TableFooter>
            {this.getFooterRowElement()}
          </TableFooter>
        </StyledTable>
      </Paper>
    );
  }

  /**
   * Return the optional element for the header row.
   * @return {Object} The element for the header row.
   * @private
   */
  getHeaderRowElement() {
    const { breakpoint, headerRow, useSmallFontForXS } = this.props;
    if (typeof headerRow !== 'undefined') {
      return (
        <StyledTableRow breakpoint={breakpoint}>
          {headerRow.map((cell, index) => {
            return (
              // Using index as the key is fine here and for cells in other rows, since we never add,
              // remove, reorder, or filter items in the cell arrays.
              <TableCellHeader
                isaltcolor={cell.isAltColor ? 'true' : 'false'}
                usesmallfontforxs={useSmallFontForXS}
                breakpoint={breakpoint}
                key={index}
                align={cell.isRightAligned ? 'right' : 'inherit'}
                padding='checkbox'
                size='small'
              >
                {cell.value}
              </TableCellHeader>
            );
          })}
        </StyledTableRow>
      );
    }
    else
      return null;
  }

  /**
   * Return the elements for all of the body rows.
   * @return {Object} The elements for all of the body rows.
   * @private
   */
  getBodyRowElements() {
    const { getBodyRows } = this.props;
    let rows = getBodyRows();
    return rows.map((bodyRow, index) => {
      return this.getBodyRowElement(bodyRow, index);
    });
  }

  /**
   * Return the element for the specified body row.
   * @param {Object} bodyRow Object that describes the body row.
   * @param {Number} rowIndex The index of the body row.
   * @return {Object} The element for the specified body row.
   * @private
   */
  getBodyRowElement(bodyRow, rowIndex) {
    const { breakpoint, showRowBorders, useSmallFontForXS } = this.props;
    return (
      <StyledTableRow breakpoint={breakpoint} key={bodyRow.mapKey}>
        {bodyRow.cells.map((cell, index) => {
          return (
            <StyledTableCell
              isaltcolor={cell.isAltColor ? 'true' : 'false'}
              usesmallfontforxs={useSmallFontForXS}
              breakpoint={breakpoint}
              key={index}
              align={cell.isRightAligned ? 'right' : 'inherit'}
              padding='checkbox'
              size='small'
              showborders={showRowBorders ? (rowIndex ? 1 : 2) : 0}
            >
              {
                typeof cell.switch !== 'undefined' ?                               
                  <div>
                    <StyledSwitch
                      checked={cell.switch.isChecked}
                      color='primary'
                      edge={cell.isRightAligned ? 'end' : 'start'}
                      name={cell.switch.name}
                      onChange={cell.switch.onChange}
                    />
                  </div> :
                  cell.value
              }
            </StyledTableCell>
          );
        })}
      </StyledTableRow>
    );
  }

  /**
   * Return the element for the footer row.
   * @return {Object} The element for the footer row.
   * @private
   */
  getFooterRowElement() {
    const { breakpoint, showFooter } = this.props;
    return (
      showFooter === true && <TableRowFooter breakpoint={breakpoint} />
    );
  }
}

export default InfoTable;
