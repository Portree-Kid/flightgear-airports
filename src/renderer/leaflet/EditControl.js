/* eslint-disable */
L.EditControl = L.Control.extend({

    options: {
        position: 'topleft',
        callback: null,
        kind: '',
        html: '<i class="fas fa-draw-polygon"></i>',
        tooltip: 'tooltip'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);

        link.href = '#';
        link.title = this.options.tooltip;
        link.innerHTML = this.options.html;
        link.callback = this.options.callback;
        link.addEventListener('click',function (event) {
            event.stopPropagation();
            event.preventDefault(); 
            event.stopImmediatePropagation();               
        }, false);
        link.addEventListener('mousedown',function (event) {
            event.stopPropagation();
            event.preventDefault(); 
            event.stopImmediatePropagation();               
            window.LAYER = this.callback.call(map.editTools);
        }, false);
        link.addEventListener('mouseup',function (event) {
            event.stopPropagation();
            event.preventDefault(); 
            event.stopImmediatePropagation();               
        }, false);
        return container;
    }
});


L.NewMarkerControl = L.EditControl.extend({
    options: {
        position: 'topright',
        callback: null,
        kind: 'marker',
        html: '🖈'
    }

});
