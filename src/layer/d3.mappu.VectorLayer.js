  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
	  var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'vector';
	  var path = d3.geo.path()
					.projection(map.projection);
     
	  var drawboard = map.svg.append('g');
	  
      /* exposed */
      Object.defineProperty(layer, 'data', {
        get: function() {
            return self._data===undefined?[]:self._data;
        },
        set: function(array) {
            self._data = array;
            this.draw();
        }
      });
      
      layer.draw = function(){
          myprojection
            .scale(myzoom.scale() / 2 / Math.PI)
            .translate(myzoom.translate());
          var entities = drawboard.selectAll('.entity').data(layer.data);
          var newpaths = entities.enter().append('path').attr("d", path)
            .classed('entity',true).classed(name, true);
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newpaths.on(d.event, d.action);
              });
          }
      };
      
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  