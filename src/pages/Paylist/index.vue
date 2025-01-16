<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md">
      <q-card-section v-if="company">
        <div class="row items-center">
          <div class="col" v-if="company.image">
            <img
              :src="
                '//' +
                defaultCompany.logo.domain +
                '/files/' +
                company.image.id +
                '/download'
              "
              alt="Logo"
              class="col-auto"
              style="width: 200px"
            />
          </div>
          <div class="col">
            <div class="text-h5">
              {{ company.name }}
            </div>
            <div class="text-subtitle2">
              <span v-if="company.document.length > 0">
                {{ $formatter.formatDocument(company.document[0].document) }}
              </span>
              <span v-if="company.email.length > 0">
                {{ company.email[0].email }}
              </span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row">
          <div class="col">
            <div>{{ $tt("paylist", "label", "Client") }}:</div>
            <div class="text-bold">{{ client?.name }}</div>
          </div>
          <div class="col">
            <div>{{ $tt("paylist", "label", "Document") }}:</div>
            <div class="text-bold">
              {{ $formatter.formatDocument(document) }}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section v-if="rows.length > 0">
        <div class="text-h6">{{ $tt("paylist", "title", "OpenPayments") }}</div>
        <q-table
          flat
          dense
          :rows="rows"
          :rows-per-page-options="[]"
          :columns="columns"
          row-key="date"
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props.row">
              <q-td>{{
                $formatter.formatDateYmdTodmY(props.row.dueDate)
              }}</q-td>
              <q-td>R$ {{ $formatter.formatMoney(props.row.price) }}</q-td>
              <q-td>
                <q-icon name="error" class="text-warning" />
                {{ props.row.status.status }}
              </q-td>
              <q-td>
                <Payment :row="props.row" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section v-else>
        <div class="text-green">
          <q-icon name="error" />
          {{ $tt("paylist", "message", "NoOpenPayments") }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div>{{ $tt("paylist", "message", "Message") }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-center">
          <a
            :href="'https://www.controleonline.com'"
            target="_blank"
            class="primary"
          >
            <img
              :alt="defaultCompany.alias"
              :title="defaultCompany.alias"
              style="width: 100px"
              v-if="defaultCompany.logo"
              :src="'//' + defaultCompany.logo.domain + defaultCompany.logo.url"
              class="q-pa-sm main-logo"
            />
          </a>
        </div>
      </q-card-section>
      <q-separator />
    </q-card>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Payment from "../../components/Gateways/Payment.vue";

export default {
  components: {
    Payment,
  },
  data() {
    return {
      companyId: null,
      company: null,
      document: null,
      client: null,
      rows: [],
      columns: [
        {
          name: "date",
          label: this.$tt("paylist", "title", "Date"),
          align: "left",
          field: "date",
        },
        {
          name: "amount",
          label: this.$tt("paylist", "title", "Amount"),
          align: "left",
          field: "amount",
        },
        {
          name: "status",
          label: this.$tt("paylist", "title", "Status"),
          align: "left",
          field: "status",
        },
        {
          name: "actions",
          label: this.$tt("paylist", "title", "Actions"),
          align: "center",
        },
      ],
    };
  },
  computed: {
    ...mapGetters({
      defaultCompany: "people/defaultCompany",
    }),
  },
  created() {
    this.init();
  },
  methods: {
    ...mapActions({
      getPaylist: "invoice/getPaylist",
      getPeople: "people/getPeople",
    }),
    init() {
      this.companyId = this.$route.params.company;
      this.document = this.$route.params.document;
      this.getItems();
      this.getPeople(this.companyId).then((result) => {
        this.company = result;
      });
    },
    getItems() {
      let params = {
        company: this.companyId,
        document: this.document,
      };
      const endpoint = `invoice/paylist`;
      return this.getPaylist(params).then((result) => {
        this.client = result[0].payer;
        this.rows = result;
      });
    },
  },
};
</script>
