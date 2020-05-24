import EditFlow from './edit_flow'
import FlowSchema from './flow_schema'
import { withFormik } from 'formik'

const FlowForm = withFormik({
  displayName: 'FlowForm',
  mapPropsToValues: props => {
    let fc = props.fc
    if (fc === undefined) {
      fc = {
        enable: true,
        notify: {}
      }
    }

    const values = {
      id: fc.id || '',
      name: fc.name || '',
      pin: fc.pin || '',
      rate: fc.rate || '',
      unit: fc.unit || '',
      pulse_count: fc.pulse_count || 0,
      period: fc.period || '60',
      flow_count: fc.flow_count || 0,
      // max_count: fc.max_count || 0,
      enable: (fc.enable === undefined ? true : fc.enable),
      alerts: (fc.notify && fc.notify.enable) || false,
      minAlert: (fc.notify && fc.notify.min) || '0',
      maxAlert: (fc.notify && fc.notify.max) || '0',
    }

    return values
  },
  validationSchema: FlowSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditFlow)

export default FlowForm
