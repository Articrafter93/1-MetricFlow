/* eslint-disable jsx-a11y/alt-text */
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type ReportKpi = {
  label: string;
  value: string;
  delta?: string;
};

type RevenuePoint = {
  date: string;
  mrr: string;
};

type FunnelSnapshot = {
  visits: string;
  leads: string;
  deals: string;
  visitToLeadPct: string;
  leadToDealPct: string;
};

export type ReportDocumentProps = {
  workspaceName: string;
  logoUrl?: string | null;
  dateRangeLabel: string;
  clientName: string;
  kpis: ReportKpi[];
  funnel: FunnelSnapshot;
  revenuePoints: RevenuePoint[];
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0b0f1a",
    color: "#e6edf7",
    padding: 36,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#243145",
  },
  titleBlock: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    color: "#9ba7be",
  },
  logo: {
    width: 96,
    height: 32,
    objectFit: "contain",
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#e6edf7",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#243145",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#101828",
  },
  metricLabel: {
    color: "#9ba7be",
    marginBottom: 4,
    fontSize: 10,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  metricDelta: {
    marginTop: 2,
    fontSize: 9,
    color: "#9ba7be",
  },
  funnelGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  funnelCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#243145",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#101828",
  },
  funnelLabel: {
    color: "#9ba7be",
    fontSize: 9,
  },
  funnelValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  table: {
    borderWidth: 1,
    borderColor: "#243145",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#243145",
  },
  tableHead: {
    backgroundColor: "#101828",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableText: {
    fontSize: 10,
    color: "#e6edf7",
  },
  footer: {
    marginTop: 18,
    color: "#9ba7be",
    fontSize: 9,
  },
});

function FunnelBlock({ funnel }: { funnel: FunnelSnapshot }) {
  const stages = [
    { label: "Awareness", value: funnel.visits, extra: "100%" },
    { label: "Lead", value: funnel.leads, extra: funnel.visitToLeadPct },
    { label: "Customer", value: funnel.deals, extra: funnel.leadToDealPct },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>Embudo de conversion</Text>
      <View style={styles.funnelGrid}>
        {stages.map((stage) => (
          <View key={stage.label} style={styles.funnelCard}>
            <Text style={styles.funnelLabel}>{stage.label}</Text>
            <Text style={styles.funnelValue}>{stage.value}</Text>
            <Text style={styles.metricDelta}>Tasa: {stage.extra}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RevenueTable({ revenuePoints }: { revenuePoints: RevenuePoint[] }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Tendencia de ingresos (MRR)</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHead]}>
          <View style={styles.tableCell}>
            <Text style={styles.tableText}>Fecha</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.tableText}>MRR</Text>
          </View>
        </View>
        {revenuePoints.map((point, index) => (
          // react-pdf does not accept undefined entries inside style arrays.
          <View
            key={`${point.date}-${index}`}
            style={
              index === revenuePoints.length - 1
                ? [styles.tableRow, { borderBottomWidth: 0 }]
                : styles.tableRow
            }
          >
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{point.date}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}>{point.mrr}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function createReportDocument({
  workspaceName,
  logoUrl,
  dateRangeLabel,
  clientName,
  kpis,
  funnel,
  revenuePoints,
}: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Reporte analitico</Text>
            <Text style={styles.subtitle}>{workspaceName}</Text>
            <Text style={styles.subtitle}>Cliente: {clientName}</Text>
            <Text style={styles.subtitle}>Periodo: {dateRangeLabel}</Text>
          </View>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
        </View>

        <Text style={styles.sectionTitle}>KPI principales</Text>
        <View style={styles.grid}>
          {kpis.map((item) => (
            <View key={item.label} style={styles.card}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              {item.delta ? <Text style={styles.metricDelta}>{item.delta}</Text> : null}
            </View>
          ))}
        </View>

        <FunnelBlock funnel={funnel} />
        <RevenueTable revenuePoints={revenuePoints} />

        <Text style={styles.footer}>
          Documento generado server-side para uso del workspace.
        </Text>
      </Page>
    </Document>
  );
}
