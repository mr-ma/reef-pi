import { reduxGet, reduxPut, reduxDelete, reduxPost } from '../../utils/ajax'

export const fcsLoaded = (s) => {
  return ({
    type: 'FCS_LOADED',
    payload: s
  })
}


export const fcUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'FC_USAGE_LOADED',
      payload: { id: id, usage: s }
    })
  }
}

export const fetchFCs = () => {
  return (reduxGet({
    url: '/api/fcs',
    success: fcsLoaded
  }))
}

export const createFC = (t) => {
  return (reduxPut({
    url: '/api/fcs',
    data: t,
    success: fetchFCs
  }))
}

export const updateFC = (id, t) => {
  return (reduxPost({
    url: '/api/fcs/' + id,
    data: t,
    success: fetchFCs
  }))
}

export const deleteFC = (id) => {
  return (reduxDelete({
    url: '/api/fcs/' + id,
    success: fetchFCs
  }))
}

export const fetchFCUsage = (id) => {
  return (reduxGet({
    url: '/api/fcs/' + id + '/usage',
    success: fcUsageLoaded(id)
  }))
}

export const readFC = (id) => {
  return (reduxGet({
    url: '/api/fcs/' + id + '/read',
    success: fcReadComplete(id)
  }))
}

export const fcReadComplete = (id) => {
  return (s) => {
    return ({
      type: 'FC_READING_COMPLETE',
      payload: { reading: s, id: id }
    })
  }
}
