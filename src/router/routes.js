export const routes = [
  {
    path: "/finance",
    component: () =>
      import("@controleonline/ui-layout/src/layouts/AdminLayout.vue"),
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
        name: "IncomeStatement",
        path: "IS",
        component: () => import("../pages/Reports/IncomeStatement.vue"),
      },
    ],
  },
];
