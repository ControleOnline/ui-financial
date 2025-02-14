<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card class="full-height">
          <q-card-section class="text-primary">
            <div class="text-h6">
              {{ $tt("order", "header", "Invoice Details") }}
            </div>
          </q-card-section>
          <q-card-section v-if="invoice">
            <DefaultInput
              columnName="dueDate"
              :row="invoice"
              :configs="configs"
              @saved="init"
            />

            <DefaultInput
              columnName="paymentType"
              :row="invoice"
              :configs="configs"
              @saved="init"
            />
            <DefaultInput
              columnName="price"
              :row="invoice"
              :configs="configs"
              @saved="init"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Cards Menores -->
      <div class="col-12 col-md-4">
        <ClientWidget
          v-if="invoice"
          :columnName="context == 'receive' ? 'payer' : 'receiver'"
          :people="context == 'receive' ? invoice.payer : invoice.receiver"
          :context="context == 'receive' ? 'client' : 'provider'"
          :row="invoice"
          :configs="configs"
          @saved="init"
        />
        <InvoiceWidget
          v-if="invoice"
          :row="invoice"
          :configs="configs"
          @saved="init"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-card class="q-mt-md">
          <Orders
            :invoiceId="invoiceId"
            :context="context == 'receive' ? 'sales' : 'purchasing'"
            v-if="invoiceId"
          />
          <!-- <Invoice :orderId="orderId" :context="context" v-if="orderId" />-->
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<script>
import DefaultDetail from "@controleonline/ui-default/src/components/Default/Common/DefaultDetail.vue";
import Orders from "@controleonline/ui-orders/src/components/Orders.vue";
import ClientWidget from "@controleonline/ui-people/src/components/People/Widget.vue";
import InvoiceWidget from "./Widget.vue";
import { mapActions, mapGetters } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {
    DefaultDetail,
    ClientWidget,
    InvoiceWidget,
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
      let config = getConfigs(this.$components, this.context, this.myCompany);
      config.externalFilters = false;
      return config;
    },
  },
  data() {
    return {
      invoice: null,
      invoiceId: null,
    };
  },
  created() {
    this.invoiceId = decodeURIComponent(this.$route.params.id);
    this.init();
  },
  methods: {
    ...mapActions({
      getInvoice: "invoice/get",
    }),
    init() {
      this.getInvoice(this.invoiceId).then((result) => {
        this.invoice = result;
      });
    },
  },
};
</script>
