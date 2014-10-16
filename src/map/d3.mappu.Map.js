/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
 
 
/* d3.mappu.Map(element, options)

element = dom object
options: 
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0
maxZoom: zoomlevel                  default = 13
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
*/
 
// exposed functions

////getter/setter functions

// .zoom : (zoomlevel)

// .center : ([long,lat])

// .projection : ({projection})

////singular functions

// .addLayers([{layer}])

// .getLayers()

// .removeLayers([{layer}])



