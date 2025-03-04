<template>
  <q-page padding>
    <div class="row q-pt-xs q-py-lg row-filters">
      <q-card class="full-width">
        <q-card-section class="row col-12 q-pa-sm d-flex justify-end">
          <q-input
            type="text"
            v-model="filters.year"
            label="Ano"
            emit-value
            map-options
            use-input
            validate="validateYear"
            @keydown.enter="loadData"
            maxlength="4"
            @input="formatYear"
          />

          <q-btn
            class="q-pa-sm q-mr-md btn-search btn-primary"
            label="Filtrar"
            dense
            icon-right="search"
            @click="loadData"
          ></q-btn>
          <q-btn
            class="q-pa-sm btn-clear btn-primary"
            dense
            icon-right="filter_alt_off"
            @click="clearFilters"
          >
            <q-tooltip>Limpar</q-tooltip>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <div class="row">
      <div
        v-for="(month, index) in income_statements"
        :key="month"
        class="col-3 col-sm-6 col-xs-12 col-md-3 col-lg-2 col-xl-1 q-mb-md q-pa-sm"
        style="display: flex; flex-direction: column"
      >
        <q-card style="flex: 1; padding-bottom: 80px">
          <q-card-section>
            <div class="text-h6">
              {{ getMonthName(index) }}
            </div>
          </q-card-section>
          <q-card-section>
            <q-list bordered>
              <q-item-label header>
                <q-item :style="{ 'min-height': 'auto' }" class="q-pa-none">
                  <q-item-section class="q-item-section-main q-pa-none"
                    >Receitas</q-item-section
                  >
                  <q-item-section class="q-item-section-side q-pa-none" side>
                    <q-icon
                      class="text-primary btn-info"
                      name="info"
                      @click="showDetails(month.receive.parent_categories)"
                    />
                  </q-item-section>
                </q-item>
              </q-item-label>
              <q-item
                :style="{ 'min-height': 'auto' }"
                v-for="(parentCategory, parentId) in month.receive
                  .parent_categories"
                :key="parentId"
              >
                <template
                  v-if="parentCategory.total_parent_category_price > 0"
                  class="q-pa-none q-gutter-xs"
                >
                  <q-item-section class="q-item-section-main">
                    {{ parentCategory.parent_category_name }}
                  </q-item-section>

                  <q-item-section class="q-item-section-side" side>
                    {{"R$ " + $formatter.formatMoney(parentCategory.total_parent_category_price)}}
                  </q-item-section>
                </template>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section>
            <q-list bordered>
              <q-item-label header>
                <q-item :style="{ 'min-height': 'auto' }" class="q-pa-none">
                  <q-item-section class="q-item-section-main q-pa-none"
                    >Despesas</q-item-section
                  >
                  <q-item-section class="q-item-section-side q-pa-none" side
                    ><q-icon
                      class="text-primary btn-info"
                      name="info"
                      @click="showDetails(month.pay.parent_categories)"
                    />
                  </q-item-section>
                </q-item>
              </q-item-label>
              <q-item
                :style="{ 'min-height': 'auto' }"
                v-for="(parentCategory, parentId) in month.pay
                  .parent_categories"
                :key="parentId"
              >
                <template
                  v-if="parentCategory.total_parent_category_price > 0"
                  class="q-pa-none q-gutter-xs"
                >
                  <q-item-section class="q-item-section-main">
                    {{ parentCategory.parent_category_name }}
                  </q-item-section>

                  <q-item-section class="q-item-section-side" side>
                    {{"R$ " + $formatter.formatMoney(parentCategory.total_parent_category_price)}}
                  </q-item-section>
                </template>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section class="footer-section">
            <q-item
              :style="{ 'min-height': 'auto' }"
              class="text-green q-py-none"
            >
              <q-item-section class="q-item-section-main"
                >Total de Receitas</q-item-section
              >
              <q-item-section class="q-item-section-side text-green" side>
                {{"R$ " + $formatter.formatMoney(month.receive.total_month_price)}}
              </q-item-section>
            </q-item>
            <q-item
              :style="{ 'min-height': 'auto' }"
              class="text-red q-py-none"
            >
              <q-item-section class="q-item-section-main"
                >Total de Despesas</q-item-section
              >
              <q-item-section class="q-item-section-side text-red" side>
                {{"R$ " + $formatter.formatMoney(month.pay.total_month_price)}}
              </q-item-section>
            </q-item>
            <q-item
              :class="getBalanceColor(month) + ' q-py-none'"
              :style="{ 'font-weight': 'bold', 'min-height': 'auto' }"
            >
              <q-item-section class="q-item-section-main q-py-none"
                >Saldo</q-item-section
              >
              <q-item-section
                :class="getBalanceColor(month) + ' q-item-section-side q-py-none'"
                side
              >
                {{"R$ " + $formatter.formatMoney(
                  (month.receive.total_month_price || 0) -
                    (month.pay.total_month_price || 0)
                )}}
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="modalVisible">
      <q-card>
        <template v-for="parent_category in parent_categories">
          <q-card-section>
            <div class="text-h6">
              {{ parent_category.parent_category_name }}
            </div>
          </q-card-section>
          <q-card-section v-for="category in parent_category.categories_childs">
            <!-- Conteúdo do modal com detalhes do mês selecionado -->
            <div>
              {{ category.category_name }} : {{ category.category_price }}
            </div>
            <!-- Outros detalhes aqui -->
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "FinancePage",
  data() {
    return {
      filters: {
        year: new Date().getFullYear(),
        people: null,
      },
      modalVisible: false,
      parent_categories: null,
      income_statements: {},
    };
  },
  created() {
    this.loadData();
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      isLoading: "invoice/isLoading",
    }),
  },
  watch: {
    myCompany() {
      this.loadData();
    },
    isLoading(isLoading) {
      if (isLoading) this.$q.loading.show();
      else this.$q.loading.hide();
    },
  },
  methods: {
    ...mapActions({
      getIncomeStatements: "invoice/getIncomeStatements",
    }),
    loadData() {
      if (this.myCompany) {
        this.filters.people = this.myCompany.id;
        this.getIncomeStatements(this.filters).then((response) => {
          this.income_statements = response;
        });
      }
    },
    showDetails(parent_categories) {
      this.parent_categories = parent_categories;
      this.modalVisible = true;
    },
    getBalanceColor(month) {
      if (
        (month.receive.total_month_price || 0) -
          (month.pay.total_month_price || 0) <
        0
      ) {
        return "text-red";
      } else {
        return "text-green";
      }
    },
    formatYear() {
      this.filters.year = this.filters.year.replace(/\D/g, "");
    },
    validateYear(value) {
      if (value.length > 4) {
        return value;
      } else {
        this.$q.notify({
          color: "negative",
          position: "top",
          message: "Por favor, insira um ano válido",
          icon: "report_problem",
        });
        return this.filters.year;
      }
    },
    getMonthName(monthIndex) {
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return monthNames[monthIndex - 1];
    },
  },
};
</script>

<style scoped>
.btn-info {
  cursor: pointer;
}
.card-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.q-card {
  flex-grow: 1;
}
.footer-section {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.q-item {
  min-height: auto !important;
}
</style>
