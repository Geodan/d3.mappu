  /**

  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };

  d3_mappu_VectorLayer = function(name, config) {
  	  /*Work in progress for webworker
  	  var builder = new Worker("../src/layer/builder.js");
  	  builder.onmessage = function(e) {
		  console.log('Message received from worker', e.data.aap);
	  };
	  var obj = {project:'noot'};
  	  builder.postMessage(obj);
  	  console.log('Message posted to worker');
  	  */
  	  config = config || {};
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];
	  layer.zindex = 100; //vectors always on top
	  var _duration = config.duration || 0;
	  var _path;
	  var _projection;
	  var style = config.style || {};
	  var labelStyle = config.labelStyle || {};
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
          var self = this;
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
      //Build is only called on entry
      function build(d){
      	  var project = _projection;

      	  if (d.geometry.type == 'Point' && d.style){
      	      var x = project(d.geometry.coordinates)[0];
              var y = project(d.geometry.coordinates)[1];
              var width = d.style && d.style.width ? d.style.width :
                           (style.width ? style.width : 32);
              var height = d.style && d.style.height ? d.style.height :
                           (style.height ? style.height : 37);
              var img = d3.select(this).append('g').append("image")
                .attr("width", width)
                .attr("height", height)
                //.attr("x",x-12.5) //No need setting x and y, since it's reset later
                //.attr("y",y-25)
                .style('pointer-events','visiblepainted')
                .attr("xlink:href", function(d){
                    if (d.style['iconimg']){
					    return 'data:image/' + d.style['iconimg_encoding'] +','+ d.style['iconimg_bytearray'];
                    }
                    else if (d.style['marker-url']){
    					return d.style['marker-url'];
                    };
				});
  	      }
      	  else {
			  if (d.geometry.type == 'Polygon' && !ringIsClockwise(d.geometry.coordinates[0])){
				  d.geometry.coordinates[0].reverse();
			  }
			  d3.select(this).append('path').attr("d", _path)
				.classed(name, true)
        .style('pointer-events','visiblepainted');//make clickable
		  }
		  d3.select(this).append('text')
		  	.classed('shadowtext',true)
		  	.attr('text-anchor',"middle");
		  d3.select(this).append('text')
		  	.classed('vectorLabel',true)
		  	.attr('text-anchor',"middle");

      }

      var draw = function(rebuild){
      	  if (config.reproject){
				_projection = layer.map.projection;
				_path = d3.geo.path()
					.projection(_projection)
					.pointRadius(function(d) {
						if (d.style && d.style.radius){
							return d.style.radius;
						}
						else {
							return 4.5;
						}
					});
		  }
		  else {
				_projection = d3.geo.mercator()
					.scale(1 / 2 / Math.PI)
					.translate([0, 0]);
				_path = d3.geo.path()
					.projection(_projection);
		  }
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.select('g').selectAll('.entity').data(_data, function(d){
          	return d.id;
          });

          var newentity = entities.enter().append('g')
          	.classed('entity',true)
          	.attr('id',function(d){
                    return 'entity'+ d.id;
            })

          newentity.each(build);
          newentity.each(setStyle);

          entities.exit().remove();

          // Add events from config
          if (_events){
              _events.forEach(function(d){
                 entities.each(function(){
                 	d3.select(this).select('path').on(d.event, d.action);
                 	d3.select(this).select('image').on(d.event, d.action);
                 });
              });
          }
          layer.refresh(rebuild?0:_duration);
      };

      var calcwidth = d3.scale.linear().range([20,20,32,32]).domain([0,21,24,30]);
      var calcheight = d3.scale.linear().range([20,20,37,37]).domain([0,21,24,30]);

      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.select('g').style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
          	  var entities = drawboard.select('g').selectAll('.entity');
			  if (config.reproject){//the slow way
			  	  var project = layer.map.projection;
				  entities.select('path').transition().duration(duration).attr("d", _path);
				  entities.select('image').transition().duration(duration).each(function(d){
                    //TODO: create something nice customizable for widh-height calculations
                    var width = d.style && d.style.width ? d.style.width :
                                 (style.width ? style.width : 32); //calcwidth(layer.map.zoom);
                    var height = d.style && d.style.height ? d.style.height :
                                 (style.height ? style.height : 37); //calcheight(layer.map.zoom);
				  	var x = project(d.geometry.coordinates)[0];
				  	var y = project(d.geometry.coordinates)[1];
				  	var offsetx = width/2;
				  	var offsety = height/2;
				  	d3.select(this).attr('x',x).attr('y',y)
				  		//Smaller markers when zooming out
				  		.attr("width", width)
				  		.attr("height", height);
				  	//Rotation has to be done seperately
					if (d.style && d.style.rotate){
						  //TODO: still experimental, rotate +90 should be fixed
						  d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+") rotate("+ d.style.rotate +" " + Math.round(x + offsetx) +"  "+  Math.round(y + offsety) +")");
						  //d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+")");
					  }
					  else {
					  	  d3.select(this.parentElement).attr("transform", "translate("+ -offsetx+" "+ -offsety+")");
					  }
				  });


				  if (config.labelfield){
				  	  //TODO: add option to only show layer from certain zoomlevel
					  entities.each(function(d){
						var loc = _path.centroid(d);
						var text = d.properties[config.labelfield];
						d3.select(this).selectAll('text')
							.attr('x',loc[0])
							.attr('y', loc[1] -20)
							.text(text);

                        //Add shadow text for halo
                        d3.select(this).select('.shadowtext')
                                .style('stroke-width','2.5px')
                                .style('stroke','white')
                                .style('opacity', 0.8);

						//Style text
                        if (labelStyle){
    						for (var key in labelStyle) {
    							d3.select(this).selectAll('.vectorLabel').style(key, labelStyle[key]);
                                //shadowtext only sensitive to the opacity style
                                if (key == 'opacity'){
                                    d3.select(this).select('.shadowtext').style('opacity', labelStyle[key]);
                                }
    						}
                        }

					  });
				  }
				  entities.each(setStyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard.select('g')
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };

      var addFeature = function(feature){
      	  //var replaced = false;
		  //Testing with d3.map to make it faster
      	  var _datamap = d3.map(_data, function(d) { return d.id; });
      	  _datamap.set(feature.id, feature);
      	  _data = _datamap.values();
      	  //TODO: this is an expensive iteration when the amount of data increases
      	  //Make it cheaper.
      	  /*
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
      	  }*/
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

      var zoomToFeature = function(feature){
      	  var loc = _projection.invert(_path.centroid(feature));
      	  layer.map.center = loc;
          layer.map.redraw();
      }

      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      layer.addFeature = addFeature;
      layer.removeFeature = removeFeature;
      layer.zoomToFeature = zoomToFeature;
      return layer;
  };

  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          マップ
