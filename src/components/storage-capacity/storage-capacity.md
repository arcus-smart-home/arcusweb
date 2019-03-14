@parent app.components
@module {canComponent} i2web/components/storage-capacity Storage Capacity

Displays a progress bar showing the ratio of used and total space.

@signature `<arcus-storage-capacity {used-bytes}="aNumber" {total-bytes}="aNumber">`

@param {Number} usedBytes The number of bytes used in storage
@param {Number} totalByte The total number of bytes available in storage

@body

## Example
@demo src/components/storage-capacity/storage-capacity.html