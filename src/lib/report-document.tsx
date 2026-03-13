/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

type ReportMetric = {
  label: string;
  value: string;
};

export type ReportDocumentProps = {
  workspaceName: string;
  logoUrl?: string | null;
  dateRangeLabel: string;
  clientName: string;
  metrics: ReportMetric[];
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0b0f1a",
    color: "#e6edf7",
    padding: 36,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#243145",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#101828",
  },
  metricLabel: {
    color: "#9ba7be",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  footer: {
    marginTop: 26,
    color: "#9ba7be",
    fontSize: 10,
  },
});

export function createReportDocument({
  workspaceName,
  logoUrl,
  dateRangeLabel,
  clientName,
  metrics,
}: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Reporte automatizado</Text>
            <Text style={styles.subtitle}>{workspaceName}</Text>
            <Text style={styles.subtitle}>Cliente: {clientName}</Text>
            <Text style={styles.subtitle}>Periodo: {dateRangeLabel}</Text>
          </View>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
        </View>

        <View style={styles.grid}>
          {metrics.map((item) => (
            <View key={item.label} style={styles.card}>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Documento analitico de uso interno.</Text>
      </Page>
    </Document>
  );
}
