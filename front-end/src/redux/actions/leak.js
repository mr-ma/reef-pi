import { reduxPut, reduxDelete, reduxGet, reduxPost } from 'utils/ajax'

export const leakUpdated = () => {
  return ({
    type: 'LEAK_UPDATED'
  })
}

export const leaksLoaded = (s) => {
  return ({
    type: 'LEAKS_LOADED',
    payload: s
  })
}

export const fetchLeaks = () => {
  return (reduxGet({
    url: '/api/leaks',
    success: leaksLoaded
  }))
}

export const leakLoaded = (s) => {
  return ({
    type: 'LEAK_LOADED',
    payload: s
  })
}

export const fetchLeak = (id) => {
  return (reduxGet({
    url: '/api/leaks/' + id,
    success: atoLoaded
  }))
}

export const createLeak = (a) => {
  return (reduxPut({
    url: '/api/leaks',
    data: a,
    success: fetchLeaks
  }))
}

export const updateLeak = (id, a) => {
  return (reduxPost({
    url: '/api/leaks/' + id,
    data: a,
    success: fetchLeaks
  }))
}

export const deleteLeak = (id) => {
  return (reduxDelete({
    url: '/api/leaks/' + id,
    success: fetchLeaks
  }))
}
