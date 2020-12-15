import React from 'react';
import * as Redux from 'redux';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Provider as ProviderRedux, useDispatch, useSelector} from 'react-redux';
import defaultStorage from 'redux-persist/lib/storage';

const {combineReducers: combineReducersRedux} = Redux;

import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import {PersistGate as PersistGateRedux} from 'redux-persist/integration/react';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const isFunction = (variableToCheck) => variableToCheck instanceof Function;

const processReducer = (reducer, prefix, defaultCases) => {
  const slices = Object.entries(reducer).map(([name, reducerI]) => {
    const nameReduced = prefix ? `${prefix}/${name}` : name;
    if (isFunction(reducerI)) {
      return {
        [`${nameReduced}/fulfilled`]: (...allArgs) => {
          (defaultCases.fulfilled ?? defaultCases.f ?? (() => {}))(...allArgs);
          return reducerI(...allArgs);
        },
      };
    } else {
      return {
        [`${nameReduced}/fulfilled`]: (...allArgs) => {
          (defaultCases.fulfilled ?? defaultCases.f ?? (() => {}))(...allArgs);
          return (reducerI.fulfilled ?? reducerI.f ?? (() => {}))(...allArgs);
        },
        [`${nameReduced}/pending`]: (...allArgs) => {
          (defaultCases.pending ?? defaultCases.p ?? (() => {}))(...allArgs);
          return (reducerI.pending ?? reducerI.p ?? (() => {}))(...allArgs);
        },
        [`${nameReduced}/reject`]: (...allArgs) => {
          (defaultCases.reject ?? defaultCases.r ?? (() => {}))(...allArgs);
          return (reducerI.reject ?? reducerI.r ?? (() => {}))(...allArgs);
        },
      };
    }
  });
  return Object.assign({}, ...slices);
};

export const DEFAULT_CASES = {
  pending: (state) => {
    // pending or p
    state.status = 'loading';
  },
  reject: (state, action) => {
    // reject or r
    state.status = 'failed';
    state.error = action.error.message; // ?
  },
  fulfilled: (state) => {
    //fulfilled or f
    state.status = 'succeeded';
  },
};

export const INITIAL_STATE = {
  status: 'idle',
  error: null,
};

export const combineReducers = (
  {
    defaultCases = DEFAULT_CASES,
    defaultInitialState = INITIAL_STATE,
    initialState = {},
    reducers = {},
  } = {},
  ...otherReducers
) => {
  const slices = Object.entries(reducers).map(([name, reducer_]) => {
    const reducer = isFunction(reducer_) ? reducer_() : reducer_;
    const reducerInitialState = reducer.initialState ?? {};
    const noPrefix = reducer.noPrefix ?? false;
    const reducersRTK = reducer.reducers ?? {};
    delete reducer.initialState;
    delete reducer.noPrefix;
    delete reducer.reducers;

    return {
      [name]: createSlice({
        name,
        initialState: {
          ...defaultInitialState,
          ...initialState,
          ...reducerInitialState,
        },
        reducers: reducersRTK,
        extraReducers: processReducer(
          reducer,
          noPrefix ? undefined : name,
          defaultCases,
        ),
      }).reducer,
    };
  });
  return combineReducersRedux(Object.assign({}, ...slices, ...otherReducers));
};

const createStorePersist = ({
  reducer,
  whitelist = [],
  blacklist = [],
  stateReconciler = autoMergeLevel2,
  storage = defaultStorage,
  key = 'root',
  persistConfigOpts = {},
  middlewareOpts = {},
  configureStoreOpts = {},
  persistStoreOpts = {},
  loading = null,
} = {}) => {
  const persistConfig = {
    key,
    storage,
    whitelist: whitelist.length === 0 ? undefined : whitelist,
    blacklist: blacklist.length === 0 ? undefined : blacklist,
    stateReconciler,
    ...persistConfigOpts,
  };

  const persistedReducer = persistReducer(persistConfig, reducer);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      ...middlewareOpts,
    }),
    ...configureStoreOpts,
  });

  let persistor = persistStore(store, ...persistStoreOpts);

  const Provider = ({children}) => (
    <ProviderRedux store={store}>
      <PersistGateRedux loading={loading} persistor={persistor}>
        {children}
      </PersistGateRedux>
    </ProviderRedux>
  );
  return {
    store,
    Provider,
    persistor,
  };
};

const createStoreWithoutPersist = ({reducer, configureStoreOpts} = {}) => {
  const store = configureStore({
    reducer,
    ...configureStoreOpts,
  });

  const Provider = ({children}) => (
    <ProviderRedux store={store}>{children}</ProviderRedux>
  );

  return {
    store,
    Provider,
  };
};

const createStore = ({reducer, configureStoreOpts = {}, persist = {}} = {}) => {
  if (persist && !defaultStorage) {
    console.warn('redux-persist not installed');
    return;
  }
  const storeObj = persist
    ? createStorePersist({reducer, configureStoreOpts, ...persist})
    : createStoreWithoutPersist({reducer, configureStoreOpts});

  return {
    ...storeObj,
  };
};

/*
  slice: function | {},
  name: str,
  others: {}
*/
const createActions = ({actions = {}, slice, name, ...others} = {}) => {
  const prefix =
    slice.prefix ?? slice?.name ?? name ?? Object.keys(others) === 1
      ? Object.keys(others)[0]
      : 'default';

  const noPrefix = slice.noPrefix ?? false;
  const newActions = {};
  Object.entries(actions).forEach(([actionName_, action]) => {
    let newAction = isFunction(action) ? action : action[actionName_];
    const actionName = isFunction(action) ? actionName_ : action.name;
    newActions[actionName_] = createAsyncThunk(
      noPrefix ? actionName : `${prefix}/${actionName}`,
      newAction,
    );
  });
  return newActions;
};

export {createStore, useDispatch, useSelector, createActions};
