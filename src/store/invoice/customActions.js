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

export function getCashRegister({commit}, params = {}) {
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