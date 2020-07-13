import React from 'react'
import $ from 'jquery'
import Modal from 'modal'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Moment from 'moment';
import i18next from 'i18next'

export default class ReportsModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.cancel = this.cancel.bind(this)
  }

  cancel () {
    return this.promise.reject()
  }

  componentDidMount () {
    this.promise = new $.Deferred()
  }
  formatDateTime(value){
    Moment.locale('de');
    return(<div>{Moment(value).year()!=1?Moment(value).format('YYYY.MM.DD HH:mm:ss'):null}</div>)
  }
  formatStatus(value){
    return(<div>Status:&nbsp;{value}</div>)
  }
  render () {
    return (
      <Modal>
        <div className='modal-header'>
          <h4 className='modal-title'>
            Reports of {this.props.leak.name}
          </h4>
        </div>
        <div className='modal-body'>
      <TableContainer component={Paper}>
      <div style={{ overflow: "auto" , height:"300px"}} >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow key="th-0">
              <TableCell align="left"><b>Report Date and Time</b></TableCell>
              <TableCell align="left"><b>Sensor Status</b></TableCell> 
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.reports != null && this.props.reports.length>0? this.props.reports.sort( (a,b) => new Date(b.date)- new Date(a.date)).map((row,index) => (
              <TableRow key={'tr-'+index.toString()}>
                <TableCell align="left">{this.formatDateTime(row.date)}</TableCell>
                <TableCell align="left">{this.formatStatus(row.status)}</TableCell>
              </TableRow>
            )):null}
          </TableBody>
        </Table>
        </div>
      </TableContainer>
        </div>
        <div className='modal-footer'>
          <div className='text-center'>
              <button
                role='abort'
                type='button'
                className='btn btn-light mr-2'
                onClick={this.cancel}
              >
                {i18next.t('cancel')}
              </button>
          </div>
        </div>
        
      </Modal>
    )
  }
}

