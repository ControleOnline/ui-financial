<template>
  <div class="text-h6 q-mb-md">
    {{ $tt("paylist", "title", "Payments") }}
  </div>
  <q-table
    flat
    dense
    :rows="rows"
    :rows-per-page-options="[]"
    :columns="columns"
    row-key="date"
    hide-bottom
    :grid="$q.screen.lt.sm"
    class="custom-table"
  >
    <template v-slot:body="props">
      <q-tr :props="props.row">
        <q-td>#{{ props.row.id }}</q-td>
        <q-td>{{ $formatter.formatDateYmdTodmY(props.row.dueDate) }}</q-td>
        <q-td
          >{{
            props.row.payer
              ? props.row.payer.name + " " + props.row.payer.alias
              : $tt("paylist", "label", "Unknow")
          }}
        </q-td>
        <q-td>{{ $formatter.formatMoney(props.row.price) }}</q-td>
        <q-td>
          <q-icon name="error" class="text-warning q-mr-xs" />
          {{ props.row.status.status }}
        </q-td>
        <q-td>
          <Payment
            v-if="props.row.status.realStatus != 'closed'"
            :invoice="props.row"
          />
        </q-td>
      </q-tr>
    </template>
    <template v-slot:item="props">
      <div class="q-pa-sm">
        <div class="q-grid-item">
          <div class="row items-center q-mb-sm">
            <div class="col-4 text-bold">
              {{ $tt("paylist", "label", "Due Date") }}:
            </div>
            <div class="col-8 text-subtitle1">
              {{ $formatter.formatDateYmdTodmY(props.row.dueDate) }}
            </div>
          </div>
          <div class="row items-center q-mb-sm">
            <div class="col-4 text-bold">
              {{ $tt("paylist", "label", "Amount") }}:
            </div>
            <div class="col-8 text-h6 text-primary">
              {{ $formatter.formatMoney(props.row.price) }}
            </div>
          </div>

          <div class="row items-center q-mb-sm">
            <div class="col-4 text-bold">
              {{ $tt("paylist", "label", "Payer") }}:
            </div>
            <div class="col-8 text-subtitle1">
              {{
                props.row.payer
                  ? props.row.payer.name + " " + props.row.payer.alias
                  : $tt("paylist", "label", "Unknow")
              }}
            </div>
          </div>

          <div class="row items-center q-mb-sm">
            <div class="col-4 text-bold">
              {{ $tt("paylist", "label", "Status") }}:
            </div>
            <div class="col-8">
              <q-icon name="error" class="text-warning q-mr-xs" />
              <span class="text-body1">{{ props.row.status.status }}</span>
            </div>
          </div>
          <div class="row justify-end q-mt-sm">
            <Payment
              v-if="props.row.status.realStatus != 'closed'"
              :invoice="props.row"
            />
          </div>
        </div>
      </div>
    </template>
  </q-table>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Payment from "./Payment.vue";

export default {
  components: {
    Payment,
  },
  props: {
    rows: {
      required: true,
    },
  },
  created() {
    console.log(this.rows);
  },
  data() {
    return {
      columns: [
        {
          name: "",
          label: this.$tt("paylist", "label", "ID"),
          align: "left",
          field: "id",
        },
        {
          name: "date",
          label: this.$tt("paylist", "label", "Due Date"),
          align: "left",
          field: "date",
        },
        {
          name: "payer",
          label: this.$tt("paylist", "label", "Payer"),
          align: "left",
          field: "Payer",
        },
        {
          name: "amount",
          label: this.$tt("paylist", "label", "Amount"),
          align: "left",
          field: "amount",
        },
        {
          name: "status",
          label: this.$tt("paylist", "label", "Status"),
          align: "left",
          field: "status",
        },
        {
          name: "actions",
          label: this.$tt("paylist", "label", "Actions"),
          align: "left",
        },
      ],
    };
  },
};
</script>

<style scoped>
.q-grid-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
}

.custom-table :deep(.q-table__grid-item) {
  margin: 8px;
}

.custom-table :deep(.q-table__grid-content) {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  background-color: #fff;
}
</style>
