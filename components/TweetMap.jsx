var TweetMap = React.createClass({
  getInitialState : function() {
    return {
      tweetData : {
        max : 100,
        data : []
      },
      heatmapLayer : null
    }
  },
  componentDidMount : function() {
    var self = this;
    var baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '...',
          maxZoom : 18
        }
    );

    var cfg = {
      'radius': 2,
      'maxOpacity': .8, 
      'scaleRadius': true, 
      'useLocalExtrema': true,
      latField: 'lat',
      lngField: 'lng',
    };

    var heatmapLayer = new HeatmapOverlay(cfg);

    var map = L.map('tweetMap', {
      center : new L.LatLng(25.6856, -80.3568),
      zoom : 1,
      layers: [baseLayer, heatmapLayer]
    });

    self.setState({heatmapLayer : heatmapLayer});
  },
  resetMap : function() {
    var mapLayer = this.state.heatmapLayer;
    if (mapLayer != null) {
      var tweetData = this.getInitialState().tweetData;
      mapLayer.setData(tweetData);
      this.setState({
        heatmapLayer : mapLayer,
        tweetData : tweetData
      });
    }
  },
  addPoint : function(coords) {
    var data = this.state.tweetData.data;
    var index = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].key == coords.key) {
        index = i;
        break;
      }
    }

    if (index != -1) {
      data[i].value++;
      var mapLayer = this.state.heatmapLayer;
      if (mapLayer != null)
        mapLayer.setData(data); 
    }
    else {
      var mapLayer = this.state.heatmapLayer;
      if (mapLayer != null)
        mapLayer.addData(coords); 
      data.push(coords);
    }
    this.setState({tweetData: {
      max : this.state.tweetData.max,
      data : data
    }});
  },
  render : function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title"> Tweet Distribution</h3>
          </div>
          <div className="panel-body">
            <div id="tweetMap" className="center-block" ></div>
          </div>
        </div>
      );
  }
});
