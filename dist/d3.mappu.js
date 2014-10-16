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
;/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
/* d3.mappu.Map(element, options)

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

//import "../d3.mappu";
 
// exposed functions

////getter/setter functions

// .zoom : (zoomlevel)

// .minZoom : (zoomlevel)

// .maxZoom : (zoomlevel)

// .maxView : ([[long,lat],[long,lat]])

// .center : ([long,lat])

// .projection : ({projection})

////singular functions

// .addLayers([{layer}])

// .getLayers()

// .removeLayers([{layer}])

// .refresh()

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
