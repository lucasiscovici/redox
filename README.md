# Redox
Make Redux Simple Again

Write actions as function and reducers as object

# Installation
...
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

## slices

action -> { payload, type, [meta, error] }

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
