/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
    var layer = {};
    var map;
    layer.name = name;
    layer.id = null;//TODO: automatic ID gen
    layer.name = name;
    var opacity = 1;
    var  visible = true;  
    this._display = 'block';
    
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    var addTo = function(map){
        map = map;
        self.drawboard = map.svg.append('g');
        return layer;
    };
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return opacity;
        },
        set: function(val) {
            opacity = val;
            layer.refresh();
        }
    });
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return visible;
        },
        set: function(val) {
            if (val){
                this._display = 'block';
            }
            else {
                this._display = 'none';
            }
            visible = val;
            layer.refresh();
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;

    /* private: */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        map = map;
        drawboard = map.svg.append('g');
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    };
    
    return layer;
};
