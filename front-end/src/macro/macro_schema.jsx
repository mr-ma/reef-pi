import * as Yup from 'yup'

const EmptySchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required')
})

const WaitSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  duration: Yup.number()
    .required('Duration is required')
    .integer()
    .typeError('Duration is required')
    .min(1, 'Duration must be 1 second or greater')
})

const DoserSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  duration: Yup.number()
    .required('Duration is required')
    .integer()
    .typeError('Duration is required')
    .min(1, 'Duration must be 1 second or greater'),
    speed: Yup.number()
    .required('Speed is required')
    .integer()
    .typeError('Speed is required')
    .min(1, 'Speed must between 1 and 100')
    .max(100,'Speed must between 1 and 100')
})

const WaitTempSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  id: Yup.string()
    .required('Temperature sensor is required'),
  frequency: Yup.number()
    .required('Frequency is required')
    .integer()
    .typeError('Frequency is required')
    .min(1, 'Frequency must be 1 second or greater'),
  rangetemp1: Yup.number()
    .required('Range temperature1 is required')
    .typeError('Range temperature1 is required')
    .min(1, 'Range temperature1 must be 1 degree or greater'),
  rangetemp2: Yup.number()
    .required('Range temperature2 is required')
    .typeError('Range temperature2 is required')
    .min(1, 'Range temperature2 must be 2 degree or greater')
})

const GenericSchema = Yup.object().shape({
  type: Yup.string()
    .required('Step Type is required'),
  id: Yup.string()
    .required('System is required'),
  on: Yup.bool()
    .required('Action is required')
    .typeError('Action is required')
})

const StepSchema = Yup.lazy(value => {
  if (value.type === undefined) {
    return EmptySchema
  } else if (value.type === 'wait') {
    return WaitSchema
  } else if (value.type === 'waittemp') {
    return WaitTempSchema
  } else if (value.type === 'directdoser') {
    return DoserSchema
  } else {
    return GenericSchema
  }
})

const MacroSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  reversible: Yup.bool()
    .required('reversible is required'),
  steps: Yup.array().of(StepSchema)
    .required('Macros must have at least 1 step')
})

export default MacroSchema
