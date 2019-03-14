@parent app.components
@module {can.Component} i2web/components/camera Camera

Render the video of a camera device

@signature `<arcus-camera {camera}="camera" {recording-enabled}="canRecord" [preview-only] [no-preview]>`
@param {Camera} camera The camera to render
@param {boolean} recordingEnabled Whether or not the camera subsystem allows cameras to record
@param {htmlbool} previewOnly Display the camera preview interval only, no video options
@param {htmlbool} noPreview Do not request or render a preview image

@body

## Example
@demo src/components/camera/camera.html