<template>
  <q-dialog v-model="openModal">
    <q-card style="width: 400px">
      <q-card-section class="row items-center">
        <q-avatar icon="qr_code" color="primary" text-color="white" />
        <div class="q-ml-sm text-h6">Pagamento via Pix</div>
      </q-card-section>

      <q-card-section>
        <q-img
          :src="'data:image/png;base64,' + pix.encodedImage"
          style="width: 100%; height: auto"
          class="q-mb-md"
        />
        <q-input v-model="pix.payload" readonly dense label="Copia e Cola" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-btn label="Ver Pix" color="primary" @click="openModal = true" />
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      openModal: false,
      pix: {
        id: "CONTROLE00000000575845ASA",
        encodedImage:
          "iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADEklEQVR4Xu2VS27cQBBDtdP9b5RjaeeYjyzNIECgwJvUACyP1PXhoxfVYx9fP4xfx5+df42ST1HyKUo+RcmnKPkU/428DuK8Thckfi4V368vnnOUJVeTyvTWwGKnxiMey+hLLibd9TkScoSgsbz5kh9AevUcKTTksFvJjyKve+k8pHip8aYsuZv88lvrlkKpEb7oYT0Yfcm95Oz/+SfKkn/9WUDeoZGm3AG/ATKCmCi5lrxYLhK9rPTODzmprQ+HOhKUXEvStVpjj1Bhhq895xeUXE3CaODVa/LGq4+BJPiVXE0qH2VgdUZInSY+JfeToJGMV0w8YGRWYMm9pIoBdQNEmhcF6450w5bcTYaKUE1RplPG0FFyLUnjW5UEAhMkYo/0rGNQci2JeGiUpy9ELoa5e3jgWHItSanaQ8QoqeOFf6Zql9xLUl1Z/yDp5pJgcMokhiX3kgisvTO9x8avGyJKriWR0BT5UtvK5S3ypORq8oTRaPIhp+LbfStK7if979Yyf9QRrAzO/6FLLievlGYyYeHDCZSrtYxLriVVgkQzGSZIEcRHZ8nlpDRM3EajjomwdvVTci+JTpNDiw7vhjq8aaalX1ZyM2lcC+fDITl3AZjUOsCSm0kv3gcgPvedsB1oXEpuJp2jRzxTwEGSa6qz5GpyIIajSTuXRJZjXnI3qUJHNJzp8oDpCqRbcjEJzLpzJdQwpA5TDRAGLLmXvKUSSgWG18tINslwK7mYhDhRZ6COtQzOOIxTyeUkY5RIE2OH4zibLbmX9FwvutHKQKb4kACV3E9aBokDcxXkiA2iLLmb9DSwOVPMpi9KsNslN5OeaswEEBkOMrlrpiU3kwYzE2MRkYF8lUxacjE54S/tsG+Qd//+B6DkYlLK2fEr51bo77ZeNpgLoqLkXtKMBIP45cbUGcam5GJS3SEvp9n5DaUBrii5nryyaT5yQML5Zp1+yY8grWXhVvo+uL5QKS+5mkSvAUUcZEXqY7pwJTeTr33Tlgerd+2SuwJutuRa8kdR8ilKPkXJpyj5FCWf4sPI3xOL+DRYqnBnAAAAAElFTkSuQmCC",
        payload:
          "00020126580014br.gov.bcb.pix01365bd8eee2-a1bc-4494-808a-dc01a0b7b137520400005303986540550.005802BR5925CONTROLE ONLINE TECNOLOGI6009Guarulhos62290525CONTROLE00000000575845ASA6304DB79",
        allowsMultiplePayments: false,
        expirationDate: null,
        externalReference: "32353",
      },
    };
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.init();
  },
  methods: {
    ...mapActions({
      getPix: "invoice/getPix",
    }),
    init() {
      this.getPix(this.row.id);
    },
  },
};
</script>
