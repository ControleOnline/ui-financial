<template>
  <DefaultTable :configs="configs" v-if="loaded" />
</template>
<script>
import DefaultTable from "@controleonline/ui-default/src/components/Default/DefaultTable";
import { mapActions, mapGetters } from "vuex";
import getConfigs from "./Configs";

export default {
  components: {
    DefaultTable,
  },
  props: {
    context: {
      required: true,
    },
    orderId: {
      required: false,
    },
    loaded: {
      type: Boolean,
      required: true,
    },
    peopleId: {
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      myCompany: "people/currentCompany",
      columns: "invoice/columns",
    }),
    configs() {
      let config = getConfigs(this.context, this.myCompany);

      if (this.orderId) {
        config.companyParam = false;
        config.externalFilters = false;
        config["full-height"] = false;
      }
      if (this.peopleId) {
        // config.companyParam = false;
        config.externalFilters = false;
        config["full-height"] = false;
      }
      return config;
    },
  },
  data() {
    return {
      loaded: false,
    };
  },
  created() {
    this.addColumnTo();
    this.setFilters();
  },
  methods: {
    setFilters() {
      if (this.orderId) {
        let filters = {
          orderId: this.orderId,
        };
        this.$store.commit(this.configs.store + "/SET_FILTERS", filters);
      }
      //ID People - filtro
      if (this.peopleId) {
        let filters = {
          people: this.peopleId,
        }
        this.$store.commit(this.configs.store + "/SET_FILTERS", filters);
      }
      this.loaded = true;
    },
    addColumnTo() {
      const columns = this.$copyObject(this.columns);
      const columnIndex = columns.findIndex(
        (c) => c.name === "receiver" || c.name === "payer"
      );
      if (columnIndex !== -1) {
        columns[columnIndex].name =
          this.context === "expense" ? "receiver" : "payer";
        columns[columnIndex].label =
          this.context === "expense" ? "receiver" : "payer";
      }

      const columnIdIndex = columns.findIndex((c) => c.name === "id");
      if (columnIdIndex !== -1) {
        columns[columnIdIndex].to = (value) => {
          let route =
            this.context === "expense"
              ? "FinanceExpenseDetails"
              : "FinanceReceiveDetails";
          return {
            name: route,
            params: {
              id: value,
            },
          };
        };
      }

      this.$store.commit(this.configs.store + "/SET_COLUMNS", columns);
    },
  },
};
</script>
