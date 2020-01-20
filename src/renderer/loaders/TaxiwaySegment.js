/* eslint-disable */
var L = require('leaflet');

L.TaxiwaySegment = L.Polyline.extend({
    options: { 
        id: 'Custom data!',
        attributes: {}
    },

    begin: String,
    end: String,
    bidirectional: Boolean,

    updateBeginVertex : function (latlng) {
        if (this._latlngs[0].__vertex) {
            this._latlngs[0].__vertex.setLatLng(latlng);            
        }
    },
    updateEndVertex : function (latlng) {
        if(this._latlngs[1].__vertex){
            this._latlngs[1].__vertex.setLatLng(latlng);        
        }
    },

    updateMiddle: function () {
        this._latlngs.forEach(element => {
            if(element.__vertex.middleMarker){
                element.__vertex.middleMarker.updateLatLng();
            }
        });
    },

    updateStyle() {
        var style = {};
        if (this.options.attributes.isPushBackRoute) {
          style.color = 'magenta';  
        }
        this.setStyle(style);
        if (!this.bidirectional) {
            this.setText('  ►  ', {repeat: true, attributes: {fill: 'red', size: 20}})
        }
    }
});