// ============================================================================
// B8 / DEV-FE-008: REDUX TOOLKIT (RTK) IMPLEMENTATION & PATTERNS
// Store Configuration, Slices, Async Thunks, and Memoized Selectors (Reselect)
// ============================================================================

/**
 * createSlice Simulator: Tự động sinh Actions và Reducer chuẩn Redux Toolkit
 */
export function createSlice({ name, initialState, reducers = {}, extraReducers }) {
  const actions = {};

  // Tạo Action Creators cho từng reducer
  Object.keys(reducers).forEach((actionKey) => {
    const type = `${name}/${actionKey}`;
    actions[actionKey] = (payload) => ({ type, payload });
  });

  const reducer = (state = initialState, action) => {
    // 1. Kiểm tra case reducers thông thường
    const prefix = `${name}/`;
    if (action.type && action.type.startsWith(prefix)) {
      const reducerKey = action.type.replace(prefix, '');
      if (reducers[reducerKey]) {
        // Mô phỏng Immer: shallow clone đối tượng
        const draft = Array.isArray(state) ? [...state] : { ...state };
        const result = reducers[reducerKey](draft, action);
        return result !== undefined ? result : draft;
      }
    }

    // 2. Kiểm tra extraReducers (Thunk actions builder callback hoặc object)
    if (extraReducers) {
      if (typeof extraReducers === 'function') {
        const builder = {
          cases: {},
          addCase(actionCreatorOrType, caseReducer) {
            const type = typeof actionCreatorOrType === 'function' ? actionCreatorOrType.type : actionCreatorOrType;
            this.cases[type] = caseReducer;
            return this;
          }
        };
        extraReducers(builder);
        if (builder.cases[action.type]) {
          const draft = Array.isArray(state) ? [...state] : { ...state };
          const result = builder.cases[action.type](draft, action);
          return result !== undefined ? result : draft;
        }
      } else if (extraReducers[action.type]) {
        const draft = Array.isArray(state) ? [...state] : { ...state };
        const result = extraReducers[action.type](draft, action);
        return result !== undefined ? result : draft;
      }
    }

    return state;
  };

  return { name, actions, reducer };
}

/**
 * createAsyncThunk Simulator: Sinh Action Creators cho Pending, Fulfilled, Rejected
 */
export function createAsyncThunk(typePrefix, payloadCreator) {
  const pendingType = `${typePrefix}/pending`;
  const fulfilledType = `${typePrefix}/fulfilled`;
  const rejectedType = `${typePrefix}/rejected`;

  const actionCreator = (arg) => {
    return async (dispatch, getState) => {
      dispatch({ type: pendingType, meta: { arg } });
      try {
        const result = await payloadCreator(arg, {
          dispatch,
          getState,
          rejectWithValue: (value) => ({ isRejectedWithValue: true, value })
        });

        if (result && result.isRejectedWithValue) {
          dispatch({ type: rejectedType, payload: result.value, meta: { arg } });
          return { error: result.value };
        }

        dispatch({ type: fulfilledType, payload: result, meta: { arg } });
        return { data: result };
      } catch (err) {
        dispatch({ type: rejectedType, error: err.message || 'Lỗi bất định', meta: { arg } });
        return { error: err.message };
      }
    };
  };

  actionCreator.pending = { type: pendingType };
  actionCreator.fulfilled = { type: fulfilledType };
  actionCreator.rejected = { type: rejectedType };
  actionCreator.typePrefix = typePrefix;

  return actionCreator;
}

/**
 * createSelector: Memoized Selector mô phỏng thư viện Reselect
 * Tránh tính toán lại và re-render khi input selectors không đổi
 */
export function createSelector(inputSelectors, resultFunc) {
  let lastInputs = null;
  let lastResult = null;

  return (state) => {
    const currentInputs = inputSelectors.map(selector => selector(state));

    const inputsEqual = lastInputs !== null &&
      currentInputs.length === lastInputs.length &&
      currentInputs.every((val, idx) => Object.is(val, lastInputs[idx]));

    if (inputsEqual) {
      return lastResult; // Trả về giá trị memoized từ cache
    }

    lastInputs = currentInputs;
    lastResult = resultFunc(...currentInputs);
    return lastResult;
  };
}

/**
 * configureStore Simulator
 */
export function configureStore({ reducer }) {
  let rootReducer;
  if (typeof reducer === 'function') {
    rootReducer = reducer;
  } else {
    // Combine Reducers
    rootReducer = (state = {}, action) => {
      const nextState = {};
      Object.keys(reducer).forEach(key => {
        nextState[key] = reducer[key](state[key], action);
      });
      return nextState;
    };
  }

  let currentState = rootReducer(undefined, { type: '@@INIT' });
  const listeners = [];

  const store = {
    getState: () => currentState,
    dispatch: (action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState);
      }
      currentState = rootReducer(currentState, action);
      listeners.forEach(l => l());
      return action;
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    }
  };

  return store;
}

// ============================================================================
// TRIỂN KHAI PRODUCTS SLICE VÀ ASYNC THUNK
// ============================================================================

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchProducts',
  async (limit = 4, { rejectWithValue }) => {
    try {
      // Giả lập delay mạng
      await new Promise(r => setTimeout(r, 600));
      return [
        { id: 'p1', title: 'Laptop MacBook Pro M3', price: 1999, category: 'Tech' },
        { id: 'p2', title: 'Bàn phím cơ Không Dây NuPhy', price: 120, category: 'Accessories' },
        { id: 'p3', title: 'Màn hình 4K Dell UltraSharp', price: 650, category: 'Tech' },
        { id: 'p4', title: 'Chuột Logitech MX Master 3S', price: 99, category: 'Accessories' }
      ].slice(0, limit);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filter: 'All'
  },
  reducers: {
    addProduct: (state, action) => {
      state.items = [...state.items, action.payload];
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending.type, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled.type, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected.type, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error || 'Lỗi nạp dữ liệu';
      });
  }
});

// Configure Main Redux Store
export const reduxStore = configureStore({
  reducer: {
    products: productSlice.reducer
  }
});

// Memoized Selectors
export const selectProductsState = (state) => state.products.items;
export const selectProductsFilter = (state) => state.products.filter;

export const selectFilteredProducts = createSelector(
  [selectProductsState, selectProductsFilter],
  (items, filter) => {
    if (filter === 'All') return items;
    return items.filter(item => item.category === filter);
  }
);

export const selectTotalProductsValue = createSelector(
  [selectProductsState],
  (items) => items.reduce((total, item) => total + (item.price || 0), 0)
);
