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
                      React.createElement(RealTimeChart, {data: this.state.tweetVelocity, type: "velocity"})
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
                      React.createElement(RealTimeChart, {data: this.state.tweetAcceleration, type: "acceleration"})
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
  componentDidMount : function() {
    var now = new Date();
    var chart = $('#' + this.props.type + 'Chart').epoch({
      type : 'time.area',
      data : [{
        label : this.props.type,
        values : [ { time: now.getTime()/1000, y: 0 }]
      }],
      axes : ['bottom', 'left']
    });
    this.setState({epoch : chart});
  },
  render : function() {
    return (
      React.createElement("div", {id: this.props.type+'Chart'})
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
  componentDidMount : function() {
    var now = new Date();
    var chart = $('#' + this.props.type + 'Chart').epoch({
      type : 'time.area',
      data : [{
        label : this.props.type,
        values : [ { time: now.getTime()/1000, y: 0 }]
      }],
      axes : ['bottom', 'left'],
      height: 300
    });
    this.setState({epoch : chart});
  },
  render : function() {
    return (
      React.createElement("div", {id: this.props.type+'Chart'})
    );
  }
});
