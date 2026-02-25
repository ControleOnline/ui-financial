import { api } from "@controleonline/ui-common/src/api";
import * as types from "@controleonline/ui-default/src/store/default/mutation_types";

const RESOURCE_ENDPOINT = "/income_statements";

export function split({ commit }, invoiceId) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "PUT",
    body: {},
  };

  return api
    .fetch("/invoice/" + invoiceId + "/split", options)

    .then((data) => {
      commit(types.SET_ISLOADING, false);
      return data["member"] || null;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getIncomeStatements({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "GET",
    params: data || {},
  };

  return api
    .fetch(RESOURCE_ENDPOINT, options)

    .then((data) => {
      commit(types.SET_ISLOADING, false);

      return data["member"] || null;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getBitcoin({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "POST",
    body: { invoice: data.invoice.id },
  };

  return api
    .fetch("/bitcoin", options)

    .then((data) => {
      commit(types.SET_ISLOADING, false);
      return data["member"] || null;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getPaylist({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "GET",
    params: data || {},
  };

  return api
    .fetch("paylist", options)

    .then((data) => {
      commit(types.SET_ISLOADING, false);

      return data["member"] || null;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getCashRegister({ commit }, params = {}) {
  commit(types.SET_ISLOADING);

  const options = {
    method: 'GET',
    params: params,
  };

  return api
    .fetch('/cash-register', options)
    .then(data => {
      commit(types.SET_ISLOADING, false);
      return data;
    })
    .catch(e => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getInflow({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: 'GET',
    params: data || {},
  };

  return api
    .fetch('/invoice/inflow', options)

    .then(data => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ITEMS, data['member']);

      return data['member'];
    })
    .catch(e => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function getPix({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: 'POST',
    body: { invoice: data.invoiceId, bank: data.bank },
  };

  return api
    .fetch('/pix', options)

    .then(data => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ITEMS, data['member']);

      return data['member'];
    })
    .catch(e => {
      commit(types.SET_ISLOADING, false);

      commit(types.SET_ERROR, e.message);
      throw e;
    });
}

export function setFilterId({ commit, getters }, value) {
  const cleaned = (value || '').toString().replace(/\D/g, '');
  const currentFilters = {...(getters.filters || {})};

  if (cleaned) currentFilters.id = cleaned;
  else delete currentFilters.id;

  commit(types.SET_FILTERS, currentFilters);
}

export function setFilterDueDate({ commit, getters }, value) {
  const currentFilters = {...(getters.filters || {})};

  if (value) currentFilters.dueDate = value;
  else delete currentFilters.dueDate;

  commit(types.SET_FILTERS, currentFilters);
}

export function fetchInvoices({ commit }) {
  commit(types.SET_RELOAD, Date.now());
  return Promise.resolve();
}