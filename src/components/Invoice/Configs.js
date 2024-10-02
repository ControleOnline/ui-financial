import FormPayment from "@controleonline/ui-financial/src/components/Cielo/FormPayment.vue";

export default function getConfigs($components, context, myCompany) {
  return {
    companyParam: context == "expense" ? "payer" : "receiver",
    filters: true,
    store: "invoice",
    add: true,
    delete: false,
    categories: [context],
    status: ["invoice"],
    selection: false,
    search: true,
    components: {
      tableActions: {
        //component: FormPayment,
        props: {
          context: context,
        },
      },
    },
    columns: {
      paymentType: {
        companyParam: "people",
        selection: false,
        externalFilters: false,
        icon: "payments",
        component: $components.DefaultTable,
        store: "paymentType",
        filters: {
          people: "/people/" + myCompany.id,
        },
      },
      wallet: {
        companyParam: "people",
        selection: false,
        externalFilters: false,
        icon: "wallet",
        component: $components.DefaultTable,
        store: "wallet",
        filters: {
          people: "/people/" + myCompany.id,
        },
      },
      status: {
        filters: {
          context: "invoice",
        },
      },
      category: {
        filters: {
          context: context,
        },
      },
      installments: {
        visibleForm(item) {
          if (
            item?.paymentType?.object?.installments &&
            item?.paymentType?.object?.installments != "single"
          )
            return true;
          return false;
        },
      },
    },
  };
}
