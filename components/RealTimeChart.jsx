var RealTimeChart = React.createClass({
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
      <div id={this.props.type+'Chart'}></div>
    );
  }
});
