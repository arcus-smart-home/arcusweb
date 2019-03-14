@parent i2web/components
@module {canComponent} i2web/components/staged-progress Staged Progress Bar

Tracks the steps along a process with multiple discreet stages.

@signature `<arcus-staged-progress [stage] [in-progress] [stages]>`
@param {htmlbool} stage - Can be one of the following: select-plan, create-login, build-profile, complete
@param {htmlbool} in-progress - Whether the `stage` is in progress or complete
@param {Array} stages - A collection of stages attributes. Defaults to: [select-plan,
create-login, build-profile, complete]

@body

## Use

@demo i2web/components/staged-progress/staged-progress.html