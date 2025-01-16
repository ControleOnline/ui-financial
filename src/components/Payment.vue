<template>
  <Asaas :row="row" />
</template>

<script>
import { mapActions } from "vuex";
import Asaas from "./Gateways/Asaas.vue";
export default {
  components: {
    Asaas,
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
