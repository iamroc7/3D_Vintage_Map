require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/ElevationLayer",
  "esri/layers/BaseElevationLayer",
  "esri/layers/TileLayer"
], function(Map, SceneView, ElevationLayer, BaseElevationLayer, TileLayer) {
  var layer = new TileLayer({
    // URL points to a cached tiled map service hosted on ArcGIS Server
    url:
      "https://tiles.arcgis.com/tiles/1iEaN7ShrrAnHGzH/arcgis/rest/services/KotoSho/MapServer"
  });
  //////////////////////////////////////////////
  //
  //   Create a subclass of BaseElevationLayer
  //
  /////////////////////////////////////////////

  var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
    // Add an exaggeration property whose value will be used
    // to multiply the elevations at each tile by a specified
    // factor. In this case terrain will render 100x the actual elevation.

    properties: {
      exaggeration: 2.5
    },

    // The load() method is called when the layer is added to the map
    // prior to it being rendered in the view.

    load: function() {
      this._elevation = new ElevationLayer({
        url:
          "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
      });

      // wait for the elevation layer to load before resolving load()
      this.addResolvingPromise(this._elevation.load());
    },

    // Fetches the tile(s) visible in the view
    fetchTile: function(level, row, col) {
      // calls fetchTile() on the elevationlayer for the tiles
      // visible in the view
      return this._elevation.fetchTile(level, row, col).then(
        function(data) {
          var exaggeration = this.exaggeration;

          // `data` is an object that contains the
          // the width of the tile in pixels,
          // the height of the tile in pixels,
          // and the values of each pixel
          for (var i = 0; i < data.values.length; i++) {
            // each value represents an elevation sample for the
            // given pixel position in the tile. Multiply this
            // by the exaggeration value
            data.values[i] = data.values[i] * exaggeration;
          }

          return data;
        }.bind(this)
      );
    }
  });

  // Add the exaggerated elevation layer to the map's ground
  // in place of the default world elevation service
  var map = new Map({
    layers: [layer],
    ground: {
      layers: [new ExaggeratedElevationLayer()],
      surfaceColor: [0, 0, 0]
    },
    extent: {
      // autocasts as new Extent()
      XMin: 1.2899,
      YMin: 2199999.99,
      XMax: 1.3999,
      YMax: 3199999.9
    }
  });
  var view = new SceneView({
    container: "viewDiv",
    viewingMode: "local",
    map: map,
    environment: {
      background: {
        type: "color",
        color: [0, 0, 0]
      },
      starsEnabled: false,
      atmosphereEnabled: false
    },
    camera: {
      position: [
        121.57, // lon
        21.67, // lat
        33000 // elevation in meters
      ],
      heading: 5,
      tilt: 48
    }
  });
});