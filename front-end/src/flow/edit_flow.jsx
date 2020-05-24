import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import ReadingsChart from './readings_chart'
import i18next from 'i18next'


const EditFlow = ({
  values,
  pins,
  errors,
  touched,
  submitForm,
  isValid,
  dirty,
  readOnly,
  showChart
}) => {
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('flow:validation_error')
      )
    }
  }

  const pinOptions = () => {
    return pins.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }
  const flowUnit = () => {
    return values.unit
  }

  const charts = () => {
    if (!showChart || !values.enable) {
      return
    }

    let charts = (
      <div className='row'>
        <div className='col'>
          <ReadingsChart sensor_id={values.id} width={500} height={300} />
        </div>
      </div>
    )

    return (
      <div className='d-none d-sm-block'>
        {charts}
      </div>
    )
  }


  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div className={classNames('row', { 'd-none': readOnly })}>
          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='name'>{i18next.t('name')}</label>
              <Field
                name='name'
                disabled={readOnly}
                className={classNames('form-control', {
                  'is-invalid': ShowError('name', touched, errors)
                })}
              />
              <ErrorFor errors={errors} touched={touched} name='name' />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='pin'>{i18next.t('flow:pin')}</label>
              <Field
                name='pin'
                component='select'
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('pin', touched, errors)
                })}
              >
                <option value='' className='d-none'>
                  -- {i18next.t('select')} --
                </option>
                {pinOptions()}
              </Field>
              <ErrorFor errors={errors} touched={touched} name='pin' />
            </div>
          </div>

          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='period'>Meter Frequency</label>
              <div className='input-group'>
                <Field
                  name='period'
                  readOnly={readOnly}
                  type='number'
                  className={classNames('form-control', {
                    'is-invalid': ShowError('period', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text d-none d-lg-flex'>
                    {i18next.t('second_s')}
                  </span>
                  <span className='input-group-text d-flex d-lg-none'>{i18next.t('sec')}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='period' />
              </div>
            </div>
          </div>
          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='unit'>Unit</label>
              <div className='input-group'>
                <Field
                  name='unit'
                  readOnly={readOnly}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('unit', touched, errors)
                  })}
                />
                <ErrorFor errors={errors} touched={touched} name='unit' />
              </div>
            </div>
          </div>
          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='rate'>Pulse Rate</label>
              <div className='input-group'>
                <Field
                  name='rate'
                  readOnly={readOnly}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('rate', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{flowUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='rate' />
              </div>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='enable'>{i18next.t('flow:sensor_status')}</label>
              <Field
                name='enable'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('enable', touched, errors)
                })}
              >
                <option value='true'>{i18next.t('enabled')}</option>
                <option value='false'>{i18next.t('disabled')}</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='enable' />
            </div>
          </div>
          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='pulse_count'>Pulse Count</label>
              <div className='input-group'>
                <Field
                  name='pulse_count'
                  readOnly={readOnly}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('pulse_count', touched, errors)
                  })}
                />
                <ErrorFor errors={errors} touched={touched} name='pulse_count' />
              </div>
            </div>
          </div>
          <div className='col col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='flow_count'>Flow Meter</label>
              <div className='input-group'>
                <Field
                  name='flow_count'
                  readOnly={true}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('flow_count', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{flowUnit()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-12 col-sm-6 col-md-3'>
            <div className='form-group'>
              <label htmlFor='alerts'>{i18next.t('alerts')}</label>
              <Field
                name='alerts'
                component={BooleanSelect}
                disabled={readOnly}
                className={classNames('custom-select', {
                  'is-invalid': ShowError('alerts', touched, errors)
                })}
              >
                <option value='true'>Enabled</option>
                <option value='false'>Disabled</option>
              </Field>
              <ErrorFor errors={errors} touched={touched} name='alerts' />
            </div>
          </div>

          <div
            className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
              'd-none': values.alerts === false
            })}
          >
            <div className='form-group'>
              <label htmlFor='minAlert'>Alert Below</label>
              <div className='input-group'>
                <Field
                  name='minAlert'
                  type='number'
                  readOnly={readOnly || values.alerts === false}
                  className={classNames('form-control px-sm-1 px-md-2', {
                    'is-invalid': ShowError('minAlert', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{flowUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='minAlert' />
              </div>
            </div>
          </div>

          <div
            className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
              'd-none': values.alerts === false
            })}
          >
            <div className='form-group'>
              <label htmlFor='maxAlert'>Alert Above</label>
              <div className='input-group'>
                <Field
                  name='maxAlert'
                  type='number'
                  readOnly={readOnly || values.alerts === false}
                  className={classNames('form-control', {
                    'is-invalid': ShowError('maxAlert', touched, errors)
                  })}
                />
                <div className='input-group-append'>
                  <span className='input-group-text'>{flowUnit()}</span>
                </div>
                <ErrorFor errors={errors} touched={touched} name='maxAlert' />
              </div>
            </div>
          </div>
        </div>
        {charts()}
      </div>

      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value='Save'
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>
    </form>
  )
}

EditFlow.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  sensors: PropTypes.array,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func,
  equipment: PropTypes.array,
  macros: PropTypes.array
}

export default EditFlow
