@parent i2web/components/pairing
@module {canComponent} i2web/components/pairing/steps Pairing Steps

This component displays a series of illustrations and instructions as part of the pairing process. 
Also includes a form shown on the last step of the series whose values are kept in in the `formValues` array. 

@signature `<arcus-pairing-steps
    {config}='config'
    {product}='product'
    {^is-finished-steps}='isFinishedSteps'
    {on-abandon-pairing-steps}='@onAbandonPairingSteps'
    {^step-form-values}='formValues' />`

@body

## Use

@demo i2web/components/pairing/steps/steps.html