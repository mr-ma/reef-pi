import * as Yup from 'yup'
import i18next from 'i18next'

const LeakSchema = Yup.object().shape({
  name: Yup.string()
    .required(i18next.t('leak:name_required')),
  enable: Yup.bool()
    .required(i18next.t('leak:status_required')),
  endpoint_id: Yup.string()
    .required(i18next.t('leak:endpoint_id_required')),
  period: Yup.number()
    .required(i18next.t('leak:chk_freq_required'))
    .integer()
    .typeError(i18next.t('leak:chk_freq_number'))
    .min(1, i18next.t('leak:chk_freq_number_value')),
  on_status_zero_macro: Yup.number(),
  on_status_one_macro:Yup.number(),
  notify: Yup.bool(),
  disable_on_alert: Yup.bool(),
  maxAlert: Yup.mixed()
    .when('notify', (notify, schema) => {
      if (notify === true) {
        return Yup
          .number()
          .required(i18next.t('leak:threshold_required'))
          .typeError(i18next.t('leak:threshold_value'))
          .min(1, i18next.t('leak:chk_freq_number_value'))
      } else { return schema }
    })

})

export default LeakSchema
