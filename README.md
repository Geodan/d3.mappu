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
map.getLayersByName(name<string>) - returns an array of layers with that name
map.redraw() - redraws the map
map.resize() - updates map params (width/height etc) after resize
map.maxZoom - get/set maxzoomlevel
map.minZoom - get/zet minzoomlevel
map.zoom - get/set zoomlevel
map.center - get/set the map center coordinates
map.projection - get/set the map projection
map.tiles - get the tiles calculation method
map.zoombehaviour - get the zoombehaviour method
map.layers - get the layers array
map.svg - get the svg object of the map
map.mapdiv - get the div in which the map is drawn

```
Layer object
```
layer.id - get id
layer.name set/get name
layer.opacity (0 - 1) set/get opacity
layer.visible (bool) set/get visible
layer.map get map object that layer is attached to

layer.draw(bool) (re)draw the layer. Optional boolean parameter to remove all feats first. Otherwhise only new data is drawn.
layer.refresh() refresh the layer. This is less computational than draw, because only visibility and opacity are changed
layer.moveUp() - moves layer one level up in layerstack
layer.moveDown() - moves layer one level down in layerstack
layer.addTo(map) - adds layer to map object
```
Rasterlayer object
```
var layer = new d3.mappu.RasterLayer('name', {config});
layer.url set/get the base url of the raster service
layer.layers set/get the layers in the wms parameters
```
Vectorlayer object
```
var layer = new d3.mappu.VectorLayer('name', {config});
layer.data //set/get the data (features)
layer.events //set/get the events
layer.addFeature(feature<geojson>) //feature is geojson object
layer.removeFeature(feature<geojson>) //give full feature

```

```
Sktech plugin
```
var sketch = new d3.mappu.Sketch('id', {layer: layerobject});
sketch.draw(type); //Start drawing a feature. Type can be: 'Point', 'LineString', 'Polygon'
sketch.startRemove(); //Click a feature to be removed
sketch.startEdit(); //Click a feature to be edited
sketch.finish(); //Finishes what you were doing and removes listeners and events
```
events:
	'featureReady' returns the feature that has been drawn/edited


Install
===
prerequisites: node js, npm and a webserver

```
#install grunt and bower globally on your machine
npm install -g grunt-cli
npm install -g bower

#download external denpendencies and build your d3.mappu project
cd <path_to_your>/d3.mappu
bower install
grunt
```

Then visit:
http://yourmachine/path_to_d3.mappu/test/test1.html
in a webbrowser 
