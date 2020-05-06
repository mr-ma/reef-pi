import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import EditFlow from './edit_flow'
import ReadingsChart from './readings_chart'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditFlow />', () => {
  let values = {}
  let sensors = [{ id: 'sensor' }]
  let equipment = [{ id: '1', name: 'EQ' }]
  let macros = [{ id: '1', name: 'Macro' }]
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')

    values = {
      id: 1,
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not show charts when showChart is false', () => {
    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart={false}
      />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(0)
    expect(wrapper.find(ControlChart).length).toBe(0)
  })

  it('should show reading charts when showChart is true but hide control chart', () => {
    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
      />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(1)
    expect(wrapper.find(ControlChart).length).toBe(0)
  })

  it('should show both charts when heater or chiller is used', () => {
    values.heater = '2'
    values.cooler = '4'

    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
      />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(1)
    expect(wrapper.find(ControlChart).length).toBe(1)
  })

  it('<EditEquipment /> should submit', () => {
    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('<EditEquipment /> should disable inputs when controlling nothing', () => {

    values.control = 'nothing'

    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid={false}
      />
    )

    const upperFunction = wrapper.find({name: 'heater', className: 'custom-select'})
    expect(upperFunction.prop('disabled')).toBe(true)
  })


  it('<EditEquipment /> should enable inputs when controlling equipment', () => {

    values.control = 'equipment'

    const wrapper = shallow(
      <EditFlow
        values={values}
        sensors={sensors}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid={false}
      />
    )

    const upperFunction = wrapper.find({name: 'heater', className: 'custom-select'})
    expect(upperFunction.prop('disabled')).toBe(false)
  })

})
