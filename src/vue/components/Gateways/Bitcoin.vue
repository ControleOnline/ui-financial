<template>
  <q-card-section v-if="bitcoin">
    <q-img
      :src="'data:image/png;base64,' + bitcoin.encodedImage"
      style="width: 100%; height: auto"
      class="q-mb-md"
    />
    <q-input v-model="bitcoin.payload" readonly dense label="Copia e Cola">
      <template v-slot:append>
        <q-btn flat dense icon="content_copy" @click="copyToClipboard" />
      </template>
    </q-input>
  </q-card-section>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      bitcoin: {},
    };
  },
  props: {
    invoice: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.generate();
  },
  methods: {
    ...mapActions({
      getBitcoin: "invoice/getBitcoin",
    }),
    generate() {
      this.getBitcoin({
        invoiceId: this.invoice.id,
      }).then((response) => {
        this.bitcoin = response;
      });
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.bitcoin.payload).then(() => {
        this.$q.notify({ type: "positive", message: "Código copiado!" });
      });
    },
  },
};
</script>
