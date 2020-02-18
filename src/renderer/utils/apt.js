/* eslint-disable */
const lineReader = require('readline');
var icao;

var scanMethods = {
  1: (l, apts) => {
    logger('info', 'Airport:', l);
    icao = l[4];
    saveName(apts, l[4], l.slice(5).join(' ').replace('\t', ' '));
  },
  14: (l, apts) => {
    logger('info','Viewport:', l);
    saveCoordinates(apts, icao, l[1], l[2]);
  },
  99: (l) => {
    logger('info','Finished');
  }
};

async function saveName(features, icao, name) {
  var promise = new Promise(function (resolve, reject) {

    var transaction = features.transaction("airports", "readwrite");
    var objectStore = transaction.objectStore("airports");
    var index = objectStore.index('icaoIndex');
    var objectStoreRequest = index.get(icao);

    objectStoreRequest.onsuccess = function (event) {
      logger('info',event);
      var feature = event.target.result;
      if (!feature) {
        feature = {
          "type": "Feature",
          'properties': { 'icao': icao, 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
          'geometry': {
            "type": "Point"
          }
        };
      }
      feature.properties.name = name;
      feature.properties.icao = icao;
      logger('info',"ICAO : " + feature.properties.icao + " Name : " + name );
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info',"The transaction that originated this request is " + updateAirportRequest.updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function () {
        logger('info',"Stored");
        resolve();
      };
      updateAirportRequest.onerror = function (event) {
        logger('info',"Error " + event);
        reject(event);
      };
    };
    objectStoreRequest.onerror = function (event) {
      logger('info',"Error " + event);
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
      logger('info',event);
      var feature = event.target.result;
      if (!feature) {
        feature = {
          "type": "Feature",
          'properties': { 'icao': icao, 'twr': false, 'threshold': false, 'flights': 0, airlines: [] },
          'geometry': {
            "type": "Point"
          }
        };
      }
      feature.geometry.coordinates = [lon, lat];
      logger('info',"ICAO : " + feature.properties.icao);
      // Create another request that inserts the item back into the database
      var updateAirportRequest = objectStore.put(feature);

      // Log the transaction that originated this request
      logger('info',"The transaction that originated this request is " + updateAirportRequest.updateAirportRequest);

      // When this new request succeeds, run the displayData() function again to update the display
      updateAirportRequest.onsuccess = function (event) {
        logger('info',"Stored", event);
        resolve();
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
      require('fs').createReadStream(f)
        .on('data', function(chunk) {
          for (i=0; i < chunk.length; ++i)
            if (chunk[i] == 10) count++;
        })
        .on('end', function() {
          postMessage(['max', count]);
          console.log('Line Count',count);
          lineReader.createInterface({
            input: fs.createReadStream(f)
          }).on('line', function (line) {
            postMessage(['progress', 1]);
            var fields = line.split(/[ ]+/);
            // var fields = line.match('([0-9]+)');
            if (fields == null)
              return;
            var scanMethod = scanMethods[fields[0]];
            if (scanMethod != null) {
              scanMethod(fields, features);
            }
            else {
              if (fields[0] == '99') {
                lineReader.close();
              }
              // logger('info','Ignored:', line);
            }
          }).on('error', function (err) {
            logger('info',err);
            lr.close();
          }).on('close', function () {
            logger('info',"End");
            features.close();
            postMessage('DONE');
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

