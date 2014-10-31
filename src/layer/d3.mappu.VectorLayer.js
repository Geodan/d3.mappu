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
      var _data = [];
	  var drawboard;
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
            _data = array;
            draw(true);
        }
      });
      
      var draw = function(rebuild){
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data);
          
          var newpaths = entities.enter().append('path').attr("d", self.map.path)
            .classed('entity',true).classed(name, true);
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newpaths.on(d.event, d.action);
              });
          }
          layer.refresh();
      };
      
      var refresh = function(){
          var zoombehaviour = self.map.zoombehaviour;
          layer.drawboard.style('opacity', this.opacity).style('display',this._display);
          if (config.reproject){
              var entities = drawboard.selectAll('.entity');
              entities.attr("d", mypath);
          }
          else {
          layer.drawboard
            .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
            .style("stroke-width", 1 / zoombehaviour.scale());
          }
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  