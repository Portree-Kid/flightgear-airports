
/* eslint-disable */
// const fs = require('fs');
// const path = require('path');
// const math = require('mathjs');
// const util = require('util');
// const airports = require('./airports.js');
// const homedir = require('os').homedir();
// const apt = require('apt.js');

async function asyncForEach(array, callback) {
  console.log("AsyncForEach Len " + array.length);
  for (let index = 0; index < array.length; index++) {
    try {
      var res = await callback(array[index], index, array);
      console.log("Index " + index + " " + res);
    } catch (error) {
      console.error(error);
    }
  }
}

function scanAPT_Old(p) {
  return airports.init().then(features => {
    var d = path.join(homedir, 'Documents/apt.dat');
    console.log(d);
    apt.scan(d, features);
  });
}

async function waitFor(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


async function scanGroundnetFiles(p, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      console.log('Start Groundnets ' + p);
      var files = traverseDir(p);
      console.log(files);

      asyncForEach(files, async f => {
        //await waitFor(5000);
        try {
          var text = await readGroundnet(f, features);
          console.log(text);
          resolve(text);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }).then(t => {
        console.log("Finished");
        features.close();
        resolve();
      }).catch(reason => {
        console.log("Crashed");
        console.log(reason);
        features.close()
      });

      //walkDir(p, f => { readGroundnet(f, features) });

    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

async function scanTrafficFiles(p, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      console.log('Start Groundnets ' + p);
      var files = traverseDir(p);
      console.log(files);

      asyncForEach(files, async f => {
        //await waitFor(5000);
        try {
          var text = await readAI(f, features);
          console.log(text);
          resolve(text);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }).then(t => {
        console.log("Finished");
        features.close();
        resolve();
        this.postMessage('DONE');
      }).catch(reason => {
        console.log("Crashed");
        console.log(reason);
        features.close()
        this.postMessage('DONE');
      });

      //walkDir(p, f => { readGroundnet(f, features) });

    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

/**
 * 
 * @param {*} p 
 * @param {*} features 
 */

function scanTrafficIntoDB(p, features) {
  try {
    console.log('Start Traffic ' + p + ' ' + features);
    var objectStore = features.transaction("airports").objectStore("airports");

    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        feature.value.properties.flights = 0
        feature.value.properties.airlines = [];
        console.log("Name for SSN " + cursor.key + " is " + cursor.value.name);
        cursor.continue();
      }
      else {
        console.log("No more entries!");
      }
    };

    walkDir(p, f => { readAI(f, features) });
    console.log("Closing");
    features.close();
    this.postMessage('DONE');
    console.log("End Traffic");
  } catch (error) {
    console.log(error);
  }
}

function traverseDir(dir) {
  var result = [];
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      console.log(fullPath);
      var children = traverseDir(fullPath);
      result = result.concat(children);
    } else {
      console.log(fullPath);
      result.push(fullPath);
    }
  });
  return result;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    try {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ?
        walkDir(dirPath, callback) : callback(path.join(dir, f));
    } catch (error) {
      console.error(error);
    }
  });
}

/**
 * 
 * @param {*} f 
 * @param {*} apts 
 */

function readAI(f, apts) {
  var promise = new Promise(function (resolve, reject) {
    try {
      console.log(path.basename(f));
      // Reset
      var airline = path.basename(f).match('([^.]+)\.xml');
      if (airline == null){
        resolve();
        return;
      }
      var xmlSource = fs.readFileSync(f, 'utf8').toString();
      console.debug("read airline " + path.basename(f));
      // var doc = new domParser().parseFromString(xmlSource );
      // console.log("parsed ");
      // var flights = xpath.select("/trafficlist/flight", doc);
      // console.log("selected flight ");
      // console.log(flights);
      var dat = tXml(xmlSource);
      //    console.log(dat);
      if( !dat || !dat[0] || !dat[0].children || !dat[0].children[0] ) {
        resolve();
        return;
      }

      console.log(dat[0].children[0]);

      var flightNodes = dat[0].children[0].children.filter(e => e.tagName === 'flight');
      flightNodes = tXml.simplify(flightNodes);
      if (!flightNodes || !flightNodes.flight) {
        resolve();
        return;
      }

      console.log(flightNodes.flight);

      console.log("Departure flights " + flightNodes.flight.length);

      var merged = new Array();

      flightNodes.flight.map(n => {
        merged.push(n.departure.port);
        merged.push(n.arrival.port);
      }).sort();

      var counts = {};
      for (var i = 0; i < merged.length; i++) {
        counts[merged[i]] = 1 + (counts[merged[i]] || 0);
      }
      
      asyncForEach(Object.keys(counts), async key => {
        console.log(key);
        await store(key, airline[0], counts[key]);
      }).then(t => {
        console.log("Finished");
        resolve();
      }).catch(reason => {
        console.log("Crashed");
        console.log(reason);
        features.close()
      });
      //for (var key in counts) {
      //  store(key, airline[0], counts[key]);
      //}

      // var flights = xpath.select("/trafficlist/flight/departure/port/text()", doc);
      // console.log(nodes);
      // console.log(nodes);
      // nodes = xpath.select("/trafficlist/flight/arrival/port/text()", doc);
      // console.log(nodes);

    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
  return promise;
}

/**
 * Store airline info into DB
 * @param {*} icao 
 * @param {*} airline 
 * @param {*} value 
 */

function store(icao, airline, value) {
  var promise = new Promise(function (resolve, reject) {
    console.log("Airport " + icao + " has " + value + " new flights");
    // Make a request to get a record by key from the object store
    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var objectStoreRequest = objectStore.get(icao);

    objectStoreRequest.onsuccess = function (event) {
      console.log(event);
      var feature = objectStoreRequest.result;
      if (!feature) {
        feature = createFeature(icao);
      }
      feature.properties.flights += value;
      console.log("Airline " + airline);
      feature.properties.airlines.push(airline);
      feature.properties.airlines.sort();
      console.log("ICAO : " + feature.properties.icao + " Flights : " + feature.properties.flights);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      console.log("The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function () {
        console.log("Stored");
        resolve();
      };
      updateAirportRequest.onerror = function (event) {
        console.log("Error storing " + event);
        reject(event);
      };
    };
    objectStoreRequest.onerror = function (event) {
      console.log("Error " + event);
      reject(event);
    };
  });
  return promise;
}

/**
 * read a groundnet xml file
 * @param {*} f 
 * @param {*} apts 
 */

async function readGroundnet(f, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      var filename = path.basename(f).match('^([^.]+)\\.([^.]+)\\.([^.]+)');
      if (filename == null) {
        resolve("File didn't match");
      }
      else {
        console.log('Parsing ' + f);
        fs.readFile(f, 'utf8', (err, data) => {
          if (err) {
            console.log('Error reading file ' + err);
            reject(err);
          }
          console.log(data);
          var dat = tXml.simplify(tXml(data));
          console.log('Simplified ' + filename);

          if (dat['?xml']) {
            console.log("parsed " + f);

            var transaction = features.transaction("airports", "readonly");
            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function (event) {
              console.log('Read Transaction complete ' + event);
            };

            transaction.onerror = function (event) {
              console.log('Transaction error ' + event);
            };
            var objectStore = transaction.objectStore("airports");
            var objectStoreRequest = objectStore.get(filename[1]);

            objectStoreRequest.onsuccess = function (event) {
              console.log(dat['?xml'].groundnet);
              var feature = event.result;
              console.log("Got Airport : " + feature);
              if (!feature) {
                feature = createFeature(filename[1]);
              }

              if (filename[2] == 'threshold') {
                try {
                  console.log('threshold : ' + filename[1]);
                  var nodes = dat['?xml'].PropertyList.runway;
                  if (nodes.threshold == 0) {
                    console.log("No Runway");
                    resolve();
                  }
                  nodes.forEach(r => {
                    var lat1 = parseFloat(r.threshold[0].lat);
                    var lon1 = parseFloat(r.threshold[0].lon);
                    var lat2 = parseFloat(r.threshold[1].lat);
                    var lon2 = parseFloat(r.threshold[1].lon);
                    if (!feature.geometry.coordinates) {
                      feature.geometry.coordinates = [mean(lon1, lon2), mean(lat1, lat2)];
                      console.log(feature.geometry.coordinates);
                    }
                  });
                  feature.properties['threshold'] = true;

                } catch (error) {
                  console.log(error);
                }
              } else if (filename[2] == 'twr') {
                try {
                  console.log('twr : ' + filename[1]);
                  var nodes = dat['?xml'].PropertyList.tower.twr;
                  if (nodes.length == 0) {
                    console.log("No Tower");
                    resolve();
                  }
                  var lat = parseFloat(nodes.lat);
                  var lon = parseFloat(nodes.lon);
                  feature.properties['twr'] = true;
                  feature.geometry.coordinates = [lon, lat];

                } catch (error) {
                  console.log(error);
                }
              } else if (filename[2] == 'groundnet') {
                console.log('groundnet : ' + filename[1]);
                if (dat['?xml'].groundnet) {
                  var nodes = dat['?xml'].groundnet.TaxiNodes;
                  if (nodes && nodes.node) {
                    console.log(nodes);
                  }
                  feature['properties']['groundnet'] = nodes && nodes.node ? nodes.node.length : 0;
                  var nodes = dat['?xml'].groundnet.parkingList;
                  feature['properties']['parking'] = nodes && nodes.Parking ? nodes.Parking.length : 0;
                }
              } else if (filename[2] == 'ils') {
                console.log('ils : ' + filename[1]);
                if (dat['?xml'].PropertyList.runways) {
                  var nodes = dat['?xml'].PropertyList.runways.ils;
                  feature.properties['ils'] = nodes !== undefined;
                }
              }
              var transaction = features.transaction("airports", "readwrite");
              // report on the success of the transaction completing, when everything is done
              transaction.oncomplete = function (event) {
                console.log('Write Transaction complete ' + event);
                resolve("Stored " + filename[1]);
              };

              transaction.onerror = function (event) {
                console.log('Transaction error ' + event);
              };
              var objectStore = transaction.objectStore("airports");
              var updateAirportRequest = objectStore.put(feature);

              // Log the transaction that originated this request
              console.log("The transaction that originated this request is " + updateAirportRequest.transaction);

              // When this new request succeeds, run the displayData() function again to update the display
              updateAirportRequest.onsuccess = function () {
                console.log("Stored");
              };
              updateAirportRequest.onerror = function (event) {
                console.log("Error storing " + event);
                reject(event);
              };
            }
            objectStoreRequest.onerror = function (event) {
              console.log("Read Errpr : " + event);
              resolve(event);
            }
          }
          else {
            resolve('No root');
          }

        });
      }

    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
  return promise;
}

function createFeature(icao) {
  return {
    "type": "Feature",
    'properties': { 'icao': icao, 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
    'geometry': {
      "type": "Point"
    }
  };
}

function mean(coord1, coord2) {
  return (coord1 + coord2) / 2;
}
// export default { scanAPT, scanTraffic, scanGroundnet }
