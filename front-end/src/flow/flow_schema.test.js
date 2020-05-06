import FlowSchema from './flow_schema'

describe('Validation', () => {
  let fc = {}

  beforeEach(() => {
    fc = {
      name: 'name',
      pin: '17',
      rate: 76,
      unit: 'Litre',
      period: 60,
      enable: true,
      alerts: false,
      notify: { enable: false },
    }
  })

  it('should require min and max alert when alert is enabled', () => {
    fc.alerts = true
    expect.assertions(1)
    return FlowSchema.isValid(fc).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should require min and max alert when alert is enabled', () => {
    fc.alerts = true
    fc.minAlert = 77
    fc.maxAlert = 81
    expect.assertions(1)
    return FlowSchema.isValid(fc).then(
      valid => expect(valid).toBe(true)
    )
  })



})
