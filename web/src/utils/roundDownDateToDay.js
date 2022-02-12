/**
 * @file roundDownDateToDay
 * @copyright Copyright (c) 2018-2022 Dylan Miller and icpexplorer contributors
 * @license MIT License
 */

/**
 * Round down the specified Date object to the nearest day.
 * @param {Data} date The Date object to round down.
 * @return {Date} The rounded down Date object.
 * @protected
*/
export default function roundDownDateToDay(date) {
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  return new Date(Math.floor(date.getTime() / millisecondsInDay) * millisecondsInDay);
}

