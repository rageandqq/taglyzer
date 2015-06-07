var Dashboard = React.createClass({
  getInitialState : function() {
    return {
              loading : false,
              socket : null,
              searchTerm : "",
              tweetList : [],
              autoScrollTweets : true
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
  handleIncomingTweet : function(data) {
    if (this.state.loading) {
      this.reset();
    }
    this.addTweet(data);
  },
  addTweet : function(data) {
    var list = this.state.tweetList;
    list.push(data);
    this.setState({tweetList : list});
  },
  reset : function() {
    this.setState(this.getInitialState());
  },
  search : function() {
    var socket = this.state.socket;
    if (socket != null) {
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
