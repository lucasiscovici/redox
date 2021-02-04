import React from 'react';
import * as Redux from 'redux';
import {
    // createSlice,
    createAsyncThunk,
    createAction,
    createReducer,
} from '@reduxjs/toolkit';

import {
    Provider as ProviderRedux,
    useDispatch,
    useSelector as useSelectorRedux,
} from 'react-redux';
// import defaultStorage from 'redux-persist/lib/storage';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import {createSelector, createObserver, setState} from './recompute';
// import {setState} from './recompute';
// import {parse} from 'pathington';

import {useRef, useEffect} from 'react';

import isEqual from 'lodash.isequal';
// import {useSelector as useSelectorRedux} from 'react-redux';

function mergeDeep(...objects) {
    const isObject = (obj) => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

let refsCount = 0;

const addRef = (selector) => {
    if (!selector.refIds) {
        selector.refIds = [];
    }
    selector.refIds.push(++refsCount);
    return refsCount;
};

const removeRef = (selector, refId) => {
    if (!selector.refIds) {
        return;
    }
    selector.refIds = selector.refIds.filter((id) => id !== refId);
    if (selector.refIds.length === 0) {
        selector.clearCache();
    }
};

/**
 * Wrapper around useSelector that keeps reference count per component instance
 *  in order to automatically clear the cache when all components using
 *  the selector are unmounted.
 *
 * @param Function selector
 * @param  {...any} args
 */
const useSelector = (selector, ...args) => {
    const ref = useRef();

    if (!ref.current) {
        ref.current = addRef(selector);
    }

    useEffect(() => {
        const refId = ref.current;
        return () => removeRef(selector, refId);
    }, [selector]);

    const result = useSelectorRedux((state) => {
        setState(state);
        return selector(...args);
    });

    return result;
};

const createNoopStorage = () => {
    return {
        getItem(_key) {
            return Promise.resolve(null);
        },
        setItem(_key, value) {
            return Promise.resolve(value);
        },
        removeItem(_key) {
            return Promise.resolve();
        },
    };
};

let defaultStorage = null;
if (typeof document !== 'undefined') {
    // I'm on the web!
    defaultStorage = createWebStorage();
} else if (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'
) {
    // I'm in react-native
    console.warn('/! change the storage for react-native');
    defaultStorage = createNoopStorage();
} else {
    // I'm in node js
}
// const defaultStorage =
//     typeof window === 'undefined' ? createNoopStorage() : createWebStorage();
const {combineReducers: combineReducersRedux} = Redux;

import {configureStore, getDefaultMiddleware} from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    // PersistConfig,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

import {PersistGate as PersistGateRedux} from 'redux-persist/integration/react';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import * as z from 'zod';

var MODULES = [];

var MODULES_CONFIGURATED = false;

const isFunction = (functionToCheck) => {
    return (
        functionToCheck &&
        {}.toString.call(functionToCheck) === '[object Function]'
    );
};

const isObject = (variable) => {
    return Object.prototype.toString.call(variable) === '[object Object]';
};

// const isString = (variable) =>
//     typeof variable === 'string' || variable instanceof String;

// const getParsedPath = (path) => (Array.isArray(path) ? path : parse(path));

// const getCoalescedValue = (value, fallbackValue) =>
//     value === void 0 ? fallbackValue : value;

// const getByPath = (object, path, noMatchValue) => {
//     const parsedPath = getParsedPath(path);

//     if (parsedPath.length === 1) {
//         return object
//             ? getCoalescedValue(object[parsedPath[0]], noMatchValue)
//             : noMatchValue;
//     }

//     let ref = object;
//     let key = parsedPath[0];

//     for (let index = 0; index < parsedPath.length - 1; index++) {
//         if (!ref || !ref[key]) {
//             return noMatchValue;
//         }

//         ref = ref[key];
//         key = parsedPath[index + 1];
//     }

//     return ref ? getCoalescedValue(ref[key], noMatchValue) : noMatchValue;
// };

// var getByPath = function (obj, path, def) {
//     /**
//      * If the path is a string, convert it to an array
//      * @param  {String|Array} path The path
//      * @return {Array}             The path array
//      */
//     var stringToPath = function (path) {
//         // If the path isn't a string, return it
//         if (typeof path !== 'string') return path;

//         // Create new array
//         var output = [];

//         // Split to an array with dot notation
//         path.split('.').forEach(function (item, index) {
//             // Split to an array with bracket notation
//             item.split(/\[([^}]+)\]/g).forEach(function (key) {
//                 // Push to the new array
//                 if (key.length > 0) {
//                     output.push(key);
//                 }
//             });
//         });

//         return output;
//     };

//     // Get the path as an array
//     path = stringToPath(path);

//     // Cache the current object
//     var current = obj;

//     // For each item in the path, dig into the object
//     for (var i = 0; i < path.length; i++) {
//         // If the item isn't found, return the default (or null)
//         if (!current[path[i]]) return def;

//         // Otherwise, update the current  value
//         current = current[path[i]];
//     }

//     return current;
// };
const fakeFunc = () => undefined;

const reducerFunc = z.function(z.tuple([z.unknown(), z.unknown()]), z.void());

// const sliceFunc = (slice) => z.function(z.tuple([]), slice);

const reducerObj = z.object({
    f: reducerFunc,
    fulfilled: reducerFunc,

    p: reducerFunc,
    pending: reducerFunc,

    r: reducerFunc,
    reject: reducerFunc,
});

const reducerZod = z.union([
    reducerFunc,
    reducerObj
        .partial()
        .refine((val) => val.f !== undefined || val.fulfilled !== undefined),
]);

// const reducerZodType = reducerZod.optional();

const Slice = z.record(reducerZod);

// const isSlice = z.instanceof(Slice);

// const Reducer = z.record(reducerFunc);

// const isReducer = z.instanceof(Reducer);

// const processReducerType = z
//     .object({
//         slice: Slice,
//         prefix: z.string(),
//         defaultCases: reducerObj.partial(),
//     })
//     .partial();

// const isProcessReducerType = z.instanceof(processReducerType);

const processReducer = ({
    reducers = {},
    prefix,
    defaultCases = {},
    onlyPrefix = false,
    onlyReducer = false,
} = {}) => {
    // console.log(defaultCases);
    const newReducers = Object.entries(reducers).map(([name, reducer]) => {
        const nameReduced = prefix ? `${prefix}/${name}` : name;
        if (onlyPrefix) return {[name]: nameReduced};
        if (onlyReducer) {
            return {[`${nameReduced}`]: reducer};
        }
        // if (isFunction(reducer)) {
        //     return {
        //         [`${nameReduced}/fulfilled`]: (arg1, arg2) => {
        //             (defaultCases.fulfilled ?? defaultCases.f ?? fakeFunc)(
        //                 arg1,
        //                 arg2,
        //             );
        //             return reducer(arg1, arg2);
        //         },
        //     };
        // } else {
        return {
            [`${nameReduced}/fulfilled`]: (arg1, arg2) => {
                (defaultCases.fulfilled ?? defaultCases.f ?? fakeFunc)(
                    arg1,
                    arg2,
                );
                Object.values(MODULES).forEach((module) =>
                    (module?.cases?.fulfilled ?? module?.cases?.f ?? fakeFunc)(
                        arg1,
                        arg2,
                    ),
                );
                return (isFunction(reducer)
                    ? reducer
                    : reducer.fulfilled ?? reducer.f ?? fakeFunc)(arg1, arg2);
            },
            [`${nameReduced}/pending`]: (arg1, arg2) => {
                (defaultCases.pending ?? defaultCases.p ?? fakeFunc)(
                    arg1,
                    arg2,
                );
                Object.values(MODULES).forEach((module) =>
                    (module?.cases?.pending ?? module?.cases?.p ?? fakeFunc)(
                        arg1,
                        arg2,
                    ),
                );
                return (isFunction(reducer)
                    ? reducer
                    : reducer.pending ?? reducer.p ?? fakeFunc)(arg1, arg2);
            },
            [`${nameReduced}/rejected`]: (arg1, arg2) => {
                // console.log(defaultCases, defaultCases.reject);
                (defaultCases.rejected ?? defaultCases.r ?? fakeFunc)(
                    arg1,
                    arg2,
                );
                Object.values(MODULES).forEach((module) =>
                    (module?.cases?.rejected ?? module?.cases?.r ?? fakeFunc)(
                        arg1,
                        arg2,
                    ),
                );

                return (isFunction(reducer)
                    ? reducer
                    : reducer.rejected ?? reducer.r ?? fakeFunc)(arg1, arg2);
            },
        };
        // }
    });
    const c = Object.assign({}, ...newReducers);
    // console.log(c);
    return c;
};

const without = (object, keys) =>
    keys.reduce((o, k) => {
        const {[k]: _, ...p} = o;
        return p;
    }, object);

const filtered = (object, keys) =>
    Object.keys(object)
        .filter((key) => keys.includes(key))
        .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});

const getErrorKeys = (err) => Object.keys(err.error.flatten().fieldErrors);

const recupGoodSliceExtraReducers = (extraReducers) => {
    const testSafe = Slice.safeParse(extraReducers);
    if (testSafe.success) {
        return Object.keys(testSafe?.data ?? {});
    }
    const sliceErrors = getErrorKeys(testSafe);
    const sliceTestWithoutError = without(extraReducers, sliceErrors);
    if (Object.keys(sliceTestWithoutError).length === 0) {
        return [];
    }

    const testSafe2 = Slice.safeParse(sliceTestWithoutError);
    if (testSafe2.success) {
        return Object.keys(testSafe2?.data ?? {});
    }
    return [];
};

// const processReducerReducers = ({reducers, prefix, defaultCases} = {}) => {
//     const slices = Object.entries(reducers).map(([name, reducer]) => {
//         // const nameReduced = prefix ? `${prefix}/${name}` : name;
//     });
//     return slices;
// };

function getReducers({
    name,
    reducers = {},
    extraReducers,
    noPrefix = false,
    defaultCases = {},
    onlyPrefix = false,
} = {}) {
    if (onlyPrefix) {
        return {
            extra: processReducer({
                reducers: Object.assign({}, extraReducers),
                prefix: noPrefix ? undefined : name,
                onlyPrefix,
            }),
            reducers: processReducer({
                reducers: Object.assign({}, reducers),
                prefix: noPrefix ? undefined : name,
                onlyPrefix,
            }),
        };
        // const finalCaseReducers = {
        //     ...extraReducers,
        //     ...sliceCaseReducersByType,
        // };
        // const reducer = createReducer(initialState, finalCaseReducers);
    } else {
        return {
            ...processReducer({
                reducers: extraReducers,
                prefix: noPrefix ? undefined : name,
                defaultCases,
            }),
            ...processReducer({
                reducers: reducers,
                prefix: noPrefix ? undefined : name,
                onlyReducer: true,
            }),
        };
    }
}

function createReducerFromReducers({reducers, initialState}) {
    return createReducer(
        initialState,
        // reducers,
        reducers,
    );
}

function createSliceFromExtraReducers({
    name,
    initialState = {},
    reducers = {},
    extraReducers = {},
    noPrefix = false,
    defaultCases = {},
    onlyPrefix = false,
    allReducers,
} = {}) {
    const allReducers_ =
        allReducers ??
        getReducers({
            name,
            reducers,
            extraReducers,
            onlyPrefix,
            defaultCases,
            noPrefix,
        });
    if (onlyPrefix) {
        return allReducers_;
    }

    return {
        [name]: createReducerFromReducers({
            initialState,
            // reducers,
            reducers: allReducers_,
        }),
    };
}

function createSliceFromExtraReducersOrNameSpace({
    name,
    initialState = {},
    reducers,
    extraReducers,
    noPrefix,
    defaultCases,
    failIfBad = false,
    onlyPrefix = false,
}) {
    const goodSliceExtraReducers = recupGoodSliceExtraReducers(extraReducers);
    // console.log(defaultCases);
    const plainSliceExtraReducers =
        goodSliceExtraReducers.length > 0 || Object.keys(reducers).length > 0
            ? getReducers({
                  name,
                  initialState,
                  reducers,
                  extraReducers: filtered(
                      extraReducers,
                      goodSliceExtraReducers,
                  ),
                  noPrefix,
                  defaultCases,
                  onlyPrefix,
              })
            : {};
    // console.log('plain', {...plainSliceExtraReducers});
    const newReducers = without(extraReducers, goodSliceExtraReducers);
    // console.log('new', {...newReducers});
    if (Object.keys(newReducers).length > 0) {
        if (failIfBad) {
            return {};
        }
        const repu = Object.entries(newReducers).map(([k, v]) => {
            const {
                // initialState: initialState2 = {},
                noPrefix: noPrefix2 = false,
                reducers: reducers2 = {},
                ...extraReducers2
            } = v;
            return createSliceFromExtraReducersOrNameSpace({
                name: noPrefix ? k : `${name}/${k}`,
                initialState,
                noPrefix: noPrefix2,
                reducers: reducers2,
                extraReducers: extraReducers2,
                defaultCases,
                failIfBad: true,
                onlyPrefix,
            });
        });
        // console.log(repu, flatArrayOfObject(plainSliceExtraReducers, repu));
        const allReducers = createSliceFromExtraReducers({
            allReducers: flatArrayOfObject(plainSliceExtraReducers, repu),
            initialState,
            name,
            onlyPrefix,
        });
        return allReducers;
    }
    // console.log(plainSliceExtraReducers);
    return failIfBad
        ? plainSliceExtraReducers
        : createSliceFromExtraReducers({
              initialState,
              allReducers: plainSliceExtraReducers,
              name,
              onlyPrefix,
          });
}

// const SlicesType = z.object({slices: Slice}).partial();

// const SlicesNamespaceType = z.record(Slices);

// const getSlicesFromExtraReducersType = z.union([
//     z
//         .object({
//             defaultCases: reducerObj,
//             defaultInitialState: z.record(z.unknown()),
//             initialState: z.record(z.unknown()),
//         })
//         .partial(),
//     SlicesType,
// ]);

// const ExtraReducersTypeProps = z
//     .object({
//         initialState: z.record(z.unknown()),
//         noPrefix: z.boolean(),
//         reducers: z.record(z.unknown()),
//     })
//     .partial()
//     .refine((arg) => {
//         return Object.keys(arg).length > 0;
//     });

// const ExtraReducersTypePlain = ExtraReducersTypeProps.merge(Slice);
// const ExtraReducersTypeNameSpace = ExtraReducersTypeProps.merge(
//     z.record(ExtraReducersTypePlain),
// );

// const isGetSlicesFromExtraReducers = z.instanceof(getSlicesFromExtraReducers);

function getSlicesFromExtraReducers({
    extraReducers = {},
    defaultCases = DEFAULT_CASES,
    defaultInitialState = INITIAL_STATE,
    initialState = {},
    name = '',
    onlyPrefix = false,
}) {
    const reducerInitialState = extraReducers.initialState ?? {};
    const noPrefix = extraReducers.noPrefix ?? false;
    const reducersRTK = extraReducers.reducers ?? {};
    delete extraReducers.initialState;
    delete extraReducers.noPrefix;
    delete extraReducers.reducers;
    delete extraReducers.selectors;
    delete extraReducers.getters;

    const modulesInitialState = mergeDeep(
        ...Object.values(MODULES).map((module) => module?.state ?? {}),
        defaultInitialState,
        initialState,
        reducerInitialState,
    );
    // .reduce((state1, state2) => ({...state1, ...state2}), {});

    // const modulesDefaultCases = mergeDeep(defaultCases,);

    // console.log(modulesDefaultCases);

    return createSliceFromExtraReducersOrNameSpace({
        name,
        initialState: {
            ...modulesInitialState,
            // ...defaultInitialState,
            // ...initialState,
            // ...reducerInitialState,
        },
        reducers: reducersRTK,
        extraReducers,
        noPrefix,
        defaultCases: {
            ...defaultCases,
            // ...modulesDefaultCases,
        },
        onlyPrefix,
    });
}

export const prf = {
    config: {
        persist: {
            blacklist: ['status', 'error'],
        },
    },
    state: {
        status: 'idle',
        error: null,
    },
    cases: {
        pending: (state) => {
            // pending or p
            state.status = 'loading';
            state.error = null;
        },
        rejected: (state, action) => {
            // reject or r
            // console.log('here');
            state.status = 'failed';
            state.error = action.error.message;
        },
        fulfilled: (state) => {
            //fulfilled or f
            state.status = 'succeeded';
        },
    },
    getters: {
        getStatus: ({state}) => state?.status,
        getError: ({state}) => state?.error,
    },
    selectors: {
        getError: ({getters}) =>
            (getters?.getStatus() === 'failed' && getters?.getError()) || '',
        isStatusFinish: ({getters}) =>
            ['rejected', 'succeeded'].includes(getters.getStatus()),
    },
}; // pending, reject, fulfilled

export const INITIAL_STATE = {};

export const DEFAULT_CASES = {};

export const DEFAULT_SELECTORS = {};

export const DEFAULT_GETTERS = {};

const configure = ({
    modules = {},
    usePrf = true,
    cleanIfCalledMultipleTimes = true,
} = {}) => {
    if (MODULES_CONFIGURATED) return;
    if (cleanIfCalledMultipleTimes) MODULES = {};
    if (usePrf) modules = {...modules, prf};
    Object.entries(modules).forEach(([module_name, module]) => {
        MODULES[module_name] = module;
    });
    MODULES_CONFIGURATED = true;
};

// const getSlicesType = z
//     .object({
//         defaultCases: reducerObj,
//         defaultInitialState: z.record(z.unknown()),
//         initialState: z.record(z.unknown()),
//     })
//     .partial()
//     .merge(SlicesType);

// const isGetSlices = z.instanceof(getSlicesType);

const getSlicesObj = ({slice}) => {
    return isFunction(slice) ? slice() : slice;
};

/* slices's Group */
function getSlices({
    slices = {},
    defaultCases = DEFAULT_CASES,
    defaultInitialState = INITIAL_STATE,
    initialState = {},
    onlyPrefix = false,
}) {
    const newSlices = Object.entries(slices).map(([name, extraReducers_]) => {
        const extraReducers = getSlicesObj({slice: extraReducers_});

        // console.log(extraReducers);

        return getSlicesFromExtraReducers({
            extraReducers,
            defaultCases,
            defaultInitialState,
            initialState,
            name,
            onlyPrefix,
        });
    });
    return newSlices;
}

function flatArrayOfObject(arrayOfObject, ...objects) {
    // console.log(arrayOfObject);
    // console.log(others);
    // const ef = objects.map((obj) => !Array.isArray(obj) && [obj]);
    // console.log(objects.flat());
    const r = Object.assign(
        {},
        Array.isArray(arrayOfObject) ? arrayOfObject.flat() : arrayOfObject,
        ...objects.flat(),
    );
    return r;
}
const createPersistConfig = ({
    key = 'root',
    storage = defaultStorage,
    whitelist = [],
    blacklist = [],
    stateReconciler = autoMergeLevel2,
    ...persistConfigOpts
}) => {
    return {
        key,
        storage,
        whitelist: whitelist.length === 0 ? undefined : whitelist,
        blacklist: blacklist.length === 0 ? undefined : blacklist,
        stateReconciler,
        ...persistConfigOpts,
    };
};
function combineReducersFromSlicesReducers({slices, reducers, persistConfig}) {
    const gg1 = flatArrayOfObject({}, slices);
    const gg = flatArrayOfObject(slices, reducers);
    // console.log(gg1, gg);
    if (persistConfig) {
        const persistConfigModules = mergeDeep(
            ...Object.values(MODULES).map(
                (module) => module?.config?.persist ?? {},
            ),
            persistConfig,
        );
        // .reduce((a, b) => ({...a, ...b}), {}); // TODO: revoir ça

        // console.log(
        //     flatArrayOfObject(
        //         {},
        //         Object.entries(gg).map(([gg_name, g]) => ({
        //             [gg_name]: persistReducer(
        //                 createPersistConfig({
        //                     key: gg_name,
        //                     ...persistConfig,
        //                     ...persistConfigModules,
        //                 }),
        //                 g,
        //             ),
        //         })),
        //     ),
        // );

        return combineReducersRedux(
            flatArrayOfObject(
                flatArrayOfObject(
                    {},
                    Object.entries(gg1).map(([gg_name, g]) => {
                        // console.log(
                        //     createPersistConfig({
                        //         key: gg_name,
                        //         ...persistConfig,
                        //         ...persistConfigModules,
                        //     }),
                        // );
                        return {
                            [gg_name]: persistReducer(
                                createPersistConfig({
                                    key: gg_name,
                                    // ...persistConfig,
                                    ...persistConfigModules,
                                }),
                                g,
                            ),
                        };
                    }),
                ),
                reducers,
            ),
        );
    }
    return combineReducersRedux(gg);
}

// const combineReducersType = z.union([
//     getSlicesType,
//     z.object({reducers: z.record(Reducer).optional()}),
// ]);

// const isCombineReducersType = z.instanceof(combineReducersType);

function combineReducers({
    defaultCases = DEFAULT_CASES,
    defaultInitialState = INITIAL_STATE,
    initialState = {},
    slices = {},
    reducers = {},
    persistConfig,
}) {
    const newSlices = getSlices({
        defaultCases,
        defaultInitialState,
        initialState,
        slices,
    });
    return combineReducersFromSlicesReducers({
        slices: newSlices,
        reducers,
        persistConfig,
    });
}

// const combineReducersListOrObjectsType = z.union([
//     z.union([getSlicesType, z.array(getSlicesType)]),
//     z.object({reducers: z.record(Reducer).optional()}),
// ]);

// const isCombineReducersListOrObject = z.instanceof(combineReducersListOrObject);

/*
slices: {Slice} => if one group of slices, [{Slice}] if multiple
    Slice:
        initialState: {}, noPrefix = false, prefix:string
reducers: [k: string] : func
*/

function combineReducersListOrObject({
    slices: slices_ = {},
    reducers = {},
    persistConfig,
    ...props
} = {}) {
    const {clearStateActionType = 'redox/resetState'} = props;
    if (!isObject(slices_) && !Array.isArray(slices_)) {
        throw new Error(
            '[combineReducersListOrObject] slices not obj or array',
        );
    }
    const getProps = (slices) => {
        const {
            defaultCases,
            defaultInitialState,
            initialState = {},
            // reducers: innerReducers = {},
            ...innerSlices
        } = slices;
        return {
            slices: innerSlices,
            defaultCases,
            defaultInitialState,
            initialState,
            // reducers: reducers ?? innerReducers,
            // innerReducers,
        };
    };
    let reducer = {};
    let sliceKeys = [];
    if (isObject(slices_)) {
        const {
            defaultCases,
            defaultInitialState,
            initialState,
            // reducers,
            slices,
        } = getProps(slices_);
        sliceKeys = Object.keys(slices);
        reducer = combineReducers({
            slices,
            defaultCases,
            defaultInitialState,
            initialState,
            reducers,
            persistConfig,
        });
    } else {
        if (Array.isArray(slices_)) {
            const allSlices =
                slices_.map((slice) => {
                    const {
                        defaultCases,
                        defaultInitialState,
                        initialState,
                        slices,
                    } = getProps(slice);
                    return flatArrayOfObject(
                        {},
                        getSlices({
                            slices,
                            defaultCases,
                            defaultInitialState,
                            initialState,
                        }),
                    );
                }) ?? [];
            // const allInnerReducers =
            //     slices_.map((slice) => {
            //         const { innerReducers } = getProps(slice);
            //         return innerReducers;
            //     }) ?? [];
            const allSlicesFlat = flatArrayOfObject({}, allSlices);
            const allInnerReducersFlat = reducers; // flatArrayOfObject(allInnerReducers);
            sliceKeys = Object.keys(allSlicesFlat);
            reducer = combineReducersFromSlicesReducers({
                slices: allSlicesFlat,
                reducers: allInnerReducersFlat,
                persistConfig,
            });
        }
    }
    const reducerWithResetState = (state, action) => {
        if (action.type === clearStateActionType) {
            state = {};
        }
        return reducer(state, action);
    };

    return {
        reducer: reducerWithResetState,
        clearState: {type: clearStateActionType},
        sliceKeys,
    };
}

class Getters {
    constructor(name) {
        this.name = name;
        // this.gettersPure = {};
        this.infiniteGetters = {};
        this.getters = {};
        this.gettersObserver = {};
    }
    addGetter(getterName, getterFn) {
        // this.gettersPure[getterName] = getterFn;
        this.createInfiniteGetter(getterName, getterFn);
        this.createObserver(getterName, this.infiniteGetters[getterName]);
        this.getters[getterName] = this.invokeGetter(
            this.gettersObserver[getterName],
        );
    }
    addGetters(getters) {
        const _this = this;
        Object.entries(getters).forEach(([k, v]) => {
            if (isFunction(v)) {
                _this.addGetter(k, v);
            }
        });
        return this.getters;
    }
    infiniteGettersWithState(state) {
        const out = {};
        Object.entries(this.infiniteGetters).forEach(([k, v]) => {
            out[k] = v(state);
        });
        return out;
    }
    createBuildInfiniteGetter(getterFn) {
        const name = this.name;
        const _this = this;
        return (state) => (arg = {}) =>
            getterFn({
                state: state?.[name],
                getters: _this.infiniteGettersWithState(state),
                args: arg,
                context: {
                    state,
                    name,
                },
            });
    }
    createInfiniteGetter(getterName, getterFn) {
        this.infiniteGetters[getterName] = this.createBuildInfiniteGetter(
            getterFn,
        );
    }
    createObserver(getterName, infiniteGettersFn) {
        this.gettersObserver[getterName] = createObserver(
            (state, arg) => infiniteGettersFn(state)(arg),
            {isEqual},
        );
    }
    invokeGetter(getterFn) {
        const _this = this;
        return (arg = {}) => getterFn(arg);
    }
}

export const createGetters = (
    slice,
    name,
    defaultGetters = DEFAULT_GETTERS,
) => {
    const gettersObj = new Getters(name);
    const sliceObj = getSlicesObj({slice});
    const {getters = {}} = sliceObj;
    const modulesDefaultGetters = mergeDeep(
        ...Object.values(MODULES).map((module) => module?.getters ?? {}),
        defaultGetters,
        getters,
    );
    // .reduce((state1, state2) => ({...state1, ...state2}), {});
    const gettersAll = gettersObj.addGetters({
        ...modulesDefaultGetters,
        // ...defaultGetters,
        // ...getters,
    });
    // const gettersAll = flatArrayOfObject(
    //     {},
    //     Object.entries({
    //         ...modulesDefaultGetters,
    //         // ...defaultGetters,
    //         // ...getters,
    //     }).map(([k, v]) => {
    //         if (isFunction(v)) {
    //             return {
    //                 [k]: (...args) =>
    //                     createObserver((state) =>
    //                         v({
    //                             state: state[name],
    //                             getters: {
    //                                 ...modulesDefaultGetters,
    //                                 // ...defaultGetters,
    //                                 // ...getters,
    //                             },
    //                             args: args?.[0] ?? {},
    //                             context: {
    //                                 state,
    //                                 name,
    //                             },
    //                         })
    //                     )(),
    //             };
    //         }
    //         // if (isString(v)) {
    //         //     return {
    //         //         [k]: (...args) =>
    //         //             createObserver(({state}) =>
    //         //                 getByPath(state[name], v, undefined),
    //         //             ),
    //         //     };
    //         // }
    //     })
    // );

    return gettersAll;
};

class Selectors {
    constructor(name, getters) {
        this.name = name;
        this.selectors = {};
        this.selectorsObj = {};
        this.getters = getters; // observers
    }
    addSelector(selectorName, selectorFn) {
        this.createSelector(selectorName, selectorFn);
        this.selectors[selectorName] = this.invokeSelector(
            this.selectorsObj[selectorName],
        );
    }
    addSelectors(selectors) {
        const _this = this;
        Object.entries(selectors).forEach(([k, v]) => {
            if (isFunction(v)) {
                _this.addSelector(k, v);
            }
        });
        return this.selectors;
    }
    createBuildSelector(selectorFn) {
        const name = this.name;
        const _this = this;
        return (...args) =>
            selectorFn({
                getters: _this.getters,
                selectors: _this.selectorsObj,
                args: args?.[0] ?? args,
                context: {
                    name,
                },
            });
    }
    createSelector(selectorName, selectorFn) {
        const _this = this;
        this.selectorsObj[selectorName] = createSelector((...args) =>
            _this.createBuildSelector(selectorFn)(...args),
        );
    }
    invokeSelector(selectorFn) {
        const _this = this;
        return (...args) => useSelector(selectorFn, ...args);
    }
}

export const createSelectors = ({
    slice,
    name,
    getters = {},
    defaultSelectors = DEFAULT_SELECTORS,
}) => {
    const selectorsObj = new Selectors(name, getters);
    const sliceObj = getSlicesObj({slice});
    const {selectors = {}} = sliceObj;
    const modulesDefaultSelectors = mergeDeep(
        ...Object.values(MODULES).map((module) => module?.selectors ?? {}),
        defaultSelectors,
        selectors,
        getters,
    );

    const selectorsAll = selectorsObj.addSelectors(modulesDefaultSelectors);

    // const selectorsAll = flatArrayOfObject(
    //     {},
    //     Object.entries({
    //         ...modulesDefaultSelectors,
    //         // ...defaultSelectors,
    //         // ...selectors,
    //         // ...getters,
    //     }).map(([k, v]) => {
    //         if (isFunction(v)) {
    //             return {
    //                 [k]: (...args) =>
    //                     useSelector(
    //                         createSelector((state) => {
    //                             return v({
    //                                 // TODO : add selector
    //                                 state,
    //                                 getters,
    //                                 args: args?.[0] ?? {},
    //                                 context: {
    //                                     name,
    //                                 },
    //                             });
    //                         })
    //                     ),
    //             };
    //         }
    //         // if (isString(v)) {
    //         //     return {
    //         //         [k]: (...args) =>
    //         //             useSelectorRedux((state) =>
    //         //                 createSelector((state) =>
    //         //                     getByPath(state[name], v, undefined),
    //         //                 ),
    //         //             ),
    //         //     };
    //         // }
    //     })
    // );

    return selectorsAll;
};

// export const createSelectors = (
//     slice,
//     name,
//     globalSelectors = {},
//     defaultSelectors = DEFAULT_SELECTORS,
// ) => {
//     const sliceObj = getSlicesObj({slice});
//     const {selectors = {}} = sliceObj;
//     const modulesDefaultSelectors = Object.values(MODULES)
//         .map((module) => module?.selectors ?? {})
//         .reduce((state1, state2) => ({...state1, ...state2}), {});

//     const selectorsAll = flatArrayOfObject(
//         {},
//         Object.entries({
//             ...modulesDefaultSelectors,
//             ...defaultSelectors,
//             ...selectors,
//         }).map(([k, v]) => {
//             // if (isFunction(v)) {
//             return {
//                 [k]: (...args) =>
//                     createSelector(({state}) =>
//                         v({
//                             state: state[name],
//                             selectors: {
//                                 ...modulesDefaultSelectors,
//                                 ...defaultSelectors,
//                                 ...selectors,
//                             },
//                             args: args?.[0] ?? {},
//                             context: {
//                                 state,
//                                 name,
//                                 globalSelectors: selectors,
//                             },
//                         }),
//                     ),
//             };
//             // }
//             // if (isString(v)) {
//             //     return {
//             //         [k]: (...args) =>
//             //             createObserver(({state}) =>
//             //                 getByPath(state[name], v, undefined),
//             //             ),
//             //     };
//             // }
//         }),
//     );
//     return selectorsAll;
// };

/*
  actions: function | {},
  slice?: Slice,
*/
const createActions = ({actions = {}, slice} = {}) => {
    // const prefix_ = slice?.prefix ?? slice?.name ?? prefix ?? '';

    const {extra, reducers} = getSlices({
        // COMMENT: configure because we need here
        slices: {[slice.name]: slice},
        onlyPrefix: true,
    })[0];
    const kkk = flatArrayOfObject({}, extra);
    const kkk2 = flatArrayOfObject({}, reducers);

    // console.log(kkk, kkk2);

    // const noPrefix = slice.noPrefix ?? prefix_ === ''; // ?? false
    const newActions = {};
    Object.entries(actions).forEach(([actionName_, action]) => {
        const newAction = isFunction(action) ? action : action[actionName_];
        const actionName = isFunction(action) ? actionName_ : action.name;
        const getSliceState = (getState) => () => getState()[slice.name];
        newActions[actionName_] = createAsyncThunk(
            kkk[actionName],
            (payloadCreator, thunkApi) =>
                newAction(payloadCreator, thunkApi, {
                    getSliceState: getSliceState(thunkApi.getState),
                    selectors: slice?.selectors ?? {},
                }),
        );
    });

    Object.entries(kkk2).forEach(([actionName_, action]) => {
        newActions[actionName_] = createAction(action);
    });

    // createAction(type)
    return newActions;
};

const createActionsGettersSelectors = ({actions = {}, slice} = {}) => {
    const getters = createGetters(slice, slice.name);
    return {
        actions: createActions({actions, slice}),
        selectors: createSelectors({slice, name: slice.name, getters}),
        getters,
        // selectors: createSelectorObservers(slice, slice.name),
    };
};
const createActionsSelectors = createActionsGettersSelectors;
const createIndex = createActionsGettersSelectors;
export {createActionsGettersSelectors, createActionsSelectors, createIndex};
/*
slices: {Slice} => if one group of slices, [{Slice}] if multiple
    Slice:
        initialState: {}, noPrefix = false, prefix:string

*/
function createStorePersist({
    slices = {},
    reducers = {},
    //
    configureStoreOpts = {},
    combineReducersOpts = {},
    // persist opts
    whitelist = [],
    blacklist = [],
    stateReconciler = autoMergeLevel2,
    storage = defaultStorage,
    key = 'root',
    persistConfigOpts = {},
    middlewareOpts = {},
    persistStoreOpts = [],
    loading = null,
}) {
    const {reducer, clearState, sliceKeys} = combineReducersListOrObject({
        slices,
        reducers,
        persistConfig: {storage, stateReconciler},
        ...combineReducersOpts,
    });
    const persistConfig = createPersistConfig({
        key,
        storage,
        whitelist,
        blacklist: [...blacklist, ...sliceKeys], // TODO: warning when custom slice name
        stateReconciler,
        ...persistConfigOpts,
    });
    // console.log(persistConfig);
    const persistedReducer = persistReducer(persistConfig, reducer);

    const store = configureStore({
        reducer: persistedReducer,
        middleware: getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
            ...middlewareOpts,
        }),
        ...configureStoreOpts,
    });

    const persistor = persistStore(store, ...persistStoreOpts);

    const Provider = ({children}) => {
        return (
            <ProviderRedux store={store}>
                <PersistGateRedux loading={loading} persistor={persistor}>
                    {children}
                </PersistGateRedux>
            </ProviderRedux>
        );
    };
    return {
        store,
        Provider,
        persistor,
        rootReducer: reducer,
        clearState,
    };
}

/*
slices: {Slice} => if one group of slices, [{Slice}] if multiple
    Slice:
        initialState: {}, noPrefix = false, prefix:string

*/
const createStoreWithoutPersist = ({
    slices = {},
    configureStoreOpts = {},
    reducers = {},
    combineReducersOpts = {},
} = {}) => {
    const {reducer, clearState} = combineReducersListOrObject({
        slices,
        reducers,
        ...combineReducersOpts,
    });
    const store = configureStore({
        reducer,
        ...configureStoreOpts,
    });

    const Provider = ({children}) => {
        return <ProviderRedux store={store}> {children} </ProviderRedux>;
    };

    return {
        store,
        Provider,
        rootReducer: reducer,
        clearState,
    };
};

/*
slices: {Slice} => if one group of slices, [{Slice}] if multiple
    Slice:
        initialState: {}, noPrefix = false, prefix:string
configureStoreOpts: {}
persist: {}
reducers: {} -> normal reducers
*/
const createStore = ({
    slices,
    configureStoreOpts = {},
    persist = {},
    reducers = {},
    combineReducersOpts = {},
} = {}) => {
    if (persist && !defaultStorage) {
        console.warn('redux-persist not installed');
        return;
    }
    // console.log(slices);
    const storeObj = persist
        ? createStorePersist({
              slices,
              configureStoreOpts,
              ...persist,
              reducers,
              ...combineReducersOpts,
          })
        : createStoreWithoutPersist({
              slices,
              configureStoreOpts,
              reducers,
              ...combineReducersOpts,
          });

    return storeObj;
};

configure();
MODULES_CONFIGURATED = false;
console.log('loaded', MODULES_CONFIGURATED);
export {createStore, useDispatch, useSelector, createActions, configure};
