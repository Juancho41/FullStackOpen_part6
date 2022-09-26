import React from 'react';
import ReactDOM from 'react-dom/client'
import { configureStore } from '@reduxjs/toolkit'
import { createStore } from 'redux'

import reducer from './reducer'


const store = createStore(reducer)

const App = () => {
  const good = () => {
    store.dispatch({
      type: 'GOOD'
    })
  }

  const ok = () => {
    store.dispatch({
      type: 'OK'
    })
  }

  const bad = () => {
    store.dispatch({
      type: 'BAD'
    })
  }

  const reset = () => {
    store.dispatch({
      type: 'ZERO'
    })
  }

  return (
    <div>
      <h1>give feedback</h1>
      <button onClick={good}>good</button>
      <button onClick={ok}>ok</button>
      <button onClick={bad}>bad</button>
      <button onClick={reset}>reset</button>
      <h1>statistics</h1>
      <div>good {store.getState().good}</div>
      <div>ok {store.getState().ok}</div>
      <div>bad {store.getState().bad}</div>
      <div>average {(store.getState().good - store.getState().bad)/(store.getState().good + store.getState().bad + store.getState().ok)}</div>
      <div>positive {(store.getState().good)/(store.getState().good + store.getState().bad + store.getState().ok)}</div>
      <div>all {(store.getState().good + store.getState().bad + store.getState().ok)}</div>


    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
const renderApp = () => {
  root.render(<App />)
}

renderApp()
store.subscribe(renderApp)
