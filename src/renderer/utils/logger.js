var util = require("util");

const d = new Date();

const fName = 'scan_' + d.getFullYear()
+ d.getMonth()
+ d.getDay()
+ d.getHours()
+ d.getMinutes()
+ d.getSeconds()
+ d.getMilliseconds() + '.log';

var logStream = null;

var loggerInit = function (logging) {
  if (logging) {
    logStream = require('fs').createWriteStream( fName, {autoClose: true});
  }
}

var logger = function (level, msg, o) {
    var d = new Date();
    if(logStream!==null) {
      logStream.write(d.toUTCString() + '|' + level + ' | ' + msg + '\r\n');
    }
    if (o != undefined && logStream!==null) {
      logStream.write( util.inspect(o,{depth: 2}) + '\r\n');
    }
}