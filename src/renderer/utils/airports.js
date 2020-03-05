/* eslint-disable */

var features = null;

async function initDB() {
    var promise = new Promise(function (resolve, reject) {
        console.log("Init " + (features == null));
        if (features == null) {
            console.log("Loading DB");
            console.log(this.indexedDB);
            var request = this.indexedDB.open("flightgear", 3);
            request.onerror = function (event) {
                reject(event);
            };
            request.onsuccess = function (event) {
                console.log('Opened DB ' + event);
                
                features = request.result;
                resolve(features);
            };
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                console.log("Migrate " + event);
                if (event.oldVersion < 1) {
                    // Version 1 is the first version of the database.
                    var objectStore = db.createObjectStore("airports", { keyPath: "properties.icao" });
                }
                if (event.oldVersion < 2) {
                    // Version 2 is the first version of the database.
                    var objectStore = event.target.transaction.objectStore("airports");
                    var indexNames = objectStore.indexNames;
                    var desiredKeyPathForMyIndex = "properties.icao";
                    console.log(indexNames);
                  
                    if(indexNames.contains('icaoIndex')) {
                      var myIndex = objectStore.index('icaoIndex');
                      var currentKeyPath = myIndex.keyPath;
                      if(currentKeyPath != desiredKeyPathForMyIndex) {
                        objectStore.deleteIndex('icaoIndex');
                        objectStore.createIndex('icaoIndex', desiredKeyPathForMyIndex);
                      }
                    } else {
                        objectStore.createIndex('icaoIndex', desiredKeyPathForMyIndex);
                    }                    
                }
                
            };
        }
        else {
            resolve(features);
        }
    });
    return promise;
}

function getAirport(apts, icao) {
    console.log("Getting Airport " + icao);
    var results = apts.where(function (f) {
        return f.properties['icao'] === icao;
    });
    var feature;
    if (results.length == 0) {
        feature = {
            "type": "Feature",
            'properties': { 'icao': icao, 'twr': false, 'threshold': false, 'flights': 0 },
            'geometry': {
                "type": "Point"
            }
        };
        feature = apts.insert(feature);
        // apts.update(feature);
        console.log("Added New");
        console.log(JSON.stringify(feature));
        return feature;
    }
    else {
        console.debug("retrieved " + JSON.stringify(results[0]));
        return results[0];
    }

}

function save() {
    if (!features || !features.data)
        return;
    var mappedData = features.data.map(function (f) {
        delete f.meta;
        delete f.$loki;
        if (f.properties.airlines) {
            f.properties.airlines = f.properties.airlines.join(' ');
        }
        else {
            f.properties.airlines = [];
        }

        return f;
    });

    mappedData = mappedData.filter(feature => feature.properties['twr'] || feature.properties['threshold']);

    //console.log(mappedData);
    var featureCollection = { type: "FeatureCollection", features: mappedData };

    let data = JSON.stringify(featureCollection, null, 2);
    fs.writeFileSync('airports.json', data);
    // db.saveDatabase(function (err) {
    //     if (err) {
    //         console.error(err);
    //     }
    // });
}
