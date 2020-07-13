import React from 'react'
import { createLeak } from 'redux/actions/leak'
import LeakForm from './leak_form'
import { connect } from 'react-redux'

class newLeak extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: false,
      period: 60,
      add: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  handleToggle () {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: '',
      enable: false,
      period: 60,
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <LeakForm
        onSubmit={this.handleSubmit}
        macros={this.props.macros}
      />
    )
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      endpoint_id: values.endpoint_id,
      enable: values.enable,
      period: parseInt(values.period),
      expected_heartbeat_frequency: parseInt(values.expected_heartbeat_frequency),
      on_status_zero_macro: values.on_status_zero_macro,
      on_status_one_macro:values.on_status_one_macro,
      disable_on_alert: values.disable_on_alert,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      },
    }
    this.props.createLeak(payload)
    this.handleToggle()
  }

  render () {
    return (
      <div className='list-group-item add-leak'>
        <input id='add_new_leak_sensor' type='button' value={this.state.add ? '-' : '+'} onClick={this.handleToggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createLeak: (a) => dispatch(createLeak(a))
  }
}

const New = connect(null, mapDispatchToProps)(newLeak)
export default New
