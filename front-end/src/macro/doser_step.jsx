import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'

const DoserStep = ({ type, name, readOnly, touched, errors, ...props }) => {
  const options = () => {
    return props['doser'].map((item) => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }
  return (
    <>
    <div className='col-12 col-sm-4 col-md-3 form-group'>
        <Field
          name={`${name}.id`}
          aria-label='System'
          title='System'
          component='select'
          readOnly={readOnly}
          className={classNames('form-control custom-select', {
            'is-invalid': ShowError(`${name}.id`, touched, errors)
          })}
        >
          <option value='' className='d-none'>-- Select Dosing Pump --</option>
          {options()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
    </div>
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.duration`}
          aria-label='Duration'
          title='Duration'
          type='number'
          readOnly={readOnly}
          placeholder='Duration'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.duration`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
              second(s)
          </span>
          <span className='input-group-text d-flex d-lg-none'>sec</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.duration`} />
      </div>
    </div>
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.speed`}
          aria-label='Speed'
          title='Speed'
          type='number'
          readOnly={readOnly}
          placeholder='Speed'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.speed`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
              1-100
          </span>
          <span className='input-group-text d-flex d-lg-none'>1-100</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.speed`} />
      </div>
    </div>
      </>
  )
        }
  

DoserStep.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}
const mapStateToProps = state => {
  return {
    doser: state.dosers,
    subsystem: [
      { id: 'doser', name: 'doser' },
    ]
  }
}
const DoserStepConfig = connect(
  mapStateToProps,
  null
)(DoserStep)
export default DoserStepConfig
//export default WaitStep
