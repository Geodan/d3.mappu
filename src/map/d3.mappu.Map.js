d3.mappu = d3.mappu || {};
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
	
	window.onresize = function(){
		//TODO: redraw the map with new extents
		console.log('Map resize detected');
		resize();
	};
	
	//TODO: how to get the size of the map
	var _width = _mapdiv.clientWidth || 2024;
	var _height = _mapdiv.clientHeight || window.innerHeight || 768;
	var _ratio = 1;
	
	/* Experimental
	var _canvasdiv = d3.select(_mapdiv)
		.style("width", _width + 'px')
		.style("height", _height + 'px')
	  .append("div")
		.style("transform", "scale(" + 1 / _ratio + ")")
		.style("transform-origin", "0 0 0");
	*/
	
	
	
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
    
    var resize = function(){
		_width = _mapdiv.clientWidth;
		_height = _mapdiv.clientHeight;
		d3.select(_mapdiv).select('svg')
			.attr("width", _width)
			.attr("height", _height);
		_projection.translate([_width / 2, _height / 2]);
		_zoombehaviour.translate([_width - _projcenter[0], _height - _projcenter[1]]);
		_tile.size([_width,_height]);
		redraw();
	};
	
	var _svg = d3.select(_mapdiv).append('svg')
	    .style('position', 'absolute');
    
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
          
    resize();
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
