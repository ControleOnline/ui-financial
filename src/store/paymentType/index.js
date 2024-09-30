import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";

export default {
  namespaced: true,
  state: {
    resourceEndpoint: "payment_types",
    isLoading: false,
    error: "",
    violations: null,
    totalItems: 0,
    filters: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        sortable: true,
        name: "id",
        align: "left",
        label: "id",
        externalFilter: true,
        format: function (value) {
          return "#" + value;
        },
      },
      {
        editable: false,
        sortable: true,
        name: "frequency",
        align: "left",
        label: "frequency",
        externalFilter: true,
        format: function (value) {
          return value;
        },
      },   
      {
        editable: false,
        sortable: true,
        name: "installments",
        align: "left",
        label: "installments",
        externalFilter: true,
        format: function (value) {
          return value;
        },
      }, 
      {
        editable: false,
        sortable: true,
        name: "paymentType",
        align: "left",
        label: "paymentType",
        externalFilter: true,
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
