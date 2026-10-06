import * as actions from "@controleonline/ui-default/src/store/default/actions";
import * as getters from "@controleonline/ui-default/src/store/default/getters";
import mutations from "@controleonline/ui-default/src/store/default/mutations";
import Formatter from "@controleonline/ui-common/src/utils/formatter.js";
import * as customActions from "./customActions";
import {
  resolveInvoiceCategoryListParams,
  resolveInvoiceCreateFieldVisibility,
  resolveInvoicePaymentTypeListParams,
  resolveInvoicePartyListParams,
  formatInvoicePartyLabel,
  formatInvoicePartyOption,
  resolveInvoiceWalletListParams,
  formatInvoiceWalletOption,
  formatInvoicePaymentTypeOption,
} from "../../react/pages/financialEntriesFilters";

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
        label: "Pagador",
        formLabel: "Pagador",
        createPayload: true,
        list: "people/getItems",
        listRequestParams: ({currentCompanyId, requestParams}) =>
          resolveInvoicePartyListParams({
            columnName: "payer",
            currentCompanyId,
            requestParams,
          }),
        externalFilter: false,
        visibleForm: row => resolveInvoiceCreateFieldVisibility({fieldName: "payer", requestParams: row}),
        format: function (value) {
          return formatInvoicePartyLabel(value);
        },
        formatList: function (value, _row, _column) {
          return formatInvoicePartyOption(value);
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
        label: "Recebedor",
        formLabel: "Recebedor",
        createPayload: true,
        list: "people/getItems",
        listRequestParams: ({currentCompanyId, requestParams}) =>
          resolveInvoicePartyListParams({
            columnName: "receiver",
            currentCompanyId,
            requestParams,
          }),
        externalFilter: false,
        visibleForm: row => resolveInvoiceCreateFieldVisibility({fieldName: "receiver", requestParams: row}),
        format: function (value) {
          return formatInvoicePartyLabel(value);
        },
        formatList: function (value, _row, _column) {
          return formatInvoicePartyOption(value);
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
        listRequestParams: resolveInvoiceCategoryListParams,
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
          return "/categories/" + parseInt(value.value || value);
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
        createPayload: true,
        list: "wallet/getItems",
        listRequestParams: resolveInvoiceWalletListParams,
        searchParam: "sourceWallet",
        externalFilter: false,
        visibleForm: row => resolveInvoiceCreateFieldVisibility({fieldName: "sourceWallet", requestParams: row}),
        format: function (value) {
          return value?.wallet;
        },
        formatList(data) {
          return formatInvoiceWalletOption(data);
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
        createPayload: true,
        list: "wallet/getItems",
        listRequestParams: resolveInvoiceWalletListParams,
        searchParam: "destinationWallet",
        externalFilter: false,
        visibleForm: row => resolveInvoiceCreateFieldVisibility({fieldName: "destinationWallet", requestParams: row}),
        format: function (value) {
          return value?.wallet;
        },
        formatList(data) {
          return formatInvoiceWalletOption(data);
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
        formLabel: "Tipo de pagamento",
        list: "walletPaymentType/getItems",
        listRequestParams: resolveInvoicePaymentTypeListParams,
        searchParam: "paymentType.paymentType",
        externalFilter: false,
        editable: true,
        format: function (value) {
          return value?.paymentType;
        },
        formatList: function (value) {
          return formatInvoicePaymentTypeOption(value);
        },
        saveFormat: function (value) {
          return value ? "/payment_types/" + (value?.value || value) : null;
        },
        filterFormat: function (value) {
          const selectedValue = value?.value || value?.id || value?.key || value?.['@id'] || value;
          if (String(selectedValue || '').trim().toLowerCase() === 'select') return '';

          return selectedValue
            ? value?.label || value?.object?.paymentType || value?.paymentType || value
            : '';
        },
      },
      {
        sortable: true,
        filterClass: "col-2 q-pa-xs",
        formClass: "col-6",
        name: "invoiceType",
        align: "left",
        label: "invoiceType",
        createPayload: true,
        editable: false,
        defaultValue: "invoice",
        visibleForm: false,
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
