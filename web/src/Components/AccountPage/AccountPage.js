/**
 * @file AccountPage
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CircularProgress, Fade, Grid, Typography } from '@material-ui/core';
import { duration, easing } from '@material-ui/core/styles/transitions';
import zIndex from '@material-ui/core/styles/zIndex';
import axios from 'axios';
import InfoTable from '../InfoTable/InfoTable';
import TrackablePage from '../TrackablePage/TrackablePage';
import RosettaApi, { RosettaError } from '../../rosetta/RosettaApi';
import { Breakpoints } from '../../utils/breakpoint';
import getHashString from '../../utils/getHashString';
import getIcpStringFromE8s from '../../utils/getIcpStringFromE8s';
import Constants from '../../constants';

const GridSection = styled(Grid)`
  && {
    padding-top: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    padding-bottom: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    padding-left: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    padding-right: ${Constants.HOME_PAGE_MARGIN_SM_AND_UP + 'px'};
    transition: ${'padding ' + duration.standard + 'ms ' + easing.easeInOut};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        padding-top: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-bottom: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-left: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
        padding-right: ${Constants.HOME_PAGE_MARGIN_XS + 'px'};
      `
    }
  }
`;

const DivCircularProgress = styled.div`
  && {
    position: absolute;
    margin-top: 145px;
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

const GridCard = styled(Grid)`
  && {
    width: 100%;
  }
`;

const TableInfo = styled(InfoTable)`
  && {
    background: ${props => props.theme.colorDashCardBackground};
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
 * The Account page shows details about an account.
 */
class AccountPage extends TrackablePage {
  static propTypes = {
    /**
     * The current Breakpoint, taking the desktop drawer (large screens) width into account.
     */    
    breakpoint: PropTypes.number.isRequired,
    /**
     * Object containing information about how a <Route path> matched the URL.
     */
    match: PropTypes.object.isRequired
  };

  /**
   * Create a AccountPage object.
   * @constructor
   */
  constructor(props) {
    super(props);

    this.state = {
      icpToUsd: null,
      isLoading: false,
      rosettaError: null,
      accountBalance: null
    };

    // Bind to make 'this' work in callbacks.
    this.getBodyRows = this.getBodyRows.bind(this);
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  async componentDidMount() {
    super.componentDidMount();

    const { address } = this.props.match.params;
    this.rosettaApi = new RosettaApi();
    if (address) {
      this.setState({
        isLoading: true
      });
      const accountBalance = await this.rosettaApi.getAccountBalance(address);
      if (accountBalance instanceof RosettaError) {
        this.setState({
          isLoading: false,
          rosettaError: accountBalance
        });
      }
      else {
        /*pricing!!!const url =
          `https://api.nomics.com/v1/currencies/ticker?key=${Constants.NOMICS_API_KEY}&ids=ICP&interval=1d`;
        const result = await axios.get(url);
        const icpToUsd = parseFloat(result?.data[0]?.price);*/

        this.setState({
          icpToUsd: null,//pricing!!!icpToUsd,
          isLoading: false,
          rosettaError: null,
          accountBalance: accountBalance
        });
      }
    }
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint } = this.props;
    const { isLoading, rosettaError, accountBalance } = this.state;

    let errorMessage = '';
    if (rosettaError) {
      switch (rosettaError.errorType) {
        case RosettaError.NotFound:
          errorMessage = 'ERROR: Account not found.';
          break;
        case RosettaError.Timeout:
          errorMessage = 'ERROR: Timed out while getting the account balance.';
          break;
        default: // NetworkError
          errorMessage = 'ERROR: An error occurred while getting the account balance.'
          break;
      }
    }

    return (
      <GridSection container
        direction='column'
        justify='flex-start'
        alignItems='center'
        breakpoint={breakpoint}
      >
        {rosettaError ?
          <Grid item>
            <TypographyBody>{errorMessage}</TypographyBody>
          </Grid> :
          <Fragment>
            <Fade in={isLoading} timeout={duration.standard} mountOnEnter unmountOnExit>
              <DivCircularProgress breakpoint={breakpoint}>
                <StyledCircularProgress size={Constants.MATERIAL_CIRCULAR_INDICATOR_SIZE} />
              </DivCircularProgress>
            </Fade>
            {accountBalance &&
              <GridCard item breakpoint={breakpoint}>
                <Fade
                  timeout={500}
                >
                  <TableInfo
                    breakpoint={breakpoint}
                    getBodyRows={this.getBodyRows}
                    showFooter={true}
                    showRowBorders={true}
                    title='Account'
                    wrapText={true}
                  />
                </Fade>
              </GridCard>
            }
          </Fragment>
        }
      </GridSection>
    );
  }

  /**
   * Return an array of objects that describe the body rows, where each object contains:
   *  mapKey: A unique key that identifies the row.
   *  cells: An array of objects that describe the cells of the row, where each object contains:
   *    value: String containing the value of the cell.
   *    color: Use the specified InfoTableTextColor for the text of the cell, or undefined to use
   *      the default color.
   *    isRightAligned: True to right align the table cell content.
   * @return {Array} An array of objects that describe the body rows.
   * @protected
   */
  getBodyRows() {
    const { address } = this.props.match.params;
    const { breakpoint } = this.props;
    const { accountBalance, icpToUsd } = this.state;

    let hashMaxLength;
    if (breakpoint === Breakpoints.XS)
      hashMaxLength = 20;
    else if (breakpoint === Breakpoints.SM)
      hashMaxLength = 48;
    else
      hashMaxLength = 0;

    let balance = getIcpStringFromE8s(accountBalance) + ' ICP';
    if (icpToUsd) {
      const balanceUsd = icpToUsd * accountBalance.div(100000000).toNumber();
      balance += ' ($' +
        balanceUsd.toLocaleString(
          undefined, {'minimumFractionDigits': 2, 'maximumFractionDigits': 2}) + ')';
    }

    return [
      {
        mapKey: 0,
        cells: [ { value: 'Address' }, { value: getHashString(address, hashMaxLength) } ]
      },
      {
        mapKey: 1,
        cells: [ { value: 'Balance' }, { value: balance } ]
      }
    ];
  }
}

export default AccountPage;
