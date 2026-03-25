
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Invoice, Company } from '../types';

// Register fonts for professional look
// Removed custom font to avoid network issues and "Unknown font format" errors.
// Using default Helvetica.


const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    maxWidth: 250,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0f172a',
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textTransform: 'uppercase',
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.5,
  },
  invoiceDetails: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  detailLabel: {
    width: 80,
    color: '#64748b',
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  detailValue: {
    fontWeight: 'bold',
  },
  addressSection: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 30,
  },
  addressBlock: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 2,
  },
  addressName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  col1: { width: '5%' },
  col2: { width: '45%' },
  col3: { width: '10%', textAlign: 'center' },
  col4: { width: '10%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '15%', textAlign: 'right' },
  headerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  summaryLeft: {
    flex: 1,
    marginRight: 40,
  },
  summaryRight: {
    width: 200,
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 12,
    color: '#ffffff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordsSection: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  wordsLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  wordsValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  signatureBlock: {
    textAlign: 'center',
  },
  signatureImage: {
    height: 40,
    width: 'auto',
    marginBottom: 5,
    opacity: 0.8,
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bankDetails: {
    fontSize: 9,
    color: '#64748b',
  }
});

interface InvoicePDFProps {
  invoice: Invoice;
  company: Company;
  documentTitle?: string;
  numberToWords: (n: number) => string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, documentTitle = 'Invoice', numberToWords }) => {
  const selectedBankAccount = company.bankAccounts.find(ba => ba.id === invoice.selectedBankAccountId);
  const docNumber = invoice.invoiceNumber || (invoice as any).quotationNumber;
  const dateLabel = documentTitle === 'Quotation' ? 'Date' : 'Invoice Date';
  const validUntilLabel = documentTitle === 'Quotation' ? 'Valid Until' : 'Due Date';
  const validUntilValue = documentTitle === 'Quotation' ? ((invoice as any).validUntil || invoice.dueDate) : invoice.dueDate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.invoiceTitle}>{documentTitle}</Text>
        
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {company.details?.logo ? (
              <Image src={company.details.logo} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>{company.details?.name?.substring(0, 2) || 'CO'}</Text>
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{company.details?.name || 'Company Name'}</Text>
              <Text style={{ color: '#64748b', marginBottom: 2 }}>{company.details?.address || ''}</Text>
              <Text style={{ color: '#64748b', marginBottom: 2 }}>{company.details?.city || ''} {company.details?.zip ? `- ${company.details.zip}` : ''}{company.details?.state ? `, ${company.details.state}` : ''}</Text>
              <Text style={{ color: '#64748b' }}>Tel: {company.details?.phone || 'N/A'} | {company.details?.email || 'N/A'}</Text>
              {company.details?.gstin && <Text style={{ fontWeight: 'bold', marginTop: 4 }}>GSTIN: {company.details.gstin}</Text>}
            </View>
          </View>

          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{documentTitle} No:</Text>
              <Text style={styles.detailValue}>{docNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{dateLabel}:</Text>
              <Text style={styles.detailValue}>{invoice.issueDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{validUntilLabel}:</Text>
              <Text style={[styles.detailValue, { color: '#10b981' }]}>{validUntilValue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Bill To</Text>
            <Text style={styles.addressName}>{invoice.client?.name || 'Unknown Client'}</Text>
            <Text style={{ color: '#64748b' }}>{invoice.client?.address || ''}</Text>
            <Text style={{ color: '#64748b' }}>{invoice.client?.city || ''}, {invoice.client?.state || ''} {invoice.client?.zip || ''}</Text>
            {invoice.client?.gstin && <Text style={{ marginTop: 4, fontWeight: 'bold' }}>GSTIN: {invoice.client.gstin}</Text>}
          </View>
          {invoice.shippingName && (
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Ship To</Text>
              <Text style={styles.addressName}>{invoice.shippingName}</Text>
              <Text style={{ color: '#64748b' }}>{invoice.shippingAddress}</Text>
              <Text style={{ color: '#64748b' }}>{invoice.shippingCity}, {invoice.shippingState} {invoice.shippingZip}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.headerText]}>#</Text>
            <Text style={[styles.col2, styles.headerText]}>Item Description</Text>
            <Text style={[styles.col3, styles.headerText]}>HSN</Text>
            <Text style={[styles.col4, styles.headerText]}>Qty</Text>
            <Text style={[styles.col5, styles.headerText]}>Price</Text>
            <Text style={[styles.col6, styles.headerText]}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.col1, { color: '#94a3b8' }]}>{index + 1}</Text>
              <Text style={[styles.col2, { fontWeight: 'bold' }]}>{item.name}</Text>
              <Text style={[styles.col3, { color: '#64748b' }]}>{item.hsn || '-'}</Text>
              <Text style={styles.col4}>{item.quantity} {item.unit}</Text>
              <Text style={styles.col5}>{item.price.toFixed(2)}</Text>
              <Text style={[styles.col6, { fontWeight: 'bold' }]}>{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryLeft}>
            <View style={styles.wordsSection}>
              <Text style={styles.wordsLabel}>Total in Words</Text>
              <Text style={styles.wordsValue}>{numberToWords(invoice.grandTotal)}</Text>
            </View>
            {selectedBankAccount && (
              <View>
                <Text style={styles.bankTitle}>Bank Details</Text>
                <Text style={styles.bankDetails}>{selectedBankAccount.bankName} • {selectedBankAccount.accountNumber} • {selectedBankAccount.ifsc}</Text>
              </View>
            )}
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.summaryRow}>
              <Text style={{ opacity: 0.8 }}>Subtotal</Text>
              <Text>Rs. {invoice.subTotal.toFixed(2)}</Text>
            </View>
            {invoice.cgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ opacity: 0.8 }}>CGST</Text>
                <Text>Rs. {invoice.cgst.toFixed(2)}</Text>
              </View>
            )}
            {invoice.sgst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ opacity: 0.8 }}>SGST</Text>
                <Text>Rs. {invoice.sgst.toFixed(2)}</Text>
              </View>
            )}
            {invoice.igst > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ opacity: 0.8 }}>IGST</Text>
                <Text>Rs. {invoice.igst.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {invoice.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{ maxWidth: 250 }}>
            <Text style={{ fontWeight: 'bold', color: '#64748b', marginBottom: 4 }}>Terms & Conditions:</Text>
            <Text style={{ color: '#94a3b8', fontSize: 8 }}>{invoice.notes || (documentTitle === 'Quotation' ? 'Valid for 30 days.' : 'Payment due within 15 days.')}</Text>
          </View>
          <View style={styles.signatureBlock}>
            {company.details?.signature && <Image src={company.details.signature} style={styles.signatureImage} />}
            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{company.details?.name || 'Company Name'}</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
