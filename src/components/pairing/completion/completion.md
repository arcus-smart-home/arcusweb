@parent app.components
@module {canComponent} i2web/components/pairing/completion Pairing - Completion Steps Manager

Shows a series of pairing-related modals based on the contents of the 'DismissAllResponse'
messsage triggered when the pairing page exits following a successful pairing.

The DismissAllResponse may return completion step records that indicate which
post-pairing dialogs to show.

Shows when a DismissAllResponse arrives that contains completion records. Hides when the
last completion record prompt is satisfied by the user.

@signature `<arcus-pairing-completion-manager />`

@body

## Use

@demo i2web/components/pairing/completion/completion.html