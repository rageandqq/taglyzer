var Dashboard = React.createClass({displayName: "Dashboard",
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
              tweetHistory : 50 //show no more than 100 tweets
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
      tweetCount : 0
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

        React.createElement("div", null, 
          React.createElement("div", {className: "jumbotron"}, 
            React.createElement("div", {className: "container-fluid"}, 
              React.createElement("div", {className: "col-lg-2 col-sm-2"}, 
                React.createElement("h1", null, this.props.appName)
              ), 

              React.createElement("div", {className: "col-lg-10 col-sm-10"}, 
                React.createElement("div", {className: "row"}, 
                  React.createElement("div", {className: "form-group"}, 
                    React.createElement("div", {className: "input-group"}, 
                      React.createElement("span", {className: "input-group-addon"}, "#"), 
                      React.createElement("input", {className: "form-control", type: "text", value: this.state.searchTerm, onChange: this.handleSearchTermChange}), 
                      React.createElement("span", {className: "input-group-btn"}, 
                        React.createElement("button", {className: "btn btn-default", type: "button", id: "search-button", onClick: this.search}, "Analyze")
                      )
                    )
                  )
                )
              )
            )
          ), 

          React.createElement("div", {className: "container-fluid"}, 
            React.createElement("div", {className: "col-lg-3"}, 
              React.createElement("div", {className: "panel panel-default"}, 
                React.createElement(TweetList, {tweetList: this.state.tweetList})
              )
            ), 
            React.createElement("div", {className: "col-lg-9"}, 
              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-lg-6"}, 
                  React.createElement("div", {className: "panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Velocity (tweets/second)")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement("p", null, "Velocity ", this.state.tweetVelocity), 
                      React.createElement(RealTimeChart, {ref: "velChart", data: this.state.tweetVelocity, dataType: "velocity", chartType: "area"})
                    )
                  )
                ), 
                React.createElement("div", {className: "col-lg-6"}, 
                  React.createElement("div", {className: "panel-default"}, 
                    React.createElement("div", {className: "panel-heading"}, 
                      React.createElement("h3", {className: "panel-title"}, "Acceleration (tweets/second", React.createElement("sup", null, "2"), ")")
                    ), 
                    React.createElement("div", {className: "panel-body"}, 
                      React.createElement("p", null, "Acceleration ", this.state.tweetAcceleration), 
                      React.createElement(RealTimeChart, {ref: "accelChart", data: this.state.tweetAcceleration, dataType: "acceleration", chartType: "line"})
                    )
                  )
                )
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
      axes : ['bottom', 'left'],
      height: 300
    });
    this.setState({epoch : chart});
  },
  componentDidMount : function() {
    this.resetChart();
  },
  render : function() {
    return (
      React.createElement("div", {id: this.props.dataType+'Chart', className: "real-time-chart"})
    );
  }
});

var TweetList = React.createClass({displayName: "TweetList",
  componentWillMount : function() {
    this.setState(this.getInitialState());
  },
  getInitialState : function() {
    return {
      autoScrollTweets : true
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
    return (
    React.createElement("div", {className: "panel-body"}, 
      React.createElement("div", {className: "list-group", id: "tweetList"}, 
      
        this.props.tweetList.map(function(tweet) {
          return React.createElement(Tweet, {key: tweet.id, val: tweet.text});
        })
      
      ), 
      React.createElement("div", {className: "panel-footer"}, 
        React.createElement("div", {className: "input-group"}, 
          React.createElement("span", {className: "input-group-addon"}, 
            React.createElement("input", {type: "checkbox", checked: this.state.autoScrollTweets, onChange: this.handleAutoScrollChange})
          ), 
          React.createElement("input", {type: "text", value: "Auto scroll", className: "form-control", "aria-label": "..", readOnly: true})
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


