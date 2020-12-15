# Redox

Speed-up react redux writing

Only write actions as simple function and reducer as object

# Installation

# Setup

## combineReducers: Create reducers.js

reducers.js

```js
import {combineReducers} from 'redox';

export default combineReducers({
  reducers: {},
});
```

## createStore: Create the store file

createStore use redux-persist by default (with web storage)  
createStore return the Provider (redux or redux with persist)

### React

store.js

```js
import {createStore} from 'redox';
import reducer from './reducers';

const {Provider} = createStore({reducer});
export {Provider};
```

### React-native

store.js

```js
import {createStore} from 'redox';
import AsyncStorage from '@react-native-community/async-storage';

import reducer from './reducers';

const {Provider} = createStore({
  reducer,
  persist: {storage: AsyncStorage},
});
export {Provider};
```

## Providing the Store

We wrap our app with the "\<Provider />"

Provider can be :

- the Provider from react-redux
- or if persist is enabled the Provider from react-redux and inside the PersitGate from redux-persist

Provider is already configured with the store (persit configuration if needed)

App.js

```js
import {Provider} from './state/store';

export default function App() {
  return <Provider>...</Provider>;
}
```

# USAGE

## Create the "User" feature

- Create the folder 'users'
- Create 'actions', 'slice', 'index' files

### Create actions

users/actions.js

```js
import api from '...';

export const fetchUsers = async () => (await api.get('users/')).data;
```

### Create Slice

payload is the data return by the action.

users/slice.js

```js
import {fetchUsers} from './actions';

export const users = () => ({
  [fetchUsers.name]: (state, {payload}) => {
    state.data = payload;
  },
});
```

### createActions: Create Index

users/index.js

```js
import {createActions} from 'redox';

import * as actions from './actions';
import {users} from './slice';

export default createActions({actions, slice: users});
```

## add the reducer in reducers.js

reducers.js

```js
import {combineReducers} from 'redox';

import {users} from './users/slice';

export default combineReducers({
    ...
    reducers: {
        users,
    },
});
```

## call the action

```js
import React from 'react';
import {useDispatch} from 'redox';

import {fetchUsers} from '@/state/users';

const Home = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchUsers());
  }, []);
};
```

# API

## actions

payloadCreator -> argument send to the action with the dispatch function (dispatch(fetchUsers(...)))  
thunkAPI -> {dispatch, getState, extra, requestId, signal, rejectWithValue}

users/actions.js

```js
import api from '...';

export const fetchUser = async (payloadCreator, thunkAPI) =>
  (await api.get(`users/{payloadCreator.id}/`)).data;
```

To specify the "name" ("type" in createAsyncThunk from redux-toolkit)

```js
import api from '...';

export const fetchUser = {
  name: 'patient/user',
  fetchUser: async (payloadCreator, thunkAPI) =>
    (await api.get(`users/{payloadCreator.id}/`)).data,
};
```

## slices

If name is not specified for the action. The default type is "SLICE_NAME/ACTION_NAME".  
"SLICE_NAME" is the called 'prefix'.

action -> { payload, type, [meta, error] }

```js
export const SLICE_NAME = () => ({
    // optional
    // initialState : {}, // specific initial state for this SLICE
    // noPrefix : false, // don't add "SLICE_NAME/" in default type
    // prefix : null, // specify prefix for the type
    // reducers : {} // equivalent to "reducers" in CreateSlice of redux-toolkit

    // equivalent to extraReducers in CreateSlice of redux-toolkit
    [ACTION.name]: (state, action) => {
        ...
    },

    // SAME AS

    [ACTION.name]: {
        fulfilled(state, action){
            ...
        }
    },


    // SAME AS

    [ACTION.name]: {
        f : (state, action) => {
            ...
        }
    },
})

```

By default theses reducers are for the fulfilled state.

To add specific pending, reject function after the default cases pending, reject function

```js
export const SLICE_NAME = () => ({
    ...

    [ACTION.name]: {
        pending: (state, action) => {
            ...
        },
        rejected: (state, action) => {
            ...
        }
    },

    // SAME AS
    [ACTION.name]: {
        p: (state, action) => {
            ...
        },
        r: (state, action) => {
            ...
        }
    },
})

```

users/slice.js

```js
import {fetchUsers} from './actions';

export const users = () => ({
    initialState: {
        users: []
    };
    [fetchUsers.name]: (state, action) => {
        state.users = action.payload;
    },
});
```

## combineReducers

```js
combineReducers({
    defaultCases = DEFAULT_CASES,
    defaultInitialState = INITIAL_STATE,
    initialState = {}
    reducers = {}
})

```

'DEFAULT_CASES' is object with default reducers for pending, rejected and fulfilled "state"

```js
const DEFAULT_CASES = {
  pending: (state) => {
    // pending or p
    state.status = 'loading';
  },
  reject: (state, action) => {
    // reject or r
    state.status = 'failed';
    state.error = action.error.message;
  },
  fulfilled: (state) => {
    //fulfilled or f
    state.status = 'succeeded';
  },
};
```

'INITIAL_STATE' is object with default state used by DEFAULT_CASES reducers

```js
const INITIAL_STATE = {
  status: 'idle', // idle, loading, failed, succeeded
  error: null,
};
```

'initialState' is the default state for each reducers
'reducers' are the object of reducers

reducers.js

```js
import {combineReducers} from 'redox';

export default combineReducers({
    initialState: {
        data: {},
    },
    ...
});
```

All reducers with have in their initial state "data" which is an empty object.

## createStore

```js
createStore({
    reducer,
    configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
    persist = {} // if persist is set to null/undefined no persistance, if set it's the configuration options for createStorePersist
})
```

### createStorePersist

```js
createStorePersist({
  reducer,
  configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
  // following are options from 'persist' object from createStore
  whitelist = [], // for redux-persist (persistConfig)
  blacklist = [], // for redux-persist (persistConfig)
  stateReconciler = autoMergeLevel2, // for redux-persist  (persistConfig)
  storage = defaultStorage, // for redux-persist (persistConfig)
  key = 'root', // for redux-persist (persistConfig)
  persistConfigOpts = {}, // for redux-persist (persistConfig)
  persistStoreOpts = {}, // for redux-persist  (persistStore)
  middlewareOpts = {}, // for @reduxjs/toolkit (getDefaultMiddleware)
  loading = null, // for redux-persist (PersitGate)
})
```

### createStoreWithoutPersist

```js
createStorePersist({
  reducer,
  configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
})
```

# Approach

- based on redux-toolkit
  - based on extraReducers of redux-toolkit
    - pending
    - reject
    - fulfilled
  - based on thunk
- create one folder by feature
  - actions
  - slice
  - index
- no extras import in actions/slice only one in index;
