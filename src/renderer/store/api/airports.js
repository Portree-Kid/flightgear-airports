/* eslint-disable */
const DB_NAME = 'flightgear';
const DB_VERSION = 3;
let DB;

export default {

	async getDb() {
		return new Promise((resolve, reject) => {

			if(DB) { return resolve(DB); }
			console.log('OPENING DB', DB);
			let request = window.indexedDB.open(DB_NAME, DB_VERSION);
			
			request.onerror = e => {
				console.log('Error opening db', e);
				reject('Error');
			};
	
			request.onsuccess = e => {
				DB = e.target.result;
				console.log('OPENED DB', DB);
				resolve(DB);
			};
			
			request.onupgradeneeded = e => {
				console.log('onupgradeneeded');
                let db = e.target.result;
				db.createObjectStore("airports", { autoIncrement: true, keyPath:'properties.icao' });
			};
		});
	},
	async deleteAirport(airport) {

		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['airports'],'readwrite');
			trans.oncomplete = () => {
				resolve();
			};

			let store = trans.objectStore('airports');
			store.delete(airport.features.icao);
		});	
	},
	async getAirports() {

		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['airports'],'readonly');
			trans.oncomplete = () => {
				resolve(airports);
			};
			
			let store = trans.objectStore('airports');
			let airports = [];
			
			store.openCursor().onsuccess = e => {
				let cursor = e.target.result;
				if (cursor) {
					airports.push(cursor.value)
					cursor.continue();
				}
			};

		});
	},

	async saveAirport(airport) {
		let db = await this.getDb();
		
		return new Promise(resolve => {

			let trans = db.transaction(['airports'],'readwrite');
			trans.oncomplete = () => {
				resolve();
			};

			let store = trans.objectStore('airports');
			store.put(airport);

		});
	
	}

}