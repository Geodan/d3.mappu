d3.mappu = d3.mappu || {};
d3.mappu.util = {};

//create a uniqueID for layers etc.
var _ctr = 0;   
d3.mappu.util.createID = function(){
    var id = "ッ-"+_ctr;
    _ctr++;
    return id;
};

//                                                                          マップ
;d3.mappu = d3.mappu || {};
/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
/* d3.mappu.Map(element, config)

element = dom object
options: 
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0.0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0.0
maxZoom: zoomlevel                  default = 13.0
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
*/


d3.mappu.Map = function(id, config) {
    return d3_mappu_Map(id, config);
};

d3_mappu_Map = function(id, config) {
    
    var map = {};
	var _layers = [];
	var _mapdiv;
	var _duration = 0;
	map._duration = _duration;
	//check if elem is a dom-element or an identifier
	if (typeof(id) == 'object'){
	    _mapdiv = id;
	}
	else {
	    _mapdiv = document.getElementById(id);
	}
	
	//TODO: how to get the size of the map
	var _width = _mapdiv.clientWidth || 2024;
	var _height = _mapdiv.clientHeight || window.innerHeight || 768;
	var _ratio = 1;
	
	var _canvasdiv = d3.select(_mapdiv)
		.style("width", _width + 'px')
		.style("height", _height + 'px')
	  .append("div")
		.style("transform", "scale(" + 1 / _ratio + ")")
		.style("transform-origin", "0 0 0");
		
	var _svg = d3.select(_mapdiv).append('svg')
	    .style('position', 'absolute')
		.attr("width", _width)
		.attr("height", _height);
	
	var _center = config.center || [0,0];
	var _projection = config.projection || d3.geo.mercator();
	var _zoom = config.zoom || 22;
	var _maxZoom = config.maxZoom || 24;
	var _minZoom = config.minZoom || 15;
	var _maxView = config.maxView || [[-180,90],[180,-90]];
	

    var redraw = function(){
        //Calculate tile set
        _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();
        //Calculate projection, so we can find out coordinates
        _projection
           .scale(_zoombehaviour.scale() / 2 / Math.PI)
           .translate(_zoombehaviour.translate());

        /* EXPERIMENTAL */
        //layer.call(raster);

        _layers.forEach(function(d){
            d.refresh();
        });
        
        map._duration = 0;
    };
    
    //var p = .5 * _ratio;
	_projection.scale(( _zoom << 12 || 1 << 12) / 2 / Math.PI)
        .translate([_width / 2, _height / 2]);
	    //.center(_center)
        //.clipExtent([[p, p], [_width - p, _height - p]]);
     
    var _projcenter = _projection(_center);     
    
    //TODO: reset this on projection change
    var _path = d3.geo.path()
        .projection(_projection);    
        
	var _zoombehaviour = d3.behavior.zoom()
	    .scale(_projection.scale() * 2 * Math.PI)
        .scaleExtent([1 << _minZoom, 1 << _maxZoom])
        .translate([_width - _projcenter[0], _height - _projcenter[1]])
        .on("zoom", redraw);
	d3.select(_mapdiv).call(_zoombehaviour);
	
    _projection
        .scale(1 / 2 / Math.PI)
        .translate([0, 0]);
    
    var _tile = d3.geo.tile()
        .size([_width,_height]);

    var _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();
    /*
    var raster = d3.geo.raster(_projection)
        .scaleExtent([0, 10])
        //.url("//{subdomain}.tiles.mapbox.com/v3/mapbox.natural-earth-2/{z}/{x}/{y}.png");
        .url("//{subdomain}.tiles.mapbox.com/v3/examples.map-i86nkdio/{z}/{x}/{y}.png");
    
    var layer = _canvasdiv
      .append("div")
        .style("transform-origin", "0 0 0")
        .call(raster);
   */
// exposed functions

////getter/setter functions
	 Object.defineProperty(map, 'svg', {
        get: function() {
            return _svg;
        },
        set: function() {
            console.log("do not touch the svg");
        }
    });
    
    Object.defineProperty(map, 'size', {
            get: function(){return [_height, _width];},
            set: function(val){
                _height = val[0];
                _width = val[1];
                _tile = d3.geo.tile()
                    .size([_width,_height]);
                d3.select(_mapdiv).select('svg')
                    .attr("width", _width)
                    .attr("height", _height);
                map.redraw();
            }
    });
     
    Object.defineProperty(map, 'mapdiv', {
        get: function() {
            return _mapdiv;
        },
        set: function() {
            console.log("do not touch the mapdiv");
        }
    });
    
    Object.defineProperty(map, 'canvasdiv', {
        get: function() {
            return _canvasdiv;
        },
        set: function() {
            console.log("do not touch the canvasdiv");
        }
    }); 
    
    function zoomcenter(){
    	_zoombehaviour.scale((1 << _zoom) / 2 / Math.PI);
    	//Adapt projection based on new zoomlevel
		_projection
		   .scale(_zoombehaviour.scale() / 2 / Math.PI)
		   .translate(_zoombehaviour.translate());
		   
	   //recenter map based on new zoomlevel
		var pixcenter = _projection(_center);
		var curtranslate = _zoombehaviour.translate();
		var translate = [
			curtranslate[0] + (_width - pixcenter[0]) - (_width/2), 
			curtranslate[1] + (_height - pixcenter[1]) - (_height/2)
		];
		_zoombehaviour
			.translate(translate);
		//TODO: calculate duration based on distance to be moved
		map._duration = 2000;
		map.redraw();
    }
    
// .zoom : (zoomlevel)
    Object.defineProperty(map, 'zoom', {
        get: function() {
            return _zoom;
        },
        set: function(val) {
        	if (val <= _maxZoom && val >= _minZoom){
				_zoom = val;
				zoomcenter();
			}
			else {
				console.log('Zoomlevel exceeded', _minZoom , _maxZoom);
			}
        }
    });

// .minZoom : (zoomlevel)
    Object.defineProperty(map, 'minZoom', {
        get: function() {
            return _minZoom;
        },
        set: function(val) {
            _minZoom = val;
            this.zoombehaviour.scaleExtent([1 << _minZoom, 1 << _maxZoom]);
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        get: function() {
            return _maxZoom;
        },
        set: function(val) {
            _maxZoom = val;
            this.zoombehaviour.scaleExtent([1 << _minZoom, 1 << _maxZoom]);
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        get: function() {
            return _maxView;
        },
        set: function(val) {
            _maxView = val;
        }
    });
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        get: function() {
            var pixcenter = [_width/2,_height/2];
            return _projection.invert(pixcenter);
        },
        set: function(val) {
        	_center = val;
			zoomcenter();
        }
    });
// .projection : ({projection})
    Object.defineProperty(map, 'projection', {
        get: function() {
            return _projection;
        },
        set: function(obj) {
          _projection = obj;
          _path = d3.geo.path()
            .projection(_projection);
          //TODO: redraw
        }
    });
    
    Object.defineProperty(map, 'path', {
            get: function(){return _path;},
            set: function(){console.warn('No setting allowed for path');}
    });
    
    Object.defineProperty(map, 'tiles', {
            get: function(){return _tiles;},
            set: function(){console.warn('No setting allowed for tile');}
    });
    
    Object.defineProperty(map, 'zoombehaviour', {
            get: function(){return _zoombehaviour;},
            set: function(){console.warn('No setting allowed for zoombehaviour');}
    });
    
    Object.defineProperty(map, 'layers', {
            get: function(){return _layers;},
            set: function(){console.warn('No setting allowed for layers');}
    });
    
	
////singular functions

    var addLayer = function(layer){
        if (!layer.id){
            console.warn('Not a valid layer. (No ID)');
            return false;
        }
        //Replace existing ID
        _layers.forEach(function(d){
            if (d.id == layer.id){
                d = layer; //TODO: can you replace an array item like this?
                return map;
            }
        });
        _layers.push(layer);
        layer._onAdd(map);
        return map;
    };
    var removeLayer = function(id){
        _layers.forEach(function(d,i){
            if (d.id == id){
                // ?? d.onRemove(self);
                _layers.splice(i,1);
                return map;
            }
        });
        return map;
    };   

// .removeLayers([{layer}])

// .refresh()
    
    
    map.addLayer = addLayer;
    map.removeLayer = removeLayer;
    map.redraw = redraw;
    
    return map;
};

//                                                                          マップ
;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
    var layer = {};
    var _map;
    var _id = d3.mappu.util.createID();
    var _name = name;
    //TODO: parse config
    var _opacity = 1;
	var _visible = true;  
	var _display = 'block';
	
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    /*SMO: what does this do?*/
    var addTo = function(map){
        _map = map;
        layer.drawboard = _map.svg.append('g');
        _map.addLayer(layer);
        layer.draw();
        return layer;
    };
    
    Object.defineProperty(layer, 'id', {
        get: function() {return _id;},
        set: function() {console.warn('setting ID not allowed for layer');}
    });
    
    Object.defineProperty(layer, 'name', {
        get: function() {
            return _name;
        },
        set: function(val) {
            _name = val;
        }
    });
    
    Object.defineProperty(layer, 'map', {
        get: function() {
            return _map;
        },
        set: function(val) {
            _map = val;
        }
    });
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return _opacity;
        },
        set: function(val) {
            _opacity = val;
            layer.refresh();
        }
    });
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return _visible;
        },
        set: function(val) {
            _visible = val;
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
        _map = map;
        layer.drawboard = _map.svg.append('g');
        layer.draw();
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    };
    
    return layer;
};
//                                                                          マップ
;  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'vector';
      var _data = [];                         
	  var drawboard;
	  var _duration = 0;
	  
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
      
      function addstyle(d){
      	  var entity = d3.select(this);
      	  if (d.style){
      	  	  for (var key in d.style) { //First check for generic layer style
      	  	  	  entity.style(key, d.style[key]);
      	  	  }
      	  }
      }
      
      var draw = function(rebuild){
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data);
          
          var newpaths = entities.enter().append('path').attr("d", layer.map.path)
            .classed('entity',true).classed(name, true)
            .style('stroke', 'blue')
            .each(addstyle);
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newpaths.on(d.event, d.action);
              });
          }
          layer.refresh();
      };
      
      var refresh = function(){
          var drawboard = layer.drawboard;
          drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
          if (config.reproject){
              var entities = drawboard.selectAll('.entity');
              entities.transition().duration(layer.map._duration).attr("d", layer.map.path).each(addstyle);
          }
          else {
          	//based on: http://bl.ocks.org/mbostock/5914438
          	var zoombehaviour = layer.map.zoombehaviour;
          	drawboard.transition().duration(layer.map._duration)
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
  
  //                                                                          マップ
  ;  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'raster';
      var drawboard;
      var _url = config.url;
      var _ogc_type = config.ogc_type || 'tms';
      var _layers = config.layers;
      var _duration = 0;
      
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
          if (_ogc_type == 'tms') {
              url = _url    
                    .replace('{s}',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('{z}',d[2])
                    .replace('{x}',d[0])
                    .replace('{y}',d[1])
                    //FIXME: why are these curly brackets killed when used with polymer?                    
                    .replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('%7Bz%7D',d[2])
                    .replace('%7Bx%7D',d[0])
                    .replace('%7By%7D',d[1]);
          }
          else if (_ogc_type == 'wms'){
                //This calculation only works for tiles that are square and always the same size
                var bbox = getbbox(d);
                url =  _url + 
                     "&bbox=" + bbox + 
                     "&layers=" + _layers + 
                     "&service=WMS&version=1.1.0&request=GetMap&tiled=true&styles=&width=256&height=256&srs=EPSG:3857&transparent=TRUE&format=image%2Fpng";
          }
          return url;
      };
      
      var getFeatureInfo = function(d){
          return; /* WORK IN PROGRESS */
          if (_ogc_type == 'wms'){
            var loc = d3.mouse(this);
            var loc2 = d3.mouse(map.mapdiv);
            //http://pico.geodan.nl/geoserver/pico/wms?
            //REQUEST=GetFeatureInfo
            //&EXCEPTIONS=application%2Fvnd.ogc.se_xml
            //&BBOX=144587.40296%2C458169.888794%2C146661.115594%2C460572.017456
            //&SERVICE=WMS&INFO_FORMAT=text%2Fhtml&QUERY_LAYERS=pico%3Apc6_energieverbruik_alliander&FEATURE_COUNT=50&Layers=pico%3Apc6_energieverbruik_alliander
            //&WIDTH=442&HEIGHT=512&format=image%2Fpng&styles=&srs=EPSG%3A28992&version=1.1.1&x=243&y=190
            //TODO: make this more flexible
            var url = _url +
                "&SRS=EPSG:900913" + 
                "&QUERY_LAYERS=" + _layers +
                "&LAYERS=" + _layers + 
                "&INFO_FORMAT=application/json" + 
                "&REQUEST=GetFeatureInfo" + 
                "&FEATURE_COUNT=50" + 
                "&EXCEPTIONS=application/vnd.ogc.se_xml" + 
                "&SERVICE=WMS" + 
                "&VERSION=1.1.0" + 
                "&WIDTH=256&HEIGHT=256" + 
                "&X="+ Math.round(loc[0]) + 
                "&Y="+ Math.round(loc[1]) + 
                "&BBOX=" + getbbox(d);
            d3.json(url, function(error,response){
                var feat = response.features[0];
                //TODO: check if there is a response
                //TODO: show more than 1 response
                d3.select('#map').append('div').classed('popover', true)
                    .style('left', loc2[0]+'px')
                    .style('top', loc2[1]+'px')
                    .html(feat.id); 
            });
            
          }
      };
      
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         drawboard.transition().duration(layer.map._duration).attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")");
         var image = drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", tileurl)
              .attr("width", 1)
              .attr("height", 1)
              .attr('opacity', this.opacity)
              .attr("x", function(d) { return d[0]; })
              .attr("y", function(d) { return d[1]; })
              .on('click', getFeatureInfo);
         image.exit().remove();
      };
      
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
      };
      
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  ;"use strict";
d3.mappu.Controllers = function(map) {
    return d3_mappu_Controllers(map);
};

d3_mappu_Controllers = function(map){
    var drag = d3.behavior.drag()
        .on('drag',function(e){
            console.log('Drag', d3.mouse(this));
        })
        .on('dragend',function(e,d){
            console.log('Dragend',d3.mouse(this)); 
        });
        
    map.svg.call(drag);
};;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Coordinates = function(config) {
    return d3_mappu_Coordinates(config);
};

d3_mappu_Coordinates = function(config){
    var tool = {};
    
    tool.addTo = function(map){
        var coordsdiv = d3.select(map.mapdiv).append('div').classed('coordinates',true);

        map.svg.on('mousemove', function(e){
            var loc = d3.mouse(this);
            var crds = map.projection.invert(loc);
            coordsdiv.html('lat: ' + Math.round(crds[0] * 100) / 100 + '| lon: ' + Math.round(crds[1] * 100) / 100);
        });
    };
    return tool;
};