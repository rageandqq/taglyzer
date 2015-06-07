var Dashboard = React.createClass({
  getInitialState : function() {
    return {
              loading : false,
              socket : null,
              searchTerm : "",
              tweetList : [],
              autoScrollTweets : true,
              lastSearchedTerm : "",
              lastUpdateTime : new Date(),
              lastUpdateCount : 0,
              tweetVelocity : 0,
              tweetAcceleration : 0,
              tweetCount : 0,
              tweetHistory : 50, //show no more than 100 tweets
              retweetCount : 0,
              retweetPercentage : 0
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
    console.log(data);
    var list = this.state.tweetList;
    var count = this.state.tweetCount;
    list.push(data);
    count++;
    if (list.length > this.state.tweetHistory) {
      list.unshift();
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
      retweetPerce : 0
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
  search : function() {
    var socket = this.state.socket;
    if (socket != null && this.state.lastSearchedTerm != this.state.searchTerm) {
      this.setState({lastSearchedTerm : this.state.searchTerm});
      this.resetTweets(true);
      this.refs['accelChart'].resetChart();
      this.refs['velChart'].resetChart();
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
  render : function() {
    return (

        <div>
          <div className="jumbotron">
            <div className="container-fluid">
              <div className="col-lg-2 col-sm-2">
                <h1>{this.props.appName}</h1>
              </div>

              <div className="col-lg-10 col-sm-10">
                <div className="row">
                  <div className="form-group">
                    <div className="input-group">
                      <span className="input-group-addon">#</span>
                      <input className="form-control" type="text" value={this.state.searchTerm} onChange={this.handleSearchTermChange}/>
                      <span className="input-group-btn">
                        <button className="btn btn-default" type="button" id="search-button" onClick={this.search}>Analyze</button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-fluid">
            <div className="col-lg-3">
              <div className="panel panel-default">
                <TweetList tweetList={this.state.tweetList} />
              </div>
            </div>
            <div className="col-lg-9">
              <div className="row">
                <div className="col-lg-6">
                  <div className="panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Velocity (tweets/second)</h3>
                    </div>
                    <div className="panel-body">
                      <p>Velocity {this.state.tweetVelocity}</p>
                      <RealTimeChart ref="velChart" data={this.state.tweetVelocity} dataType="velocity" chartType="area"/>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Acceleration (tweets/second<sup>2</sup>)</h3>
                    </div>
                    <div className="panel-body">
                      <p>Acceleration {this.state.tweetAcceleration}</p>
                      <RealTimeChart ref="accelChart" data={this.state.tweetAcceleration} dataType="acceleration" chartType="line"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4">
                  <div className="panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Retweet Percentage</h3>
                    </div>
                    <div className="panel-body">
                      <RealTimeGauge ref="retweetGauge" data={this.state.retweetPercentage} dataType="retweet"/>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">

                </div>
                <div className="col-lg-4">

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
