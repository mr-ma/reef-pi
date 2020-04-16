import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Field } from 'formik'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'

const WaitTempStep = ({ type, name, readOnly, touched, errors, ...props }) => {
  const options = () => {
    return props['temperature'].map((item) => {
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
      <div className='input-group'>
        <Field
          name={`${name}.frequency`}
          aria-label='Check Frequency'
          title='Check Frequency'
          type='number'
          readOnly={readOnly}
          placeholder='Check Frequency'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.frequency`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
              second(s)
          </span>
          <span className='input-group-text d-flex d-lg-none'>sec</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.frequency`} />
      </div>
    </div>
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
          <option value='' className='d-none'>-- Select System --</option>
          {options()}
        </Field>
        <ErrorFor errors={errors} touched={touched} name={`${name}.id`} />
      </div>
      <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.rangetemp1`}
          aria-label='rangetemp1'
          title='Reach Start Temperature Range'
          type='number'
          readOnly={readOnly}
          placeholder='Rangetemp1'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.rangetemp1`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
              C/F
          </span>
          <span className='input-group-text d-flex d-lg-none'>C/F</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.rangetemp1`} />
      </div>
    </div>
    <div className='col-12 col-sm-4 col-md-3 form-group'>
      <div className='input-group'>
        <Field
          name={`${name}.rangetemp2`}
          aria-label='rangetemp2'
          title='End Temperature Range'
          type='number'
          readOnly={readOnly}
          placeholder='Rangetemp2'
          className={classNames('form-control', {
            'is-invalid': ShowError(`${name}.rangetemp2`, touched, errors)
          })}
        />
        <div className='input-group-append'>
          <span className='input-group-text d-none d-lg-flex'>
              C/F
          </span>
          <span className='input-group-text d-flex d-lg-none'>C/F</span>
        </div>
        <ErrorFor errors={errors} touched={touched} name={`${name}.rangetemp2`} />
      </div>
    </div>
      </>
  )
        }
  

WaitTempStep.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}
const mapStateToProps = state => {
  return {
    temperature: state.tcs,
    subsystem: [
      { id: 'temperature', name: 'temperature' },
    ]
  }
}
const WaitTempStepConfig = connect(
  mapStateToProps,
  null
)(WaitTempStep)
export default WaitTempStepConfig
//export default WaitStep
