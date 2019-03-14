@parent i2web/components/subsystem
@module {can.Component} i2web/components/subsystem/alarms/devices/generic Alarms > Devices > Generic

Renders a list of devices that are associated with the alarm subsystem of a specific type. That type will either be `CO`, `Smoke`, or `Water Leak`. Security based devices are handled by a different component.

@signature `<arcus-subsystem-alarms-devices-generic {(type)}="type" {(subsystem)}="subsystem">`

@body

## Example
@demo src/components/subsystem/alarms/devices/generic/generic.html