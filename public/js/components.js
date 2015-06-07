var Dashboard = React.createClass({displayName: "Dashboard",
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

        React.createElement("div", null, 
          React.createElement("div", {className: "jumbotron"}, 
            React.createElement("div", {className: "container-fluid"}, 
              React.createElement("div", {className: "col-lg-3 col-sm-3"}, 
                React.createElement("h1", null, this.props.appName)
              ), 

              React.createElement("div", {className: "col-lg-9 col-sm-9"}, 
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
              React.createElement("div", {className: "row"}, 
                React.createElement(TweetList, {tweetList: this.state.tweetList})
              )
            ), 
            React.createElement("div", {className: "col-lg-9"}

            )
          )

        )
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
    React.createElement("div", null, 
      React.createElement("div", {className: "list-group", id: "tweetList"}, 
      
        this.props.tweetList.map(function(tweet) {
          return React.createElement(Tweet, {key: tweet.id, val: tweet.text});
        })
      
      ), 
      React.createElement("div", {className: "row"}, 
        React.createElement("div", {className: "input-group"}, 
          React.createElement("span", {className: "input-group-addon"}, 
            React.createElement("input", {type: "checkbox", checked: this.state.autoScrollTweets, onChange: this.handleAutoScrollChange})
          ), 
          React.createElement("input", {type: "text", value: "Auto scroll", className: "form-control", "aria-label": "..", readonly: true})
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


