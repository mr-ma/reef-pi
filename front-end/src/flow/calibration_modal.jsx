import React from 'react'
import Modal from 'modal'
import i18next from 'i18next'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import { withFormik, Field } from 'formik'

export class CalibrationForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }

    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.props.readProbe(this.props.flowsensor.id)
    }, 500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  handleCancel () {
    this.props.cancel()
  }

  render () {
    return (
      <Modal>
        <form onSubmit={this.props.handleSubmit}>
          <div className='modal-header'>
            <h4 className='modal-title'>
              {i18next.t('flow:calibrate')} {this.props.flowsensor.name}
            </h4>
          </div>
          <div className='modal-body'>

            <div className='row'>
              <div className='col-4'>{i18next.t('flow:current_reading')}</div>
              <div className='col-4'>{this.props.currentReading[this.props.flowsensor.id]}</div>
            </div>
          </div>
          <div className='modal-footer'>
            <div className='text-center'>
              <button
                role='abort'
                type='button'
                className='btn btn-light mr-2'
                onClick={this.handleCancel}
              >
                {i18next.t('cancel')}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    )
  }
}

const CalibrateSchema = Yup.object().shape({
  value: Yup.number()
    .required()
})

const CalibrationModal = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: props => {
    return {
      value: props.defaultValue || 0
    }
  },
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(props.flowsensor, parseFloat(values.value))
  }
})(CalibrationForm)

export default CalibrationModal
