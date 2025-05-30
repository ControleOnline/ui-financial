import * as actions from '@controleonline/ui-default/src/store/default/actions';
import * as getters from '@controleonline/ui-default/src/store/default/getters';
import mutations from '@controleonline/ui-default/src/store/default/mutations';
import Formatter from '@controleonline/ui-common/src/utils/formatter.js';

export default {
  namespaced: true,
  state: {
    item: null, //Don´t touch plz....
    items: null, //Don´t touch plz....
    resourceEndpoint: 'wallets',
    isLoading: false,
    isSaving: false,
    error: '',
    totalItems: 0,messages:[], message:{},
    filters: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: 'id',
        align: 'left',
        label: 'id',
        externalFilter: false,
        format: function (value) {
          return '#' + value;
        },
      },
      {
        editable: false,
        sortable: true,
        name: 'wallet',
        align: 'left',
        label: 'wallet',
        externalFilter: false,
        format: function (value) {
          return value;
        },
      },
    ],
  },
  actions: actions,
  getters,
  mutations,
};
