# Redox

Speed-up react redux writing

Only write actions as simple function and reducer as mapping object

# Install
## npm or yarn
```shell
npm install https://github.com/lucasiscoviciMoon/redox 
# or
yarn add https://github.com/lucasiscoviciMoon/redox 
```
## sublime text plugin
Package Control: add repository  
https://raw.github.com/lucasiscoviciMoon/redox/sublime/packages.json  
Package Control: install package  
Redox Snippets + SideBar Menu

# Setup

## createStore: Create the store file

createStore use redux-persist by default (with web storage)  
createStore return the Provider (redux or redux with persist)

### React

store.js

```js
import {
    createStore,
    // configure
} from 'redox';

// If we want to configure with special configuration
// DONT FORGET TO call configure before importing slices
// configure()

// slices
import {user} from './user';
...

const {Provider} = createStore({
    slices: {
        user,
        ...
    },
});

export {Provider};

```

### React-native

store.js

```js
import {createStore} from 'redox';
import AsyncStorage from '@react-native-community/async-storage';

// slices 
import {user} from  './user';
...

const {Provider} = createStore({
  slices: {
    user,
    ...
  },
  persist: {storage: AsyncStorage},
});
export {Provider};
```

### Sublime Text

You can click on the folder (state, State, etc.....)  and click on "Create Redox store"  

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

- Create the folder 'user'
- Create 'actions', 'slice', 'index' files

### Create actions
It's only a function that return data

user/actions.js

```js
import api from '...';

export const fetchUsers = async () => (await api.get('users/')).data;
```

#### Sublime Text

you can use the snippet "Redox_actions"

### Create Slice
It's only a function that return a mapping between action name and modication of the current state of the slice

payload is the data return by the action.

user/slice.js

```js
import {fetchUsers} from './actions';

export const users = () => ({

  // add initialState only for this slice
  initialState: {
        data: {},
  },
  // add getters (only for read from the state)
  getters: {
        getUsers: ({state}) => state.data,
        getUser: ({getters, args: { userId }}) => getters.getUsers()?.[userId],
        getUserFirstName: ({getters, args}) => getters.getUser({...args})?.firstname,
        getUserLastName: ({getters, args}) => getters.getUser({...args})?.lastname,
  },
  // add selectors (when we combine getters or selectors)
  selectors: {
        getUserFullName: ({getters, args}) => `${getters.getUserFirstName({...args})} ${getters.getUserLastName({...args})}`
  },
  // add mapping between action and modification of the state
  [fetchUsers.name]: (state, {payload}) => { // Redox_extraReducers
        state.data = payload;
  },
  reducers: { // Redox_reducers
  
  },
});
```

#### Sublime Text

you can use the snippet "Redox_getters", "Redox_selectors", "Redox_reducers", "Redox_extraReducers"

### createActionsGettersSelectors: Create Index
CreateIndex is an alias of createActionsGettersSelectors too

user/index.js

```js
import {createActions} from 'redox';

import * as actions from './actions';
import {users} from './slice';

const {actions: createdActions, getters, selectors} = createActionsGettersSelectors({
  actions,
  slice: users,
});

export {createdActions as actions, getters, selectors};
```


### Sublime Text

You can click on the folder (state, State, etc.....)  and click on "Create Redox slice feature" to create the folder with "index.js", "actions.js" and "slice.js"  

## add the slice in store.js

store.js

```js
import {createStore} from 'redox';
...

// slices 
import {user} from  './user';
...

const {Provider} = createStore({
  slices: {
    user,
    ...
  },
  ...
});
export {Provider};
```
## Sublime Text

you can use the snippet "Redox_import_slice"

## call the action, use the selector

```js
import React from 'react';
import { actions as userActions, selectors as userSelectors } from '@/state/user';

const Home = () => {
  const users = userSelectors.getUsers();
  React.useEffect(() => {
    userActions.fetchUsers();
  }, []);
};
```

### Sublime Text

you can use the snippet "Redox_import_selectors_actions"

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
    // getters: {}, // ({state, getters, args}) | add getters (only for read from the state)
    // selectors: {}, //  ({selectors, getters, args}) | add selectors (when we combine getters or selectors) 
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

## createStore
### slices
it's apply different options for a group of slice

"initialState" : initial state for each slice  
"defaultCases" (deprecated)  : default cases for fulfilled, pending, rejected  
"defaultInitialState" (deprecated) : default initial state for each slice
 
the rest are the slices
 
 
(Prefer use modules that default*)

```js
createStore({
    slices, // {} or [] each slices could have an specific initialState 
    configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
    persist = {} // if persist is set to null/undefined no persistance, if set it's the configuration options for createStorePersist
    combineReducersOpts = {} // some configuration for 'combineReducersListOrObject' (clearStateActionType)
    reducers = {} // reducers without redox configuration (normal reducers)
})
```

### createStorePersist

```js
createStorePersist({
  slices = {},
  reducers = {},
  //
  configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
  combineReducersOpts = {}, // some conf options for 'combineReducersListOrObject'
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
  slices = {},
  reducers = {},
  configureStoreOpts = {}, // some configuration options for 'configureStore' function of @reduxjs/toolkit
  combineReducersOpts = {},
})
```

# Modules
## Architecture
```js
{
    config: {
        persist: {
            ...
        },
    },
    slice: {
        state: {
            ...
        },
        cases: {
            pending: (state) => {
                // pending or p
                ...
            },
            rejected: (state, action) => {
                // reject or r
                ...
            },
            fulfilled: (state) => {
                //fulfilled or f
                ...
            },
        },
        getters: {
            ...
        },
        selectors: {
            ...
        },
  },
  reducers: {},
  postCreateStore: () => {}
}

```
## PRF
```js
 const prf = {
  config: {
    persist: {
      blacklist: ["status", "error"],
    },
  },
  slice: {
    state: {
      status: "idle",
      error: null,
    },
    cases: {
      pending: (state) => {
        // pending or p
        state.status = "loading";
        state.error = null;
      },
      rejected: (state, action) => {
        // reject or r
        // console.log('here');
        state.status = "failed";
        state.error = action.error.message;
      },
      fulfilled: (state) => {
        //fulfilled or f
        state.status = "succeeded";
      },
    },
    getters: {
      getStatus: ({ state }) => state?.status,
      getError: ({ state }) => state?.error,
    },
    selectors: {
      getError: ({ getters }) =>
        (getters?.getStatus() === "failed" && getters?.getError()) || "",
      isStatusFinish: ({ getters }) =>
        ["failed", "succeeded"].includes(getters.getStatus()),
      isPending: ({ getters, selectors }) => !selectors.isStatusFinish(),
    },
  },
  reducers: {},
}; 
```

## configure
```js
configure({
    modules: {}, // object with modules
    usePrf: true, // use default modules PRF
    cleanIfCalledMultipleTimes: true, // if configure is called multiples times it's reset the modules 
})

```

store.js
```js
import {
    createStore,
    configure
} from 'redox';

// If we want to configure with special configuration
// DONT FORGET TO call configure before importing slices
configure({usePrf: false}) // don't use prf by default

// slices
import {user} from './user';
...

const {Provider} = createStore({
    slices: {
        user,
        ...
    },
});

export {Provider};

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
