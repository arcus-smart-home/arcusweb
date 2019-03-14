@parent app.components
@module {canComponent} i2web/components/wizard/step Wizard > Step

The Wizard Step component is used in conjunction with the `Wizard` component, to provide a
collection of steps through a process. The containing Wizard controls navigation
and prevents a user from moving forward until a particular step has been satisfied.

@signature `<arcus-wizard-step {is-satisfied}="@isSatisfied" {prev-button-label}="prevLabel" {next-button-label}="nextLabel" {has-no-nav}="noNav">`

@param {} is-satisfied  Attribute that determines when Step is satisfied.
@param {} prev-button-label Button label to show on Previous button for this Step.
@param {} next-button-label Button label to show on Next button for this Step.
@param {} has-no-nav Hide Next and Previous buttons for this Step.

@body

Although the Wizard container controls the Next and Previous navigation buttons,
each Step can override the button labels if desired. Alternatively, a Step may wish to
completely hide navigation buttons using the `has-no-nav` attribute. This may be useful
in the final Step.

## Example
@demo src/components/wizard/wizard.html

