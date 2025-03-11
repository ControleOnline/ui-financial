<template>
  <Asaas :row="row" />
  <Bitcoin :row="row" />
</template>

<script>
import { mapActions } from "vuex";
import Asaas from "./Gateways/Asaas.vue";
import Bitcoin from "./Gateways/Bitcoin.vue";

export default {
  components: {
    Asaas,
    Bitcoin,
  },
  data() {
    return {};
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
  },
  created() {},
  methods: {
    ...mapActions({}),
    init() {},
  },
};
</script>
