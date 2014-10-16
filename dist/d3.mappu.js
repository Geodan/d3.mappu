d3.mappu = d3.mappu || {};
d3.mappu.util = {};

//create a uniqueID for layers etc.
var _ctr = 0;   
d3.mappu.util.createID = function(){
    var id = "ッ-"+_ctr;
    _ctr++;
    return id;
};

//                                                                          マップ
;d3.mappu = d3.mappu || {};
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
;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
    var layer = {};
    this.config = config;
    layer.name = name;
    layer.id = null;//TODO: automatic ID gen
    layer.name = name;
    layer.opacity = 1;
    layer.visible = true;  
  
    /* exposed: */
    layer.refresh =  function(){
    };
    layer.moveUp = function(){
    };
    layer.moveDown = function(){
    };

    /* private: */
    this._onAdd =  function(map){ //Adds the layer to the given map object
    };
    this._onRemove = function(){ //Removes the layer from the map object
    };
    this._draw = function(){
    };
    
    return layer;
};
;  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      this._layertype = 'vector';
      return d3_mappu_Layer(name, config);
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  