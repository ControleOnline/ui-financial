<template>
 <q-page class="q-pa-md">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <img src="/path/to/logo.png" alt="Logo" class="col-auto" style="width: 100px;" />
          <div class="col">
            <div class="text-h5">CONTROLE ONLINE TECNOLOGIA DA INFORMAÇÃO LTDA</div>
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
      <q-card-section class="text-warning text-bold">
        <q-icon name="warning" /> Aguardando Pagamento
        <q-btn flat label="Reportar problema" class="float-right" />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Dados da Fatura - 501792090</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row">
          <div class="col">
            <div>Valor Total</div>
            <div class="text-bold text-h6">R$ 400,00</div>
          </div>
          <div class="col">
            <div>Data de Vencimento</div>
            <div class="text-bold text-h6">20/02/2025</div>
          </div>
          <div class="col">
            <div>Após o Vencimento</div>
            <div class="text-bold text-h6">R$ 20,00 de multa</div>
          </div>
        </div>
        <div class="q-mt-md">Descrição:</div>
        <div>Manutenção e Suporte de Sistema. Será enviado para protesto em 30 dias após o vencimento.</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Dados do Comprador</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row">
          <div class="col">
            <div>Nome:</div>
            <div class="text-bold">Focus Transporte de Veículos</div>
          </div>
          <div class="col">
            <div>Email:</div>
            <div class="text-bold">Vendasfocusscgonha@gmail.com</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Resumo da Assinatura</div>
        <div class="text-warning">
          <q-icon name="error" /> Cobrança anterior aguardando pagamento
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>
          20/10/2024 - R$ 400,00<br />
          20/11/2024 - R$ 400,00<br />
          20/12/2024 - R$ 400,00
        </div>
      </q-card-section>
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
    };
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
