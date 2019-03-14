@parent app.components
@module {canComponent} i2web/components/catalog/selectable Catalog - Selectable

A selectable item on the Product Catalog page, bound to a product, brand or category.

@signature `<arcus-catalog-selectable {thing}="thing" {thing-type}="thingType" {advance}="@selectThing"/>`

@param {CanMap} thing The thing to display; either a product, brand or category
@param {String} thingType The type of thing to display; 'product', 'brand', or 'category'
@param {Function} advance called with the model represented by this component when selected and no errors are present


@body

## Use

@demo i2web/catalog/selectable/selectable.html