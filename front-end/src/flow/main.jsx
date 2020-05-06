import React from 'react'
import FlowForm from './flow_form'
import { createFC, deleteFC, updateFC, fetchFCs, readFC } from 'redux/actions/fcs'
import { fetchInlets } from 'redux/actions/inlets'
import { connect } from 'react-redux'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import CalibrationModal from './calibration_modal'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addProbe: false,
      showCalibrate: false,
      currentProbe: null,
      defaultCalibrationPoint: ''
    }
    this.flowsensorList = this.flowsensorList.bind(this)
    this.handleToggleAddProbeDiv = this.handleToggleAddProbeDiv.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
    this.handleCalibrate = this.handleCalibrate.bind(this)
  }

  componentDidMount () {
    this.props.fetchpins()
    this.props.fetchFCs()
    this.props.probes.map(probe => {
      this.props.readFC(probe.id)
    })
  }

  handleToggleAddProbeDiv () {
    this.setState({
      addProbe: !this.state.addProbe
    })
  }

  valuesToProbe (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      min: parseFloat(values.min),
      max: parseFloat(values.max),
      pin: values.pin,
      period: parseInt(values.period),
      rate: parseFloat(values.rate),
      pulse_count: parseInt(values.pulse_count),
      unit: values.unit,
      notify: {
        enable: values.alerts,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      }
    }
    return payload
  }

  flowsensorList () {
    return this.props.probes
      .sort((a, b) => {
        return parseInt(a.id) < parseInt(b.id)
      })
      .map(flowsensor => {
        const calibrationButton = (
          <button
            type='button'
            name={'calibrate-flowsensor-' + flowsensor.id}
            className='btn btn-sm btn-outline-info float-right'
            onClick={e => this.calibrateProbe(e, flowsensor)}
          >
            {i18next.t('flow:calibrate')}
          </button>
        )
        const handleToggleState = () => {
          flowsensor.enable = !flowsensor.enable
          this.props.update(flowsensor.id, flowsensor)
        }
        return (
          <Collapsible
            key={'panel-flow-' + flowsensor.id}
            name={'panel-flow-' + flowsensor.id}
            item={flowsensor}
            buttons={calibrationButton}
            title={<b className='ml-2 align-middle'>{flowsensor.name} </b>}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={flowsensor.enable}
          >
            <FlowForm
              fc={flowsensor}
              showChart
              pins={this.props.pins}
              onSubmit={this.handleUpdate}
            />
          </Collapsible>
        )
      })
  }

  calibrateProbe (e, flowsensor) {
    let defaultValue = ''
    if (flowsensor.calibration_points && flowsensor.calibration_points[0]) {
      defaultValue = flowsensor.calibration_points[0].expected
    }

    this.setState({
      currentProbe: flowsensor,
      showCalibrate: true,
      defaultCalibrationPoint: defaultValue
    })
  }

  dismissModal () {
    this.setState({ currentProbe: null, showCalibrate: false })
  }

  handleCalibrate (flowsensor, value) {
    flowsensor.calibration_points = [{
      expected: value,
      observed: this.props.currentReading[flowsensor.id]
    }]

    this.props.update(flowsensor.id, flowsensor)
    this.setState({ currentProbe: null, showCalibrate: false })
  }

  handleUpdate (values) {
    const payload = this.valuesToProbe(values)
    this.props.update(values.id, payload)
  }

  handleCreate (values) {
    const payload = this.valuesToProbe(values)
    this.props.create(payload)
    this.handleToggleAddProbeDiv()
  }

  handleDelete (flowsensor) {
    const message = (
      <div>
        <p>
          {'Do you really want to delete '} {flowsensor.name}?
        </p>
      </div>
    )

    confirm('Delete ' + flowsensor.name, { description: message }).then(
      function () {
        this.props.delete(flowsensor.id)
      }.bind(this)
    )
  }

  render () {
    let newProbe = null
    if (this.state.addProbe) {
      newProbe =
        <FlowForm
          pins={this.props.pins}
          onSubmit={this.handleCreate}
        />
    }

    let calibrationModal = null
    if (this.state.showCalibrate) {
      calibrationModal = (
        <CalibrationModal
          flowsensor={this.state.currentProbe}
          currentReading={this.props.currentReading}
          defaultValue={this.state.defaultCalibrationPoint}
          readProbe={this.props.readFC}
          calibrateProbe={this.props.calibrateProbe}
          cancel={this.dismissModal}
          onSubmit={this.handleCalibrate}
        />
      )
    }

    return (
      <div>
        {calibrationModal}
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.flowsensorList()}</CollapsibleList>
          <li className='list-group-item add-flow'>
            <div className='row'>
              <div className='col'>
                <input
                  type='button'
                  id='add_flowsensor'
                  value={this.state.addProbe ? '-' : '+'}
                  onClick={this.handleToggleAddProbeDiv}
                  className='btn btn-outline-success'
                />
              </div>
            </div>
            {newProbe}
          </li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    probes: state.fcs,
    pins: state.inlets,
    currentReading: state.fc_reading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchFCs: () => dispatch(fetchFCs()),
    fetchpins: () => dispatch(fetchInlets()),
    create: t => dispatch(createFC(t)),
    delete: id => dispatch(deleteFC(id)),
    update: (id, t) => dispatch(updateFC(id, t)),
    readFC: id => dispatch(readFC(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
