/* eslint-disable */
const loki = require('lokijs');
const fs = require('fs');

var db = new loki('airports_DB.json');
var features = null;

export async function init() {
    var promise = new Promise(function (resolve, reject) {
        console.log("Init " + (features == null));
        if (features == null) {
            console.log("Loading DB");
            db.loadDatabase({}, function (err) {
                if (err) {
                    console.error("Error loading DB");
                    console.error(err);
                    db.addCollection('features', {
                        unique: ["properties.icao"], autoupdate: true
                    });
                    features = db.getCollection('features');
                }
                features = db.getCollection('features');
                if( features == null ){
                    db.addCollection('features', {
                        unique: ["properties.icao"], autoupdate: true
                    });
                    features = db.getCollection('features');
                }
                console.log("Loaded " + features.count() + " features");
                resolve(features);
            });
        }
        else {
            resolve(features);
        }
    });
    return promise;
}

export function getAirport(apts, icao) {
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

export function save() {
    if (!features || !features.data)
        return;
    var mappedData = features.data.map(function (f) {
        delete f.meta;
        delete f.$loki;
        if(f.properties.airlines) {
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
    db.saveDatabase(function (err) {
        if (err) {
            console.error(err);
        }
    });
}
