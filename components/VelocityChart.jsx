var VelocityChart = React.createClass({
  getInitialState : function() {
    return {
      epoch : null,
      velocity : 0
    }
  },
  componentWillReceiveProps : function(props) {
    var chart = this.state.epoch;
    if (chart != null && this.state.velocity != props.velocity) {
      var now = new Date();
      chart.push([{time:now.getTime(), y:props.velocity}]);
      this.setState({velocity : props.velocity});
    }
  },
  componentDidMount : function() {
    var now = new Date();
    var chart = $('#velocityChart').epoch({
      type : 'time.area',
      data : [{
        label : "Velocity",
        values : [ { time: now.getTime(), y: 0 }]
      }],
      axes : ['bottom', 'left']
    });
    this.setState({epoch : chart});
  },
  render : function() {
    return (
      <div id="velocityChart"></div>
    );
  }
});
