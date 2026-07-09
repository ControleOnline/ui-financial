import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";
import * as customActions from "./customActions";

export default {
  namespaced: true,
  state: {
    item: null,
    items: null,
    resourceEndpoint: "invoices",
    isLoading: false,
    isSaving: false,
    error: "",
    totalItems: 0,
    summary: {},
    add: true,
    messages: [],
    message: {},
    filters: {},
    columns: [
      {
        editable: false,
        isIdentity: true,
        filterClass: "col-1 q-pa-xs",
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
        sortable: true,
        sortField: "payer.name",
        filterClass: "col-1 q-pa-xs",
        formClass: "col-12",
        name: "payer",
        align: "left",
        label: "payer",
        list: "people/getItems",
        externalFilter: false,
        format: function (value) {
          return value?.name
            ? value?.name + " - " + value?.alias
            : "---------------";
        },
        formatList: function (value, _row, _column) {
          return {
            id: value?.id,
            label: value?.name,
          };
        },
        saveFormat: function (value) {
          return value ? "/people/" + (value.value || value) : null;
        },
      },
      {
        sortable: true,
        sortField: "receiver.name",
        filterClass: "col-1 q-pa-xs",
        formClass: "col-12",
        name: "receiver",
        align: "left",
        label: "receiver",
        list: "people/getItems",
        externalFilter: false,
        format: function (value) {
          return value?.name
            ? value?.name + " - " + value?.alias
            : "---------------";
        },
        formatList: function (value, _row, _column) {
          return {
            id: value?.id,
            label: value?.name,
          };
        },
        saveFormat: function (value) {
          return value ? "/people/" + (value.value || value) : null;
        },
      },
      {
        sortable: true,
        sortField: "category.name",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "category",
        align: "left",
        label: "category",
        list: "categories/getItems",
        searchParam: "name",
        externalFilter: true,
        format: function (value) {
          return value?.name;
        },
        style: function (value) {
          return {
            color: value?.category?.color,
          };
        },
        formatList(data) {
          return {
            value: data?.id,
            label: data?.name,
          };
        },
        saveFormat: function (value, _column, _row) {
          //if (row && row["@id"])
          return "/categories/" + parseInt(value.value || value);
          //else return parseInt(value.value || value);
        },
      },
      {
        sortable: true,
        sortField: "status.status",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "status",
        align: "left",
        label: "status",
        list: "status/getItems",
        listRequestParams: {
          context: "invoice",
        },
        searchParam: "status",
        externalFilter: true,
        format: function (value) {
          return value?.status;
        },
        style: function (value) {
          return {
            color: value?.status?.color,
          };
        },

        saveFormat: function (value) {
          return value ? "/statuses/" + (value?.value || value) : null;
        },
      },
      {
        inputType: "date-range",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        sortable: true,
        name: "dueDate",
        align: "left",
        label: "dueDate",
        externalFilter: true,
        saveFormat: function (value) {
          return Formatter.buildAmericanDate(value);
        },
        format: function (value) {
          return Formatter.formatDateYmdTodmY(value);
        },
      },
      {
        sortable: true,
        sortField: "sourceWallet.wallet",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "sourceWallet",
        align: "left",
        label: "source wallet",
        list: "wallet/getItems",
        searchParam: "sourceWallet",
        externalFilter: false,
        format: function (value) {
          return value?.wallet;
        },
        formatList(data) {
          return {
            value: data?.id,
            label: data?.wallet,
          };
        },
        saveFormat: function (value) {
          return value ? "/wallets/" + (value?.value || value) : null;
        },
      },
      {
        sortable: true,
        sortField: "destinationWallet.wallet",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "destinationWallet",
        align: "left",
        label: "destination wallet",
        list: "wallet/getItems",
        searchParam: "destinationWallet",
        externalFilter: false,
        format: function (value) {
          return value?.wallet;
        },
        formatList(data) {
          return {
            value: data?.id,
            label: data?.wallet,
          };
        },
        saveFormat: function (value) {
          return value ? "/wallets/" + (value?.value || value) : null;
        },
      },
      {
        sortable: true,
        sortField: "paymentType.paymentType",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "paymentType",
        align: "left",
        label: "paymentType",
        list: "paymentType/getItems",
        searchParam: "paymentType",
        externalFilter: false,
        editable: true,
        format: function (value) {
          return value?.paymentType;
        },
        formatList: function (value) {
          if (value && value["@id"])
            return {
              value: value["@id"].split("/").pop(),
              label: value?.paymentType,
              object: value,
            };
          return value;
        },
        saveFormat: function (value) {
          return value ? "/payment_types/" + (value?.value || value) : null;
        },
      },
      {
        sortable: true,
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "invoiceType",
        align: "left",
        label: "invoiceType",
        editable: false,
        defaultValue: "invoice",
        format: function (value) {
          return String(value || "")
            .trim()
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
        },
        saveFormat: function (value) {
          return String(value || "invoice").trim().toLowerCase() || "invoice";
        },
      },
      {
        sortable: true,
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "installments",
        align: "center",
        label: "installments",
        editable: false,
        defaultValue: 1,
        inputType: "number",
        mask: "####",
        editFormat(value) {
          return parseInt(value || 1);
        },
        saveFormat(value) {
          return parseInt(value || 1);
        },
        format(value, _column, row, _editing) {
          if (row?.paymentType?.frequency == "single") {
            return "1X";
          }
          if (row?.installments == 0) {
            return "Recorrente";
          }
          return (
            (row?.portion > 0 ? row?.portion : 1) + "X/" + row?.installments
          );
        },
      },
      {
        inputType: "float",
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        filters: false,
        sortable: true,
        name: "price",
        align: "left",
        label: "value",
        sum: true,
        editFormat(value) {
          return Formatter.formatMoney(value);
        },
        saveFormat(value) {
          return Formatter.formatFloat(value);
        },
        format(value) {
          return Formatter.formatMoney(value);
        },
      },
    ],
  },
  actions: { ...actions, ...customActions },
  getters,
  mutations,
};
