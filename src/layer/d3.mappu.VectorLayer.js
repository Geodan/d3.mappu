  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
	  var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      this._layertype = 'vector';
	  this.path = d3.geo.path()
					.projection(map.projection);
      var _data = [];
	  this.drawboard = map.svg.append('path');
	  
      /* exposed */
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data===undefined?[]:_data;
        },
        set: function(array) {
            _data = array;
            this.draw();
        }
      });
      
      layer.draw = function(){
          self.drawboard
            .datum(layer.data)
            .attr("d", self.path);
      };
      
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  