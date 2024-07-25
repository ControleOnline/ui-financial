export default function getConfigs(context, myCompany) {
  return {
    companyParam: context == "expense" ? "payer" : "receiver",
    filters: true,
    store: "invoice",
    add: true,
    delete: false,
    categories: [context],
    selection: true,
    search: true,
    columns: {
      category: {
        filters: {
          context: context,
          company: "/people/" + myCompany.id,
        },
      },
      paymentType: {
        filters: {
          people: "/people/" + myCompany.id,
        },
      },
      wallet: {
        filters: {
          people: "/people/" + myCompany.id,
        },
      },
      status: {
        filters: {
          context: "invoice",
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
