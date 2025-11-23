
export default function getConfigs($components, context, myCompany) {


  return {
    companyParam: context == "expense" ? "payer" : "receiver",
    filters: true,
    store: "invoice",
    add: true,
    delete: false,
    categories: [context == "expense" ? "payer" : "receiver"],
    status: ["invoice"],
    selection: false,
    search: true,
    columns: {
      paymentType: {
        companyParam: "people",
        selection: false,
        externalFilters: true,
        icon: "payments",
        component: $components.DefaultTable,
        store: "paymentType",
        filters: {
          //people: "/people/" + myCompany.id,
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
          company: "/people/" + myCompany.id,
        },
      },
      category: {
        filters: {
          context: context == "expense" ? "payer" : "receiver",
          company: "/people/" + myCompany.id,
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
