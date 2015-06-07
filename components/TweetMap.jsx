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
  componentWillReceiveProps : function(props) {
    var mapLayer = this.state.heatmapLayer;
    var tweetData = this.state.tweetData;
    if (mapLayer != null && Array.isArray(tweetData.data) && tweetData.data.length != props.coordinates.length) {
      tweetData.data = props.coordinates;
      mapLayer.setData(tweetData);
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
