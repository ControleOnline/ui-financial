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
        externalFilter: false,
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
        list:[
          {label:'Única',value:'single'},
          {label:'Diário',value:'daily'},
          {label:'Semanal',value:'weeakly'},
          {label:'Mensal',value:'monthly'},          
        ],
        externalFilter: false,
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
        list:[
          {label:'Única',value:'single'},
          {label:'Parcelas',value:'split'},
        ],        
        externalFilter: false,
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
