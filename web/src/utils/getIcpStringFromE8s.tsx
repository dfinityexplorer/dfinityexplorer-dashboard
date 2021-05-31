/**
 * @file getIcpStringFromE8s
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import BigNumber from 'bignumber.js';

/**
 * Return a string containing a formatted ICP value based on the specified ICP e8s value.
 * @param {number|BigNumber} icpE8s An ICP value specified in e8s units. 
 * @param {boolean} shouldRound True to round to the nearest whole ICP value.
 * @returns {String} A string containing the formatted ICP value.
 */
export default function getIcpStringFromE8s(
  icpE8s: number|BigNumber, shouldRound?: boolean): string {
  let icp: number|BigNumber;
  if (icpE8s instanceof BigNumber) {
    icp = shouldRound ?
      icpE8s.dividedToIntegerBy(100000000).toNumber() : icpE8s.div(100000000).toNumber();
  }
  else
    icp = shouldRound ? Math.round(icpE8s / 100000000) : icpE8s / 100000000;
  return icp.toLocaleString(undefined, {'minimumFractionDigits': 0, 'maximumFractionDigits': 8});
}
