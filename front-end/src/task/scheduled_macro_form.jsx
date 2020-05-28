
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import { connect } from 'react-redux'
import Moment from 'moment';


export default class ScheduledMacroForm extends React.Component {
  
  getStatus(status){
    switch (status) {
      case 0:
        return "Waiting"
      case 1:
        return "Running"
      case 2:
        return "Finished"
      default:
        return "Unknown"
    }
  }
  formatDateTime(value){
    Moment.locale('de');
    return(<p> {Moment(value).year()==1?null:Moment(value).format('YYYY.MM.DD HH:mm:ss.SSS')} </p>)
  }
  formatConfig(value){
    var values=[]
    Object.keys(value).map(function(keyName, keyIndex) {
      values.push((<li className='list-group-item'><p className='row mb-1 text-center text-md-left'>{keyName}&nbsp;:&nbsp;{value[keyName]}</p>  </li>))
    });
    return values
  }
  render(){
    
    return (
      <div>
      <p className='ml-2 align-middle'>Scheduled Steps</p>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow key="th-0">
              <TableCell align="left">Status</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="left">Start Time</TableCell>
              <TableCell align="left">End Time</TableCell>
              {/* <TableCell align="right">Config</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.steps.map((row,index) => (
              <TableRow key={'tr-'+index.toString()}>
                <TableCell align="left">{this.getStatus(row.status)}</TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell align="left">{this.formatDateTime(row.start)}</TableCell>
                <TableCell align="left">{this.formatDateTime(row.end)}</TableCell>
                {/* <TableCell align="right"><ul>{this.formatConfig(row.config)}</ul></TableCell> */}
              </TableRow>
            ))}
          </TableBody>
          {/* <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
            />
          </TableRow>
        </TableFooter> */}
        </Table>
      </TableContainer>
      </div>
    );
  }
}
