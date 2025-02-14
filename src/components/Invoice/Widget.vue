<template>
  <q-card class="q-mb-md">
    <q-card-section v-if="row">
      <q-card-section class="row items-center">
        <q-icon name="person" color="primary" size="md" class="q-mr-sm" />
        <div class="text-bold">{{ $tt("invoice", "label", "details") }}</div>
      </q-card-section>
      <q-card-section>
        <q-item-label caption>
          <DefaultInput
            columnName="status"
            :row="row"
            :configs="configs"
            @saved="saved"
            @loadData="loadData"
          />
        </q-item-label>
        <q-item-label caption>
          <DefaultInput
            columnName="wallet"
            :row="row"
            :configs="configs"
            @saved="saved"
            @loadData="loadData"
          />
        </q-item-label>
        <q-item-label caption>
          <DefaultInput
            columnName="category"
            :row="row"
            :configs="configs"
            @saved="saved"
            @loadData="loadData"
          />
        </q-item-label>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  components: {},
  props: {
    configs: {
      required: true,
    },
    row: {
      required: true,
    },
  },
  methods: {
    saved(saved) {
      this.$emit("saved", saved);
    },
    loadData() {
      this.$emit("loadData");
    },
  },
};
</script>
