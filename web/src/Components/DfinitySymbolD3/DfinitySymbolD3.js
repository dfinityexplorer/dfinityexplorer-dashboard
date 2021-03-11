/**
 * @file DfinitySymbolD3
 * @copyright Copyright (c) 2018-2021 Dylan Miller and dfinityexplorer contributors
 * @license MIT License
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import * as filters from 'pixi-filters';
import getRandomInt from '../../utils/getRandomInt';

/**
 * This class draws the DFINITY logo infinity symbol using a d3 force-directed graph.
 */
class DfinitySymbolD3 extends Component  {
  static propTypes = {
    /**
     * True is the theme is dark, false if the theme is light.
     */
    isThemeDark: PropTypes.bool.isRequired,
    /**
     * True for logo mode, where the symbol is shaped more like the DFINITY logo, and various
     * adjustments are made with the intention of rendering at small sizes (e.g., in an app bar).
     */
    logoMode: PropTypes.bool,
    /**
     * The width of the component, or 0 for use built-in simulationWidth.
     */
    width: PropTypes.number.isRequired
  };

  /**
   * Create a DfinitySymbolD3 object.
   * @constructor
   */
  constructor(props) {
    super(props);

    // Bind to make 'this' work in callbacks.
    this.dragStarted = this.dragStarted.bind(this);
    this.dragged = this.dragged.bind(this);
    this.dragEnded = this.dragEnded.bind(this);
    this.tick = this.tick.bind(this);
    this.rotate = this.rotate.bind(this);

    // A force-directed graph can be a difficult beast to tame. Most changes to settings in this
    // class will likely change the shape of the graph and require changing other settings through
    // trial and error in order to get the graph back to the DFINITY logo shape. Any number of the
    // settings below could be made into constructor parameters. Another idea would be to pre-define
    // different groups of settings that produce a shape which approximates the DFINITY logo
    // shape, and then allow the caller to specify which group of settings to use. Since there is
    // currently only one group of settings defined, settings groups would not currently be useful.

    // PixiJS members.
    this.stage = null;
    this.renderer = null;
    this.linksGraphics = null;

    // Code is customized for this window size. Modifying these values will cause the d3 force-
    // directed graph to change shape unless scaleToWindow is adjusted to keep the object the same
    // size.
    this.simulationWidth = this.props.logoMode ? 780 : 800;
    this.simulationHeight = 400;
    this.scaleSimulationToPixi = 1.0;

    this.centerX = this.simulationWidth / 2;
    this.centerY = this.simulationHeight / 2;
    this.scaleToWindow = this.simulationWidth / 2 * 0.8;

    // Specify the number of symbol nodes and the number of vertices for each symbol node. The
    // current values of 36 symbol nodes and 8 vertices (octagon) was arrived at after trial and
    // error to produce a shape which resembles the DFINITY logo.
    this.numSymbolNodes = this.props.logoMode ? 41 : 36;
    this.numVertices = this.props.logoMode ? 10 : 8;
    this.numNodes = this.numSymbolNodes * this.numVertices;

    // Specify the charge of the symbol nodes and the non-symbol nodes. "A positive value causes
    // nodes to attract each other, similar to gravity, while a negative value causes nodes to
    // repel each other, similar to electrostatic charge." The default value is -30, but we specify
    // much lower in magnitude values because we do not want the nodes to repel very much. For the
    // fixed nodes which draw the infinity symbol, we do not want any force at all.
    this.forceManyBodyStrengthSymbolNodes = 0;
    this.forceManyBodyStrengthNonSymbolNodes = this.props.logoMode ? -3.75 : -9;

    // Specify the link distance. "The link force pushes linked nodes together or apart according to
    // the desired link distance." The default value is 30.
    this.linkDistance = this.props.logoMode ? 19 : 14;

    // Specify node and link drawing properties.
    this.nodeStrokeWidth = 1;
    this.nodeRadius = 4.5;
    this.nodeRadiusSelected = this.props.logoMode ? 11 : 5.5;
    // DCM 01.mar.2019: Always use same node fill color as stroke color.
    //this.nodeFillColorArray = [127, 127, 127];
    this.nodeSelectedFillColorArray = [255, 255, 255];
    this.nodeSelectedStrokeColorArray = [255, 255, 255];
    this.nodeOpacity = 0.5;
    this.nodeOpacitySelected = 0.75;
    this.linkStrokeWidth = this.props.logoMode ? 3 : 2; // why do lines get blurry when this is increased?
    this.linkStrokeWidthIncreaseAtMagnitude = this.props.logoMode ? 1.5 : 0;

    // Adjust the symbolHeightMultiplier to make the symbol shorter or taller. A value of 1.0
    // represents normal height.
    this.symbolHeightMultiplier = this.props.logoMode ? 1.325 : 1.111111;

    // The initial rotateOffset does two things: it determines which part of the symbol goes in
    // front (blue is on top in the DFINITY logo), and it makes a small adjustment to align the
    // colors correctly.
    this.rotateOffset = this.numSymbolNodes / 2 - 1.2;

    // The rotate interval frequency.
    this.rotateTimeMs = 33.3; // 30 frames/sec max

    // The amount of rotation for every rotate interval.
    this.rotateAmount = this.props.logoMode ? 0 : 0.000015;

    // The currently selected node index.
    this.selectedNodeIndex = -1;

    // New block timer members.
    this.newBlockNodeStartTime = null;
    this.newBlockLinksStartTime = null;
    this.newBlockNodeTimerMs = 1000;
    this.newBlockLinksTimerMs = 1500;
  }

  /**
   * Invoked by React immediately after a component is mounted (inserted into the tree). 
   * @public
   */
  componentDidMount() {
    // Set the value of scaleSimulationToPixi based on the width prop. We scale the force-directed
    // graph by keeping the d3 simulation as is, since it is finely tuned to appear in a certain
    // way, and instead scaling coordinates from simulation space to PixiJS space when rendering.
    // In this way, the graph can be scaled to any width by changing the widths prop. A width prop
    // of 0 indicates no scaling. Note that drag/drop is not currently implemented when scaling.
    this.scaleSimulationToPixi = this.props.width ? this.props.width / this.simulationWidth : 1.0;

    // Draw the DFINITY logo infinity symbol.
    this.draw();
  }

  /**
   * Invoked by React immediately before a component is unmounted and destroyed.
   * @public
   */
  componentWillUnmount() {
    // Cleanup PixiJS properties.
    this.renderer.destroy();
    this.stage.destroy();
  }

  /**
   * Invoked by React immediately after updating occurs. This method is not called for the initial
   * render.
   * @public
   */
  componentDidUpdate() {
    // Make the necessary PixiJS adjustments when the width prop changes.
    const scaleSimulationToPixi = this.props.width ? this.props.width / this.simulationWidth : 1.0;
    if (this.scaleSimulationToPixi !== scaleSimulationToPixi) {
      this.scaleSimulationToPixi = scaleSimulationToPixi;

      // Resize the renderer.
      this.pixiResizeRenderer();

      // Draw circles for the nodes.
      if (this.nodesData) {
        this.nodesData.forEach((node) => { this.pixiDrawNode(node); });
      }
    }
  }

  /**
   * Return a reference to a React element to render into the DOM.
   * @return {Object} A reference to a React element to render into the DOM.
   * @public
   */
  render() {
    return <div ref={(el) => { this.element = el }}/>;
  }

  /**
   * Draw the DFINITY logo infinity symbol.
   * @public
   */
  draw() {
    // Set up the nodes and links of the graph.
    this.addNodes();
    this.addLinks();

    // Create the d3 simulation.
    this.createSimulation();

    // Set up PixiJS to draw the simulation.
    this.pixiSetup();
  }

  /**
   * Add a new block.
   * @public
   */
  addNewBlock() {
    // If there is a selected node still animating, stop the animation and return it to normal.
    if (this.newBlockNodeStartTime) {
        const node = this.nodesData[this.selectedNodeIndex];
        this.pixiDrawNode(node);
    }

    // Select node and enable new block timers.
    this.selectedNodeIndex = getRandomInt(0, this.numNodes - 1);
    this.newBlockNodeStartTime = this.newBlockLinksStartTime = new Date();
  }

  /**
   * Populate nodesData[] with the nodes of the graph.
   * @private
   */
  addNodes() {
    // Add the symbol nodes to nodesData[] at fixed positions (fx, fy). _fx and _fy save the fixed
    // position across drag/drop operations, linkCount is used to calculate the strength of the
    // force of a link.
    this.nodesData = [];
    for (let i = 0; i < this.numSymbolNodes; i++) {
      const pos = this.getNodePosition(i);
      this.nodesData.push({
        'fx' : pos[0],
        'fy' : pos[1],
        '_fx' : pos[0],
        '_fy' : pos[1],
        'linkCount' : 0});
    }

    // Add the non-symbol nodes at non-fixed positions.
    for (let i = this.numSymbolNodes; i < this.numNodes; i++) {
      this.nodesData.push({'linkCount' : 0});
    }
  }

  /**
   * Get the position of the node with the specified index.
   * @param {Number} index The node index.
   * @return {Array} An array containing the [x, y] position of the node.
   * @private
   */
  getNodePosition(index) {
    const t =
      2 * Math.PI * ((index + this.rotateOffset) % this.numSymbolNodes) / this.numSymbolNodes;
    const scale = 2 / (3 - Math.cos(2 * t));
    const fx = this.centerX + scale * Math.cos(t) * this.scaleToWindow;
    const fy =
      this.centerY +
      scale * Math.sin(2 * t) * this.symbolHeightMultiplier / 2 * this.scaleToWindow;
    return [fx, fy];
  }

  /**
   * Populate linksData[] with the links of the graph.
   * @private
   */
  addLinks() {
    this.linksData = [];
    for (let i = 0; i < this.numSymbolNodes; i++) {   
      // Define the ith link of the symbol.
      const indexSymbol = i;
      const indexSymbolNext = (i + 1) % this.numSymbolNodes;
      this.addLink(indexSymbol, indexSymbolNext, 0, 1);
           
      // Link at top of shape, parallel to symbol link, invisible.
      const vertexShapeTop = this.numVertices / 2;
      const indexShapeTop = vertexShapeTop * this.numSymbolNodes + i;
      const indexShapeTopNext =
        vertexShapeTop * this.numSymbolNodes + (i + 1) % this.numSymbolNodes;
      this.addLink(indexShapeTop, indexShapeTopNext, 1, 0);
      
      // Cross bar, invisible. This pulls the graph in and provides stability. Rather than linking
      // the cross bar from the link at top of shape to the symbol index, we link it from the shape
      // node prior. Found that this produces a more interesting graph. Note that previously this
      // code was in the for loop below and executed when j === 3, but with the same parameters to
      // addLink(). This produced a slightly different/thicker graph.
      const vertexShapeAlmostTop = vertexShapeTop - 1;
      const indexShapeAlmostTop = vertexShapeAlmostTop * this.numSymbolNodes + i;
      this.addLink(indexShapeAlmostTop, indexSymbol, 1, 0);
      
      for (let j = 0; j < this.numVertices; j++) {     
        // Define the jth link of the shape (e.g., if numVertices is 6, shape is 6-sided polygon).
        const index = j * this.numSymbolNodes + i;
        const indexShapeNext = (index + this.numSymbolNodes) % this.numNodes;
        this.addLink(index, indexShapeNext, 0, 0.7);
      
        // Define the jth link of the spiral which spirals around the shapes. Two spirals are used
        // for better stability.
        const indexSpiralNext =
          (j + 1) % this.numVertices * this.numSymbolNodes + (i + 1) % this.numSymbolNodes;            
        this.addLink(index, indexSpiralNext, 0.65, 0.5);
        this.addLink(index, indexSpiralNext, 0.65, 0.5);
      }
    }
  }

  /**
   * Add a link of the graph to linksData[].
   * @param {Number} indexSource The index of the source node of the link.
   * @param {Number} indexTarget The index of the target node of the link.
   * @param {Number} The strength of the link, or 0 for use default strength.
   * @param {Number} opacity The opacity of the link.
   * @private
   */
  addLink(indexSource, indexTarget, strength, opacity) {
    this.linksData.push({
      'source': indexSource.toString(),
      'target': indexTarget.toString(),
      '_strength' : strength,
      'opacity' : opacity,
      '_opacity' : opacity});
    this.nodesData[indexSource].linkCount++;
    this.nodesData[indexTarget].linkCount++;
  }

  /**
   * Create the d3 simulation of the force-directed graph. Nodes and links must be added before
   * calling this function.
   * @private
   */
  createSimulation() {
    // Create a new simulation containing the nodes.
    this.simulation = d3.forceSimulation(this.nodesData);

    // Add a charge to each node and a centering force.
    this.simulation
      .force('charge', d3.forceManyBody()
        .strength((d) => {
          return d.index < this.numSymbolNodes ?
            this.forceManyBodyStrengthSymbolNodes : this.forceManyBodyStrengthNonSymbolNodes;
        }))
      .force('center', d3.forceCenter(this.simulationWidth / 2, this.simulationHeight / 2));

    // Add the links, with the strength of the force of a link optionally specified by the link's
    // _strength.
    const link_force =  d3.forceLink(this.linksData)
      .strength((d) => {
        return d._strength > 0 ?
          d._strength :
          1 / Math.min(d.source.linkCount, d.target.linkCount); // default
      })
      .distance(this.linkDistance);        
      this.simulation.force('links', link_force);

    // Call tick() for every tick.
    this.simulation.on('tick', this.tick);

    // Set the decay rate to zero to have the simulation run forever at the current alpha.
    this.simulation.alphaDecay(0);

    // Rotate the symbol using a d3 interval.
    if (this.rotateAmount)
      d3.interval(this.rotate, this.rotateTimeMs);
  }

  /**
   * Set up PixiJS to draw the simulation using WebGL (with Canvas fallback for older platforms).
   * @private
   */
  pixiSetup() {
    // Disable PIXI console log message.
    PIXI.utils.skipHello();
    
    // Create PixiJS WebGL renderer element to hold the force-directed graph. We set the resolution
    // to 3, then auto-resize the window back down to the correct size in order to increase the
    // resolution. With resolution set to 1, it looks low resolution and pixelated.
    this.stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer(
      this.simulationWidth * this.scaleSimulationToPixi,
      this.simulationHeight * this.scaleSimulationToPixi,
      {antialias: true, transparent: true, resolution: 3}
    );
    this.renderer.autoResize = true;
    this.pixiResizeRenderer();
    this.element.appendChild(this.renderer.view);

    // Draw circles for the nodes.
    this.nodesData.forEach((node) => {
      node.graphics = new PIXI.Graphics();
      this.pixiDrawNode(node);
      this.stage.addChild(node.graphics);
    });

    // Set up drag/drop.
    d3.select(this.renderer.view)
      .call(d3.drag()
        .container(this.renderer.view)
        .subject(() => this.simulation.find(d3.event.x, d3.event.y))
        .on('start', this.dragStarted)
        .on('drag', this.dragged)
        .on('end', this.dragEnded));

    // Set up graphics for the links.
    this.linksGraphics = new PIXI.Graphics();
    this.stage.addChild(this.linksGraphics);
  }

  /**
   * Resize the PixiJS renderer based on the width and height.
   * @private
   */
   pixiResizeRenderer() {
    this.renderer.resize(
      this.simulationWidth * this.scaleSimulationToPixi,
      this.simulationHeight * this.scaleSimulationToPixi);
  }

  /**
   * Move the PixiJS position of the specified node.
   * @param {Object} node The node to move the position of.
   * @private
   */
  pixiMoveNode(node) {
    let { x, y, graphics } = node;
    graphics.position =
      new PIXI.Point(x * this.scaleSimulationToPixi, y * this.scaleSimulationToPixi);
  }

  /**
   * Use PixiJS to draw the circle for a node.
   * @param {Object} node The node to draw the circle for.
   * @param {Number} selectedNodeMagnitude If this is the currently selected node, indicates the
   * magnitude percentage (0 - 1.0) of the selection. A value of 0 indicates that this is not the
   * currently selected node.
   * @private
   */
  pixiDrawNode(node, selectedNodeMagnitude = 0) {
    let nodeStrokeColor;
    let nodeFillColor;
    let nodeOpacity;
    let nodeRadius;
    if (selectedNodeMagnitude) {
      // Scale the node properties based on the magnitude.
      nodeStrokeColor = this.rgbNumberFromArray(
        this.gradientColor(
          this.nodeSelectedStrokeColorArray,
          this.getNodeStrokeColorArray(node),
          selectedNodeMagnitude));
      nodeFillColor = this.rgbNumberFromArray(
        this.gradientColor(
          this.nodeSelectedFillColorArray,
          // DCM 01.mar.2019: Always use same node fill color as stroke color.
          this.getNodeStrokeColorArray(node),
          //this.props.logoMode ? this.getNodeStrokeColorArray(node) : this.nodeFillColorArray,
          selectedNodeMagnitude));
      nodeOpacity =
        this.nodeOpacity + (this.nodeOpacitySelected - this.nodeOpacity) * selectedNodeMagnitude;
      nodeRadius =
        this.nodeRadius + (this.nodeRadiusSelected - this.nodeRadius) * selectedNodeMagnitude;
    }
    else {
      nodeStrokeColor = this.rgbNumberFromArray(this.getNodeStrokeColorArray(node));
      // DCM 01.mar.2019: Always use same node fill color as stroke color.
      nodeFillColor = nodeStrokeColor;
      //nodeFillColor = this.rgbNumberFromArray(
      //  this.props.logoMode ?
      //    this.getNodeStrokeColorArray(node) : this.nodeFillColorArray);

      nodeOpacity = this.nodeOpacity;
      nodeRadius = this.nodeRadius;
    }

    node.graphics.clear();
    node.graphics.lineStyle(
      this.nodeStrokeWidth * this.scaleSimulationToPixi,
      nodeStrokeColor,
      nodeOpacity);
    node.graphics.beginFill(nodeFillColor, nodeOpacity);
    if (selectedNodeMagnitude) {
      node.graphics.filters = [
        new filters.GlowFilter(
          5,                          // distance
          4 * selectedNodeMagnitude,  // outerStrength
          0,                          // innerStrength
          nodeStrokeColor,            // color
          0.5)                        // quality
      ]
    }
    else
      node.graphics.filters = null;
    node.graphics.drawCircle(0, 0, nodeRadius * this.scaleSimulationToPixi);
  }

  /**
   * Use PixiJS to draw the line for a link between nodes.
   * @param {Object} link The link to draw the line for.
   * @param {Number} linkMagnitude Indicates the magnitude percentage (0 - 1.0) of the link opacity
   * boost.
   * @private
   */
  pixiDrawLink(link, linkMagnitude) {
    let { source, target, opacity } = link;
    const linkOpacity = opacity + 0.25 * (this.props.logoMode ? 1 : linkMagnitude);
    this.linksGraphics.alpha = linkOpacity;
    this.linksGraphics.lineStyle(
      (this.linkStrokeWidth + this.linkStrokeWidthIncreaseAtMagnitude * linkMagnitude) *
        this.scaleSimulationToPixi,
      this.rgbNumberFromArray(this.getColorArray(link.index, this.linksData.length)));
      this.linksGraphics.moveTo(
        source.x * this.scaleSimulationToPixi, source.y * this.scaleSimulationToPixi);
      this.linksGraphics.lineTo(
        target.x * this.scaleSimulationToPixi, target.y * this.scaleSimulationToPixi);
  }

  /**
   * Return the color based on the specified index and number of indices.
   * @param {Number} index The index to return the color of.
   * @param {Number} numIndices The total number of indices used to determine the color.
   * @return {Array} The color arrayof the specified index.
   * @private
   */
  getColorArray(index, numIndices) {
    // These colors come from the DFINITY logo.
    const purple = [99,38,132];
    const pink = [237,30,121];
    const darkOrange = [241,90,36];
    const lightOrange = [251,176,59];
    const blue = [41,171,226];

    // Certain color transitions in the DFINITY logo are small, others are gradual.
    const transitionPercentSmall = 0.02;
    const transitionPercentGradual = 0.1;
    const transitionIndicesSmall = numIndices * transitionPercentSmall;
    const transitionIndicesGradual = numIndices * transitionPercentGradual;

    // The number of indices of each color was determined by analyzing the DFINITY logo.
    const lastPurpleIndex = numIndices * 0.15 - transitionIndicesGradual;
    const lastPinkIndex =
      lastPurpleIndex + transitionIndicesGradual + numIndices * 0.15 - transitionIndicesSmall;
    const lastDarkOrangeIndex =
      lastPinkIndex + transitionIndicesSmall + numIndices * 0.15 - transitionIndicesGradual;
    const lastLightOrangeIndex =
      lastDarkOrangeIndex + transitionIndicesGradual + numIndices * 0.15 - transitionIndicesSmall;
    const lastBlueIndex =
      lastLightOrangeIndex + transitionIndicesSmall + numIndices * 0.4 - transitionIndicesSmall;

    // Determine the color based on the color zone the index is in.
    if (index <= lastPurpleIndex)
      return purple;
    else if (index <= lastPurpleIndex + transitionIndicesGradual)
    {
      const percentage = (index - lastPurpleIndex) / transitionIndicesGradual;
      return this.gradientColor(pink, purple, percentage);
    }
    else if (index <= lastPinkIndex)
      return pink;
    else if (index <= lastPinkIndex + transitionIndicesSmall)
    {
      const percentage = (index - lastPinkIndex) / transitionIndicesSmall;
      return this.gradientColor(darkOrange, pink, percentage);
    }
    else if (index <= lastDarkOrangeIndex)
      return darkOrange;
    else if (index <= lastDarkOrangeIndex + transitionIndicesGradual)
    {
      const percentage = (index - lastDarkOrangeIndex) / transitionIndicesGradual;
      return this.gradientColor(lightOrange, darkOrange, percentage);
    }
    else if (index <= lastLightOrangeIndex)
      return lightOrange;
    else if (index <= lastLightOrangeIndex + transitionIndicesSmall)
    {
      const percentage = (index - lastLightOrangeIndex) / transitionIndicesSmall;
      return this.gradientColor(blue, lightOrange, percentage);
    }     
    else if (index <= lastBlueIndex)
      return blue;
    else
    {
      const percentage = (index - lastBlueIndex) / transitionIndicesSmall;
      return this.gradientColor(purple, blue, percentage);
    }
  }

  /**
   * Return the gradient color based on the specified parameters.
   * @param {Array} color1 The RGB array of color 1.
   * @param {Array} color2 The RGB array of color 2.
   * @param {Number} percent The percentage of the gradient.
   * @return {Array} The RGB array of the gradient color.
   * @private
   */
  gradientColor(color1, color2, percent) {
    const p1 = percent;
    const p2 = 1 - p1;
    const rgb = [
      Math.round(color1[0] * p1 + color2[0] * p2),
      Math.round(color1[1] * p1 + color2[1] * p2),
      Math.round(color1[2] * p1 + color2[2] * p2)];
    return rgb;
  }

  /**
   * Return the RGB color number corresponding to the specified RGB color array.
   * @param {Array} array The RGB array.
   * @return {Number} The RGB color number.
   * @private
   */
  rgbNumberFromArray(array) {
    let color = 0;
    array.forEach(element => {
      color = (color << 8) + element;
    });
    return Number(color);
  }

/**
   * Return the stroke color of the specified node.
   * @param {Object} node The node to return the stroke color of.
   * @return {Array} The stroke color array of the specified node.
   * @private
   */
  getNodeStrokeColorArray(node) {
    return this.getColorArray(node.index % this.numSymbolNodes, this.numSymbolNodes)
  }

/**
   * Start dragging a node.
   * @param {Object} d The node being dragged.
   * @private
   */
  dragStarted(d) {
    // Disable dragging when scaling.
    if (this.scaleSimulationToPixi !== 1.0)
      return;

    const isSimulationRunning = this.simulation.alphaDecay() === 0;
    if (!isSimulationRunning) {
      if (!d3.event.active)
        this.simulation.alphaTarget(0.3).restart();
    }
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  /**
   * Continue dragging a node.
   * @param {Object} d The node being dragged.
   * @private
   */
  dragged(d) {
    // Disable dragging when scaling.
    if (this.scaleSimulationToPixi !== 1.0)
      return;

    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  /**
   * Stop dragging a node.
   * @param {Object} d The node being dragged.
   * @private
   */
  dragEnded(d) {
    // Disable dragging when scaling.
    if (this.scaleSimulationToPixi !== 1.0)
      return;

    const isSimulationRunning = this.simulation.alphaDecay() === 0;
    if (!isSimulationRunning) {
      if (!d3.event.active)
        this.simulation.alphaTarget(0);
    }
    d3.event.subject.fx = d3.event.subject._fx;
    d3.event.subject.fy = d3.event.subject._fy;
  }

  /**
   * Update the node and link positions on each tick of the simulation.
   * @private
   */
  tick() {
    // Move the node positions.
    this.nodesData.forEach((node) => { this.pixiMoveNode(node); });

    // Animate the selected node to grow larger and change to white, then shrink smaller and change
    // back to original colors.
    if (this.newBlockNodeStartTime != null) {
      const node = this.nodesData[this.selectedNodeIndex];
      const elapsedMs = new Date() - this.newBlockNodeStartTime;
      if (elapsedMs > this.newBlockNodeTimerMs) {
        // Draw a normal node circle.
        this.pixiDrawNode(node);

        // Disable new block node timer.
        this.newBlockNodeStartTime = null;
      }
      else {
        // Calculate the magnitude based on the timer.
        const selectedNodeMagnitude =
          (elapsedMs <= this.newBlockNodeTimerMs / 2 ?
            elapsedMs :
            this.newBlockNodeTimerMs - elapsedMs) /
          (this.newBlockNodeTimerMs / 2);

        // Draw a modifified node circle based on the magnitude.
        this.pixiDrawNode(node, selectedNodeMagnitude);
      }
    }

    // Calculate link magnitude.
    let linkMagnitude = 0;
    if (this.newBlockLinksStartTime != null) {
      const elapsedMs = new Date() - this.newBlockLinksStartTime;
      if (elapsedMs > this.newBlockLinksTimerMs) {
        // Disable new block links timer.
        this.newBlockLinksStartTime = null;
      }
      else {
        // Calculate the magnitude based on the timer.
        linkMagnitude =
          elapsedMs <= this.newBlockLinksTimerMs / 3 ?
            elapsedMs / (this.newBlockLinksTimerMs / 3) :
            (this.newBlockLinksTimerMs - elapsedMs) /
              (this.newBlockLinksTimerMs * 2 / 3);
      }
    }

    // Draw lines for the links.
    this.linksGraphics.clear();
    this.linksData.forEach((link) => {
      this.pixiDrawLink(link, linkMagnitude);
    });
    this.linksGraphics.endFill();

    this.renderer.render(this.stage);
  }

  /**
   * Rotate the symbol.
   * @param {Number} elapsed Elapsed time since the timer became active.
   * @private
   */
  rotate(elapsed) {
    // In order to increase efficiency, it might be possible to decrease the frequency at which we
    // rotate, then use d3 transition so that the movement is smooth. The problem is, non-symbol
    // nodes will still be moving based on the simulation, so it's unknown whether this will
    // actually improve performance. Since it does not seem like d3.interval() can be counted on to
    // call this function with precision, this may not be a feasible approach, since if you do not
    // know when the next call will be, you cannot know how long to make the transition.
    // See webpage "D3.selectAll(...).transition() Explained"
    // (http://bl.ocks.org/Kcnarf/9e4813ba03ef34beac6e)

    for (let i = 0; i < this.numSymbolNodes; i++) {
      this.rotateOffset += this.rotateAmount;
      const pos = this.getNodePosition(i);
      this.nodesData[i].fx = this.nodesData[i]._fx = pos[0];
      this.nodesData[i].fy = this.nodesData[i]._fy = pos[1];
    }
  }
}

export default DfinitySymbolD3;
