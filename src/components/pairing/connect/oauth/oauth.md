@parent app.components
@module {canComponent} i2web/components/pairing/connect/oauth Arcus Pairing Connect OAuth

A pairing subview that provides the status and available actions of an OAuth device 
connection / discovery process. 

@signature `<arcus-pairing-connect-oauth
  {^title}="pairingTitle"
  {(is-finished-steps)}="isFinishedSteps"
  {pairing-config}="pairingConfig"
  {pairing-devices}="pairingDevices"
  {on-customize}="@onCustomize"
  {on-try-again}="@onTryAgain"
  {on-remove}="@onRemove" />`

@body

## Use

@demo i2web/components/pairing/connect/oauth/oauth.html