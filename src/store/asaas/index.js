import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import * as customActions from './customActions';

export default {
  namespaced: true,
  state: {
    item: null,
    items: null,
    resourceEndpoint: 'assas',
    isLoading: false,
    isSaving: false,
    error: '',
    totalItems: 0,
    messages: [],
    message: {},
    filters: {},
    columns: [
    ],
  },
  actions: {...actions, ...customActions},
  getters,
  mutations,
};
