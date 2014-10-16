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
    this.elem = elem;
    this.config = config;
    
    

// exposed functions

////getter/setter functions

// .zoom : (zoomlevel)
    Object.defineProperty(map, 'zoom', {
        get: function() {
            return this._zoom===undefined?0:this._zoom;
        },
        set: function(zoom) {
            this._zoom = zoom;
        }
    });

// .minZoom : (zoomlevel)
  /*  Object.defineProperty(map, 'minZoom', {
        value: 0,
        get: function() {
            return this.minZoom;
        },
        set: function(minZoom) {
            this.minZoom = minZoom;
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        value: 13,
        get: function() {
            return this.maxZoom;
        },
        set: function(maxZoom) {
            this.maxZoom = maxZoom;
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        value: [[-180,90],[180,-90]],
        get: function() {
            return this.maxView;
        },
        set: function(maxView) {
            this.maxView = maxView;
        }
    });
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        value: [0,0],
        get: function() {
            return this.center;
        },
        set: function(center) {
            this.center = center;
        }
    });*/
// .projection : ({projection})

////singular functions

// .addLayers([{layer}])

// .getLayers()

// .removeLayers([{layer}])

// .refresh()
    return map;
};

//                                                                          マップ
