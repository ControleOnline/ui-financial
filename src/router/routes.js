export const routes = [
  {
    path: "/finance",
    component: () =>
      import("@controleonline/quasar-layout-ui/src/layouts/AdminLayout.vue"),
    children: [
      {
        name: "FinanceExpenseIndex",
        path: "expense",
        component: () => import("../pages/Expense"),
      },
      {
        name: "FinanceExpenseDetails",
        path: "expense/id/:id",
        component: () => import("../pages/Expense/Details.vue"),
      },
      {
        name: "FinanceReceiveIndex",
        path: "receive",
        component: () => import("../pages/Receive"),
      },
      {
        name: "FinanceReceiveDetails",
        path: "receive/id/:id",
        component: () => import("../pages/Receive/Details.vue"),
      },
      {
        name: "FinanceExpenseCategories",
        path: "categories/expense",
        component: () => import("../pages/Expense/Categories.vue"),
      },
      {
        name: "FinanceReceiveCategories",
        path: "categories/receive",
        component: () => import("../pages/Receive/Categories.vue"),
      },

      {
        name: "IncomeStatement",
        path: "IS",
        component: () => import("../pages/Reports/IncomeStatement.vue"),
      },
    ],
  },
];
