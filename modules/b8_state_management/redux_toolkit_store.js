// B8: Redux Toolkit Architecture & Async Thunk Simulation

class ReduxStoreSimulator {
  constructor(reducers) {
    this.reducers = reducers;
    this.state = {};
    Object.keys(reducers).forEach(key => {
      this.state[key] = reducers[key](undefined, { type: '@@INIT' });
    });
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    console.log(`[Redux Dispatch] Action: ${action.type}`, action.payload || '');
    
    // Handle Async Thunk function
    if (typeof action === 'function') {
      return action(this.dispatch.bind(this), this.getState.bind(this));
    }

    const nextState = {};
    Object.keys(this.reducers).forEach(key => {
      nextState[key] = this.reducers[key](this.state[key], action);
    });

    this.state = nextState;
    this.listeners.forEach(l => l());
    return action;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Counter Slice Reducer
function counterReducer(state = { value: 0, status: 'idle' }, action) {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 };
    case 'counter/decrement':
      return { ...state, value: state.value - 1 };
    case 'counter/fetchPending':
      return { ...state, status: 'loading' };
    case 'counter/fetchSuccess':
      return { ...state, value: action.payload, status: 'succeeded' };
    default:
      return state;
  }
}

export const reduxStore = new ReduxStoreSimulator({
  counter: counterReducer
});

// Async Thunk Action Creator
export function fetchCounterAsync() {
  return (dispatch) => {
    dispatch({ type: 'counter/fetchPending' });
    setTimeout(() => {
      dispatch({ type: 'counter/fetchSuccess', payload: 100 });
    }, 500);
  };
}
