<template>
  <Invoice :context="context" v-if="context" />
</template>

<script>
import Invoice from "../../components/Invoice/Details.vue";

export default {
  components: {
    Invoice,
  },

  data() {
    return {
      context: 'receive'
    };
  },
  created() {
  },
};
</script>
