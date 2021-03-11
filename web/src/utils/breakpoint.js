/**
 * @file breakpoint
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import Constants from '../constants';

export const Breakpoints = Object.freeze({
  XS: 0,
  SM: 1,
  MD: 2,
  LG: 3,
  XL: 4
});

/**
 * Return the current breakpoint.
 * @param {Boolean} isDesktopDrawerOpen True if the desktop drawer (large screens) is open and
 *  caller wants the breakpoint to be calculated based on the non-drawer width of the window.
 * @return {Number} The current breakpoint.
 * @private
 */
export function getBreakpoint(isDesktopDrawerOpen) {
  const drawerWidth =  isDesktopDrawerOpen ? Constants.DRAWER_WIDTH : 0;
  if (window.matchMedia('(max-width: ' + (Constants.BREAKPOINT_MAX_XS + drawerWidth) + 'px)').matches)
    return Breakpoints.XS;
  else if (window.matchMedia('(max-width: ' + (Constants.BREAKPOINT_MAX_SM + drawerWidth) + 'px)').matches)
    return Breakpoints.SM;
  else if (window.matchMedia('(max-width: ' + (Constants.BREAKPOINT_MAX_MD  + drawerWidth) + 'px)').matches)
    return Breakpoints.MD;
  else if (window.matchMedia('(max-width: ' + (Constants.BREAKPOINT_MAX_LG + drawerWidth) + 'px)').matches)
    return Breakpoints.LG;
  else
    return Breakpoints.XL;
}

/**
 * Return true if the current breakpoint is greater than or equal to the specified breakpoint.
 * @param {Number} breakpoint The breakpoint to compare to the current breakpoint.
 * @return {Boolean} True if the current breakpoint is greater than or equal to the specified
 *  breakpoint.
 * @private
 */
export function isBreakpointGreaterOrEqualTo(breakpoint) {
  switch (breakpoint) {
    case Breakpoints.XS:
      return window.matchMedia('(min-width: ' + Constants.BREAKPOINT_MIN_XS + 'px)').matches;
    case Breakpoints.SM:
      return window.matchMedia('(min-width: ' + Constants.BREAKPOINT_MIN_SM + 'px)').matches;
    case Breakpoints.MD:
      return window.matchMedia('(min-width: ' + Constants.BREAKPOINT_MIN_MD + 'px)').matches;
    case Breakpoints.LG:
      return window.matchMedia('(min-width: ' + Constants.BREAKPOINT_MIN_LG + 'px)').matches;
    case Breakpoints.XL:
    default:
      return window.matchMedia('(min-width: ' + Constants.BREAKPOINT_MIN_XL + 'px)').matches;
  }
}

/**
 * Return true if the current breakpoint is greater than or equal to the smallest "desktop"
 * breakpoint.
 * @return {Boolean} True if the current breakpoint is greater than or equal to the smallest
 * "desktop" breakpoint.
 * @private
 */
export function isBreakpointDesktop() {
  return isBreakpointGreaterOrEqualTo(Breakpoints.MD);
}

/**
 * Return true if the current breakpoint is less than or equal to the specified breakpoint.
 * @param {Number} breakpoint The breakpoint to compare to the current breakpoint.
 * @return {Boolean} True if the current breakpoint is less than or equal to the specified
 *  breakpoint.
 * @private
 */
export function isBreakpointLessOrEqualTo(breakpoint) {
  switch (breakpoint) {
    case Breakpoints.XS:
      return window.matchMedia('(max-width: ' + Constants.BREAKPOINT_MAX_XS + 'px)').matches;
    case Breakpoints.SM:
      return window.matchMedia('(max-width: ' + Constants.BREAKPOINT_MAX_SM + 'px)').matches;
    case Breakpoints.MD:
      return window.matchMedia('(max-width: ' + Constants.BREAKPOINT_MAX_MD + 'px)').matches;
    case Breakpoints.LG:
      return window.matchMedia('(max-width: ' + Constants.BREAKPOINT_MAX_LG + 'px)').matches;
    case Breakpoints.XL:
    default:
      return window.matchMedia('(max-width: ' + Constants.BREAKPOINT_MAX_XL + 'px)').matches;
  }
}
