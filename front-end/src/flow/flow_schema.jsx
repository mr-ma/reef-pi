import * as Yup from 'yup'
import i18next from 'i18next'

const FlowSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  pin: Yup.string()
    .required('Pin is required'),
  unit: Yup.string()
    .required('Unit is required'),
  rate: Yup.number()
    .required('Rate is required'),
  period: Yup.number()
    .required('Pulse Frequency is required')
    .integer()
    .typeError('Pulse Frequency must be a number')
    .min(1, 'Pulse Frequency must be 1 second or greater'),
  pulse_count: Yup.number()
    .required('Pulse count can be set')
    .integer()
    .typeError('Pulse count must be a number')
    .min(0, 'Pulse count must be 0 or greater'),
  enable: Yup.bool()
    .required('Sensor Status is required'),
  alerts: Yup.bool()
    .required('Alerts is required'),
  minAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
      } else { return schema }
    }),
  maxAlert: Yup.number()
    .when('alerts', (alert, schema) => {
      if (alert === true || alert === 'true') {
        return schema
          .required('Threshold is required when alerts are enabled')
          .typeError('Threshold must be a number')
          .test('greaterThan', 'Alert Above must be greater than Alert Below', function (max) {
            return max > this.parent.minAlert
          })
      } else { return schema }
    })
})

export default FlowSchema
