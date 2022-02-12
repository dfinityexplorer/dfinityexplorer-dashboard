/**
 * @file TransactionsPage
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React from "react";
import styled from 'styled-components';
import {
  Grid,
  Typography
} from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import Fade from 'react-reveal/Fade';
import TrackablePage from '../TrackablePage/TrackablePage'
import TransactionsPagedTable from '../TransactionsPagedTable/TransactionsPagedTable';
import RosettaApi, { RosettaError } from '../../rosetta/RosettaApi';
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

const GridSection = styled(Grid)`
  && {
    padding: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    transition: ${'padding ' + duration.standard + 'ms ' + easing.easeInOut};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding-top: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
        padding-left: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-right: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
      `
    }
  }
`;

const GridPagedTable = styled(Grid)`
  && {
    width: 100%;
  }
`;

const TypographyBody = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_1};
    line-height: 1.75rem;
    color: ${props => props.theme.colorBodyTextDim};
  }
`;

/**
 * Component for the transactions page.
 */
class TransactionsPage extends TrackablePage {
  /**
   * Create a TransactionsPage object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      pageIndex: null,
      pageSize: 10,
      transactionsCount: null,
      rosettaError: null
    };

    // Bind to make 'this' work in callbacks.
    this.getTransactions = this.getTransactions.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangePageSize = this.handleChangePageSize.bind(this);
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  async componentDidMount() {
    super.componentDidMount();

    this.rosettaApi = new RosettaApi();
    const maxBlockIndex = await this.rosettaApi.getLastBlockIndex();
    if (maxBlockIndex instanceof RosettaError) {
      this.setState({
        rosettaError: maxBlockIndex
      });
    }
    else {
      this.setState({
        pageIndex: 0,
        transactionsCount: maxBlockIndex + 1,
        rosettaError: null
      });
    }
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint } = this.props;
    const { pageIndex, pageSize, rosettaError, transactionsCount } = this.state;

    let errorMessage = '';
    if (rosettaError) {
      switch (rosettaError.errorType) {
        case RosettaError.Timeout:
          errorMessage = 'ERROR: Timed out while getting the transactions count.';
          break;
        default: // NotFound, NetworkError
          errorMessage = 'ERROR: An error occurred while getting the transactions count.'
          break;
      }
    }

    return (
      <GridSection container
        direction='row'
        justify='space-between'
        alignItems='flex-start'
        breakpoint={breakpoint}
      >
        {rosettaError ?
          <Grid item>
            <TypographyBody>{errorMessage}</TypographyBody>
          </Grid> :
          <GridPagedTable item breakpoint={breakpoint}>
            <Fade timeout={500}>
              <TransactionsPagedTable
                breakpoint={breakpoint}
                getTransactions={this.getTransactions}
                onChangePage={this.handleChangePage}
                onChangePageSize={this.handleChangePageSize}
                pageIndex={pageIndex}
                pageSize={pageSize}
                transactionsCount={transactionsCount}
              />
            </Fade>
          </GridPagedTable>
        }
      </GridSection>
    );
  }

  /**
   * Callback to get the specified transactions.
   * @param {Number} offset The offset at which to start getting transactions.
   * @param {Number} limit The maximum number of transactions to get.
   * @returns {Promise<Array<Transaction>|RosettaError>|Array<Transaction>} An array of Transaction
   * objects, or RosettaError for error.
   */
  async getTransactions(offset, limit) {
    const { transactionsCount } = this.state;
    if (transactionsCount !== null)
      return await this.rosettaApi.getTransactions(limit, transactionsCount - 1, offset);
    else
      return [];
  }

  /**
   * Callback fired when the TransactionsPagedTable component page is changed.
   * @param {Number} pageIndex The index of the new page.
   * @public
   */
  handleChangePage(pageIndex) {
    this.setState({
      pageIndex: pageIndex
    });
  }

  /**
   * Callback fired when the TransactionsPagedTable component number of rows per page is changed.
   * @param {Number} pageSize The number of rows per page.
   * @public
   */
   handleChangePageSize(pageSize) {
    // When rows per page is changed, reset pageIndex.
    this.setState({
      pageIndex: 0,
      pageSize: pageSize
    });
  }
}

export default TransactionsPage;
