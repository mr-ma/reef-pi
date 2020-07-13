import React from 'react'
import New from './new'
import LeakForm from './leak_form'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import { fetchLeaks, deleteLeak, updateLeak } from 'redux/actions/leak'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { confirm, showModal } from 'utils/confirm'
import ReportsModal from './reports_modal'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.probeList = this.probeList.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleShowSchedules = this.handleShowSchedules.bind(this)
  }

  componentDidMount () {
    this.props.fetchLeaks()
    if(this.props.leaks == null) {
      this.props.leaks = [];
    }
  }
  handleShowSchedules(e, leak){
    e.stopPropagation()
    showModal(<ReportsModal leak={leak}  reports={leak.states}/>)
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      endpoint_id: values.endpoint_id,
      enable: values.enable,
      expected_heartbeat_frequency: parseInt(values.expected_heartbeat_frequency),
      period: parseInt(values.period),
      on_status_one_macro:values.on_status_one_macro,
      on_status_zero_macro: values.on_status_zero_macro,
      disable_on_alert: values.disable_on_alert,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      },
    }
    this.props.update(values.id, payload)
  }

  handleDelete (probe) {
    const message = (
      <div>
        <p>
          {i18next.t('leak:warn_delete')} {probe.name}.
        </p>
      </div>
    )

    confirm('Delete ' + probe.name, { description: message }).then(
      function () {
        this.props.delete(probe.id)
      }.bind(this)
    )
  }

  probeList () {
    return this.props.leaks.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) })
    .map( probe => {
      const buttons = []
      buttons.push(
        <button
          type='button' name={'schedules-' + probe.id}
          className='btn btn-sm btn-outline-info float-right'
          disabled={!probe.enable}
          onClick={(e) => this.handleShowSchedules(e, probe)}
          key='run'
        >
          {'Reports'}
        </button>
      )
      const handleToggleState = () => {
        probe.enable = !probe.enable
        this.props.update(probe.id, probe)
      }
      return (
        <Collapsible
          key={'panel-leak-' + probe.id}
          name={'panel-leak-' + probe.id}
          item={probe}
          buttons={buttons}
          title={<b className='ml-2 align-middle'>{probe.name} </b>}
          onDelete={this.handleDelete}
          onToggleState={handleToggleState}
          enabled={probe.enable}
        >
          <LeakForm
            data={probe}
            onSubmit={this.handleSubmit}
            macros={this.props.macros}
          />
        </Collapsible>
      )
    })
  }

  render () {
    return (
      <div>
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <New
            macros={this.props.macros}
          />
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    leaks: state.leaks,
    macros: state.macros
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchLeaks: () => dispatch(fetchLeaks()),
    delete: id => dispatch(deleteLeak(id)),
    update: (id, a) => dispatch(updateLeak(id, a))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
