import LeakSchema from './leak_schema'

describe('Validation', () => {
  let leak = {}

  beforeEach(() => {
    leak = {
      name: 'name',
      endpoint_id: '1',
      expected_heartbeat_frequency: 100,
      enable: true,
      period: 60,
      on_status_zero_macro: 3,
      on_status_one_macro:4,
      notify: false,
      maxAlert: ''
    }
  })

  it('should require maxAlert when notify is enabled', () => {
    leak.notify = true
    expect.assertions(1)
    return LeakSchema.isValid(leak).then(
      valid => expect(valid).toBe(false)
    )
  })

  it('should not require maxAlert when notify is enabled', () => {
    leak.notify = false
    leak.maxAlert = null
    expect.assertions(1)
    LeakSchema.validateSync(leak)
    return LeakSchema.isValid(leak).then(
      valid => expect(valid).toBe(true)
    )
  })
})
