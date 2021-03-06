/*
Copyright 2020 Keith Paterson

This file is part of FG Airports.

FG Airports is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

FG Airports is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with FG Airports. If not, see http://www.gnu.org/licenses/.
*/
/* eslint-disable */
/**
 * Iterates over an array with a async function and await
 * @param {*} array The array being iterated over 
 * @param {*} callback 
 */

const { Debugger } = require("electron");

async function asyncForEach(array, callback) {
  logger('info', "AsyncForEach Len " + array.length);
  for (let index = 0; index < array.length; index++) {
    try {
      var res = await callback(array[index], index, array);
      logger('info', "Index " + index + " " + res);
    } catch (error) {
      logger('error', error);
    }
  }
}

function scanAPT_Old(p) {
  return airports.init().then(features => {
    var d = path.join(homedir, 'Documents/apt.dat');
    logger('info', d);
    apt.scan(d, features);
  });
}

async function waitFor(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


async function scanGroundnetFiles(p, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      logger('info', 'Start Groundnets ' + p);
      var files = traverseDir(p);
      this.postMessage(['max', files.length*2]);
      logger('info', files);

      asyncForEach(files, async f => {
        //await waitFor(5000);
        try {
          this.postMessage(['progress', 1]);
          var text = await readGroundnet(f, features);
          logger('info', text);
          resolve(text);
        } catch (error) {
          logger('error', error);
          reject(error);
        }
      }).then(t => {
        logger('info', "Finished");
        this.postMessage('DONE');
        resolve();
      }).catch(reason => {
        logger('info', "Crashed");
        logger('info', reason);
        this.postMessage('DONE');
      });

      //walkDir(p, f => { readGroundnet(f, features) });

    } catch (error) {
      logger('info', error);
      reject(error);
    }
  });
}

async function resetAI() {
  var promise = new Promise(function (resolve, reject) {
    try {
      var objectStore = features.transaction("airports", 'readwrite').objectStore("airports");

      objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          cursor.value.properties.flights = 0
          cursor.value.properties.airlines = [];
          logger('info', "Name for SSN " + cursor.key + " is " + cursor.value.properties.name);
          cursor.update(cursor.value);
          cursor.continue();
        }
        else {
          logger('info', "No more entries!");
          resolve();
        }
      };
    } catch (error) {
      logger('info', error);
      reject(error);
    }
  });
  return promise;
}

async function scanTrafficFiles(p, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      logger('info', 'Start Traffic ' + p);

      resetAI().then(f => {
        var files = traverseDir(p);
        this.postMessage(['max', files.length]);
        logger('info', files);
  
        asyncForEach(files, async f => {
          //await waitFor(5000);
          try {
            this.postMessage(['progress', 1]);
            var text = await readAI(f, features);
            logger('info', text);
            resolve(text);
          } catch (error) {
            logger('error', error);
            reject(error);
          }
        }).then(t => {
          logger('info', "Finished");
          resolve();
          this.postMessage('DONE');
        }).catch(reason => {
          logger('info', "Crashed");
          logger('info', reason);
          this.postMessage('DONE');
        });  
      }
      );


      //walkDir(p, f => { readGroundnet(f, features) });

    } catch (error) {
      logger('info', error);
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
    logger('info', 'Start Traffic ' + p + ' ' + features);
    var objectStore = features.transaction("airports").objectStore("airports");

    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        feature.value.properties.flights = 0
        feature.value.properties.airlines = [];
        logger('info', "Name for SSN " + cursor.key + " is " + cursor.value.name);
        cursor.continue();
      }
      else {
        logger('info', "No more entries!");
      }
    };

    //walkDir(p, f => { readAI(f, features) });
    logger('info', "Closing");
    this.postMessage('DONE');
    logger('info', "End Traffic");
  } catch (error) {
    logger('info', error);
  }
}

function traverseDir(dir) {
  var result = [];
  if(!fs.existsSync(dir)) {
    return result;
  }
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      logger('info', fullPath);
      var children = traverseDir(fullPath);
      result = result.concat(children);
    } else {
      logger('info', fullPath);
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
      logger('error', error);
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
      // Reset
      var airline = path.basename(f).match('([^.]+)\.xml');
      if (airline == null) {
        resolve();
        return;
      }
      var xmlSource = fs.readFileSync(f, 'utf8').toString();
      logger('info', "read airline ", path.basename(f));
      // var doc = new domParser().parseFromString(xmlSource );
      // logger('info', "parsed ");
      // var flights = xpath.select("/trafficlist/flight", doc);
      // logger('info', "selected flight ");
      // logger('info', flights);
      var dat = tXml.simplify(tXml(xmlSource))['?xml'];
      //    logger('info', dat);
      if (!dat || !dat.trafficlist || !dat.trafficlist.flight) {
        resolve();
        return;
      }
      const aircraftLookup = {};
      
      dat.trafficlist.aircraft.map(n => {
        try {
          if(aircraftLookup[n['required-aircraft']] === undefined) {
            aircraftLookup[n['required-aircraft']] = [];
          }
          aircraftLookup[n['required-aircraft']].push(n.airline);
          aircraftLookup[n['required-aircraft']] = aircraftLookup[n['required-aircraft']].filter((v, i, a) => a.indexOf(v) === i);            
        } catch (error) {
          reject(error);
        }
        //debugger;
      });
           

      logger('info', 'Traffic', dat.trafficlist.flight);

      logger('info', "Departure flights " + dat.trafficlist.flight.length);

      // Flat list. Each flight departing or landing counts as one. 
      var merged = [];

      var airports = {};


      dat.trafficlist.flight.map(n => {
        merged.push(n.departure.port);        
        merged.push(n.arrival.port);

        if(airports[n.departure.port] === undefined) {
          airports[n.departure.port] = [];
        }
        if(airports[n.arrival.port] === undefined) {
          airports[n.arrival.port] = [];
        }
        airports[n.departure.port] = airports[n.departure.port].concat(aircraftLookup[n['required-aircraft']]);
        airports[n.departure.port] = airports[n.departure.port].filter((v, i, a) => a.indexOf(v) === i)
        airports[n.arrival.port] = airports[n.arrival.port].concat(aircraftLookup[n['required-aircraft']]);
        airports[n.arrival.port] = airports[n.arrival.port].filter((v, i, a) => a.indexOf(v) === i)
      }).sort();

      //debugger;
      var counts = {};
      for (var i = 0; i < merged.length; i++) {
        counts[merged[i]] = 1 + (counts[merged[i]] || 0);
      }

      asyncForEach(Object.keys(counts), async icao => {
        logger('info', icao);
        await store(icao, airports[icao], counts[icao]);
      }).then(t => {
        logger('info', "Finished");
        resolve();
      }).catch(reason => {
        logger('error', "Crashed", reason);
      });
      //for (var key in counts) {
      //  store(key, airline[0], counts[key]);
      //}

      // var flights = xpath.select("/trafficlist/flight/departure/port/text()", doc);
      // logger('info', nodes);
      // logger('info', nodes);
      // nodes = xpath.select("/trafficlist/flight/arrival/port/text()", doc);
      // logger('info', nodes);

    } catch (error) {
      logger('error', error);
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

function store(icao, airlines, value) {
  var promise = new Promise(function (resolve, reject) {
    logger('info', "Airport " + icao + " has " + value + " new flights");
    // Make a request to get a record by key from the object store
    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    var objectStoreRequest = index.get(icao);

    objectStoreRequest.onsuccess = function (event) {
      logger('info', 'Store Request', event);
      var feature = objectStoreRequest.result;
      if (!feature) {
        feature = createFeature(icao);
      }
      feature.properties.flights += value;
      logger('info', "ICAO : " + feature.properties.icao + " Flights : " + feature.properties.flights);
      logger('info', "Airlines : ", JSON.stringify(airlines));
      //debugger;
      feature.properties.airlines = feature.properties.airlines.concat(airlines);
      feature.properties.airlines = feature.properties.airlines.filter((v, i, a) => a.indexOf(v) === i)
      feature.properties.airlines.sort()
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info', "The transaction that originated this request is ", updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info', "Updated Success", event);
        resolve();
      };
      updateAirportRequest.onerror = function (event) {
        logger('info', "Error updating ",  event);
        reject(event);
      };
    };
    objectStoreRequest.onerror = function (event) {
      logger('info', "Error reading" + event);
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
      var thisPostMessage = this.postMessage;
      var filename = path.basename(f).match('^([^.]+)\\.([^.]+)(\\.new)?\\.([^.]+)');
      if (filename == null) {
        resolve("File didn't match");
      }
      else {
        logger('info', 'Parsing ' + f);
        fs.readFile(f, 'utf8', (err, data) => {
          if (err) {
            logger('info', 'Error reading file ' + err);
            reject(err);
          }
          logger('info', data);
          var dat = tXml.simplify(tXml(data));
          logger('info', 'Simplified ' + filename);

          if (dat['?xml']) {
            logger('info', "parsed " + f);

            var transaction = features.transaction("airports", "readonly");
            // report on the success of the transaction completing, when everything is done
            transaction.oncomplete = function (event) {
              logger('info', 'Read Transaction complete ', event);
            };

            transaction.onerror = function (event) {
              logger('info', 'Transaction error ', event);
            };
            var objectStore = transaction.objectStore("airports");
            var icao = filename[1];
            var index = objectStore.index('icaoIndex');
            var objectStoreRequest = index.get(icao);
            /*
            var getAllKeysRequest = index.getAllKeys();
            getAllKeysRequest.onsuccess = function() {
              logger('AllKeys', getAllKeysRequest.result);
            } 
            */       
            objectStoreRequest.onsuccess = function (event) {
              logger('info', dat['?xml'].groundnet);
              var feature = event.target.result;
              logger('info', "Got Airport : ", feature);
              if (!feature) {
                feature = createFeature(filename[1]);
              }

              if (filename[2] == 'threshold') {
                try {
                  logger('info', 'threshold : ' + filename[1]);
                  var nodes = dat['?xml'].PropertyList.runway;
                  if (nodes.threshold == 0) {
                    logger('info', "No Runway");
                    resolve();
                  }
                  nodes.threshold.forEach(r => {
                    var lat1 = parseFloat(r.threshold[0].lat);
                    var lon1 = parseFloat(r.threshold[0].lon);
                    var lat2 = parseFloat(r.threshold[1].lat);
                    var lon2 = parseFloat(r.threshold[1].lon);
                    if (!feature.geometry.coordinates) {
                      feature.geometry.coordinates = [mean(lon1, lon2), mean(lat1, lat2)];
                      logger('info', feature.geometry.coordinates);
                    }
                  });
                  feature.properties['threshold'] = true;

                } catch (error) {
                  logger('info', error);
                }
              } else if (filename[2] == 'twr') {
                try {
                  logger('info', 'twr : ' + filename[1]);
                  var nodes = dat['?xml'].PropertyList.tower.twr;
                  if (nodes.length == 0) {
                    logger('info', "No Tower");
                    resolve();
                  }
                  var lat = parseFloat(nodes.lat);
                  var lon = parseFloat(nodes.lon);
                  feature.properties['twr'] = true;
                  feature.geometry.coordinates = [lon, lat];

                } catch (error) {
                  logger('info', error);
                }
              } else if (filename[2] == 'groundnet') {
                logger('info', 'groundnet : ' + filename[1]);
                if (dat['?xml'].groundnet) {
                  var nodes = dat['?xml'].groundnet.TaxiNodes;
                  var parkingnodes = dat['?xml'].groundnet.parkingList;
                  if (nodes && nodes.node) {
                    logger('info', nodes);
                  }
                  if(filename [3] === '.new') {
                    feature['properties']['wipgroundnet'] = nodes && nodes.node ? nodes.node.length : 0;
                    feature['properties']['wipparking'] = parkingnodes && parkingnodes.Parking ? parkingnodes.Parking.length : 0;
  
                  } else {
                    feature['properties']['groundnet'] = nodes && nodes.node ? nodes.node.length : 0;
                    feature['properties']['parking'] = parkingnodes && parkingnodes.Parking ? parkingnodes.Parking.length : 0;  
                  }
                }
              } else if (filename[2] == 'ils') {
                logger('info', 'ils : ' + filename[1]);
                if (dat['?xml'].PropertyList.runways) {
                  var nodes = dat['?xml'].PropertyList.runways.ils;
                  feature.properties['ils'] = nodes !== undefined;
                }
              }
              var transaction = features.transaction("airports", "readwrite");
              // report on the success of the transaction completing, when everything is done
              transaction.oncomplete = function (event) {
                logger('info', 'Write Transaction complete ' + event);
                thisPostMessage(['progress', 1]);
                resolve("Stored " + filename[1]);
              };

              transaction.onerror = function (event) {
                logger('info', 'Transaction error ' + event);
              };
              var objectStore = transaction.objectStore("airports");
              var updateAirportRequest = objectStore.put(feature);

              // Log the transaction that originated this request
              logger('info', "The transaction that originated this request is ", updateAirportRequest.transaction);

              // When this new request succeeds, run the displayData() function again to update the display
              updateAirportRequest.onsuccess = function () {
                logger('info', "Stored");
              };
              updateAirportRequest.onerror = function (event) {
                logger('info', "Error storing " + event);
                reject(event);
              };
            }
            objectStoreRequest.onerror = function (event) {
              logger('info', "Read Error : " + event);
              resolve(event);
            }
          }
          else {
            resolve('No root');
          }

        });
      }

    } catch (error) {
      logger('error', error);
      reject(error);
    }
  });
  return promise;
}

function createFeature(icao) {
  return {
    "type": "Feature",
    'properties': { 'icao': icao, 'name': '', 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
    'geometry': {
      "type": "Point"
    }
  };
}

function mean(coord1, coord2) {
  return (coord1 + coord2) / 2;
}
// export default { scanAPT, scanTraffic, scanGroundnet }
