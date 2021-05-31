/**
 * @file getHashString
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

/**
 * Return a string containing the hash which has been modified for display.
 * @param {string} hash The hash to modify for display.
 * @param {number} maxLength The maximum length of the hash string.
 * @return {string} A string containing the hash which has been modified for display.
 * @protected
 */
export default function getHashString(hash: string, maxLength?: number): string {
  if (maxLength === undefined)
    maxLength = 22;
  if (maxLength !== 0 && hash.length > maxLength) {
    const first = hash.substring(0, Math.max(maxLength - 4, 0));
    const last = hash.substr(hash.length - 4);
    return first + "..." + last;
  }
  else
    return hash;
}
