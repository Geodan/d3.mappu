/**
 Generic layer object, to be extended.
**/
(function(){
  "use strict";
  
  d3.mappu.Layer = function(id, config){
      this.id = id;
      this.config = config;
  };
  
  Object.defineProperty(d3.mappu.Layer, 'id', {
    value: null,
    get: function() {
        return this.id;
    },
    set: function() {
        console.warn('can\'t set id afterwards');
        //not settable
    }
  });
  
  
  Object.defineProperty(d3.mappu.Layer, 'data', {
    value: [],
    get: function() {
        return this.data;
    },
    set: function(data) {
        this.data = data;
        //redraw
    }
  });
  
  Object.defineProperty(d3.mappu.Layer, 'opacity', {
    value: 1,
    get: function() {
        return this.opacity;
    },
    set: function(data) {
        this.opacity = opacity;
        //redraw
    }
  });
  
  Object.defineProperty(d3.mappu.Layer, 'visible', {
    value: true,
    get: function() {
        return this.visible;
    },
    set: function(data) {
        this.visible = visible;
        //redraw
    }
  });
  
  
  
/*
    functions exposed:
*/

    //singulars
    d3.mappu.Layer.prototype.refresh = function(){
    }
   

/*    
functions private:
*/
    d3.mappu.Layer.prototype._onAdd = function(map){ //Adds the layer to the given map object
    }
    d3.mappu.Layer.prototype._onRemove = function(){ //Removes the layer from the map object
    }
    d3.mappu.Layer.prototype._draw = function(){
    }
    

});