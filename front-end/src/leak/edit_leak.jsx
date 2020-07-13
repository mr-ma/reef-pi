import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import { showError } from 'utils/alert'
import classNames from 'classnames'
import { Field } from 'formik'
import BooleanSelect from '../ui_components/boolean_select'
import i18next from 'i18next'

const EditLeak = ({
  values,
  errors,
  touched,
  macros,
  submitForm,
  isValid,
  dirty,
  readOnly
}) => {
  const controlOptions = () => {
    let opts = macros
    return opts.map(item => {
      return (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
  }
  const handleSubmit = event => {
    event.preventDefault()
    if (dirty === false || isValid === true) {
      submitForm()
    } else {
      submitForm() // Calling submit form in order to show validation errors
      showError(
        i18next.t('leak:validation_error')
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <div className='col col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='endpoint_id'>{i18next.t('endpoint_id')}</label>
            <Field
              name='endpoint_id'
              disabled={readOnly}
              className={classNames('form-control', {
                'is-invalid': ShowError('endpoint_id', touched, errors)
              })}
            />
            <ErrorFor errors={errors} touched={touched} name='endpoint_id' />
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='period'>{i18next.t('leak:chk_freq')}</label>
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
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='period' />
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='expected_heartbeat_frequency'>{i18next.t('leak:expected_heartbeat_frequency')}</label>
            <div className='input-group'>
              <Field
                name='expected_heartbeat_frequency'
                readOnly={readOnly}
                type='number'
                className={classNames('form-control', {
                  'is-invalid': ShowError('expected_heartbeat_frequency', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='expected_heartbeat_frequency' />
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='enable'>{i18next.t('leak:leak_status')}</label>
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
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='on_status_zero_macro'>{i18next.t('leak:on_status_zero_macro')}</label>
            <Field
              name='on_status_zero_macro'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('on_status_zero_macro', touched, errors)
              })}
            >
              <option key='' value=''>
                {i18next.t('none')}
              </option>
              {controlOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='on_status_zero_macro' />
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='on_status_one_macro'>{i18next.t('leak:on_status_one_macro')}</label>
            <Field
              name='on_status_one_macro'
              component='select'
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('on_status_one_macro', touched, errors)
              })}
            >
              <option key='' value=''>
                {i18next.t('none')}
              </option>
              {controlOptions()}
            </Field>
            <ErrorFor errors={errors} touched={touched} name='on_status_one_macro' />
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='notify'>{i18next.t('alerts')}</label>
            <Field
              name='notify'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='notify' />
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-3'>
          <div className='form-group'>
            <label htmlFor='disable_on_alert'>{i18next.t('leak:disable_on_alert')}</label>
            <Field
              name='disable_on_alert'
              component={BooleanSelect}
              disabled={readOnly}
              className={classNames('custom-select', {
                'is-invalid': ShowError('notify', touched, errors)
              })}
            >
              <option value='true'>{i18next.t('enabled')}</option>
              <option value='false'>{i18next.t('disabled')}</option>
            </Field>
            <ErrorFor errors={errors} touched={touched} name='disable_on_alert' />
          </div>
        </div>

        <div
          className={classNames('col-12 col-sm-3 col-md-3 d-sm-block', {
            'd-none': values.notify === false
          })}
        >
          <div className='form-group'>
            <label htmlFor='maxAlert'>{i18next.t('leak:alert_after')}</label>
            <div className='input-group'>
              <Field
                title={i18next.t('leak:total_seconds_pump_on')}
                name='maxAlert'
                type='number'
                readOnly={readOnly || values.notify === false}
                className={classNames('form-control px-sm-1 px-md-2', {
                  'is-invalid': ShowError('maxAlert', touched, errors)
                })}
              />
              <div className='input-group-append'>
                <span className='input-group-text d-none d-lg-flex'>
                  {i18next.t('second_s')}
                </span>
                <span className='input-group-text d-flex d-lg-none'>sec</span>
              </div>
              <ErrorFor errors={errors} touched={touched} name='maxAlert' />
            </div>
          </div>
        </div>
      </div>

      <div className={classNames('row', { 'd-none': readOnly })}>
        <div className='col-12'>
          <input
            type='submit'
            value={i18next.t('save')}
            disabled={readOnly}
            className='btn btn-sm btn-primary float-right mt-1'
          />
        </div>
      </div>
    </form>
  )
}

EditLeak.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  handleBlur: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  handleChange: PropTypes.func
}

export default EditLeak
