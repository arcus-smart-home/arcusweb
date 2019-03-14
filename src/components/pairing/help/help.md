@parent app.components
@module {canComponent} i2web/components/pairing/help Pairing - Help Steps

Component displayed when attempting to Search for all devices and search has idled.

@signature `<arcus-pairing-help
              {action-click}="@actionClick"
              {help-steps}="helpSteps"
              {^title}="title"
            />`
@param {Function} actionClick A function that accepts a string dictating the action
clicked by the User
@param {Object} helpSteps The helpSteps to display to the User; retrieved from
`PairingSubsystem.ListHelpSteps`
@param {String} title The pairing step title

@body

## Use

@demo i2web/components/pairing/help/help.html