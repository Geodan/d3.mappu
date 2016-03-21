importScripts('http://d3js.org/d3.v3.min.js','../../postgis-service/lib/twkb.js/dist/twkb.min.js');

var _id;
var cache = {_db:null};

cache.init = function(){
	return new Promise(function(resolve, reject){
		if (cache._db) {
			resolve();
			return;
		}
		var request = indexedDB.open("d3.mappu");
		request.onblocked = function(e){
			console.error('Blocked!',e);
			reject();
		}
		request.onerror = function(event) {
			console.error("Why didn't you allow my web app to use IndexedDB?!");
			reject();
		};
		request.onsuccess = function(event) {
			cache._db = event.target.result;
			cache._db.onerror = function(event) {
				console.error("Database error: " + event.target.error);
			};

			resolve();
		};
		request.onupgradeneeded = function(event) {
			console.error('No upgrade should be needed here');
			reject();
		};
	});
};

cache.add = function(key,data){
	return new Promise(function(resolve, reject){
			cache.init().then(function(){
				var req = cache._db.transaction(_id,"readwrite").objectStore(_id).put({key: key,data: data});
				req.onsucces = function(){
					resolve();
				};
				req.onerror = function(e){
					console.error(e);
					reject();
				};
			});
	});
}
cache.get = function(key,data){
	return new Promise(function(resolve, reject){
			var request = cache._db.transaction(_id).objectStore(_id).get(key);
			request.onsuccess = function(event){
				if (event.target.result){
					resolve(event.target.result.data);
				}
				else {
					reject();
				}
			};
			request.onerror = function(e){
				console.error('Error: ',e);
				reject();
			}
	});
}
cache.delete = function(key){
	return new Promise(function(resolve, reject){
			cache._db.transaction(_id,"readwrite").objectStore(_id).delete(key).onsucces = function(){
				resolve();
			};
	});
}

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

function twkb2geojson(data,_attributes){
	var features = [];
	data.forEach(function(twkbdata){
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
	return features;
}

function getData(url,d, _attributes){
			var features = [];
			cache.init().then(function(){
				cache.get(d[0]+'_'+d[1]+'_'+d[2])
					.then(function(data){
						//No need to request new data, still in cache
						var returndata = twkb2geojson(data, _attributes);
						postMessage({layerid: _id,data:returndata,d:d });
					},function(){
						d3.json(url, function(error,json){
								if (error) {
									console.error("error", error);
									return;
								}
								var promise = cache.add(d[0]+'_'+d[1]+'_'+d[2],json.data);
								var returndata = twkb2geojson(json.data,_attributes);
								postMessage({layerid: _id, data:returndata,d:d });
						});
					});
			});
};


onmessage = function(e) {
	//var json = e.data.json;
	_id = e.data.layerid;
	var url = e.data.url;
	var tile = e.data.tile;
	var attributes = e.data.attributes;
		
	cache.init().then(function(){
			getData(url, tile,attributes);
	}, function(error){
		console.warn(error);
	});
  
};