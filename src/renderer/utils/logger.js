/* eslint-disable no-unused-vars */
var util = require('util');

const d = new Date();

const fName = 'scan_' + d.getFullYear() +
d.getMonth() +
d.getDay() +
d.getHours() +
d.getMinutes() +
d.getSeconds() +
d.getMilliseconds() + '.log';

var logStream = null;

var loggerInit = function (logging) {
  if (logging) {
    try {
      const homedir = require('os').homedir();
      const logFileName = require('path').join(homedir, fName);
      logStream = require('fs').createWriteStream( logFileName, {autoClose: true});
    } catch (error) {
      console.error('Logging not possible ' + error);
    }
  }
}

var logger = function (level, msg, o) {
  var d = new Date();
  try {
    if (logStream !== null) {
      logStream.write(d.toUTCString() + '|' + level + ' | ' + msg + '\r\n');
    }
    if (o != undefined && logStream!==null) {
      logStream.write( util.inspect(o,{depth: 2}) + '\r\n');
    }
  } catch (error) {
    console.error('Logging not possible ' + error);
  }
}