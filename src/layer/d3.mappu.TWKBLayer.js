  /**

  **/
  d3.mappu.TWKBLayer = function(name, config){
      return d3_mappu_TWKBLayer(name, config);
  };

  d3_mappu_TWKBLayer = function(name, config) {
      var self = this;
      config = config || {};
      //d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'raster';
      var _url = config.url;
      var _options = config; //Te be leaflet compatible in g-layercatalogus
      layer.options = _options;
      layer.visibility = layer.visible; //leaflet compat
      var _layers = config.layers;
      var _classproperty = config.classproperty;
      var _id_column = config.id_column;
      var _geom_column = config.geom_column;
      var _srid = config.srid;
      var _attributes = config.attributes;
      var _style = config.style;
      var _duration = config.duration || 0;
			var _path;
			var _projection;
			var style = config.style || {};
			var _xhrqueue = [];
			
      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });

      Object.defineProperty(layer, 'layers', {
        get: function() {
            return _layers;
        },
        set: function(val) {
            _layers = val;
            draw();
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
    

      //Clear all tiles
      layer.clear = function(){
      };

      var getbbox = function(d){
        var numtiles = 2 << (d[2]-1);
        var tilesize = (20037508.34 * 2) / (numtiles);
        var x = -20037508.34 + (d[0] * tilesize);
        var y = 20037508.34 - ((d[1]+1) * tilesize);//shift 1 down, because we want LOWER left
        var bbox = x + ","+ y + "," + (x + tilesize) + "," + (y + tilesize);
        return bbox;
      };

      var tileurl = function(d){
          var url;
         	if (_url.indexOf('?') < 0){
          		_url+='?';
          	}
						//This calculation only works for tiles that are square and always the same size
						var bbox = getbbox(d);
						url =  _url +
							 "&request=getData" +
							 "&bbox=" + bbox +
							 "&table=" + _layers +
							 "&id_column=" + _id_column +
							 "&geom_column=" + _geom_column +
							 "&srid=" + _srid +
							 "&attributes=" + _attributes +
							 "&srs=EPSG:3857";
          return url;
      };

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
			var renders = [];
			renders.push(new Worker("twkb_processor.js"));
			
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			//renders.push(new Worker("twkb_processor.js"));
			renders.forEach(function(renderer){
				renderer.onmessage = function (e) {
					if (e.data.layerid == layer.id){
						var data = e.data.data;
						var d = e.data.d;
						build(d,data);
					}
				}
			});
      //each tile can be considered it's own drawboard, on which we build
      function build(d,data){
				var counter = 0;
				var tile = d3.select('#T'+layer.id+'_'+d[0]+'_'+d[1]+'_'+d[2]);
				if (tile[0][0]){
					_projection = d3.geo.mercator();
					_path = d3.geo.path().projection(_projection);
					var tiles = layer.map.tiles;
					var k = Math.pow(2, d[2]) * 256; // size of the world in pixels
					
					_path.projection()
							.translate([k / 2 - d[0] *256, k / 2 - d[1] *256]) // [0°,0°] in pixels
							.scale(k / 2 / Math.PI);
					
					var canvas = tile.append("canvas")
						.attr("width", 256)
						.attr("height", 256);
					
					var context = canvas.node().getContext("2d");
					_path.context(context);
					context.save();
					
					data.forEach(function(d){
							context.beginPath();
							_path(d);
							//context.strokeStyle = typeof(_style.stroke)=='function'?_style.stroke(d.properties[_style.column]):_style.stroke;
							context.fillStyle = typeof(_style.fill)=='function'?_style.fill(d.properties[_style.column]):_style.fill;
							//context.stroke();
							context.fill();
							context.closePath();
					});
					context.lineWidth   = 1;
					context.restore();
				}
      }
      function matrix3d(scale, translate) {
				var k = scale / 256, r = scale % 1 ? Number : Math.round;
				return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
			}
			
      //Draw the tiles (based on data-update)
      var draw = function(){
      	//Wait for cache to be settled
      	Promise.all(d3.mappu.Cache.runningtasks).then(function(){
      		 var rand = 0;
					 var drawboard = layer.drawboard;
					 var tiles = layer.map.tiles;
					 _xhrqueue = [];
					 var image = drawboard
							.style("transform", matrix3d(tiles.scale, tiles.translate))
							.selectAll(".tile")
							.data(tiles, function(d) { 
								return d; 
							});
	
					 var imageEnter = image.enter();
					 if (layer.visible){
					 	 var tile = imageEnter.append("div")
								.classed("tile",true)
								.attr('id',function(d){
										return 'T'+layer.id+'_'+d[0]+'_'+d[1]+'_'+d[2];
								})
								//.style('border','1px solid black')
								.style('position','absolute')
								.style('width','256px')
								.style('height','256px')
								.style("left", function(d) { return (d[0] << 8) + "px"; })
								.style("top", function(d) { return (d[1] << 8) + "px"; })
						
						//Delegate the xhr and twkb work to a webworker
						tile.each(function(d){
								var url = tileurl(d);
								//var rand = Math.round(Math.random() * 3);
								//rand>2?rand=0:rand++;
								renders[0].postMessage({layerid: layer.id, url: url,tile:d,attributes: _attributes });
						});
						//tile.each(setStyle);
					 }
					 image.exit()
						.each(function(d){
								//d3.select(this)[0][0].xhr.abort();//yuck
						})
						.remove();
				});
      };

      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };

      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };

  d3_mappu_TWKBLayer.prototype = Object.create(d3_mappu_Layer.prototype);

  //                                                                          ãƒžãƒƒãƒ—
