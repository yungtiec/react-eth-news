import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import googleTrendsActions from '../store/googleTrends/actions';
import {getAllGoogleTrendsOverTime} from '../store/googleTrends/reducer';
import {TrendsChart} from '../components'


class TrendsChartWrapper extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  shouldComponentUpdate(nextProps) {
    if ((!this.props.allDataProvider || !this.props.allDataProvider.length) && nextProps.allDataProvider.length) return true
    else return false
  }

  componentDidMount() {
    this.props.dispatch(googleTrendsActions.fetchAllGoogleTrendsOverTime())
  }

  render() {
    return (

        <div >
          <TrendsChart
            dataProvider={this.props.allDataProvider}
          />
        </div>

    );
  }
}

function mapStateToProps(state) {
  return {
    allDataProvider: getAllGoogleTrendsOverTime(state)
  }
}

export default connect(mapStateToProps)(TrendsChartWrapper)
