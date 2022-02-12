/**
 * @file PagedTable
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  CircularProgress,
  Fade,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import zIndex from '@material-ui/core/styles/zIndex';
import TablePager from '../TablePager/TablePager';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const StyledPaper = styled(Paper)`
  && {
    background: ${props => props.theme.colorTableBackgroundPrimary};
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

const DivCircularProgress = styled.div<{ breakpoint: number }>`
  && {
    position: absolute;
    /* Set to modal z-index so that progress indicator is above table.  */
    z-index: ${zIndex.modal};
    /* Add padding under the progress indicator for XS to compensate for the larger footer. */
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding-bottom: 30px;
      `
    }
  }
`;

const StyledCircularProgress = styled(CircularProgress)`
  && {
    color: ${props => props.theme.colorBodyButtonBackground};
  }
`;

const StyledTable = styled(Table)<{ breakpoint: number, loading: number }>`
  && {
    /* Same easing as Material-UI . */
    transition: ${'opacity ' + duration.standard + 'ms ' + easing.easeInOut};
    opacity: ${props => props.loading ? 0.5 : 1.0};
    font-family: ${Constants.FONT_PRIMARY};
    ${({ breakpoint }) =>
      ((breakpoint !== Breakpoints.XS) && `
        min-width: 800px;
      `)
    }
  }
`;

const StyledTableRow = styled(TableRow)<{ breakpoint: number }>`
  && {
    height: ${Constants.TABLE_ROW_HEIGHT_SM_AND_UP + 'px'};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        height: ${Constants.TABLE_ROW_HEIGHT_XS + 'px'};
      `
    }
  }
`;

const TableRowFooter = styled(StyledTableRow)`
  && {
    border-top-color: ${props => props.theme.colorTableRowBorder};
    border-top-style: solid;
    border-top-width: 2px;
  }
`;

const StyledTableCell = styled(TableCell)<{ breakpoint: number }>`
  && {
    border-color: ${props => props.theme.colorTableRowBorder};
    color: ${props => props.theme.colorBodyText};
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_2};
    white-space: nowrap;
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        font-size: ${Constants.FONT_SIZE_TABLE_XS};
      `
    }
  }
`;

const TableCellHeader = styled(StyledTableCell)`
  && {
    border-bottom-style: solid;
    border-bottom-width: 2px;
    color: ${props => props.theme.colorBodyTextDim};
    font-weight: 500;
  }
`;

const StyledLink = styled(Link)`
  && {
    color: ${props => props.theme.colorBodyTextLink};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

/**
 * Describes the cells of a PagedTable row.
 */
export interface PagedTableCell
{
  /**
   * The value of the cell.
   */
  value: string;
  /**
   * True if the cell contains a numeric value, false otherwise.
   */
  isNumeric: boolean;
  /**
   * Optional string which provides a link for the cell (to= prop of Link).
   */
  link?: string;
}

/**
 * Describes a body row of a PagedTable.
 */
export interface PagedTableBodyRow {
  /**
  * A unique key that identifies the row.
  */
  mapKey: string;
  /**
   * An array of PagedTableCell objects that describe the cells of the row.
   */
  cells: Array<PagedTableCell>;
}

interface PagedTableProps {
  /**
   * The current Breakpoint, taking the desktop drawer (large screens) width into account.
   */    
  breakpoint: number;
  /**
   * An array that specifies the column widths of the table.
   */    
  columnWidths: Array<string>;
  /**
   * The total number of rows.
   */
  count: number;
  /**
   * Return an array of PagedTableBodyRow objects that describe the body rows.
   * @return {Array} An array of PagedTableBodyRow that describe the body rows.
   */
  getBodyRows: () => Array<PagedTableBodyRow>;
  /**
   * An array of PagedTableCell objects that describe the cells of the header row.
   */
  headerRow: Array<PagedTableCell>;
  /**
   * Indicates whether the table is currently loading data.
   */
  isLoading: boolean;
  /**
   * Callback fired when the page is changed.
   * @param {number} pageIndex The index of the new page.
   */
  onChangePage: (pageIndex: number) => void;
  /**
   * Callback fired when the number of rows per page is changed.
   * @param {number} pageSize The number of rows per page.
   */
  onChangePageSize: (pageSize: number) => void;
  /**
   * The current page index.
   */
  pageIndex: number|null;
  /**
   * The page size of the table.
   */    
  pageSize: number;
  /**
   * The title of the table.
   */
  title: string;
}

/**
 * This component displays a table that supports pagination.
 */
const PagedTable = (
  {
    breakpoint,
    columnWidths,
    count,
    getBodyRows,
    headerRow,
    isLoading,
    onChangePage,
    onChangePageSize,
    pageIndex,
    pageSize,
    title
  }: PagedTableProps) => {

  /**
   * Return the elements for the table.
   * @return {JSX.Element} The elements for the table.
   * @private
   */
  const getTableElements = (): JSX.Element => {
    return (
      <Grid container
        direction='column'
        justify='center'
        alignItems='center'
      >
        <Fade in={isLoading} timeout={duration.standard} mountOnEnter unmountOnExit>
          <DivCircularProgress breakpoint={breakpoint}>
            <StyledCircularProgress size={Constants.MATERIAL_CIRCULAR_INDICATOR_SIZE} />
          </DivCircularProgress>
        </Fade>
        <TableContainer>
          <StyledTable breakpoint={breakpoint} loading={isLoading ? 1 : 0}>
            <colgroup>
              {columnWidths.map((width, index) => {
                // The column width settings seem to be ignored in many cases, depending on cell
                // length. That is, when cell lengths are long, the widths are ignored.
                return (
                  <col key={index} width={width} />
                );
              })}
            </colgroup>
            <TableHead>
              {getHeaderRowElement()}
            </TableHead>
            <TableBody>
              {getBodyRowElements()}
            </TableBody>
            <TableFooter>
              {getFooterRowElement()}
            </TableFooter>
          </StyledTable>
        </TableContainer>
      </Grid>
    );
  }

  /**
   * Return the element for the header row.
   * @return {JSX.Element} The element for the header row.
   */
  const getHeaderRowElement = (): JSX.Element => {
    return (
      <StyledTableRow breakpoint={breakpoint}>
        {headerRow.map((cell, index) => {
          return (
            // Using index as the key is fine here and for cells in other rows, since we never add,
            // remove, reorder, or filter items in the cell arrays.
            <TableCellHeader
              breakpoint={breakpoint}
              key={index}
              align={cell.isNumeric ? 'right' : 'inherit'}
              padding='checkbox'
              size='small'
            >
              {cell.link ?
                <StyledLink to={cell.link}>{cell.value}</StyledLink> :
                cell.value
              }
            </TableCellHeader>
          );
        })}
      </StyledTableRow>
    );
  }

  /**
   * Return the elements for all of the body rows.
   * @return {Array<JSX.Element>} The elements for all of the body rows.
   */
  const getBodyRowElements = (): Array<JSX.Element> => {
    const rows: Array<PagedTableBodyRow> = getBodyRows();
    return rows.map((bodyRow: PagedTableBodyRow) => {
      return getBodyRowElement(bodyRow);
    });
  }

  /**
   * Return the element for the specified body row.
   * @param {PagedTableBodyRow} bodyRow Object that describes the body row.
   * @return {JSX.Element} The element for the specified body row.
   */
  const getBodyRowElement = (bodyRow: PagedTableBodyRow): JSX.Element => {
    return (
      <StyledTableRow breakpoint={breakpoint} key={bodyRow.mapKey}>
        {bodyRow.cells.map((cell, index) => {
          return (
            <StyledTableCell
              breakpoint={breakpoint}
              key={index}
              align={cell.isNumeric ? 'right' : 'inherit'}
              padding='checkbox'
              size='small'
            >
              {cell.link ?
                <StyledLink to={cell.link}>{cell.value}</StyledLink> :
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
   * @return {JSX.Element} The element for the footer row.
   */
  const getFooterRowElement = (): JSX.Element => {
    const show = count > 0;
    return (
      <Fade in={show} timeout={duration.standard}>
        <TableRowFooter breakpoint={breakpoint}>
          <TablePager
            breakpoint={breakpoint}
            rowsPerPageOptions={[10, 25, 50]}
            count={count}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
            pageIndex={pageIndex}
            pageSize={pageSize}
          />
        </TableRowFooter>
      </Fade>
    );
  }

  return (
    <StyledPaper elevation={1}>
      <TypographyTitle>{title}</TypographyTitle>
      {getTableElements()}
    </StyledPaper>
  );
}

export default PagedTable;
