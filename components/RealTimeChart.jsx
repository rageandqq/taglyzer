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
      <div id={this.props.dataType+'Chart'} className="real-time-chart epoch category10"></div>
    );
  }
});
