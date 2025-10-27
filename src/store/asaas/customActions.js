import { api } from "@controleonline/ui-common/src/api";
import * as types from "@controleonline/ui-default/src/store/default/mutation_types";

export function getPix({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "POST",
  };

  return api
    .fetch("/asaas/" + data.invoice.id + "/pix", options)

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

export function payWithCard({ commit }, data) {
  commit(types.SET_ISLOADING);

  const options = {
    method: "POST",
    body: { card_id: data.card.id },
  };

  return api
    .fetch("/asaas/" + data.invoice.id + "/card", options)

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
