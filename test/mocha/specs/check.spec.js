var assert = require('chai').assert;
var Worker = require("tiny-worker");

process.chdir('src/renderer/utils');

describe("Test Check", function () {
  describe("Routing Checks", function () {
    it("Not legitimate End", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === 1).filter(m => m.message === 'Node not a legimate end'), 1);
            assert.lengthOf(e.data[1].filter(m => m.id === 2).filter(m => m.message === 'Node not a legimate end'), 1);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 0);

            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });
    it("Legitimate End Runway", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, 'direction': 'bi-directional' },
        { 'index': 1, '_leaflet_id': 2, 'type': 'runway' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === 1).filter(m => m.message === 'No way from runway to each parking'), 1);
            assert.lengthOf(e.data[1].filter(m => m.id === 2).filter(m => m.message === 'Node not a legimate end'), 1);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 0);
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });

    it("From Parking to Runway bi-directional", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, direction: 'bi-directional' },
        { 'index': 1, '_leaflet_id': 2, 'type': 'runway' },
        { 'index': 2, '_leaflet_id': 3, 'name': 'name', parkingType: 'gate', 'type': 'parking' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 1);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1);
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });

    it("From Parking to Runway forward OK", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, direction: 'forward' },
        { 'index': 1, '_leaflet_id': 3, 'name': 'name', parkingType: 'gate', 'type': 'parking' },
        { 'index': 2, '_leaflet_id': 2, 'type': 'runway' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()

          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 1);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1);
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });

    it("From Parking to Runway forward Not Ok", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, direction: 'forward' },
        { 'index': 2, '_leaflet_id': 3, 'name': 'name', parkingType: 'gate', 'type': 'parking' },
        { 'index': 1, '_leaflet_id': 2, 'type': 'runway' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()

          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 0);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1);
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });

    it("From Parking to Runway reverse OK", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, direction: 'backward' },
        { 'index': 2, '_leaflet_id': 3, 'name': 'name', parkingType: 'gate', 'type': 'parking' },
        { 'index': 1, '_leaflet_id': 2, 'type': 'runway' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 1);
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1);
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });

    it("From Parking to Runway reverse Not OK", function (done) {
      var data = [
        { 'start': 1, 'end': 2, '_leaflet_id': 1, 'type': 'poly', 'isPushBackRoute': true, direction: 'backward' },
        { 'index': 1, '_leaflet_id': 3, 'name': 'name', parkingType: 'gate', 'type': 'parking' },
        { 'index': 2, '_leaflet_id': 2, 'type': 'runway' }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 0, 'No Routes from Runway');
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1, 'No invalid ends');
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });
  });
  describe("Routing Checks", function () { 
    it("Runway Node not on Runway", function (done) {
      var data = [
        { 'index': 2, '_leaflet_id': 2, 'type': 'runway' },
        { 'name': 'R29', 'type': 'runway_area', 'polygon': [] }
      ];
      var worker = new Worker('check.js');
      worker.onmessage = function (e) {
        if (e.data === 'checkStarted') {
        } else if (e.data[0] === 'DONE') {
          console.log('DONE')
          worker.terminate()
          if (e.data[1].length === 0) {
            done('Crashed')
          } else {
            console.log(e.data[1]);
            console.log(e.data[1].filter(m => m.id === 1));
            assert.lengthOf(e.data[1].filter(m => m.id === -1).filter(m => m.message === 'Routes from runways OK'), 0, 'No Routes from Runway');
            assert.lengthOf(e.data[1].filter(m => m.message === 'No invalid ends'), 1, 'No invalid ends');
            done()
          }
        } else if (e.data.length > 0) {
        }
      };
      worker.postMessage(['check', data]);
    });    
  });
  describe("", function () {
    
  });
});