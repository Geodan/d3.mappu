  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {

      
      
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      this._layertype = 'vector';
      var _data = [];
      /* exposed */
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data===undefined?[]:_data;
        },
        set: function(array) {
            _data = array;
            this._draw();
        }
      });
      
      layer.zoomTo = function(){
      };
      
      
      
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  