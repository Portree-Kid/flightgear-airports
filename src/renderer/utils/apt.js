/* eslint-disable */
const lineReader = require('readline');
const zlib = require('zlib');
var icao;

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

var scanMethods = {
  1: async (l, apts) => {
    var promise = new Promise(function (resolve, reject) {
      logger('info', 'Airport:', l);
      icao = l[4];
      saveName(apts, l[4], l.slice(5).join(' ').replace('\t', ' '))
      .then(result => {
        resolve(result)
      }).catch( err => {reject(err)});
    });
    return promise;
  },
  14: async (l, apts) => {
    var promise = new Promise(function (resolve, reject) {
      logger('info','Viewport:', l);
      saveCoordinates(apts, icao, l[1], l[2]).then(result => {
        resolve(result)
      }).catch( err => {reject(err)});;
    });
    return promise;
  },
  18: async (l, apts) => {
    var promise = new Promise(function (resolve, reject) {
      logger('info','Airport light beacon:', l);
      saveCoordinates(apts, icao, l[1], l[2]).then(result => {
        resolve(result)
      }).catch( err => {reject(err)});;
    });
    return promise;
  },
  19: async (l, apts) => {
    var promise = new Promise(function (resolve, reject) {
      logger('info','Windsock:', l);
      saveCoordinates(apts, icao, l[1], l[2]).then(result => {
        resolve(result)
      }).catch( err => {reject(err)});;
    });
    return promise;
  },
  99: async (l) => {
    logger('info','Finished');
  }
};

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
      logger('info',"Storing ICAO : " + feature.properties.icao + " Name : " + name );
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info',"The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info',"Stored Name : " + event.target.result);
        resolve(event.target.result);
      };
      updateAirportRequest.onerror = function (event) {
        logger('info',"Error ", event);
        reject(event);
      };
    };
    objectGetRequest.onerror = function (event) {
      logger('info',"Error ", event);
      reject(event);
    };
  });
  return promise;
}

async function saveCoordinates(features, icao, lat, lon) {
  var promise = new Promise(function (resolve, reject) {

    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    var objectStoreRequest = index.get(icao);

    objectStoreRequest.onsuccess = function (event) {
      logger('info', 'objectStoreRequest',event);
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

      if (!feature.geometry.coordinates || isNaN(feature.geometry.coordinates[0]) || isNaN(feature.geometry.coordinates[1])) {
        feature.geometry.coordinates = [lon, lat];
      } else {
        var avgLon = (Number(lon) + Number(feature.geometry.coordinates[0])) / 2;
        var avgLat = (Number(lat) + Number(feature.geometry.coordinates[1])) / 2;
        feature.geometry.coordinates = [avgLon, avgLat];
      }
      logger('info',"ICAO : " + feature.properties.icao);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info',"The transaction that originated this request is " + updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info',"Stored Position : " + event.target.result);
        resolve("Stored Position : " + event.target.result);
      };
      updateAirportRequest.onerror = function (event) {
        logger('info',"Error ", event);
        reject(event);
      };
    };
    objectStoreRequest.onerror = function (event) {
      logger('info',"Error ", event);
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
        .on('data', function(chunk) {
          for (i=0; i < chunk.length; ++i)
            if (chunk[i] == 10) count++;
        })
        .on('end', function() {
          postMessage(['max', count]);
          console.log('Line Count',count);
          lineReader.createInterface({
            input: fs.createReadStream(f).pipe(zlib.createGunzip())
          }).on('line', function (line) {
            lines.push(line);
            var fields = line.split(/[ ]+/);
            if (fields[0] == '99') {
              logger('info',"End Reading");
            }
          }).on('error', function (err) {
            logger('info',err);
            lr.close();
          }).on('close', async function () {
            logger('info',"End File Read");
            asyncForEach(lines, async line => {
              //await waitFor(5000);
              try {
                postMessage(['progress', 1]);
                var fields = line.split(/[ ]+/);
                // var fields = line.match('([0-9]+)');
                if (fields != null) {
                  var scanMethod = scanMethods[fields[0]];
                  if (scanMethod != null) {
                    var text = await scanMethod(fields, features);
                    logger('info', 'Scanned', text);  
                    resolve(text);
                  } else {
                    resolve('Ignored ' + line);
                  }                  
                }
              } catch (error) {
                logger('error', error);
                reject(error);
              }
            }).then(t => {
              logger('info', "Finished");
              postMessage('DONE');
            }).catch(reason => {
              logger('error', "Crashed");
              logger('error', reason);
              postMessage('DONE');
            });
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

