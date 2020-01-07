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
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                window.LAYER = this.options.callback.call(map.editTools);
            }, this);

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
