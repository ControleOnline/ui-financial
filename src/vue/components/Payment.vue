<template>
  <div v-if="row.status.realStatus != 'closed'">
    <q-dialog v-model="openModal">
      <q-card style="width: 100%; height: 100%">
        <q-card-section>
          <template v-if="row">
            <q-expansion-item
              group="payments"
              default-opened
              label="Cartão de Crédito"
              icon="credit_card"
              v-model="expanded.creditCard"
            >
              <AsaasCard v-if="expanded.creditCard" :invoice="row" />
            </q-expansion-item>
            <q-expansion-item
              group="payments"
              label="Pix"
              icon="pix"
              v-model="expanded.pix"
            >
              <AsaasPix v-if="expanded.pix" :invoice="row" />
            </q-expansion-item>
            <q-expansion-item
              group="payments"
              label="Bitcoin"
              icon="currency_bitcoin"
              v-model="expanded.bitcoin"
            >
              <Bitcoin v-if="expanded.bitcoin" :invoice="row" />
            </q-expansion-item>
          </template>
          <template v-else> lll </template>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-btn label="Pagar" color="primary" @click="pay" />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import AsaasPix from "./Gateways/Asaas/Pix.vue";
import AsaasCard from "./Gateways/Asaas/Card.vue";
import Bitcoin from "./Gateways/Bitcoin.vue";

export default {
  components: { AsaasPix, AsaasCard, Bitcoin },
  props: { row: Object },
  data() {
    return {
      openModal: false,
      expanded: {
        creditCard: true,
        pix: false,
        bitcoin: false,
      },
    };
  },
  created() {
    console.log(this.rows);
  },
  methods: {
    ...mapActions({}),
    pay() {
      this.openModal = true;
    },
  },
};
</script>
