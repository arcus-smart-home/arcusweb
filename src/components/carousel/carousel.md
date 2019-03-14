@parent app.components
@module {canComponent} i2web/components/carousel Carousel

Carousel

@signature `<arcus-carousel {nav}="nav" {loop}="loop" {slide-by-page}="slideByPage" {listen-to}="~list.length">`

@body

The `listen-to` param should be a compute that will trigger a change event that should refresh the carousel.

Note, nav, loop, and slide-by-page are "one-time" params - they will not update the carousel configuration if the value has changed.

## Example
@demo src/components/carousel/carousel.html
