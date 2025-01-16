<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <img
            src="/path/to/logo.png"
            alt="Logo"
            class="col-auto"
            style="width: 100px"
          />
          <div class="col">
            <div class="text-h5">
              CONTROLE ONLINE TECNOLOGIA DA INFORMAÇÃO LTDA
            </div>
            <div class="text-subtitle2">
              20.114.048/0001-38<br />
              financeiro@controleonline.com<br />
              (11) 3168-6294<br />
              Alameda Yaday, 424, Jardim Aida<br />
              Guarulhos - SP
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row">
          <div class="col">
            <div>Cliente:</div>
            <div class="text-bold">Focus Transporte de Veículos</div>
          </div>
          <div class="col">
            <div>CNPJ:</div>
            <div class="text-bold">
              {{ $formatter.formatDocument(document) }}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section>
        <div class="text-h6">Faturas em Aberto</div>
      </q-card-section>
      <q-card-section>
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
              <q-td>{{ props.row.date }}</q-td>
              <q-td>{{ props.row.amount }}</q-td>
              <q-td>
                <q-icon name="error" class="text-warning" />
                {{ props.row.status }}
              </q-td>
              <q-td>
                <q-btn
                  flat
                  color="primary"
                  label="Pagar"
                  @click="handlePayment(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div>Será enviado para protesto em 30 dias após o vencimento.</div>
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

export default {
  data() {
    return {
      company: null,
      document: null,
      rows: [
        {
          date: "20/10/2024",
          amount: "R$ 400,00",
          status: "Aguardando pagamento",
        },
        {
          date: "20/11/2024",
          amount: "R$ 400,00",
          status: "Aguardando pagamento",
        },
        {
          date: "20/12/2024",
          amount: "R$ 400,00",
          status: "Aguardando pagamento",
        },
      ],
      columns: [
        { name: "date", label: "Data", align: "left", field: "date" },
        { name: "amount", label: "Valor", align: "left", field: "amount" },
        { name: "status", label: "Status", align: "left", field: "status" },
        { name: "actions", label: "Ação", align: "center" },
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
    }),
    init() {
      this.company = this.$route.params.company;
      this.document = this.$route.params.document;
      this.getItems();
    },
    getItems() {
      let params = {
        company: this.company,
        document: this.document,
      };
      const endpoint = `invoice/paylist`;
      return this.getPaylist(params).then((result) => {
        console.log(result);
      });
    },
  },
};
</script>
