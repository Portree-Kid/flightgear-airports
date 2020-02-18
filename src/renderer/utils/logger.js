var util = require("util")

const d = new Date();

const fName = 'scan_' + d.getFullYear()
+ d.getMonth()
+ d.getDay()
+ d.getHours()
+ d.getMinutes()
+ d.getSeconds()
+ d.getMilliseconds() + '.log';

var logStream = require('fs').createWriteStream( fName, {autoClose: true});

var logger = function (level, msg, o) {
    var d = new Date();
    logStream.write(d.toUTCString() + '|' + level + ' | ' + msg + '\r\n');
    if (o != undefined) {
      logStream.write( util.inspect(o,{depth: 2}) + '\r\n');
    }
}