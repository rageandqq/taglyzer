var Dashboard = React.createClass({
  getInitialState : function() {
    return {
              loading : false,
              socket : null,
              searchTerm : "",
              tweetList : [],
              autoScrollTweets : true,
              lastSearchedTerm : "",
              lastVelUpdateTime : new Date()
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
  },
  addTweet : function(data) {
    var list = this.state.tweetList;
    list.push(data);
    this.setState({tweetList : list});
  },
  resetTweets : function(isLoading) {
    var localState = {
      tweetList : [],
      loading : false
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
  render : function() {
    return (

        <div>
          <div className="jumbotron">
            <div className="container-fluid">
              <div className="col-lg-3 col-sm-3">
                <h1>{this.props.appName}</h1>
              </div>

              <div className="col-lg-9 col-sm-9">
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
              <div className="row">
                <TweetList tweetList={this.state.tweetList} />
              </div>
            </div>
            <div className="col-lg-9">

            </div>
          </div>

        </div>
    );
  }
});
