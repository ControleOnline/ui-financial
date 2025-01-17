<template>
  <q-dialog v-model="openModal">
    <q-card style="width: 400px">
      <q-card-section class="row items-center">
        <q-avatar icon="qr_code" color="primary" text-color="white" />
        <div class="q-ml-sm text-h6">Pagamento via Pix</div>
      </q-card-section>

      <q-card-section>
        <q-img
          :src="'data:image/png;base64,' + pix.encodedImage"
          style="width: 100%; height: auto"
          class="q-mb-md"
        />
        <q-input v-model="pix.payload" readonly dense label="Copia e Cola" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-btn label="Ver Pix" color="primary" @click="generate" />
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      openModal: false,
      pix: {},
    };
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
  },
  created() {},
  methods: {
    ...mapActions({
      getPix: "invoice/getPix",
    }),
    generate() {
      this.openModal = true;
      this.getPix(this.row.id).then((response) => {
        this.pix = response;
      });
    },
  },
};
</script>
