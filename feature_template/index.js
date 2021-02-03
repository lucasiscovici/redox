import {createActionsGettersSelectors} from 'redox';
import * as actions from './actions';
import {{{SLICE_NAME}}} from './slice';

const {actions: createdActions, getters, selectors} = createActionsGettersSelectors({
    actions,
    slice: {{SLICE_NAME}},
});

export {createdActions as actions, getters, selectors, {{SLICE_NAME}}};
