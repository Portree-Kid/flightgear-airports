/* eslint-disable */
const lineReader = require('readline');
const fs = require('fs');
const airports = require('./airports');

var scanMethods = {
    1: (l, apts) => {
        console.log('Airport:', l);

        var airportFeature = airports.getAirport(apts, l[4]);
        console.log(JSON.stringify(airportFeature));
        airportFeature.properties.name = l.slice(5).join(' ').replace('\t', ' ');
        console.debug(airportFeature.properties.name);
        // apts.update(airportFeature);
    },
    99: (l) => {
        console.log('Finished');
    }
};

function scan (f, apts) {
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
        airports.save();
    });
}

// export default { scan, name }

