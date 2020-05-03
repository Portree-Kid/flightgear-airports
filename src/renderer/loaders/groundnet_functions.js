/* eslint-disable */
const fs = require('fs');
const path = require('path');

exports.removeWip = function (fDir, icao) {
    var fNew = path.join(fDir, icao[0], icao[1], icao[2], icao + '.groundnet.new.xml');
    if( fs.existsSync(fNew) ) {
        fs.unlinkSync(fNew);
    }
}
