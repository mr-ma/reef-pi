import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditLeak from './edit_leak'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditLeak />', () => {
  let values = {}
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditLeak />', () => {
    shallow(
      <EditLeak
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
      />
    )
  })

  it('<EditLeak /> should submit', () => {
    const wrapper = shallow(
      <EditLeak
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        dirty
        isValid
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditLeak /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const wrapper = shallow(
      <EditLeak
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        dirty
        isValid={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })
})
