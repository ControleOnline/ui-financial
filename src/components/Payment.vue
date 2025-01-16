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
        <Asaas :row="row" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions } from "vuex";
import Asaas from "./Gateways/Asaas.vue";
export default {
  components: {
    Asaas,
  },
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
  created() {},
  methods: {
    ...mapActions({}),
    init() {},
  },
};
</script>
