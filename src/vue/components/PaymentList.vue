<template>
  <DefaultTable :configs="configs" :key="key" />
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Payment from "./Payment.vue";

export default {
  components: {
    Payment,
  },

  computed: {
    configs() {
      return {
        "full-height": false,
        title: "Payments",
        store: "invoice",
        editable: false,
        headers: true,
        toolbar: false,
        filters: false,
        delete: false,
        add: false,
        selection: false,
        search: false,
        components: {
          tableActions: {
            component: Payment,
          },
        },
      };
    },
  },

  created() {},
  data() {
    return {};
  },
};
</script>
