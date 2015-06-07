var Dashboard = React.createClass({displayName: "Dashboard",
  getInitialState : function() {
    return {
              loading : false,
              socket : null,
              searchTerm : "",
              tweetList : [],
              lastSearchedTerm : "",
              lastUpdateTime : new Date(),
              lastUpdateCount : 0,
              tweetVelocity : 0,
              tweetAcceleration : 0,
              tweetCount : 0,
              tweetHistory : 50, //show no more than 100 tweets
              retweetCount : 0,
              retweetPercentage : 0,
              characterUsePercentage : 0,
              characterCount : 0,
              hashtagCount : 0,
              hashtagAverage: 0
           };
  },
  componentDidMount : function() {
    var self = this;

    var socketConnection = io();
    this.setState({ socket : socketConnection});

    socketConnection.on('tweet', function(data) {
      self.handleIncomingTweet(data);
    });

  },
  handleIncomingTweet : function(message) {
    if (this.state.lastSearchedTerm == message.hashtag) {
      return;
    }
    var data = message.data;
    if (this.state.loading) {
      this.resetTweets(false);
    }

    this.addTweet(data);
    this.updateRetweetCount(data);
    this.updateCharacterCount(data);
    this.updateHashtagCount(data);

    var now = new Date();
    var delta = Math.abs(this.state.lastUpdateTime.getTime() - now.getTime());
    if (delta >= 1000) {
      this.updateAcceleration(delta); //update acceleration before velocity is updated
      this.updateVelocity(delta);
      this.setState({
        lastUpdateTime : now,
        lastUpdateCount : this.state.tweetCount
      });
    }
  },
  addTweet : function(data) {
    var list = this.state.tweetList;
    var count = this.state.tweetCount;
    list.push(data);
    count++;
    if (list.length > this.state.tweetHistory) {
      list.shift();
    }
    this.setState({tweetList : list, tweetCount: count});
  },
  resetTweets : function(isLoading) {
    var localState = {
      tweetList : [],
      loading : false,
      tweetVelocity : 0,
      tweetAcceleration : 0,
      lastUpdateTime : new Date(),
      lastUpdateCount : 0,
      tweetCount : 0,
      retweetCount : 0,
      retweetPerce : 0,
      characterUsePercentage : 0,
      characterCount : 0
    }
    if (isLoading) {
      localState.tweetList.push({text:"LOADING"});
      localState.loading = true;
    }
    this.setState(localState);
  },
  updateRetweetCount : function(data) {
    var rCount = this.state.retweetCount;
    var updatedRCount = rCount + ((data.retweeted_status != null)?1:0);
    this.setState({ 
      retweetCount : updatedRCount,
      retweetPercentage : updatedRCount/this.state.tweetCount
    });
  },
  updateCharacterCount : function(data) {
    var cCount = this.state.characterCount;
    var updatedCCount = cCount = cCount + data.text.length;
    this.setState({
      characterCount : updatedCCount,
      characterUsePercentage : updatedCCount/(144 * this.state.tweetCount) //max # characters
    });
  },
  updateHashtagCount : function(data) {
    var hCount = this.state.hashtagCount;
    var updatedHCount = hCount + data.entities.hashtags.length;
    this.setState({
      hashtagCount : updatedHCount,
      hashtagAverage : updatedHCount/this.state.tweetCount
    });
  },
  search : function() {
    var self = this;
    var socket = this.state.socket;
    if (socket != null && this.state.lastSearchedTerm != this.state.searchTerm) {
      this.setState({lastSearchedTerm : this.state.searchTerm});
      this.resetTweets(true);
      ['accelChart', 'velChart', 'characterGauge', 'retweetGauge', 'hashtagChart']
        .forEach(function(chart) {
          self.refs[chart].resetChart();
        });
      socket.emit('analyze', this.state.searchTerm);
    }
  },
  handleSearchTermChange : function(event) {
    this.setState({searchTerm : event.target.value});
  },
  updateVelocity : function(delta) {
    var tweetCount = this.state.tweetCount;
    var vel = (tweetCount - this.state.lastUpdateCount)/(delta/1000);
    this.setState({
      tweetVelocity : vel
    });
  },
  updateAcceleration : function(delta) {
    var tweetCount = this.state.tweetCount;
    var vel = (tweetCount - this.state.lastUpdateCount)/(delta/1000);
    var accel = (vel - this.state.tweetVelocity)/(delta/1000);
    this.setState({
      tweetAcceleration : accel
    });
  },
  parseTweetCoordinates : function(f) {
    if (f.coordinates == null) {
      f.coordinates = f.retweeted_status.coordinates
    }
    return {
      lng : parseFloat(f.coordinates.coordinates[0]),
      lat : parseFloat(f.coordinates.coordinates[1]),
      value: 1,
      key : parseFloat(f.coordinates.coordinates[0]) + ';' + parseFloat(f.coordinates.coordinates[1]) ,
    }
  },
  render : function() {
    return (

        React.createElement("div", null, 
          React.createElement("div", {className: "jumbotron"}, 
            React.createElement("div", {className: "container-fluid"}, 

              React.createElement("div", {className: "row"}, 
                React.createElement("h1", {className: "text-center"}, this.props.appName)
              ), 

              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-2 col-md-4"}

                ), 
                React.createElement("div", {className: "col-sm-10 col-md-4"}, 
                  React.createElement("div", {className: "form-group"}, 
                    React.createElement("div", {className: "input-group"}, 
                      React.createElement("span", {className: "input-group-addon"}, "#"), 
                      React.createElement("input", {className: "form-control", type: "text", value: this.state.searchTerm, onChange: this.handleSearchTermChange}), 
                      React.createElement("span", {className: "input-group-btn"}, 
                        React.createElement("button", {className: "btn btn-default", type: "button", id: "search-button", onClick: this.search}, "Analyze")
                      )
                    )
                  )
                ), 
                React.createElement("div", {className: "col-sm-2 col-md-4"}

                )
              )
            )
          ), 

          React.createElement("div", {className: "container-fluid"}, 
            React.createElement("div", {className: "col-sm-12 col-md-2"}, 
              React.createElement(TweetList, {tweetList: this.state.tweetList, tweetCount: this.state.tweetCount})
            ), 
            React.createElement("div", {className: "cols-sm-12 col-md-10"}, 
              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-12 col-md-6"}, 
                  React.createElement(TweetMap, {coordinates: this.state.tweetList.filter(function(f) {
                    return f.coordinates != null || 
                      (f.retweeted_status != null && f.retweeted_status.coordinates != null);
                  }).map(this.parseTweetCoordinates)
                    .reduce(function(tweet1, tweet2) {
                      var index = -1;
                      for (var i = 0; i < tweet1.length; i++) {
                        if (tweet1[i].key == tweet2.key) {
                          index = i;
                          break;
                        }
                      }
                      if (index != -1) {
                        tweet1[index].value++;
                      }
                      else
                        tweet1.push(tweet2);
                      return tweet1;
                    }, [])})
                ), 
                React.createElement("div", {className: "col-sm-12 col-md-6"}, 
                  React.createElement("div", {className: "panel panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Hashtags per Tweet")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement(RealTimeChart, {ref: "hashtagChart", data: this.state.hashtagAverage, dataType: "hashtag", chartType: "bar"})
                    )
                  )
                )
              ), 
              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-12 col-md-6"}, 
                  React.createElement("div", {className: "panel panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Velocity (tweets/second)")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement("h4", {className: "text-center"}, "Current Velocity: ", this.state.tweetVelocity), 
                      React.createElement(RealTimeChart, {ref: "velChart", data: this.state.tweetVelocity, dataType: "velocity", chartType: "area"})
                    )
                  )
                ), 
                React.createElement("div", {className: "col-sm-12 col-md-6"}, 
                  React.createElement("div", {className: "panel panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Acceleration (tweets/second", React.createElement("sup", null, "2"), ")")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement("h4", {className: "text-center"}, "Current Acceleration: ", this.state.tweetAcceleration), 
                      React.createElement(RealTimeChart, {ref: "accelChart", data: this.state.tweetAcceleration, dataType: "acceleration", chartType: "line"})
                    )
                  )
                )
              ), 
              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-md-6"}, 
                  React.createElement("div", {className: "panel panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Retweet Percentage")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement(RealTimeGauge, {ref: "retweetGauge", data: this.state.retweetPercentage, dataType: "retweet"})
                    )
                  )
                ), 
                React.createElement("div", {className: "col-sm-12 col-md-6"}, 
                  React.createElement("div", {className: "panel panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Average Character Use (out of 144)")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement(RealTimeGauge, {ref: "characterGauge", data: this.state.characterUsePercentage, dataType: "character"})
                    )
                  )
                )
              ), 
              React.createElement("div", {className: "row"}
              )
            )
          )
        )
    );
  }
});

var RealTimeChart = React.createClass({displayName: "RealTimeChart",
  getInitialState : function() {
    return {
      epoch : null,
      data : 0
    }
  },
  componentWillReceiveProps : function(props) {
    var chart = this.state.epoch;
    if (chart != null && this.state.data != props.data) {
      var now = new Date();
      chart.push([{time:now.getTime()/1000, y:props.data}]);
      this.setState({data : props.data});
    }
  },
  resetChart : function() {
    var now = new Date();
    var chart = $('#' + this.props.dataType + 'Chart').epoch({
      type : 'time.' + this.props.chartType,
      data : [{
        label : this.props.dataType,
        values : [ { time: now.getTime()/1000, y: 0 }]
      }],
      axes : ['bottom', 'left']
    });
    this.setState({epoch : chart});
  },
  componentDidMount : function() {
    this.resetChart();
  },
  render : function() {
    return (
      React.createElement("div", {id: this.props.dataType+'Chart', className: "real-time-chart epoch category10"})
    );
  }
});

var RealTimeGauge = React.createClass({displayName: "RealTimeGauge",
  getInitialState : function() {
    return {
      epoch : null,
      data : 0
    }
  },
  componentWillReceiveProps : function(props) {
    var chart = this.state.epoch;
    if (chart != null && this.state.data != props.data) {
      chart.push(props.data);
      this.setState({data : props.data});
    }
  },
  resetChart : function() {
    var now = new Date();
    var chart = $('#' + this.props.dataType + 'Gauge').epoch({
      type : 'time.gauge',
      data : 0
    });
    this.setState({epoch : chart, data : 0});
  },
  componentDidMount : function() {
    this.resetChart();
  },
  render : function() {
    return (
      React.createElement("div", {id: this.props.dataType + 'Gauge', className: "real-time-chart"})
    );
  }
});

var TweetList = React.createClass({displayName: "TweetList",
  componentWillMount : function() {
    this.setState(this.getInitialState());
  },
  getInitialState : function() {
    return {
      autoScrollTweets : false,
    }   
  },
  handleAutoScrollChange : function(event) {
    this.setState({autoScrollTweets : event.target.checked});
  },
  render : function() {
    var domElem = $('#tweetList');
    if (this.state.autoScrollTweets && domElem != null && domElem[0] != null) {
      $("#tweetList").scrollTop($("#tweetList")[0].scrollHeight);
    }
    var salt = 0;
    return (
    React.createElement("div", {className: "panel panel-default"}, 
      React.createElement("div", {className: "panel-heading"}, 
        React.createElement("h3", {className: "panel-title"}, "Tweets")
      ), 
      React.createElement("div", {className: "panel-body"}, 
        React.createElement("div", {className: "list-group", id: "tweetList"}, 
        
          this.props.tweetList.map(function(tweet) {
            salt++;
            return React.createElement(Tweet, {key: salt + '' + tweet.id, val: tweet.text});
          })
        
        ), 
        React.createElement("div", {className: "panel-footer"}, 
          React.createElement("div", {className: "input-group"}, 
            React.createElement("span", {className: "input-group-addon"}, 
              React.createElement("input", {type: "checkbox", checked: this.state.autoScrollTweets, onChange: this.handleAutoScrollChange})
            ), 
            React.createElement("input", {type: "text", value: "Auto scroll", className: "form-control", "aria-label": "..", readOnly: true})
          ), 
          React.createElement("div", {className: "input-group"}, 
            React.createElement("span", {className: "input-group-addon"}, 
              "Tweets:"
            ), 
            React.createElement("input", {type: "text", value: Math.max(this.props.tweetCount - 1,0), className: "form-control", "aria-label": "..", readOnly: true})
          )
        )
      )
    )
    );
  }
});

var Tweet = React.createClass({displayName: "Tweet",
  render : function() {
    return React.createElement("a", {className: "list-group-item"}, this.props.val);
  }
});



var TweetMap = React.createClass({displayName: "TweetMap",
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
        React.createElement("div", {className: "panel panel-default"}, 
          React.createElement("div", {className: "panel-heading"}, 
            React.createElement("h3", {className: "panel-title"}, " Tweet Distribution")
          ), 
          React.createElement("div", {className: "panel-body"}, 
            React.createElement("div", {id: "tweetMap", className: "center-block"})
          )
        )
      );
  }
});
