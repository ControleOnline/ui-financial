import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import DefaultInput from '@controleonline/ui-default/src/react/components/inputs/DefaultInput';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import {api} from '@controleonline/ui-common/src/api';
import {useTheme} from '@controleonline/ui-common/src/react/components/DefaultProvider';
import {
  isValidPaylistDocument,
  normalizePaylistDocument,
} from './paylistDocument';

const formatCurrency = value => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  } catch (_e) {
    return 'R$ ' + number.toFixed(2);
  }
};

const formatDate = value => {
  if (!value) return '—';
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split('-');
  return y && m && d ? d + '/' + m + '/' + y : String(value);
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
  invoice?.price ?? invoice?.amount ?? invoice?.total ?? invoice?.value ?? null;

const resolvePaymentUrl = invoice =>
  invoice?.paymentLink ||
  invoice?.boletoUrl ||
  invoice?.pixUrl ||
  invoice?.secondCopyUrl ||
  invoice?.bankSlipUrl ||
  null;

const COLUMNS = [
  {name: 'creditor', label: 'Fornecedor / credor', sortable: false, filterable: false},
  {name: 'amount', label: 'Valor', sortable: false, filterable: false},
  {name: 'dueDate', label: 'Vencimento', sortable: false, filterable: false},
  {name: 'situation', label: 'Situação', sortable: false, filterable: false},
  {name: 'actions', label: 'Ações', sortable: false, filterable: false},
];

const DOCUMENT_COLUMN = {
  name: 'document',
  label: 'CPF ou CNPJ',
  editable: true,
  inputType: 'number',
};

/**
 * Public customer page. A document supplied by the URL is loaded immediately;
 * otherwise the customer must explicitly submit a valid CPF/CNPJ.
 */
function PaylistPage() {
  const route = useRoute();
  const params = route?.params || {};
  const theme = useTheme?.() || {};
  const themeColors = theme?.colors || {};
  const accentColor = themeColors.primary || themeColors.accent || '#2563EB';
  const pageBackground = themeColors.background || '#F1F5F9';
  const surfaceColor = themeColors.surface || themeColors.card || '#FFFFFF';
  const primaryTextColor = themeColors.text || '#0F172A';
  const initialDocument = useMemo(() => {
    const fromUrl =
      params.document ||
      params.doc ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location?.search || '').get('document')
        : null);
    return normalizePaylistDocument(fromUrl);
  }, [params.document, params.doc]);

  const company = useMemo(() => {
    const value =
      params.company ||
      params.receiver ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location?.search || '').get('company')
        : null);
    return value ? String(value).trim() : '';
  }, [params.company, params.receiver]);

  const [document, setDocument] = useState(initialDocument);
  const [documentDraft, setDocumentDraft] = useState(initialDocument);
  const [validationError, setValidationError] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialDocument));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!document) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const query = {document};
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
    } catch (requestError) {
      setError(requestError?.message || 'Não foi possível carregar as dívidas.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [document, company]);

  useEffect(() => {
    load();
  }, [load]);

  const submitDocument = useCallback(() => {
    const normalized = normalizePaylistDocument(documentDraft);
    if (!isValidPaylistDocument(normalized)) {
      setValidationError('Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.');
      return;
    }

    setValidationError('');
    setDocumentDraft(normalized);
    setDocument(normalized);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('document', normalized);
      window.history?.replaceState?.({}, '', url.toString());
    }
  }, [documentDraft]);

  const tableData = useMemo(
    () =>
      items.map((invoice, index) => {
        const paymentUrl = resolvePaymentUrl(invoice);
        return {
          id: invoice?.id || 'row-' + index,
          creditor: resolveCreditor(invoice),
          amount: formatCurrency(resolveAmount(invoice)),
          dueDate: formatDate(invoice?.dueDate || invoice?.due_date),
          situation: resolveStatusLabel(invoice),
          actions: paymentUrl ? '2ª via / PIX' : '—',
          _paymentUrl: paymentUrl,
        };
      }),
    [items],
  );

  const handleRowPress = useCallback(row => {
    if (row?._paymentUrl && typeof Linking?.openURL === 'function') {
      Linking.openURL(row._paymentUrl).catch(() => {});
    }
  }, []);

  if (!document) {
    return (
      <SafeAreaView style={[styles.page, {backgroundColor: pageBackground}]} edges={['top', 'bottom']}>
        <View style={[styles.searchCard, {backgroundColor: surfaceColor}]}>
          <View style={[styles.brandMark, {backgroundColor: accentColor + '22'}]}>
            <Text style={[styles.brandMarkText, {color: accentColor}]}>$</Text>
          </View>
          <Text style={[styles.title, {color: primaryTextColor}]}>Consulte suas cobranças</Text>
          <Text style={styles.description}>
            Informe seu CPF ou CNPJ para visualizar cobranças, vencimentos e opções de pagamento.
          </Text>
          <DefaultInput
            accentColor={accentColor}
            autoFocus={false}
            autoSave={false}
            column={DOCUMENT_COLUMN}
            inputStyle={styles.input}
            label="CPF ou CNPJ"
            onChangeValue={value => {
              setDocumentDraft(value);
              setValidationError('');
            }}
            row={{document: documentDraft}}
            showLabel
            value={documentDraft}
            variant="form"
          />
          {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={submitDocument}
            style={({pressed}) => [styles.button, {backgroundColor: accentColor}, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Consultar cobranças</Text>
          </Pressable>
          <Text style={styles.privacy}>
            Seus dados são usados somente para localizar as cobranças vinculadas ao documento.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.page, {backgroundColor: pageBackground}]} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.hint}>Carregando cobranças…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.page, {backgroundColor: pageBackground}]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <View>
            <Text style={[styles.title, {color: primaryTextColor}]}>Minhas cobranças</Text>
            <Text style={styles.subtitle}>Documento terminado em {document.slice(-4)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setDocument('');
              setItems([]);
              setError(null);
            }}
            style={styles.linkButton}>
            <Text style={[styles.linkText, {color: accentColor}]}>Consultar outro documento</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : (
          <View style={[styles.tableWrap, {backgroundColor: surfaceColor}]}>
            <DefaultTable
              accentColor={accentColor}
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
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1180,
    padding: 24,
  },
  searchCard: {
    width: '92%',
    maxWidth: 480,
    padding: 32,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 6,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandMarkText: {fontSize: 24, fontWeight: '800', color: '#2563EB'},
  title: {fontSize: 26, fontWeight: '800', color: '#0F172A'},
  description: {marginTop: 10, marginBottom: 24, fontSize: 15, lineHeight: 22, color: '#475569'},
  input: {minHeight: 50, fontSize: 16},
  validation: {marginTop: 8, fontSize: 13, color: '#B91C1C'},
  button: {
    minHeight: 50,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {opacity: 0.88},
  buttonText: {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},
  privacy: {marginTop: 18, fontSize: 12, lineHeight: 18, textAlign: 'center', color: '#64748B'},
  centered: {alignItems: 'center', justifyContent: 'center', padding: 32},
  hint: {marginTop: 10, fontSize: 14, color: '#64748B'},
  listHeader: {
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  subtitle: {marginTop: 5, fontSize: 14, color: '#64748B'},
  linkButton: {paddingVertical: 10, paddingHorizontal: 12},
  linkText: {fontSize: 14, fontWeight: '700', color: '#2563EB'},
  tableWrap: {flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF'},
  error: {padding: 20, borderRadius: 12, backgroundColor: '#FEE2E2', color: '#991B1B'},
});

export default PaylistPage;
