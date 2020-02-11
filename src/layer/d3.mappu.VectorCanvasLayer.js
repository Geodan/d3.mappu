  /**

  **/
  d3.mappu.VectorCanvasLayer = function(name, config){
      return d3_mappu_VectorCanvasLayer(name, config);
  };

  d3_mappu_VectorCanvasLayer = function(name, config) {
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
      layer.type = 'canvas';
      var _data = [];
	  layer.zindex = 100; //vectors always on top
	  var _duration = config.duration || 0;
	  var _path;
	  var _projection;
	  var _style = config.style || {};
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

      Object.defineProperty(layer, 'style', {
        get: function() {
            return _style;
        },
        set: function(val) {
            _style = val;
         	layer.drawboard.selectAll('.tile').remove();
            layer.refresh(0);
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
      	  	  	  entity.select('circle').style(key, style[key]);
      	  	  }
      	  }

      	  //Now use per-feature styling
      	  if (d.style){
      	  	  for (var key in d.style) {
      	  	  	  entity.select('path').style(key, d.style[key]);
      	  	  	  entity.select('circle').style(key, d.style[key]);
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
      	  	if (d.geometry.type == 'Polygon' && !ringIsClockwise(d.geometry.coordinates[0])){
      	  		d.geometry.coordinates[0].reverse();
			}
			var project = _projection;
			_projection = d3.geoMercator();
			_path = d3.geoPath().projection(_projection);
			var canvas = layer.drawboard;
			var context = canvas.node().getContext("2d");
			_path.context(context);
			context.save();
			context.beginPath();
			_path(d);
			context.fillStyle = typeof(_style.fill)=='function'?_style.fill(d.properties[_style.column]):_style.fill;
			context.fill();
			context.closePath();
			context.lineWidth   = 1;
			context.restore();
	  }
	  
	  

      var draw = function(rebuild){
      	  if (config.reproject){
				_projection = layer.map.projection;
				_path = d3.geoPath()
					.projection(_projection)
		  }
		  else {
		  	  //TODO: this should be depending on the projection given ins the config, no?
				_projection = d3.geoMercator()
					.scale(1 / 2 / Math.PI)
					.translate([0, 0]);
				_path = d3.geoPath()
					.projection(_projection);
		  }
          var drawboard = layer.drawboard;
          if (rebuild){
               //drawboard.selectAll('.entity').remove();
          }
          _data.forEach(build);
      };

      function refresh() {
      	  var canvas = layer.drawboard;
		  canvas.save();
		  canvas.clearRect(0, 0, width, height);
		  canvas.translate(d3.event.translate[0], d3.event.translate[1]);
		  canvas.scale(d3.event.scale, d3.event.scale);
		  draw();
		  canvas.restore();
	  }
      
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };

  d3_mappu_VectorCanvasLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          マップ
