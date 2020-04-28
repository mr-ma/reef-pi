import EditMacro from './edit_macro'
import MacroSchema from './macro_schema'
import { withFormik } from 'formik'

const MacroForm = withFormik({
  displayName: 'MacroForm',

  mapPropsToValues: props => {
    let data = props.macro
    if (data === undefined) {
      data = {
        steps: []
      }
    }
    if (!data.steps) { data.steps = [] }

    return {
      id: data.id || '',
      name: data.name || '',
      enable: data.enable || false,
      reversible: data.reversible || false,
      steps: data.steps.map(step => {
        return {
          type: step.type,
          duration: step.config.duration,
          frequency: step.config.frequency,
          speed: step.config.speed,
          id: step.config.id,
          on: step.config.on,
          rangetemp1:step.config.rangetemp1,
          rangetemp2:step.config.rangetemp2
        }
      })
    }
  },
  validationSchema: MacroSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(values)
  }
})(EditMacro)

export default MacroForm
