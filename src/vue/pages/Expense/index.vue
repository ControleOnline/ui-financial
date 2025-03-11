<template>
  <Invoice :context="context" v-if="context"/>
</template>

<script>
import Invoice from "../../components/Invoice";

export default {
  components: {
    Invoice,
  },

  data() {
    return {
      context: 'expense'
    };
  },
  created() {
   },
};
</script>
