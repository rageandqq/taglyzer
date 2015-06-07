var Dashboard = React.createClass({
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

    if (this.hasCoordinates(data)) {
      this.addToTweetMap(data);
    }

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
    if (data.text == null) {
      return;
    }
    var cCount = this.state.characterCount;
    var updatedCCount = cCount + data.text.length;
    this.setState({
      characterCount : updatedCCount,
      characterUsePercentage : updatedCCount/(144 * this.state.tweetCount) //max # characters
    });
  },
  updateHashtagCount : function(data) {
    if (data.entities == null || data.entities.hashtags == null) {
      return;
    }
    var hCount = this.state.hashtagCount;
    var updatedHCount = hCount + data.entities.hashtags.length;
    this.setState({
      hashtagCount : updatedHCount,
      hashtagAverage : updatedHCount/this.state.tweetCount
    });
  },
  search : function(event) {
    event.preventDefault();
    var self = this;
    var socket = this.state.socket;
    if (socket != null && this.state.lastSearchedTerm != this.state.searchTerm) {
      this.setState({lastSearchedTerm : this.state.searchTerm});
      this.resetTweets(true);
      ['accelChart', 'velChart', 'characterGauge', 'retweetGauge', 'hashtagChart']
        .forEach(function(chart) {
          self.refs[chart].resetChart();
        });
      this.refs['tweetMap'].resetMap();
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
      if (f.retweeted_status != null && f.retweeted_status.coordinates != null) {
        f.coordinates = f.retweeted_status.coordinates
      }
      else {
        f.coordinates = { //parse to same format as from coordinates/retweeted_status
          coordinates : [
              f.place.bounding_box.coordinates[0][0],
              f.place.bounding_box.coordinates[0][1]
            ]
        }
      }
    }
    return {
      lng : parseFloat(f.coordinates.coordinates[0]),
      lat : parseFloat(f.coordinates.coordinates[1]),
      value: 1,
      key : parseFloat(f.coordinates.coordinates[0]) + ';' + parseFloat(f.coordinates.coordinates[1]) ,
    }
  },
  addToTweetMap : function(data) {
    var coordinates = this.parseTweetCoordinates(data);
    this.refs['tweetMap'].addPoint(coordinates);
  },
  hasCoordinates : function(tweet) {
    return tweet.coordinates != null || (tweet.retweeted_status != null && tweet.retweeted_status.coordinates != null) || (tweet.place != null);
  },
  render : function() {
    return (

        <div>
          <div className="jumbotron">
            <div className="container-fluid">

              <div className="row">
                <h1 className="text-center">{this.props.appName}</h1>
              </div>

              <div className="row">
                <div className="col-sm-2 col-md-4">

                </div>
                <div className="col-sm-10 col-md-4">
                  <form onSubmit={this.search}>
                    <div className="form-group">
                      <div className="input-group">
                        <span className="input-group-addon">#</span>
                        <input className="form-control" type="text" value={this.state.searchTerm} onChange={this.handleSearchTermChange}/>
                        <span className="input-group-btn">
                          <button className="btn btn-default" type="button" id="search-button" onClick={this.search}>Analyze</button>
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col-sm-2 col-md-4">

                </div>
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="col-sm-12 col-md-2">
              <TweetList loading={this.state.loading} tweetList={this.state.tweetList} tweetCount={this.state.tweetCount} />
            </div>
            <div className="cols-sm-12 col-md-10">
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <TweetMap ref="tweetMap" />
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Hashtags per Tweet</h3>
                    </div>
                    <div className="panel-body">
                      <RealTimeChart ref="hashtagChart" data={this.state.hashtagAverage} dataType="hashtag" chartType="bar"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Velocity (tweets/second)</h3>
                    </div>
                    <div className="panel-body">
                      <h4 className="text-center">Current Velocity: {this.state.tweetVelocity}</h4>
                      <RealTimeChart ref="velChart" data={this.state.tweetVelocity} dataType="velocity" chartType="area"/>
                    </div>
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Acceleration (tweets/second<sup>2</sup>)</h3>
                    </div>
                    <div className="panel-body">
                      <h4 className="text-center">Current Acceleration: {this.state.tweetAcceleration}</h4>
                      <RealTimeChart ref="accelChart" data={this.state.tweetAcceleration} dataType="acceleration" chartType="line"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Retweet Percentage</h3>
                    </div>
                    <div className="panel-body">
                      <RealTimeGauge ref="retweetGauge" data={this.state.retweetPercentage} dataType="retweet"/>
                    </div>
                  </div>
                </div>
                <div className="col-sm-12 col-md-6">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Average Character Use (out of 144)</h3>
                    </div>
                    <div className="panel-body">
                      <RealTimeGauge ref="characterGauge" data={this.state.characterUsePercentage} dataType="character"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
              </div>
            </div>
          </div>
        </div>
    );
  }
});
