d3.mappu = d3.mappu || {};
/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
/* d3.mappu.Map(element, config)

element = dom object
options: 
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0.0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0.0
maxZoom: zoomlevel                  default = 13.0
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
*/


d3.mappu.Map = function(elem, config) {
    return d3_mappu_Map(elem, config);
};

d3_mappu_Map = function(elem, config) {
    var map = {};
	var self = this;
	//TODO: how to get the size of the map
	var width = 1024;
	var height = 768;
	
	//TODO: check if SVG?
	var svg = d3.select(elem).append('svg')
		.attr("width", width)
		.attr("height", height);
	
    self.svg = svg;
    self.config = config;
	
	//TODO parse config;
	self._center = config.center;
	
// exposed functions

////getter/setter functions
	 Object.defineProperty(map, 'svg', {
        get: function() {
            return self.svg;
        },
        set: function(svg) {
            console.log("do not touch the svg");
        }
    });
// .zoom : (zoomlevel)
    Object.defineProperty(map, 'zoom', {
        get: function() {
            return self._zoom===undefined?0:self._zoom;
        },
        set: function(zoom) {
            self._zoom = zoom;
        }
    });

// .minZoom : (zoomlevel)
    Object.defineProperty(map, 'minZoom', {
        get: function() {
            return self._minZoom===undefined?0:self._minZoom;
        },
        set: function(minZoom) {
            self._minZoom = minZoom;
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        get: function() {
            return self._maxZoom===undefined?13:self._maxZoom;
        },
        set: function(maxZoom) {
            self._maxZoom = maxZoom;
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        get: function() {
            return self._maxView===undefined?[[-180,90],[180,-90]]:self._maxView;
        },
        set: function(maxView) {
            self._maxView = maxView;
        }
    });
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        get: function() {
            return self._center===undefined?[0,0]:self._center;
        },
        set: function(center) {
            self._center = center;
        }
    });
// .projection : ({projection})
    Object.defineProperty(map, 'projection', {
        get: function() {
            return self._projection===undefined?d3.geo.mercator():self._projection;
        },
        set: function(projection) {
            self._projection = projection;
        }
    });
////singular functions

// .addLayers([{layer}])

// .getLayers()

// .removeLayers([{layer}])

// .refresh()
    return map;
};

//                                                                          マップ
