import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import Main from './main'
import ReadingsChart from './readings_chart'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import FlowForm from './flow_form'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
jest.mock('utils/confirm', () => {
  return {
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})
describe('Flow controller ui', () => {
  const state = {
    fcs: [{ id: '1', name: 'Water' }, { id: '2', name: 'Air' } ],
    tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } },
    tc_reading: [],
    equipment: [{ id: '1', name: 'bar', on: false }],
    macros: [{id: '1', name: 'macro'}]
  }

  it('<Main />', () => {
    let wrapper = shallow(<Main store={mockStore(state)} />)
      .dive()

    console.log(wrapper.debug())
    let m = wrapper.instance()
    console.log(m)
    m.handleToggleAddProbeDiv()
    m.handleCreate({ name: 'test', type: 'reminder' })
    m.handleUpdate({ id: '1', name: 'test', type: 'equipment' })
    m.handleCalibrate({ stopPropagation: jest.fn() }, { id: 1 })
    m.handleDelete('1')
  })

  it('<ReadingsChart />', () => {
    shallow(<ReadingsChart store={mockStore({ fcs: [], tc_usage: { 1: { current: [] } } })} sensor_id='1' />)
    const m = shallow(<ReadingsChart store={mockStore(state)} sensor_id='1' />)
      .dive()
      .instance()
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
    shallow(<ReadingsChart store={mockStore({ fcs: [], tc_usage: {} })} sensor_id='9' />)
      .dive()
      .instance()
    let stateCurrent = {
      fcs: [{ id: '1', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
      tc_usage: { 1: { current: [{ flow: 1 }, { flow: 4 }] } }
    }
    shallow(<ReadingsChart store={mockStore(stateCurrent)} sensor_id='1' />)
      .dive()
      .instance()
    stateCurrent = {
      fcs: [{ id: '2', chart_min: 76, min: 72, max: 78, chart_max: 89 }],
      tc_usage: { 1: { current: [{ flow: 1 }, { flow: 4 }] } }
    }
    shallow(<ReadingsChart store={mockStore(stateCurrent)} sensor_id='1' />)
      .dive()
      .instance()
  })

  it('<ControlChart />', () => {
    shallow(
      <ControlChart
        sensor_id='1'
        store={mockStore({
          fcs: [{ id: '1', min: 72, max: 78 }],
          tc_usage: { 1: { historical: [{ cooler: 1 }], current: [] } }
        })}
      />
    ).dive()
    const m = shallow(<ControlChart sensor_id='1' store={mockStore(state)} />)
      .dive()
      .instance()
    m.state.timer = window.setInterval(() => {
      return true
    }, 10 * 1000)
    m.componentWillUnmount()
    delete m.state.timer
    m.componentWillUnmount()
    shallow(<ControlChart sensor_id='1' store={mockStore({ fcs: [], tc_usage: [] })} />)
      .dive()
      .instance()
    shallow(<ControlChart sensor_id='1' store={mockStore({ fcs: [{ id: '1', min: 72, max: 78 }], tc_usage: [] })} />)
      .dive()
      .instance()
  })

  it('<FlowForm /> for create', () => {
    const fn = jest.fn()
    const wrapper = shallow(<FlowForm onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<FlowForm /> for edit', () => {
    const fn = jest.fn()

    const fc = {
      name: 'name',
      pin: '17',
      rate: 76,
      unit: 'Litre',
      period: 60,
      enable: true,
      alerts: false,
      notify: { enable: false },
    }
    const wrapper = shallow(<FlowForm fc={fc} onSubmit={fn} />)
    wrapper.simulate('submit', {})
    expect(fn).toHaveBeenCalled()
  })

  it('<FlowForm /> for edit with macro', () => {
    const fn = jest.fn()

    const fc = {
      name: 'name',
      pin: '17',
      rate: 76,
      unit: 'Litre',
      period: 60,
      enable: true,
      alerts: false,
      notify: { enable: false },
    }
    const wrapper = shallow(<FlowForm fc={fc} onSubmit={fn} />).dive()
    expect(wrapper.instance().props.initialValues.control).toBe('macro')
  })

  it('<FlowForm /> for edit with equipment', () => {
    const fn = jest.fn()

    const fc = {
      name: 'name',
      pin: '17',
      rate: 76,
      unit: 'Litre',
      period: 60,
      enable: true,
      alerts: false,
      notify: { enable: false },
    }
    const wrapper = shallow(<FlowForm fc={fc} onSubmit={fn} />).dive()
    expect(wrapper.instance().props.initialValues.control).toBe('equipment')
  })

})
