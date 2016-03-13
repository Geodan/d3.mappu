importScripts('http://d3js.org/d3.v3.min.js','../../postgis-service/lib/twkb.js/dist/twkb.min.js');
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
function getData(json,d, _attributes){
			var features = [];
			json.data.forEach(function(twkbdata){
					if (!twkbdata.geom){
						console.warn('no data',twkbdata);
						return; 
					}
					var arr = new Uint8Array(twkbdata.geom.data);
					var collection = new twkb.toGeoJSON(arr);
					collection.features.forEach(function(f){
							f.id = twkbdata.id;
							f.properties = {};
							_attributes.forEach(function(a){
									f.properties[a] = twkbdata[a];
							});
							if (f.geometry.type == 'Polygon' && !ringIsClockwise(f.geometry.coordinates[0])){
								f.geometry.coordinates[0].reverse();
							}
					});
					features = features.concat(collection.features);
			});
			var data = features;
			/*
			var data = json.features.sort(function(a, b) {
				return a.properties.sort_key - b.properties.sort_key;
			});
			*/

			postMessage({data:data,d:d });
};


onmessage = function(e) {
	var json = e.data.json;
	var tile = e.data.tile;
	var attributes = e.data.attributes;
	getData(json, tile,attributes);
  
};