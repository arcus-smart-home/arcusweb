@parent app.components
@module {canComponent} i2web/components/pairing/customize/schedule Pairing - Customize Schedule

Allowing the User to add schedule events to a recently paired device.

@signature `<arcus-pairing-customize-schedule
                    {(device)}="device"
                    {when-complete}="@customizationCompleted"
                    {customization-step}="currentStep"
                    {^title}="title"
                  />`

@body

## Use

@demo i2web/components/pairing/customize/schedule/schedule.html