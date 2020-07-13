import EditLeak from './edit_leak'
import LeakSchema from './leak_schema'
import { withFormik } from 'formik'

const LeakForm = withFormik({
  displayName: 'LeakForm',
  mapPropsToValues: props => {
    let data = props.data
    if (data === undefined) {
      data = {
        enable: true,
        disable_on_alert: false,
        notify: {}
      }
    }
    const values = {
      id: data.id || '',
      name: data.name || '',
      endpoint_id: data.endpoint_id || '',
      enable: (data.enable === undefined ? true : data.enable),
      disable_on_alert: data.disable_on_alert || false,
      expected_heartbeat_frequency: data.expected_heartbeat_frequency || 0,
      period: data.period || 120,
      on_status_zero_macro: data.on_status_zero_macro || '',
      on_status_one_macro: data.on_status_one_macro || '',
      last_heartbeat: data.last_heartbeat || '',
      notify: (data.notify && data.notify.enable) || false,
      maxAlert: (data.notify && data.notify.max) || 0
    }
    return values
  },
  validationSchema: LeakSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditLeak)

export default LeakForm
