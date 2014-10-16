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
    Object.defineProperty(map, 'minZoom', {
        get: function() {
            return this._minZoom===undefined?0:this._minZoom;
        },
        set: function(minZoom) {
            this._minZoom = minZoom;
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        get: function() {
            return this._maxZoom===undefined?13:this._maxZoom;
        },
        set: function(maxZoom) {
            this._maxZoom = maxZoom;
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        get: function() {
            return this._maxView===undefined?[[-180,90],[180,-90]]:this._maxView;
        },
        set: function(maxView) {
            this._maxView = maxView;
        }
    });
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        get: function() {
            return this._center===undefined?[0,0]:this._center;
        },
        set: function(center) {
            this._center = center;
        }
    });
// .projection : ({projection})
    Object.defineProperty(map, 'projection', {
        get: function() {
            return this._projection===undefined?d3.geo.mercator():this._projection;
        },
        set: function(projection) {
            this._projection = projection;
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
