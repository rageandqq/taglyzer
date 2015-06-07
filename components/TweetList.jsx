var TweetList = React.createClass({
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
    <div>
      <div className="list-group" id="tweetList">
      {
        this.props.tweetList.map(function(tweet) {
          return <Tweet key={tweet.id} val={tweet.text} />;
        })
      }
      </div>
      <div className="row">
        <div className="input-group">
          <span className="input-group-addon">
            <input type="checkbox" checked={this.state.autoScrollTweets} onChange={this.handleAutoScrollChange} />
          </span>
          <input type="text" value="Auto scroll" className="form-control" aria-label=".." readonly/>
        </div>
      </div> 
    </div>
    );
  }
});

var Tweet = React.createClass({
  render : function() {
    return <a className="list-group-item">{this.props.val}</a>;
  }
});


