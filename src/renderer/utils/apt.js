/* eslint-disable */
const lineReader = require('readline');

var scanMethods = {
    1: (l, apts) => {
        console.log('Airport:', l);
        saveName(apts, l[4], l.slice(5).join(' ').replace('\t', ' '));
    },
    99: (l) => {
        console.log('Finished');
    }
};

async function saveName(features, icao, name) {
    var promise = new Promise(function (resolve, reject) { 

        var transaction = features.transaction("airports", "readwrite");
        var objectStore = transaction.objectStore("airports");
        var objectStoreRequest = objectStore.get(icao);
    
        objectStoreRequest.onsuccess = function (event) {
          console.log(event);
          var feature = objectStoreRequest.result;
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
          console.log("ICAO : " + feature.properties.icao);
          // Create another request that inserts the item back into the database
          var updateAirportRequest = objectStore.put(feature);
    
          // Log the transaction that originated this request
          console.log("The transaction that originated this request is " + updateAirportRequest.updateAirportRequest);
    
          // When this new request succeeds, run the displayData() function again to update the display
          updateAirportRequest.onsuccess = function () {
            console.log("Stored");
            resolve();
          };
          updateAirportRequest.onerror = function (event) {
            console.log("Error " + event);
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

function scanAPTIntoDB(f, apts) {
    console.log(f);
    lineReader.createInterface({
        input: fs.createReadStream(f)
    }).on('line', function (line) {
        var fields = line.split(/[ ]+/);
        // var fields = line.match('([0-9]+)');
        if (fields == null)
            return;
        var scanMethod = scanMethods[fields[0]];
        if (scanMethod != null) {
            scanMethod(fields, apts);
        }
        else {
            if (fields[0] == '99') {
                lineReader.close();
            }
            // console.log('Ignored:', line);
        }
    }).on('error', function (err) {
        console.log(err);
        lr.close();
    }).on('close', function () {
        console.log("End");
        apts.close();
    });
}

// export default { scan, name }

