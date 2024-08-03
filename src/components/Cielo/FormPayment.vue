<template>
  <q-btn
    class="q-pa-xs btn-primary"
    dense
    icon="money"
    @click="openModal = true"
  >
    <q-tooltip> Detalhes </q-tooltip>
  </q-btn>
  <q-dialog v-model="openModal" maximized>
    <q-card class="">
      <q-card-section class="row col-12 q-pa-sm">
        <q-toolbar class="">
          <q-toolbar-title class="">
            <Title>Detalhes</Title>
          </q-toolbar-title>
          <q-btn
            class="btn-primary"
            no-caps
            flat
            v-close-popup
            round
            dense
            icon="close"
          />
        </q-toolbar>
      </q-card-section>
      <q-card-section class="row q-pa-md">
        <q-btn class="btn-primary" icon="close" @click="splitIt">Split</q-btn>
      </q-card-section>
      <q-card-section class="row q-pa-md">
        <pre> {{ JSON.parse(row?.otherInformations) }}</pre>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      openModal: false,
    };
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions({
      split: "invoice/split",
    }),
    splitIt() {
      this.split(this.row.id);
    },
  },
};
</script>
