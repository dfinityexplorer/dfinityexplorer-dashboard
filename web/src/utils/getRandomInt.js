/**
 * @file getRandomInt
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */
import getRandomNumber from './getRandomNumber'

/**
 * Return a random integer between start and end.
 * @param {Number} start The starting number.
 * @param {Number} end The ending number.
 * @return {Number} The random integer.
 * @private
 */
export default function getRandomInt(start, end) {
  return Math.floor(getRandomNumber(start, end));
}
