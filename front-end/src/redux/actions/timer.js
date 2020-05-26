import { reduxPut, reduxDelete, reduxGet, reduxPost } from '../../utils/ajax'

export const timersLoaded = (s) => {
  return ({
    type: 'TIMERS_LOADED',
    payload: s
  })
}
// export const timerSchedulesLoaded = (s) => {
//   return ({
//     type: 'TIMER_SCHEDULES_LOADED',
//     payload: s
//   })
// }

export const timerDeleted = () => {
  return ({
    type: 'TIMER_DELETED'
  })
}

export const fetchTimers = () => {
  return (reduxGet({
    url: '/api/timers',
    success: timersLoaded
  }))
}

// export const fetchTimerSchedules = () => {
//   return (reduxGet({
//     url: '/api/schedules',
//     success: timerSchedulesLoaded
//   }))
// }

export const createTimer = (a) => {
  return (reduxPut({
    url: '/api/timers',
    success: fetchTimers,
    data: a,
  }))
}

export const updateTimer = (id, a) => {
  return (reduxPost({
    url: '/api/timers/' + id,
    data: a,
    success: fetchTimers,
  }))
}

export const deleteTimer = (id) => {
  return (reduxDelete({
    url: '/api/timers/' + id,
    success: fetchTimers,
  }))
}
