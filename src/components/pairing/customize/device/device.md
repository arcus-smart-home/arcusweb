@parent i2web/components/pairing
@module {canComponent} i2web/components/pairing/customize/device Pairing - Customize Device

This component manages the device or hub customization steps based on the configurations.

@signature `<arcus-pairing-customize-device
              {device}="device"
              {isHub}="isHub"
              {^title}="pairingTitle"
              {^is-finished-customization}="isFinishedCustomization"
            />`

@param {Device} device A hub or a device instance
@param {Boolean} isHub A boolean indicating whether `device` is a device or a Hub
@param {Boolean} isFinishedCustomization If the User has finished customizing `device`

@body

## Use

@demo i2web/components/pairing/customize/device.html