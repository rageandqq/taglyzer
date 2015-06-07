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
              tweetAcceleration : 0
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

    var now = new Date();
    var delta = Math.abs(this.state.lastUpdateTime.getTime() - now.getTime());
    if (delta >= 1000) {
      this.updateAcceleration(delta); //update acceleration before velocity is updated
      this.updateVelocity(delta);
      this.setState({
        lastUpdateTime : now,
        lastUpdateCount : this.state.tweetList.length
      });
    }
  },
  addTweet : function(data) {
    var list = this.state.tweetList;
    list.push(data);
    this.setState({tweetList : list});
  },
  resetTweets : function(isLoading) {
    var localState = {
      tweetList : [],
      loading : false,
      tweetVelocity : 0,
      tweetAcceleration : 0,
      lastUpdateTime : new Date(),
      lastUpdateCount : 0
    }
    if (isLoading) {
      localState.tweetList.push({text:"LOADING"});
      localState.loading = true;
    }
    this.setState(localState);
  },
  search : function() {
    var socket = this.state.socket;
    if (socket != null && this.state.lastSearchedTerm != this.state.searchTerm) {
      this.setState({lastSearchedTerm : this.state.searchTerm});
      this.resetTweets(true);
      socket.emit('analyze', this.state.searchTerm);
    }
  },
  handleSearchTermChange : function(event) {
    this.setState({searchTerm : event.target.value});
  },
  updateVelocity : function(delta) {
    var tweetCount = this.state.tweetList.length;
    var vel = (tweetCount - this.state.lastUpdateCount)/(delta/1000);
    this.setState({
      tweetVelocity : vel
    });
  },
  updateAcceleration : function(delta) {
    var tweetCount = this.state.tweetList.length;
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
                      <VelocityChart velocity={this.state.tweetVelocity}/>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
    );
  }
});
