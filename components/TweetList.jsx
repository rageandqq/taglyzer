var TweetList = React.createClass({
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
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">Tweets</h3>
      </div>
      <div className="panel-body">
        <div className="list-group" id="tweetList">
        {
          this.props.tweetList.map(function(tweet) {
            salt++;
            return <Tweet key={salt + '' + tweet.id} val={tweet.text} />;
          })
        }
        </div>
        <div className="panel-footer">
          <div className="input-group">
            <span className="input-group-addon">
              <input type="checkbox" checked={this.state.autoScrollTweets} onChange={this.handleAutoScrollChange} />
            </span>
            <input type="text" value="Auto scroll" className="form-control" aria-label=".." readOnly/>
          </div>
          <div className="input-group">
            <span className="input-group-addon">
              Tweets:
            </span>
            <input type="text" value={this.state.loading?0:this.props.tweetCount} className="form-control" aria-label=".." readOnly/>
          </div>
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


