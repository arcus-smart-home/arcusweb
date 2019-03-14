@parent app.components
@module {canComponent} i2web/components/pairing/connect/hub Pairing - Connect Hub

Component used to walk the User through Hub registration process.

@signature `<arcus-pairing-connect-hub
              {form-values}="formValues"
              {place}="place"
              {(is-finished-steps)}="isFinishedSteps"
              {^device}="hub"
              {^is-finished-registration}="isFinishedRegistration"
              {^title}="pairingTitle" />`

@body

## Use

@demo i2web/components/pairing/connect/hub/hub.html