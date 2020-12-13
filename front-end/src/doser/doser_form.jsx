import EditDoser from './edit_doser'
import DoserSchema from './doser_schema'
import { withFormik } from 'formik'

const DoserForm = withFormik({
  displayName: 'DoserForm',

  mapPropsToValues: props => {
    let data = props.doser
    if (data === undefined) {
      data = {
        regiment: {
          schedule: {}
        }
      }
    }

    return {
      id: data.id || '',
      name: data.name || '',
      jack: data.jack || '',
      pin: data.pin === undefined ? '' : data.pin,
      enable: data.regiment.enable === undefined ? true : data.regiment.enable,
      is_stepper: data.is_stepper === undefined ? false : data.is_stepper,
      in1_pin: data.in1_pin || '',
      in2_pin: data.in2_pin || '',
      in3_pin: data.in3_pin || '',
      in4_pin: data.in4_pin || '',
      steps_per_revolution: data.steps_per_revolution== undefined ? '': data.steps_per_revolution, 
      duration: data.regiment.duration || 0,
      speed: data.regiment.speed || 0,
      month: data.regiment.schedule.month || '*',
      week: data.regiment.schedule.week || '*',
      day: data.regiment.schedule.day || '*',
      hour: data.regiment.schedule.hour || '0',
      minute: data.regiment.schedule.minute || '0',
      second: data.regiment.schedule.second || '0'
    }
  },
  validationSchema: DoserSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditDoser)

export default DoserForm
