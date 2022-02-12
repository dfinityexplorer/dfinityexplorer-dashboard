/**
 * @file SearchPage
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import {
  Typography
} from '@material-ui/core';
import TrackablePage from '../TrackablePage/TrackablePage'
import { Breakpoints } from '../../utils/breakpoint';
import Constants from '../../constants';

/**
 * Regular expression to detect account ID or transaction hash.
 */
const accountIdTransactionHashRegEx = new RegExp('^[A-Fa-f0-9]{64}$');

const TypographyHeading = styled(Typography)`
  && {
    font-family: ${Constants.FONT_PRIMARY};
    font-size: ${Constants.MATERIAL_FONT_SIZE_H4};
    font-weight: 400;
    color: ${props => props.theme.colorBodyText};
    ${({ breakpoint }) =>
      breakpoint === Breakpoints.XS && `
        font-size: ${Constants.MATERIAL_FONT_SIZE_H5};       
      `
    }
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
 * The Search Page shows details about a search.
 */
class SearchPage extends TrackablePage {
  static propTypes = {
    /**
     * Object containing information about how a <Route path> matched the URL.
     */
    match: PropTypes.object.isRequired
  };

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const { breakpoint } = this.props;
    const { query } = this.props.match.params;
    return (
      <div style={{ marginTop: '32px', marginLeft: '32px' }}>
        <TypographyHeading breakpoint={breakpoint}>Search</TypographyHeading>
        {accountIdTransactionHashRegEx.test(query) ?
          <Redirect to={{ pathname: `/tx/${query}` }}/> :
          <TypographyBody>Sorry, this is an invalid search string.</TypographyBody>             
        }
      </div>
    );
  }
}

export default SearchPage;
