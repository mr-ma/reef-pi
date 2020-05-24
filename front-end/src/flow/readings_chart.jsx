import React from 'react'
import { Area, Tooltip, YAxis, XAxis, LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts'
import { fetchFCUsage } from '../redux/actions/fcs'
import { connect } from 'react-redux'
import i18next from 'i18next'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetch(this.props.sensor_id)
    const timer = window.setInterval(() => { this.props.fetch(this.props.sensor_id) }, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.usage === undefined) {
      return (<div />)
    }
    if (this.props.config === undefined) {
      return (<div />)
    }
    const min = this.props.config.chart_min
    const max = this.props.config.chart_max
    let currentFlow = ''
    if (this.props.usage.current.length > 0) {
      currentFlow = parseFloat(this.props.usage.current[this.props.usage.current.length - 1].value).toFixed(2) + ' '+this.props.config.unit
    }
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name} - {i18next.t('flow:flow')} ({currentFlow})</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={this.props.usage.current}>
            {/* <defs>
              <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#00C851' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#007E33' stopOpacity={0} />
              </linearGradient>
            </defs> */}
            <XAxis dataKey='time' />
            <YAxis domain={[min, max]} unit={this.props.config.unit} dataKey="value" tickFormatter={value => parseFloat(value).toFixed(2)}/>
            {/* <YAxis domain={[min, max]} unit={this.props.config.unit} dataKey='value' /> */}
            {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5"/> */}
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
            <Tooltip />
            {/* <Area
              type='linear'
              dataKey='value'
              stroke='#007E33'
              isAnimationActive={false}
              fillOpacity={1}
              fill='url(#gradient)'
            /> */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.fcs.find((el) => { return el.id === ownProps.sensor_id }),
    usage: state.fc_usage[ownProps.sensor_id]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: (id) => dispatch(fetchFCUsage(id))
  }
}

const ReadingsChart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default ReadingsChart
