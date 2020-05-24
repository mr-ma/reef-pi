import React, { cloneElement } from 'react'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import PropTypes from 'prop-types'
import classNames from 'classnames'

class CollapsibleSimple extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { expanded, onToggle, name, children,title } = this.props
    return (
      <li className='list-group-item' >
          <div  className={classNames('row mb-1 text-center text-md-left', {
              pointer: true})}>
            <div
            className={classNames('collapsible-title col-12 col-sm-6 col-md-8 col-lg-9 order-sm-first form-inline', {
              pointer: true
            })} onClick={() => onToggle(name)}>
            {expanded ? FaAngleUp() : FaAngleDown()}
            {title}
            </div>
            </div>
            {expanded ? children : null}
      </li>
    )
  }
}

CollapsibleSimple.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.node,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  children: PropTypes.element.isRequired
}

export default CollapsibleSimple
