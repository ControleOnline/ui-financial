<template>
  <template v-if="invoice">
    <AsaasCard :invoice="invoice" />
    <AsaasPix :invoice="invoice" />
    <Bitcoin :invoice="invoice" />
  </template>
  <template v-else> lll </template>
</template>

<script>
import { mapActions } from "vuex";
import AsaasPix from "./Gateways/Asaas/Pix.vue";
import AsaasCard from "./Gateways/Asaas/Card.vue";
import Bitcoin from "./Gateways/Bitcoin.vue";

export default {
  components: {
    AsaasPix,
    Bitcoin,
  },
  data() {
    return {};
  },
  props: {
    invoice: {
      type: Object,
      required: false,
    },
  },
  created() {},
  methods: {
    ...mapActions({}),
    init() {},
  },
};
</script>
