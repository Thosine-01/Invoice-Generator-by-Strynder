import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { InvoicePreviewProps } from "@/components/InvoicePreview";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  hasBusinessIdentity,
  hasProfileContact,
  hasTextContent,
} from "@/lib/invoice-document";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    color: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "68%",
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    objectFit: "contain",
  },
  businessName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  headerSubtext: {
    fontSize: 9,
    color: "#f3f4f6",
    marginTop: 2,
  },
  invoiceBadge: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#f3f4f6",
    textAlign: "right",
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #e5e7eb",
  },
  metaColumn: {
    flex: 1,
    maxWidth: "48%",
  },
  metaRight: {
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 3,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  billToBlock: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#ffffff",
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: "1px solid #f3f4f6",
    alignItems: "flex-start",
  },
  colIndex: { width: "6%" },
  colDescription: {
    width: "40%",
    paddingRight: 8,
  },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "22%", textAlign: "right" },
  wrapText: {
    flexWrap: "wrap",
  },
  cellText: {
    fontSize: 9,
  },
  cellTextBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  totalsBlock: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 9,
    color: "#111827",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  paymentBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  notesBlock: {
    marginTop: 16,
  },
  notesText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.5,
  },
});

export function InvoicePdfDocument({
  headerColor,
  profile,
  invoiceNumber,
  issueDate,
  dueDate,
  currency,
  clientName,
  clientAddress,
  clientEmail,
  clientPhone,
  lineItems,
  vatEnabled,
  vatRate,
  subtotal,
  vatAmount,
  grandTotal,
  paymentDetails,
  notes,
}: InvoicePreviewProps) {
  const displayName = profile.business_name || profile.owner_name;
  const showIdentity = hasBusinessIdentity(profile);
  const showProfileContact = hasProfileContact(profile);
  const showPayment = hasTextContent(paymentDetails);
  const showNotes = hasTextContent(notes);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={[styles.header, { backgroundColor: headerColor }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              {profile.logo_url && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={profile.logo_url} style={styles.logo} />
              )}
              {showIdentity && (
                <View>
                  {displayName && (
                    <Text style={styles.businessName}>{displayName}</Text>
                  )}
                  {profile.slogan && (
                    <Text style={styles.headerSubtext}>{profile.slogan}</Text>
                  )}
                  {profile.owner_name && profile.business_name && (
                    <Text style={styles.headerSubtext}>
                      {profile.owner_name}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View>
              <Text style={styles.invoiceBadge}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          {showProfileContact && (
            <View style={styles.metaColumn}>
              {profile.address && (
                <Text style={styles.metaText}>{profile.address}</Text>
              )}
              {profile.phone && (
                <Text style={styles.metaText}>{profile.phone}</Text>
              )}
              {profile.email && (
                <Text style={styles.metaText}>{profile.email}</Text>
              )}
            </View>
          )}
          <View
            style={[
              styles.metaColumn,
              styles.metaRight,
              showProfileContact ? {} : { maxWidth: "100%" },
            ]}
          >
              <Text style={styles.metaText}>
                <Text style={styles.metaLabel}>Date of issue: </Text>
                {formatDate(issueDate)}
              </Text>
              {dueDate && (
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Due date: </Text>
                  {formatDate(dueDate)}
                </Text>
              )}
              <Text style={styles.metaText}>
                <Text style={styles.metaLabel}>Currency: </Text>
                {currency}
              </Text>
            </View>
          </View>

        <View style={styles.billToBlock}>
          <Text style={styles.sectionLabel}>Bill to</Text>
          <Text style={styles.clientName}>{clientName}</Text>
          {clientAddress?.trim() && (
            <Text style={styles.clientDetail}>{clientAddress}</Text>
          )}
          {clientEmail?.trim() && (
            <Text style={styles.clientDetail}>{clientEmail}</Text>
          )}
          {clientPhone?.trim() && (
            <Text style={styles.clientDetail}>{clientPhone}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View
            style={[styles.tableHeader, { backgroundColor: headerColor }]}
          >
            <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {lineItems.map((item) => (
            <View key={item.sort_order} style={styles.tableRow} wrap={false}>
              <Text style={[styles.cellText, styles.colIndex]}>
                {item.sort_order}
              </Text>
              <View style={styles.colDescription}>
                <Text style={[styles.cellText, styles.wrapText]}>
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.cellText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.cellText, styles.colPrice]}>
                {formatCurrency(item.unit_price, currency)}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>
                {formatCurrency(item.line_total, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          {vatEnabled && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(subtotal, currency)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT ({vatRate}%)</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(vatAmount, currency)}
                </Text>
              </View>
            </>
          )}
          <View
            style={[styles.grandTotalRow, { borderTopColor: headerColor }]}
          >
            <Text style={styles.grandTotalLabel}>
              {vatEnabled ? "Grand total" : "Total"}
            </Text>
            <Text style={[styles.grandTotalValue, { color: headerColor }]}>
              {formatCurrency(grandTotal, currency)}
            </Text>
          </View>
        </View>

        {showPayment && (
          <View style={styles.paymentBox}>
            <Text style={styles.sectionLabel}>Payment details</Text>
            <Text style={styles.paymentText}>{paymentDetails}</Text>
          </View>
        )}

        {showNotes && (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
