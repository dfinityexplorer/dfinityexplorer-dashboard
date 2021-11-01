/**
 * @file TransactionsPagedTable
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as _ from 'styled-components/cssprop'; // needed once in project
import { Typography } from '@material-ui/core';
import PagedTable, { PagedTableBodyRow, PagedTableCell } from '../PagedTable/PagedTable';
import {
  RosettaError,
  RosettaErrorType,
  Transaction
} from '../../rosetta/RosettaApi';
import { Breakpoints } from '../../utils/breakpoint';
import getHashString from '../../utils/getHashString';
import getIcpStringFromE8s from '../../utils/getIcpStringFromE8s';
import timeAgo from '../../utils/timeAgo';
import Constants from '../../constants';

const TypographyBody = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_BODY_1};
    line-height: 1.75rem;
    color: ${props => props.theme.colorBodyTextDim};
  }
`;

interface TransactionsPagedTableProps {
  /**
   * The current Breakpoint, taking the desktop drawer (large screens) width into account.
   */    
  breakpoint: number;
  /**
   * The current account address of the Account page. Used to prevent linking to the page we're
   * already on.
   */
  currentAccountAddress?: string;
  /**
   * Callback to get the specified transactions.
   */    
  getTransactions: (offset: number, limit: number) =>
    Promise<Array<Transaction>|RosettaError>|Array<Transaction>;
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
   * The total count of transactions.
   */    
  transactionsCount: number|null;
}

/**
 * This component displays a paged table of Transaction objects.
 */
const TransactionsPagedTable = (
  {
    breakpoint,
    currentAccountAddress,
    getTransactions,
    onChangePage,
    onChangePageSize,
    pageIndex,
    pageSize,
    transactionsCount
  }: TransactionsPagedTableProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rosettaError, setRosettaError] = useState<RosettaError|null>(null);
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);

  useEffect(() => {
    const fetchData = async (offset: number) => {
      setIsLoading(true);
      const transactions: Array<Transaction>|RosettaError = await getTransactions(offset, pageSize);
      setIsLoading(false);
      if (transactions instanceof RosettaError)
        setRosettaError(transactions);
      else {
        setTransactions(transactions);
        setRosettaError(null);
      }
    };

    const offset: number|null = pageIndex !== null ? pageIndex * pageSize : null;
    if (offset !== null)
      fetchData(offset);
  }, [getTransactions, pageIndex, pageSize]);

  /**
   * Return an array of PagedTableBodyRow objects that describe the body rows.
   * @returns {Array<PagedTableBodyRow>} An array of PagedTableBodyRow objects that describe
   * the body rows.
   */
  const getBodyRows = (): Array<PagedTableBodyRow> => {
    let bodyRows: Array<PagedTableBodyRow>;
    if (breakpoint === Breakpoints.XS) {
      bodyRows = transactions.map(transaction => {
        const hash: string = getHashString(transaction.hash);
        const hashLink: string = `/tx/${transaction.hash}`;
        const amount: string = getIcpStringFromE8s(transaction.amount) + ' ICP';

        return {
          mapKey: transaction.hash,
          cells: [
            {value: hash, isNumeric: false, link: hashLink},
            {value: amount, isNumeric: true}
          ]
        };
      });
    }
    else {
      bodyRows = transactions.map(transaction => {
        // Special handling for BURN and MINT transactions.
        const hash: string = getHashString(transaction.hash);
        const hashLink: string = `/tx/${transaction.hash}`;
        let type: string;
        const time: string = timeAgo.format(transaction.timestamp.getTime());
        let from: string;
        let fromLink: string|undefined = undefined;
        let to: string;
        let toLink: string|undefined = undefined;
        const amount: string = getIcpStringFromE8s(transaction.amount) + ' ICP';
        if (transaction.type === 'BURN') {
          type = 'Burn';
          from = getHashString(transaction.account1Address);
          if (transaction.account1Address !== currentAccountAddress)
            fromLink = `/acct/${transaction.account1Address}`;
          to = Constants.MINTING_ACCOUNT_NAME;
        }
        else if (transaction.type === 'MINT') {
          type = 'Mint';
          from = Constants.MINTING_ACCOUNT_NAME;
          to = getHashString(transaction.account1Address);
          if (transaction.account1Address !== currentAccountAddress)
            toLink = `/acct/${transaction.account1Address}`;
        }
        else { // TRANSACTION
          type = 'Transfer';
          from = getHashString(transaction.account1Address);
          if (transaction.account1Address !== currentAccountAddress)
            fromLink = `/acct/${transaction.account1Address}`;
          to = getHashString(transaction.account2Address);
          if (transaction.account2Address !== currentAccountAddress)
            toLink = `/acct/${transaction.account2Address}`;
        }

        return {
          mapKey: transaction.hash,
          cells: [
            {value: hash, isNumeric: false, link: hashLink},
            {value: type, isNumeric: false},
            {value: time, isNumeric: false},
            {value: from, isNumeric: false, link: fromLink},
            {value: to, isNumeric: false, link: toLink},
            {value: amount, isNumeric: true}
          ]
        };
      });
    }

    return bodyRows;
  };

  let errorMessage: string = '';
  if (rosettaError) {
    switch (rosettaError.errorType) {
      case RosettaErrorType.Timeout:
        errorMessage = 'ERROR: Timed out while getting the transactions.';
        break;
      default: // NotFound (N/A), NetworkError
        errorMessage = 'ERROR: An error occurred while getting the transactions.'
        break;
    }
  }

  let columnWidths: Array<string>;
  let headerRow: Array<PagedTableCell>;
  if (breakpoint === Breakpoints.XS) {
    columnWidths = ['60%', '40%'];
    headerRow = [
      {value: 'Hash', isNumeric: false},
      {value: 'Amount', isNumeric: true}
    ];
  }
  else {
    columnWidths = ['25%', '5%', '5%', '25%', '25%', '15%'];
    headerRow = [
      {value: 'Hash', isNumeric: false},
      {value: 'Type', isNumeric: false},
      {value: 'Time', isNumeric: false},
      {value: 'From', isNumeric: false},
      {value: 'To', isNumeric: false},
      {value: 'Amount', isNumeric: true}
    ];
  }

  return (
    rosettaError ?
      <TypographyBody>{errorMessage}</TypographyBody> :
      <PagedTable
        breakpoint={breakpoint}
        title='Transactions'
        columnWidths={columnWidths}
        headerRow={headerRow}
        count={transactionsCount ? transactionsCount : 0}
        isLoading={isLoading}
        getBodyRows={getBodyRows}
        onChangePage={onChangePage}
        onChangePageSize={onChangePageSize}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
  );
}

export default TransactionsPagedTable;
