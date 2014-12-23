d3.mappu
========

map library based on d3. 

Will not work on a ringworld

マップ


API
===

MAP object
```
map = new d3.mappu.map('name', {config});

map.addLayer(layerObject) - Adds a layer to the map
map.removeLayer(id) - Removes layer with id 
map.maxZoom - get/set maxzoomlevel
map.minZoom - get/zet minzoomlevel
map.zoom - get/set zoomlevel
map.center - get/set the map center coordinates
```
Layer object
```
layer.id - get id
layer.name set/get name
layer.opacity (0 - 1) set/get opacity
layer.visible (bool) set/get visible
layer.draw(bool) (re)draw the layer. Optional boolean parameter to remove all feats first. Otherwhise only new data is drawn.
layer.refresh() refresh the layer. This is less computational than draw, because only visibility and opacity are changed
layer.moveUp() - moves layer one level up in layerstack
layer.moveDown() - moves layer one level down in layerstack
layer.addTo(map) - adds layer to map object
```
Rasterlayer object
```
var layer = new d3.mappu.RasterLayer('name', {config});
layer.url set/get the url of the raster service
```
Vectorlayer object
```
var layer = new d3.mappu.VectorLayer('name', {config});
layer.data set/get the data (features)
```
