import {
    createStore,
    // configure,
} from 'redox';

// for react-native
// import AsyncStorage from '@react-native-community/async-storage';

// if needed (BEFORE IMPORTING SLICES)
// configure({
//     modules: {}, // object with modules
//     usePrf: true, // use default modules PRF
//     cleanIfCalledMultipleTimes: true, // if configure is called multiples times it's reset the modules 
// })

// slices
// import {SLICE_NAME} from './FEATURE_DIR'

const {
    Provider,
    // store,
    // clearState,
} = createStore({
    slices: {
        // initialState: {},
        // SLICE_NAME
    },
    // configureStoreOpts : {},
    // combineReducersOpts : {},
    // reducers: {},
    // for react-native
    // persist: {storage: AsyncStorage},
});

export {
    Provider,
    // store,
    // clearState
};
