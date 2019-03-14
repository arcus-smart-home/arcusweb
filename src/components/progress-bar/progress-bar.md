@parent app.components
@module {canComponent} i2web/components/progress-bar Progress Bar

Displays a progress bar showing a specified percentage complete.

@signature `<arcus-progress-bar {percent-complete}="percent" [{unit-text}="text"] />`
@param {Number} percentComplete A number between 0 and 100 representing the percent complete
@param {String} unitText The text following the percentage value (defaults to '% Complete')

@body

## Example
@demo src/components/progress-bar/progress-bar.html