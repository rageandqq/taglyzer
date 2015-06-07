var RealTimeGauge = React.createClass({
  getInitialState : function() {
    return {
      epoch : null,
      data : 0
    }
  },
  componentWillReceiveProps : function(props) {
    var chart = this.state.epoch;
    if (chart != null && this.state.data != props.data) {
      chart.push(props.data);
      this.setState({data : props.data});
    }
  },
  resetChart : function() {
    var now = new Date();
    var chart = $('#' + this.props.dataType + 'Gauge').epoch({
      type : 'time.gauge',
      data : 0,
      height : 300
    });
    this.setState({epoch : chart, data : 0});
  },
  componentDidMount : function() {
    this.resetChart();
  },
  render : function() {
    return (
      <div id={this.props.dataType + 'Gauge'} className="real-time-chart"></div>
    );
  }
});
