<template>
  <q-card-section v-if="pix">
    <q-img
      :src="'data:image/png;base64,' + pix.encodedImage"
      style="width: 100%; height: auto"
      class="q-mb-md"
    />
    <q-input v-model="pix.payload" readonly dense label="Copia e Cola">
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
      pix: {},
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
      getPix: "asaas/getPix",
    }),
    generate() {
      this.getPix({
        invoice: this.invoice,
      }).then((response) => {
        console.log(response);
        this.pix = response;
      });
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.pix.payload).then(() => {
        this.$q.notify({ type: "positive", message: "Código copiado!" });
      });
    },
  },
};
</script>
