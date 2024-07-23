<template>
  <q-page>
    <!-- Inicio das Abas -->
    <div class="q-pt-lg">
      <q-card>
        <q-card-section>
          <div
            class="q-card q-pa-sm"
            style="max-width: calc(var(--zoom-width) - 30px)"
          >
            <DefaultDetail
              :configs="configs"
              :id="invoiceId"
              v-if="invoiceId"
            />
            <q-tabs
              inline-label
              no-caps
              outside-arrows
              mobile-arrows
              align="left"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              v-model="tab"
            >
              <q-tab name="orders" icon="tab" :label="$t('Orders')" />
            </q-tabs>
            <q-tab-panels
              v-model="tab"
              animated
              swipeable
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel class="items-center" name="orders">
                <Orders
                  :invoiceId="invoiceId"
                  :context="context == 'receive' ? 'sales' : 'purchasing'"
                  v-if="invoiceId"
                />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
<script>
import DefaultDetail from "@controleonline/quasar-default-ui/src/components/Default/Common/DefaultDetail.vue";
import Orders from "@controleonline/quasar-orders-ui/src/components/Orders.vue";

import { mapActions, mapGetters } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {
    DefaultDetail,
    Orders,
  },
  props: {
    context: {
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      columns: "invoice/columns",
    }),
    configs() {
      let config = getConfigs(this.context, this.myCompany);
      config.externalFilters = false;
      return config;
    },
  },
  data() {
    return {
      tab: "orders",
      invoiceData: null,
      invoiceId: null,
    };
  },
  created() {
    this.invoiceId = decodeURIComponent(this.$route.params.id);
  },
  methods: {

  },
};
</script>
