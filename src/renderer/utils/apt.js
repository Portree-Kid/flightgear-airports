/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');

var icao;

function aptForEach(array, apt, features, callback) {
  logger('info', "AsyncForEach Len " + array.length);
  for (let index = 0; index < array.length; index++) {
    try {
      apt = callback(array[index], index, apt);
      logger('info', "Index : " + index + " Result : " + apt);
    } catch (error) {
      logger('error', error);
    }
  }
  saveAirport(features, apt).then(t => { 
    postMessage(['progress', array.length]); 
    logger('info', `Stored : ${apt.icao}` );
    if( apt.last ) {
      postMessage('DONE');
    }
  });
}

this.boundingBox = null;

var scanMethods = {
  1: (l, apts, apt) => {
    try {
      logger('info', 'Airport:', l);
      apt.icao = l[4];
      apt.name = l.slice(5).join(' ').replace('\t', ' ');
      apt.type = 'airport'
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  14: (l, apts, apt) => {
    logger('info', 'Viewport:', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  16: (l, apts, apt) => {
    logger('info', 'Seaplane:', l);
    apt.icao = l[4];
    apt.name = l.slice(5).join(' ').replace('\t', ' ');
    apt.type = 'seaplane'
    resolve(apt);
  },
  17: (l, apts, apt) => {
    logger('info', 'Heliport:', l);
    apt.icao = l[4];
    apt.name = l.slice(5).join(' ').replace('\t', ' ');
    apt.type = 'heliport'
  },
  18: (l, apts, apt) => {
    logger('info', 'Airport light beacon:', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  19: (l, apts, apt) => {
    logger('info', 'Windsock:', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  111: (l, apts, apt) => {
    logger('info', 'Node :', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  112: (l, apts, apt) => {
    logger('info', 'Node :', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  113: (l, apts, apt) => {
    logger('info', 'Node :', l);
    try {
      updateBoundingBox(apt, l[1], l[2]);
      return apt;
    } catch (error) {
      reject(error);
    }
  },
  99: (l) => {
    logger('info', 'Finished');
  }
};

function updateBoundingBox(apt, lat, lon) {
  if (lat > 90 || lat < -90) {
    logger('debug', `${lat} out of bounds`);
  }
  if (!apt.boundingBoxCenter || isNaN(apt.boundingBoxCenter[0]) || isNaN(apt.boundingBoxCenter[1])) {
    apt.boundingBoxCenter = [lon, lat];
  } else {
    var avgLon = (Number(lon) + Number(apt.boundingBoxCenter[0])) / 2;
    var avgLat = (Number(lat) + Number(apt.boundingBoxCenter[1])) / 2;
    apt.boundingBoxCenter = [avgLon, avgLat];
  }
}

async function saveAirport(features, apt) {
  var promise = new Promise(function (resolve, reject) {
    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    if (!apt || !apt.icao) {
      return;
    }
    var objectGetRequest = index.get(apt.icao);

    objectGetRequest.onsuccess = function (event) {
      logger('info', 'objectGetRequest', event);
      var feature = event.target.result;
      if (!feature) {
        feature = {
          "type": "Feature",
          'properties': { 'icao': icao, 'name': '', 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
          'geometry': {
            "type": "Point"
          }
        };
      }
      feature.properties.name = apt.name;
      feature.properties.icao = apt.icao;
      feature.properties.type = apt.type;
      feature.geometry.coordinates = apt.boundingBoxCenter;
      logger('info', "Storing Airport : " + feature.properties.icao + " Name : " + feature.properties.name);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info', "The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info', "Stored Name : " + event.target.result);
        resolve(event.target.result);
      };
      updateAirportRequest.onerror = function (event) {
        logger('info', "Error ", event);
        reject(event);
      };
    };
    objectGetRequest.onerror = function (event) {
      logger('info', "Error ", event);
      reject(event);
    };
  });
  return promise;
}

async function saveName(features, icao, name) {
  var promise = new Promise(function (resolve, reject) {
    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    var objectGetRequest = index.get(icao);

    objectGetRequest.onsuccess = function (event) {
      logger('info', 'objectGetRequest', event);
      var feature = event.target.result;
      if (!feature) {
        feature = {
          "type": "Feature",
          'properties': { 'icao': icao, 'name': '', 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
          'geometry': {
            "type": "Point"
          }
        };
      }
      feature.properties.name = name;
      feature.properties.icao = icao;
      logger('info', "Storing ICAO : " + feature.properties.icao + " Name : " + name);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info', "The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info', "Stored Name : " + event.target.result);
        resolve(event.target.result);
      };
      updateAirportRequest.onerror = function (event) {
        logger('info', "Error ", event);
        reject(event);
      };
    };
    objectGetRequest.onerror = function (event) {
      logger('info', "Error ", event);
      reject(event);
    };
  });
  return promise;
}

async function saveCoordinates(features, icao, boundingBoxCenter) {
  var promise = new Promise(function (resolve, reject) {

    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    var objectStoreRequest = index.get(icao);

    objectStoreRequest.onsuccess = function (event) {
      logger('info', 'objectStoreRequest', event);
      var feature = event.target.result;
      if (!feature) {
        feature = {
          "type": "Feature",
          'properties': { 'icao': icao, 'name': '', 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
          'geometry': {
            "type": "Point"
          }
        };
      }

      feature.geometry.coordinates = boundingBoxCenter;
      logger('info', "ICAO : " + feature.properties.icao);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info', "The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info', "Stored Position : " + event.target.result);
        resolve("Stored Position : " + event.target.result);
      };
      updateAirportRequest.onerror = function (event) {
        logger('info', "Error ", event);
        reject(event);
      };
    };
    objectStoreRequest.onerror = function (event) {
      logger('info', "Error ", event);
      reject(event);
    };
  });
  return promise;
}

async function scanAPTIntoDB(f, features) {
  var promise = new Promise(function (resolve, reject) {
    try {
      var i;
      var count = 0;
      var postMessage = this.postMessage;
      var lines = [];
      require('fs').createReadStream(f).pipe(zlib.createGunzip())
        .on('data', function (chunk) {
          for (i = 0; i < chunk.length; ++i)
            if (chunk[i] == 10) count++;
        })
        .on('end', function () {
          postMessage(['max', count*2]);
          console.log('Line Count', count);
          lineReader.createInterface({
            input: fs.createReadStream(f).pipe(zlib.createGunzip())
          }).on('line', function (line) {
            lines.push(line);
            var fields = line.split(/[ ]+/);
            if (fields[0] == '99') {
              logger('info', "End Reading");
            }
          }).on('error', function (err) {
            logger('info', err);
            lr.close();
          }).on('close', async function () {
            logger('info', "End File Read");
            var currentAirport = [];
            var currentIcao = null;
            try {
              lines.forEach((line, index) => {
                var fields = line.split(/[ ]+/);
                if ([1, 16, 17, 99].indexOf(Number(fields[0])) >= 0) {
                  var apt = { icao: currentIcao, last: Number(fields[0])===99 }
                  var bla = aptForEach(currentAirport, apt, features, (line, index, apt) => {
                    //await waitFor(5000);
                    try {
                      var fields = line.split(/[ ]+/);
                      // var fields = line.match('([0-9]+)');
                      if (fields != null) {
                        var scanMethod = scanMethods[fields[0]];
                        if (scanMethod != null) {
                          var text = scanMethod(fields, features, apt);
                          logger('info', `Scanned ${fields[0]}`, text);
                          resolve(text);
                        } else {
                          resolve('Ignored ' + line);
                        }
                      }
                      return apt;
                    } catch (error) {
                      logger('error', error);
                      reject(error);
                    }
                  });
                  postMessage(['progress', currentAirport.length]);
                  currentIcao = fields[4]
                  currentAirport = [];
                }
                currentAirport.push(line);
              });
              logger('info', "Finished");
              // postMessage('DONE');                
            } catch (error) {
              logger('error', "Crashed");
              logger('error', error);
              postMessage('DONE');              
            }
          });
        });
    } catch (error) {
      console.error(error);
      reject(error);
      this.postMessage('DONE');
    }
  });
}

// export default { scan, name }

