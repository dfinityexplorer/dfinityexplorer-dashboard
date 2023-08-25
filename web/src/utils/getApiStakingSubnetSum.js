/**
 * @file getApiStakingSubnetSum
 * @copyright Copyright (c) 2018-2023 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

/**
 * Return the sum of values from an array of subset objects in the ic-api.internetcomputer.org/api
 * response of a staking-related endpoint.
 * @param {Array} subsets An array of subset objects in the API response of a staking-related
 * endpoint.
 * @returns {number} The sum of values from all subsets.
 */
export default function getApiStakingSubnetSum(subsets) {
  return subsets.reduce((acc, subset) => acc + Number(subset.value[1]), 0);
}
