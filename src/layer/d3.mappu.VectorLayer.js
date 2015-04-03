  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];                         
	  layer.zindex = 100; //vectors always on top
	  var _duration = config.duration || 0;
	  var path;
	  var style = config.style || {};
	  var _events = config.events;   
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
            _data = array;
            draw(false);
        }
      });
      
      Object.defineProperty(layer, 'events', {
        get: function() {
            return _events;
        },
        set: function(array) {
            _events = array;
        }
      });
      
      
      
      //Function taken from terraformer
      function ringIsClockwise(ringToTest) {
		var total = 0,i = 0;
		var rLength = ringToTest.length;
		var pt1 = ringToTest[i];
		var pt2;
		for (i; i < rLength - 1; i++) {
		  pt2 = ringToTest[i + 1];
		  total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
		  pt1 = pt2;
		}
		return (total >= 0);
	  }
      
      function setStyle(d){
      	  var entity = d3.select(this);
      	  //Do generic layer style
      	  if (style){
      	  	  for (var key in style) { 
      	  	  	  entity.select('path').style(key, style[key]);
      	  	  }
      	  }
      	  
      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) { 
      	  	  	  entity.select('path').style(key, d.style[key]);
      	  	  }
      	  }
      	  if (d._selected){
      	  	  //make halo around entity to show as selected
      	  	  entity
      	  	  	.append('path').attr("d", _path)
      	  	  	.style('stroke', 'none')
      	  	  	.style('fill', 'red')
      	  	  	.classed('halo', true);
      	  }
      	  else {
      	  	  entity.selectAll('.halo').remove();
      	  }
      }
      
      function build(d){
      	  var project = layer.map.projection;
      	  if (d.geometry.type == 'Point' && d.style && d.style['marker-url']){
      	  	  var x = project(d.geometry.coordinates)[0];
              var y = project(d.geometry.coordinates)[1];
              var img = d3.select(this).append("image")
              	.attr("width", 32)
                .attr("height", 37)
              	.attr("x",x-12.5)
				.attr("y",y-25)
				.attr("xlink:href", function(d){
					return d.style['marker-url'];
				});
      	  }
      	  else {
			  if (d.geometry.type == 'Polygon' && !ringIsClockwise(d.geometry.coordinates[0])){
				  d.geometry.coordinates[0].reverse(); 
			  }
			  d3.select(this).append('path').attr("d", _path)
				.classed(name, true);
		  }
		  d3.select(this).append('text');
          
      }
      
      var draw = function(rebuild){
		  _path = d3.geo.path()
			.projection(layer.map.projection)
			.pointRadius(function(d) {
				if (d.style && d.style.radius){
					return d.style.radius;
				}
				else {
					return 4.5;
				}
			});
      	  
      	  
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data, function(d){
          	return d.id;
          });
          
          var newentity = entities.enter().append('g')
          	.classed('entity',true)
          	.attr('id',function(d){
                    return 'entity'+ d.id;
            });
          newentity.each(build);
          newentity.each(setStyle);
            
          entities.exit().remove();
          
          // Add events from config
          if (_events){
              _events.forEach(function(d){
                 newentity.select('path').on(d.event, d.action);
                 newentity.select('image').on(d.event, d.action);
              });
          }
          layer.refresh(rebuild?0:_duration);
      };
      
      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
          	  var entities = drawboard.selectAll('.entity');
			  if (config.reproject){
			  	  var project = layer.map.projection;
				  entities.select('path').transition().duration(duration).attr("d", _path);
				  entities.select('image').transition().duration(duration)
				  	.attr('x',function(d){return project(d.geometry.coordinates)[0];})
				  	.attr('y',function(d){return project(d.geometry.coordinates)[1];});
				  if (config.labelfield){
				  	  entities.each(function(d){
				  	    var loc = _path.centroid(d);
				  	    var text = d.properties[config.labelfield];
				  	    d3.select(this).select('text').attr('x',loc[0]).attr('y', loc[1])
				  	    	.classed('vectorLabel',true)
				  	    	.attr('text-anchor',"middle")
				  	    	.text(text);
				  	  });
				  }
				  entities.each(setStyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };
      
      var addFeature = function(feature){
      	  var replaced = false;
      	  _data.forEach(function(d){
			  if (d.id == feature.id){
				  d = feature;
				  layer.draw();
				  replaced = true;
				  return;
			  }
      	  });
      	  if (!replaced){
      	  	  _data.push(feature);
      	  }
      	  layer.draw(true);
      };
      
      var removeFeature = function(feature){
      	  var idx = null;
      	  _data.forEach(function(d,i){
			  if (d.id == feature.id){
				  idx = i;
			  }
      	  });
      	  _data.splice(idx,1);
      	  layer.draw();
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      layer.addFeature = addFeature;
      layer.removeFeature = removeFeature;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  