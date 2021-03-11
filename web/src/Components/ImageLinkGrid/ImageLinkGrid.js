/**
 * @file ImageLinkGrid
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid
} from '@material-ui/core';
import Fade from 'react-reveal/Fade';

/**
 * This component displays a grid of images that link to other pages.
 */
class ImageLinkGrid extends Component {
  static propTypes = {
    /**
     * The className passed in by styled-components when styled(MyComponent) notation is used on
     * this component.
     */
    className: PropTypes.string,
    /**
     * An array of objects describing the image links, where each object contains:
     *  src: The <img> src attribute.
     *  height: The <img> height attribute.
     *  alt: The <img> alt attribute.
     *  href: The <a> href attribute.
     */    
    imageLinks: PropTypes.array.isRequired,
    /**
     * The Material-UI justify prop to apply to each row.
     * @see See [Material-UI Grid documentation](https://material-ui.com/api/grid/).
     */
    justifyRow: PropTypes.string,
    /**
     * The amount of space between rows.
     */
    marginBetweenRows: PropTypes.number,
    /**
     * The number of images per row.
     */
    perRow: PropTypes.number.isRequired
  };

  /**
   * Create a ImageLinkGrid object.
   * @constructor
   */
  constructor() {
    super();

    this.state = {widths: [], maxHeight: 0};
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    this.calculateMaxImageDimensions();
  }

  /**
   * Invoked by React immediately after updating occurs. This method is not called for the initial
   * render.
   * @param {Object} prevProps The previous props.
   * @public
   */
  componentDidUpdate(prevProps) {
    // Determine whether the props have changed.
    let arePropsChanged = false;
    const { imageLinks } = this.props;
    if (imageLinks.length === prevProps.imageLinks.length) {
      imageLinks.forEach((imageLink, index) => {
        if (imageLink.src !== prevProps.imageLinks[index].src ||
            imageLink.height !== prevProps.imageLinks[index].height)
          arePropsChanged = true;
      });
    }
    else
      arePropsChanged = true;

    // Only calculate max image dimensions if props have changed, otherwise we would cause an
    // infinite loop of updating the state.
    if (arePropsChanged)
      this.calculateMaxImageDimensions();
  }
  
  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    const {
      className,
      imageLinks,
      justifyRow,
      marginBetweenRows,
      perRow
    } = this.props;
    const { widths } = this.state;

    // Make the container slightly taller than the max image height to account for Grid bug where
    // there are a few pixels of whitespace added under the image. This '+ 4' can be removed once
    // the Grid bug is fixed.
    const containerHeight = this.state.maxHeight + 4;

    // The image grid is an array of rows, where each row is an array of image objects. Creating
    // a two-dimensional array like this is an extra step, but makes the code below more readable.
    // TODO: Consider an alternate approach to solve the problem of the center column of 3-item rows
    // not being centered. Use the same maxWidth for all cells. For cells on left, left align. For
    // cells on right, right align. For all other cells, center. To do this, we'd likely need a cell
    // within a cell, so that columns could first be centered relative to the column, then placed
    // in a second wrapper cell (Grid) aligned either left, right, or center. Would need to test
    // with different row lengths and numbers of images to see what effect it has on spacing for all
    // conditions. It seems possible this would look wrong for rows longer than 3, since the spacing
    // at the edges could be greater because the cell within the cell at the edges is not centered.!!!
    let imageLinkGrid = [];
    let maxWidthColumn = Array(perRow).fill(0);
    for (let i = 0; i < imageLinks.length;) {
      let row = [];
      const isShortRow = imageLinks.length - i < perRow;
      for (var j = 0; j < perRow && i < imageLinks.length; j++) {
        // Do not update maxWidthColumn[j] if this is a short row (last row with fewer columns).
        if (!isShortRow && widths[i])
          maxWidthColumn[j] = Math.max(widths[i], maxWidthColumn[j]);
        row.push(imageLinks[i++]);
      }
      imageLinkGrid.push(row);
    }
    
    return (
      <div className={className}>
        {imageLinkGrid.map((row, rowIndex) => {
          const isShortRow = row.length < perRow;
          return (
            <Grid container
              direction='row'
              // Always set justify='space-around' for a short row (last row with fewer columns).
              justify={isShortRow ? 'space-around' : (justifyRow || 'space-between')}
              alignItems='center'
              key={rowIndex}
              style={{ marginTop: (rowIndex && marginBetweenRows) ? marginBetweenRows : 0 }}
            >
              {row.map((imageLink, columnIndex) => {
                const index = rowIndex * perRow + columnIndex;
                return (
                  <Grid container
                    direction='column'
                    justify='center'
                    alignItems='center'
                    key={columnIndex}
                    // Do not use maxWidthColumn[j] if this is a short row (last row with fewer
                    // columns).
                    style={{
                      width: isShortRow ? widths[index] : maxWidthColumn[columnIndex],
                      height: containerHeight
                    }}
                  >
                    <Grid item>
                      <a href={imageLink.href} target='_blank' rel='noopener noreferrer'>
                        <Fade
                          bottom
                          delay={index * 50}
                          timeout={500}
                        >
                          <img
                            src={imageLink.src}
                            height={imageLink.height}
                            alt={imageLink.alt}>
                          </img>
                        </Fade>
                      </a>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          );
        })}
      </div>
    );
  }

  /**
   * Calculate the maximum width and height of all images by loading the images. This allows us to
   * create Grid containers for the images which are all the same size. An image will be
   * horizontally and vertically centered in its container.
   * @private
   */
  calculateMaxImageDimensions() {
    const { imageLinks } = this.props;
    this.setState({
      widths: Array(imageLinks.length).fill(0),
      maxHeight: 0
    });

    // Calculate the widths[] and maxHeight of the images by loading them.
    imageLinks.forEach((imageLink, index) => {
      const img = new Image();
      img.onload = event => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalHeight) {
          // Scale width from natural width to image link width.
          const width = imageLink.height / naturalHeight * naturalWidth;
          this.setState(prevState => ({
            widths: [
              ...prevState.widths.slice(0, index),
              width,
              ...prevState.widths.slice(index + 1)
            ],
            maxHeight: Math.max(imageLink.height, prevState.maxHeight)
          }));
        }
      }
      // Setting src after we have set the onload event will cause the event to be triggered after
      // the image has loaded.
      img.src = imageLink.src;
    });
  }
}

export default ImageLinkGrid;
