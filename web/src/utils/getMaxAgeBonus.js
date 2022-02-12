/**
 * @file getMaxAgeBonus
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

/**
 * Returns the maximum voting power age bonus that is currently possible based on the number of
 * days since Genesis. The age bonus builds up to 1.25 over 4 years, so it is not possible to have
 * an age bonus of 1.25 until 4 years have passed since Genesis, at which time this function will
 * no longer be needed.
 * @return {Number} The maximum voting power age bonus.
 */
export default function getMaxAgeBonus() {
  const genesisDate = new Date(2021, 4, 10); // May 10, 2021 (approximate)
  const todaysDate = new Date();
  const sinceGenesisMs = todaysDate - genesisDate;
  const fourYearsMs = 365.25 * 4 * 24 * 60 * 60 * 1000;
  return 1 + 0.25 * (sinceGenesisMs / fourYearsMs);
}
