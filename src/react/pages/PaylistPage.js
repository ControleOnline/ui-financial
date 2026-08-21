import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import { api } from '@controleonline/ui-common/src/api';

const normalizeDocument = value =>
  String(value || '')
    .replace(/\D/g, '')
    .trim();

const formatCurrency = value => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  } catch (_e) {
    return `R$ ${number.toFixed(2)}`;
  }
};

const formatDate = value => {
  if (!value) return '—';
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}`;
};

const resolveStatusLabel = invoice => {
  const real =
    invoice?.status?.realStatus ||
    invoice?.realStatus ||
    invoice?.status?.status ||
    invoice?.status ||
    '';
  const normalized = String(real).toLowerCase();
  if (normalized.includes('overdue') || normalized.includes('atraso')) return 'Em atraso';
  if (normalized.includes('pending') || normalized.includes('open')) return 'Aberta';
  if (normalized.includes('paid') || normalized.includes('paga')) return 'Paga';
  if (normalized.includes('cancel')) return 'Cancelada';
  if (normalized.includes('closed') || normalized.includes('fechad')) return 'Fechada';
  return real ? String(real) : 'Aberta';
};

const resolveCreditor = invoice =>
  invoice?.receiver?.name ||
  invoice?.receiver?.alias ||
  invoice?.company?.name ||
  invoice?.receiverName ||
  '—';

const resolveAmount = invoice =>
  invoice?.price ??
  invoice?.amount ??
  invoice?.total ??
  invoice?.value ??
  null;

const resolvePaymentUrl = invoice =>
  invoice?.paymentLink ||
  invoice?.boletoUrl ||
  invoice?.pixUrl ||
  invoice?.secondCopyUrl ||
  invoice?.bankSlipUrl ||
  null;

const COLUMNS = [
  {
    name: 'creditor',
    label: 'Fornecedor / credor',
    sortable: false,
    filterable: false,
  },
  {
    name: 'amount',
    label: 'Valor',
    sortable: false,
    filterable: false,
  },
  {
    name: 'dueDate',
    label: 'Vencimento',
    sortable: false,
    filterable: false,
  },
  {
    name: 'situation',
    label: 'Situação',
    sortable: false,
    filterable: false,
  },
  {
    name: 'actions',
    label: 'Ações',
    sortable: false,
    filterable: false,
  },
];

/**
 * Public (anonymous) paylist for debts by document (CPF/CNPJ).
 * Query: /paylist?document={doc}&company={receiverId}
 * Backend: GET /paylist (PaylistController, PUBLIC_ACCESS).
 */
function PaylistPage() {
  const route = useRoute();
  const params = route?.params || {};

  const document = useMemo(() => {
    const fromParams =
      params.document ||
      params.doc ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location?.search || '').get('document')
        : null);
    return normalizeDocument(fromParams);
  }, [params.document, params.doc]);

  const company = useMemo(() => {
    const fromParams =
      params.company ||
      params.receiver ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location?.search || '').get('company')
        : null);
    return fromParams ? String(fromParams).trim() : '';
  }, [params.company, params.receiver]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!document) {
      setError('Documento (CPF/CNPJ) não informado na URL.');
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const query = { document };
      if (company) query.company = company;
      const response = await api.fetch('paylist', {
        method: 'GET',
        params: query,
      });
      const list =
        response?.member ||
        response?.['hydra:member'] ||
        (Array.isArray(response) ? response : []);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Não foi possível carregar as dívidas.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [document, company]);

  useEffect(() => {
    load();
  }, [load]);

  const tableData = useMemo(
    () =>
      (items || []).map((invoice, index) => {
        const paymentUrl = resolvePaymentUrl(invoice);
        return {
          id: invoice?.id || `row-${index}`,
          creditor: resolveCreditor(invoice),
          amount: formatCurrency(resolveAmount(invoice)),
          dueDate: formatDate(invoice?.dueDate || invoice?.due_date),
          situation: resolveStatusLabel(invoice),
          actions: paymentUrl ? '2ª via / PIX' : '—',
          _paymentUrl: paymentUrl,
          _raw: invoice,
        };
      }),
    [items],
  );

  const handleRowPress = useCallback(row => {
    const url = row?._paymentUrl;
    if (url && typeof Linking?.openURL === 'function') {
      Linking.openURL(url).catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.hint}>Carregando dívidas…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.title}>Lista de dívidas</Text>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.hint}>
            Use o link enviado por e-mail/WhatsApp com o documento na URL.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas dívidas</Text>
        <Text style={styles.subtitle}>
          Documento {document}
          {company ? ` · credor #${company}` : ''}
        </Text>
      </View>
      <View style={styles.tableWrap}>
        <DefaultTable
          accentColor="#2563EB"
          columns={COLUMNS}
          data={tableData}
          isLoading={false}
          onRefresh={load}
          onRowPress={handleRowPress}
          showColumnFiltersButton={false}
          showRowActions={false}
          showSearch={false}
          showToolbar={false}
          storeName=""
        />
      </View>
      <Text style={styles.footerNote}>
        Acesso anônimo controlado pelo documento na URL. Não compartilhe o link.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  tableWrap: {
    flex: 1,
    paddingHorizontal: 8,
  },
  error: {
    marginTop: 12,
    fontSize: 15,
    color: '#B91C1C',
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  footerNote: {
    padding: 12,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default PaylistPage;
