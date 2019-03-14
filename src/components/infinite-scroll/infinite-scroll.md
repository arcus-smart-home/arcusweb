@parent app.components
@module {canComponent} i2web/components/infinite-scroll Infinite Scroll

A short description of the arcus-infinite-scroll component

@signature `<arcus-infinite-scroll {source}="source">`

@body

This infinite scroll component is a transplant of Google's code from their "Complexities
of an Infinite Scroller" article which can be found [here](https://developers.google.com/web/updates/2016/07/infinite-scroller).

This component bucks the standard CanJS ways of rendering data and utilizing DOM
in order to be hyper conservative on memory management. This is done by a
combination of:

1. Recycling DOM elements
2. Utilizing tombstone (placeholder) elements while data loads
3. Handling the layout itself instead of the browser

DOM rendering and data handling is all handled through a custom [i2web/components/infinite-scroll/source Source]
to render clones of DOM templates, render them with vanilla JavaScript, and fetch
data from the server to render to our scroll.

## Example
@demo src/components/infinite-scroll/infinite-scroll.html