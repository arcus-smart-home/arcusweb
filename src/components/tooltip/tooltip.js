/**
 * Copyright 2019 Arcus Project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Component from 'can-component';
import CanMap from 'can-map';
import canDev from 'can-util/js/dev/';
import 'can-map-define';
import view from './tooltip.stache';
import camelCase from 'lodash/camelCase';

export const ViewModel = CanMap.extend({});

// when anchoring left or right add additional px margin to that side of arrow
const EXTRA_ARROW_MARGIN = 5;

// calculate a tooltip position with provided positioning instructions, returns if this positioning would cause an overflow
function attemptTooltipPositioning(instructions, measurements) {
  // the calculated x & y coordinates of the tooltip relative to the document. this is adjusted to be relative to offset parent during applyPositioning
  let x = 0;
  let y = 0;
  // the calculated x & y coordinates of the tooltip relative to the tooltip container
  let arrowX = 0;
  let arrowY = 0;

  if (instructions.coordinates.x) { // if we have an explicit x position provided
    x = instructions.coordinates.x;
    arrowX = measurements.button.x - instructions.coordinates.x;
  } else if (instructions.anchor.right) { // if we are meant to anchor the right side of the tooltip
    x = measurements.button.x - measurements.tooltip.width;
    x += measurements.arrow.width + measurements.tooltip.borderRadius + EXTRA_ARROW_MARGIN;
    arrowX = measurements.tooltip.width - measurements.arrow.width - measurements.tooltip.borderRadius - EXTRA_ARROW_MARGIN;
  } else if (instructions.anchor.left) { // if we are meant to anchor the left side of the tooltip
    x = measurements.button.x - measurements.tooltip.borderRadius - EXTRA_ARROW_MARGIN;
    arrowX = measurements.tooltip.borderRadius + EXTRA_ARROW_MARGIN;
  }
  x += instructions.shift.right;
  x -= instructions.shift.left;
  arrowX += instructions.shift.left;
  arrowX -= instructions.shift.right;

  if (instructions.anchor.top) {
    y = measurements.button.bottom + measurements.arrow.height;
    arrowY = 0 - measurements.arrow.height;
  } else if (instructions.anchor.bottom) {
    y = measurements.button.y - measurements.tooltip.height - measurements.arrow.height;
    arrowY = measurements.tooltip.height - 1;
  }
  y += instructions.shift.down;
  y -= instructions.shift.up;
  arrowY += instructions.shift.up;
  arrowY -= instructions.shift.down;

  return {
    width: measurements.tooltip.width, // keep this measurement to preserve width when switching to absolute positioning during position application
    height: measurements.tooltip.height,
    coordinates: { x, y },
    arrowCoordinates: { x: arrowX, y: arrowY },
    overflow: {
      right: x + measurements.tooltip.width > instructions.bounds.x + instructions.bounds.width,
      left: x < instructions.bounds.x,
      top: y < instructions.bounds.y,
      bottom: y + measurements.tooltip.height > instructions.bounds.y + instructions.bounds.height,
      px: {
        right: Math.max((x + measurements.tooltip.width) - (instructions.bounds.x + instructions.bounds.width), 0),
        left: Math.max(instructions.bounds.x - x, 0),
        top: Math.max(instructions.bounds.y - y, 0),
        bottom: Math.max((y + measurements.tooltip.height) - (instructions.bounds.y + instructions.bounds.height), 0),
      },
    },
  };
}

// checks to see if the results of a positioning attempt are valid
function isPositioningValid(positioningResult) {
  return Object.keys(positioningResult.overflow).reduce((ret, val) => ret && !positioningResult.overflow[val], true);
}

// take positioning instructions and a failed positioning result and modify the instructions to attempt to resolve the failure
// returns the modified instructions after a alteration has been made, else returns false if no modification could be made
function adjustPositioning(instructions, failedResult) {
  // adjustments implemented:
  //  1. if a result would overflow a bound, shift it in the other direction by that amount
  //
  if (failedResult.overflow.right) {
    if (!instructions.shift.left) {
      instructions.shift.left = failedResult.overflow.px.right + 5;
      return instructions;
    }
  } else if (failedResult.overflow.left) {
    if (!instructions.shift.right) {
      instructions.shift.right = failedResult.overflow.px.left + 5;
      return instructions;
    }
  } else if (failedResult.overflow.top) {
    if (!instructions.shift.bottom) {
      instructions.shift.up = failedResult.overflow.px.bottom + 5;
      return instructions;
    }
  } else if (failedResult.overflow.bottom) {
    if (!instructions.shift.top) {
      instructions.shift.down = failedResult.overflow.px.top + 5;
      return instructions;
    }
  }

  return false;
}

// for IE based browsers add properties missing from a standard rect
function normalizeRect(rect) {
  if (rect.x === undefined) {
    rect.x = rect.left;
  }
  if (rect.y === undefined) {
    rect.y = rect.top;
  }
  return rect;
}

// take a calculated positioning result and apply it to the tooltip elements
function applyPositioning(positioningResult, tooltip, tooltipArrow) {
  tooltip.style.position = 'absolute'; // must be switched to absolute before reading 'tooltip.offsetParent'

  const offsetParent = normalizeRect(tooltip.offsetParent.getBoundingClientRect());
  const parentRelativeX = positioningResult.coordinates.x - offsetParent.x;
  const parentRelativeY = positioningResult.coordinates.y - offsetParent.y;

  tooltip.style.left = `${parentRelativeX}px`;
  tooltip.style.top = `${parentRelativeY}px`;
  tooltip.style.width = `${positioningResult.width}px`;
  tooltip.classList.add('visible');
  tooltipArrow.style.left = `${positioningResult.arrowCoordinates.x}px`;
  tooltipArrow.style.top = `${positioningResult.arrowCoordinates.y}px`;
}

// get element coordinates when in default absolute position
function getInFlowCoordinates(element) {
  element.style.position = 'absolute';
  element.style.left = 'auto';
  element.style.top = 'auto';
  const rect = normalizeRect(element.getBoundingClientRect());
  element.style.position = '';
  element.style.left = '';
  element.style.top = '';
  return rect;
}

// get the border radius of the corner that the arrow will be anchored to
function getTooltipBorderRadius(anchor, tooltip) {
  const verticalAnchor = (anchor.top && 'top') || (anchor.bottom && 'bottom') || '';
  const horizontalAnchor = (anchor.left && 'left') || (anchor.right && 'right') || '';
  const propertyName = `border-${verticalAnchor}-${horizontalAnchor}-radius`;
  const tooltipComputedStyle = window.getComputedStyle(tooltip);
  const computedBorderRadius = tooltipComputedStyle[propertyName] || tooltipComputedStyle[camelCase(propertyName)];
  return parseInt(computedBorderRadius, 10) || 0;
}

// get an instance of the tooltip hover in handler
function getHoverInHandler(tooltip) {
  return function onHover() {
    const button = this;
    const tooltipArrow = tooltip.querySelector('.tooltip-arrow');
    const tooltipAnchorAttrParts = (tooltip.getAttribute('anchor') || '').split('-');
    const anchor = ['top', 'bottom', 'left', 'right'].reduce((ret, dir) => {
      ret[dir] = tooltipAnchorAttrParts.includes(dir);
      return ret;
    }, {});
    const boundingParentSelector = tooltip.getAttribute('bounding-parent');
    const boundingParent = boundingParentSelector ? tooltip.closest(boundingParentSelector) : null;
    // TODO: pull measurement gathering into it's own helper function
    const measurements = {
      tooltip: normalizeRect(tooltip.getBoundingClientRect()),
      button: normalizeRect(button.getBoundingClientRect()),
      arrow: normalizeRect(tooltipArrow.getBoundingClientRect()),
    };
    let positionInstructions = {
      anchor,
      coordinates: {},
      shift: { left: 0, right: 0, down: 0, up: 0 },
    };

    // add additional measurements required for positioning
    measurements.tooltip.borderRadius = getTooltipBorderRadius(anchor, tooltip);

    if (boundingParent) {
      const boundingParentRect = normalizeRect(boundingParent.getBoundingClientRect());
      positionInstructions.bounds = {
        width: boundingParentRect.width,
        height: boundingParentRect.height,
        x: boundingParentRect.x,
        y: boundingParentRect.y,
      };
    } else {
      positionInstructions.bounds = {
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
      };
    }

    // if we have no horizontal anchor, measure the tooltips in-flow horizontal position and explicitly use that during positioning
    if (!(anchor.left || anchor.right)) {
      positionInstructions.coordinates.x = getInFlowCoordinates(tooltip).x;
    }

    // default to anchor top if no vertical anchor provided
    if (!anchor.top && !anchor.bottom) { anchor.top = true; }

    let attempts = 0;
    let positionResult = attemptTooltipPositioning(positionInstructions, measurements);

    // if initial positioning attempt is out of bounds, adjust positioning instructions and try again
    if (!isPositioningValid(positionResult)) {
      do {
        positionInstructions = adjustPositioning(positionInstructions, positionResult);

        // if position adjustment failed exit retry loop immediately
        if (positionInstructions === false) {
          break;
        }

        positionResult = attemptTooltipPositioning(positionInstructions, measurements);
        attempts++;
      } while (!isPositioningValid(positionResult) && attempts < 4);
    }

    // if the position is still invalid following repositioning attempts throw a warning
    if (!isPositioningValid(positionResult)) {
      canDev.warn('arcus-tooltip: multiple attempts to position the tooltip failed. this is likely due to a misconfiguration or inadequate space available in container. tooltip launcher: ', button);
    }

    // apply whatever positioning we've calculated
    applyPositioning(positionResult, tooltip, tooltipArrow);
  };
}

// get an instance of the tooltip hover out handler
function getHoverOutHandler(tooltip) {
  return function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.style.position = '';
    tooltip.style.top = '';
    tooltip.style.left = '';
    tooltip.style.width = '';
  };
}

// return the element that launches the tooltip
function getTarget(tooltip) {
  const targetSelector = tooltip.getAttribute('target');

  return targetSelector ? tooltip.parentNode.querySelector(targetSelector) : tooltip.previousElementSibling;
}


export default Component.extend({
  tag: 'arcus-tooltip',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const target = getTarget(this.element);
      this._hoverInHandler = getHoverInHandler(this.element);
      this._hoverOutHandler = getHoverOutHandler(this.element);

      target.addEventListener('mouseenter', this._hoverInHandler);
      target.addEventListener('mouseleave', this._hoverOutHandler);
    },
    removed() {
      const target = getTarget(this.element);

      target.removeEventListener('mouseenter', this._hoverInHandler);
      target.removeEventListener('mouseleave', this._hoverOutHandler);
    },
  },
});
