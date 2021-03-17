/**
 * @file roundDownDateToHour
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * Round down the specified Date object to the nearest hour.
 * @param {Data} date The Date object to round down.
 * @return {Date} The rounded down Date object.
 * @protected
*/
export default function roundDownDateToHour(date) {
  const millisecondsInHour = 60 * 60 * 1000;
  return new Date(Math.floor(date.getTime() / millisecondsInHour) * millisecondsInHour);
}

