import React from 'react'
import { connect } from 'react-redux'
import { fetchScheduledMacros } from 'redux/actions/macro'
import CollapsibleList from '../ui_components/collapsible_list'
import CollapsibleSimple from '../ui_components/collapsible_simple'
import ScheduledMacroForm from './scheduled_macro_form'
class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {

    }
    this.ScheduledMacroList = this.ScheduledMacroList.bind(this)
    this.handleUpdateMacro = this.handleUpdateMacro.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    const timer = window.setInterval(this.props.fetch, 10 * 1000)
    this.setState({ timer: timer })
  }
  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }
  
  handleUpdateMacro (values) {
  }
  ScheduledMacroList () {
    return this.props.macros_scheduled
       .sort((a, b) => {
         return parseInt(b.task_id) - parseInt(a.task_id)
       })
      .map(scheduledMacro => {
        return (
          <CollapsibleSimple
            key={'panel-flow-' + scheduledMacro.task_id}
            name={'panel-flow-' + scheduledMacro.task_id}
            item={scheduledMacro}
            title={<b className='ml-2 align-middle'>{scheduledMacro.task_id+'-'+scheduledMacro.name} </b>}
          >
            <ScheduledMacroForm steps={scheduledMacro.steps}></ScheduledMacroForm>
           </CollapsibleSimple>
        )
      })
  }

  render () {
    return (
        <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.ScheduledMacroList()}
        </CollapsibleList>
        <li className='list-group-item add-macro'>
          <div className='row'>
            <div className='col'>
            </div>
          </div>
        </li>
        </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    macros_scheduled: state.macros_scheduled,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchScheduledMacros())
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
