<template>
  <div v-for="c in cards" :key="c.id" class="q-mb-md">
    <q-card
      class="credit-card cursor-pointer"
      :class="{ selected: card?.id === c.id }"
      @click="card = c"
    >
      <q-card-section>
        <div class="row justify-between items-center text-white">
          <div>{{ c.type.toUpperCase() }}</div>
          <q-icon name="credit_card" />
        </div>
        <div class="text-h6 text-white q-mt-md">
          {{ c.number_group_1 }} •••• •••• {{ c.number_group_4 }}
        </div>
        <div class="row justify-between text-white q-mt-sm">
          <div>{{ c.name.toUpperCase() }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
  <q-card-actions align="right" v-if="card">
    <q-btn flat label="Pagar" color="primary" @click="pay" />    
  </q-card-actions>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      card: null,
    };
  },
  props: {
    invoice: { type: Object, required: true },
  },
  created() {
    this.getCards();
  },
  computed: {
    ...mapGetters({ cards: "card/items" }),
  },
  methods: {
    ...mapActions({
      payWithCard: "asaas/payWithCard",
      getCards: "card/getItems",
    }),
    pay() {
      if (!this.card.id) return;
      this.payWithCard({ invoice: this.invoice, card: this.card });
    },
  },
};
</script>

<style>
.credit-card {
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #3f51b5, #1a237e);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.credit-card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
.credit-card.selected {
  border: 2px solid #ffeb3b;
}
</style>
