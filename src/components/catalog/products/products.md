@parent app.components
@module {canComponent} i2web/components/catalog/products Catalog Products

Provides a listing of catalog products, based on a previously selected brand or category

@signature `<arcus-catalog-products {group-type}="groupType" {(selected-group)}="selectedGroup" \>`

@param {String} groupType The type of grouping, e.g. brands or categories
@param {String} selectedGroup The selected group name, either a brand or category.

@body

## Use

@demo i2web/components/catalog/products/products.html