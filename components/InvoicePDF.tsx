import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Invoice, Company } from '../types';

const commonStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#ffffff' },
  logo: { width: 60, height: 60, objectFit: 'contain' },
  table: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  col1: { width: '5%' },
  col2: { width: '45%' },
  col3: { width: '10%', textAlign: 'center' },
  col4: { width: '10%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '15%', textAlign: 'right' },
  headerText: { fontSize: 8, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
});

interface InvoicePDFProps {
  invoice: Invoice;
  company: Company;
  documentTitle?: string;
  numberToWords: (n: number) => string;
}

const ModernInvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, documentTitle = 'Invoice', numberToWords }) => {
  const selectedBankAccount = company.bankAccounts.find(ba => ba.id === invoice.selectedBankAccountId);
  const docNumber = invoice.invoiceNumber || (invoice as any).quotationNumber;
  const dateLabel = documentTitle === 'Quotation' ? 'Date' : 'Invoice Date';
  const validUntilLabel = documentTitle === 'Quotation' ? 'Valid Until' : 'Due Date';
  const validUntilValue = documentTitle === 'Quotation' ? ((invoice as any).validUntil || invoice.dueDate) : invoice.dueDate;

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {company.details?.logo && <Image src={company.details.logo} style={commonStyles.logo} />}
            <View style={{ maxWidth: 250 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>{company.details?.name || 'Company Name'}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{company.details?.address || ''}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{company.details?.city || ''} {company.details?.zip || ''}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>Tel: {company.details?.phone || 'N/A'}</Text>
              {company.details?.gstin && <Text style={{ fontWeight: 'bold', marginTop: 4, fontSize: 9 }}>GSTIN: {company.details.gstin}</Text>}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase' }}>{documentTitle}</Text>
            <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 }}>
              <Text style={{ fontSize: 9, color: '#64748b' }}>{documentTitle} No: <Text style={{ color: '#0f172a', fontWeight: 'bold' }}>{docNumber}</Text></Text>
              <Text style={{ fontSize: 9, color: '#64748b' }}>{dateLabel}: <Text style={{ color: '#0f172a' }}>{invoice.issueDate}</Text></Text>
              <Text style={{ fontSize: 9, color: '#64748b' }}>{validUntilLabel}: <Text style={{ color: '#0f172a' }}>{validUntilValue}</Text></Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 40, marginBottom: 30 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Bill To</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{invoice.client?.name || 'Unknown Client'}</Text>
            <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.client?.address || ''}</Text>
            <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.client?.city || ''}, {invoice.client?.state || ''} {invoice.client?.zip || ''}</Text>
            {invoice.client?.gstin && <Text style={{ marginTop: 4, fontWeight: 'bold', fontSize: 9 }}>GSTIN: {invoice.client.gstin}</Text>}
          </View>
          {invoice.shippingName && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Ship To</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{invoice.shippingName}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.shippingAddress}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.shippingCity}, {invoice.shippingState} {invoice.shippingZip}</Text>
            </View>
          )}
        </View>

        <View style={commonStyles.table}>
          <View style={commonStyles.tableHeader}>
            <Text style={[commonStyles.col1, commonStyles.headerText]}>#</Text>
            <Text style={[commonStyles.col2, commonStyles.headerText]}>Item Description</Text>
            <Text style={[commonStyles.col3, commonStyles.headerText]}>HSN</Text>
            <Text style={[commonStyles.col4, commonStyles.headerText]}>Qty</Text>
            <Text style={[commonStyles.col5, commonStyles.headerText]}>Price</Text>
            <Text style={[commonStyles.col6, commonStyles.headerText]}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={commonStyles.tableRow}>
              <Text style={[commonStyles.col1, { color: '#94a3b8' }]}>{index + 1}</Text>
              <Text style={[commonStyles.col2, { fontWeight: 'bold', color: '#0f172a' }]}>{item.name}</Text>
              <Text style={[commonStyles.col3, { color: '#64748b' }]}>{item.hsn || '-'}</Text>
              <Text style={[commonStyles.col4, { color: '#0f172a' }]}>{item.quantity} {item.unit}</Text>
              <Text style={[commonStyles.col5, { color: '#0f172a' }]}>{item.price.toFixed(2)}</Text>
              <Text style={[commonStyles.col6, { fontWeight: 'bold', color: '#0f172a' }]}>{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
          <View style={{ flex: 1, marginRight: 40 }}>
            <View style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, marginBottom: 15 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Total in Words</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a' }}>{numberToWords(invoice.grandTotal)}</Text>
            </View>
            {selectedBankAccount && (
              <View>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Bank Details</Text>
                <Text style={{ fontSize: 9, color: '#64748b' }}>{selectedBankAccount.bankName} • {selectedBankAccount.accountNumber} • {selectedBankAccount.ifsc}</Text>
              </View>
            )}
          </View>
          <View style={{ width: 200, borderWidth: 1, borderColor: '#e2e8f0', padding: 15, borderRadius: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#64748b' }}>Subtotal</Text>
              <Text>Rs. {invoice.subTotal.toFixed(2)}</Text>
            </View>
            {invoice.cgst > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#64748b' }}>CGST</Text>
                <Text>Rs. {invoice.cgst.toFixed(2)}</Text>
              </View>
            )}
            {invoice.sgst > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#64748b' }}>SGST</Text>
                <Text>Rs. {invoice.sgst.toFixed(2)}</Text>
              </View>
            )}
            {invoice.igst > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#64748b' }}>IGST</Text>
                <Text>Rs. {invoice.igst.toFixed(2)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Total</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Rs. {invoice.grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 }}>
          <View style={{ maxWidth: 250 }}>
            <Text style={{ fontWeight: 'bold', color: '#64748b', marginBottom: 4 }}>Terms & Conditions:</Text>
            <Text style={{ color: '#94a3b8', fontSize: 8 }}>{invoice.notes || (documentTitle === 'Quotation' ? 'Valid for 30 days.' : 'Payment due within 15 days.')}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            {company.details?.signature && <Image src={company.details.signature} style={{ height: 40, width: 'auto', marginBottom: 5 }} />}
            <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#0f172a' }}>{company.details?.name || 'Company Name'}</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const TraditionalInvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, documentTitle = 'Invoice', numberToWords }) => {
  const selectedBankAccount = company.bankAccounts.find(ba => ba.id === invoice.selectedBankAccountId);
  const docNumber = invoice.invoiceNumber || (invoice as any).quotationNumber;
  const dateLabel = documentTitle === 'Quotation' ? 'Date' : 'Invoice Date';
  const validUntilLabel = documentTitle === 'Quotation' ? 'Valid Until' : 'Due Date';
  const validUntilValue = documentTitle === 'Quotation' ? ((invoice as any).validUntil || invoice.dueDate) : invoice.dueDate;

  return (
    <Document>
      <Page size="A4" style={{ padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#000000', backgroundColor: '#ffffff' }}>
        <View style={{ borderWidth: 1, borderColor: '#000000', flex: 1 }}>
          
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#000000', padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>{documentTitle}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{company.details?.name || 'Company Name'}</Text>
            <Text style={{ fontSize: 8 }}>{company.details?.address || ''}, {company.details?.city || ''} {company.details?.zip || ''}</Text>
            <Text style={{ fontSize: 8 }}>Ph: {company.details?.phone || 'N/A'} | Email: {company.details?.email || 'N/A'}</Text>
            {company.details?.gstin && <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 2 }}>GSTIN: {company.details.gstin}</Text>}
          </View>

          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' }}>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000000', padding: 10 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>Billed To:</Text>
              <Text style={{ fontWeight: 'bold' }}>{invoice.client?.name || 'Unknown Client'}</Text>
              <Text style={{ fontSize: 8 }}>{invoice.client?.address || ''}</Text>
              <Text style={{ fontSize: 8 }}>{invoice.client?.city || ''}, {invoice.client?.state || ''} {invoice.client?.zip || ''}</Text>
              {invoice.client?.gstin && <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 2 }}>GSTIN: {invoice.client.gstin}</Text>}
            </View>
            <View style={{ flex: 1, padding: 10 }}>
              <View style={{ flexDirection: 'row', marginBottom: 2 }}><Text style={{ width: 80, fontWeight: 'bold' }}>{documentTitle} No:</Text><Text>{docNumber}</Text></View>
              <View style={{ flexDirection: 'row', marginBottom: 2 }}><Text style={{ width: 80, fontWeight: 'bold' }}>{dateLabel}:</Text><Text>{invoice.issueDate}</Text></View>
              <View style={{ flexDirection: 'row', marginBottom: 2 }}><Text style={{ width: 80, fontWeight: 'bold' }}>{validUntilLabel}:</Text><Text>{validUntilValue}</Text></View>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000', backgroundColor: '#f0f0f0' }}>
              <Text style={{ width: '5%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'center', fontWeight: 'bold' }}>S.No</Text>
              <Text style={{ width: '45%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, fontWeight: 'bold' }}>Description of Goods/Services</Text>
              <Text style={{ width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'center', fontWeight: 'bold' }}>HSN/SAC</Text>
              <Text style={{ width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'right', fontWeight: 'bold' }}>Qty</Text>
              <Text style={{ width: '15%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'right', fontWeight: 'bold' }}>Rate</Text>
              <Text style={{ width: '15%', padding: 4, textAlign: 'right', fontWeight: 'bold' }}>Amount</Text>
            </View>
            {invoice.items.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                <Text style={{ width: '5%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'center' }}>{index + 1}</Text>
                <Text style={{ width: '45%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4 }}>{item.name}</Text>
                <Text style={{ width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'center' }}>{item.hsn || '-'}</Text>
                <Text style={{ width: '10%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'right' }}>{item.quantity} {item.unit}</Text>
                <Text style={{ width: '15%', borderRightWidth: 1, borderRightColor: '#000000', padding: 4, textAlign: 'right' }}>{item.price.toFixed(2)}</Text>
                <Text style={{ width: '15%', padding: 4, textAlign: 'right' }}>{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000000' }}>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000000', padding: 10 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 2 }}>Amount in Words:</Text>
              <Text style={{ fontSize: 9, fontStyle: 'italic' }}>{numberToWords(invoice.grandTotal)}</Text>
              {selectedBankAccount && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 2 }}>Bank Details:</Text>
                  <Text style={{ fontSize: 8 }}>Bank: {selectedBankAccount.bankName}</Text>
                  <Text style={{ fontSize: 8 }}>A/C No: {selectedBankAccount.accountNumber}</Text>
                  <Text style={{ fontSize: 8 }}>IFSC: {selectedBankAccount.ifsc}</Text>
                </View>
              )}
            </View>
            <View style={{ width: 200 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                <Text>Taxable Amount</Text>
                <Text>{invoice.subTotal.toFixed(2)}</Text>
              </View>
              {(invoice.cgst > 0 || invoice.sgst > 0) && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                    <Text>Add: CGST</Text>
                    <Text>{invoice.cgst.toFixed(2)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                    <Text>Add: SGST</Text>
                    <Text>{invoice.sgst.toFixed(2)}</Text>
                  </View>
                </>
              )}
              {invoice.igst > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                  <Text>Add: IGST</Text>
                  <Text>{invoice.igst.toFixed(2)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 4, fontWeight: 'bold' }}>
                <Text>Total Amount</Text>
                <Text>Rs. {invoice.grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#000000', padding: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 2 }}>Terms & Conditions:</Text>
              <Text style={{ fontSize: 8 }}>{invoice.notes || 'E. & O.E.'}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 20 }}>For {company.details?.name || 'Company Name'}</Text>
              {company.details?.signature && <Image src={company.details.signature} style={{ height: 30, width: 'auto', marginBottom: 2 }} />}
              <Text style={{ fontSize: 8, borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 2 }}>Authorized Signatory</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

const PremiumInvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, documentTitle = 'Invoice', numberToWords }) => {
  const selectedBankAccount = company.bankAccounts.find(ba => ba.id === invoice.selectedBankAccountId);
  const docNumber = invoice.invoiceNumber || (invoice as any).quotationNumber;
  const dateLabel = documentTitle === 'Quotation' ? 'Date' : 'Invoice Date';
  const validUntilLabel = documentTitle === 'Quotation' ? 'Valid Until' : 'Due Date';
  const validUntilValue = documentTitle === 'Quotation' ? ((invoice as any).validUntil || invoice.dueDate) : invoice.dueDate;
  
  const brandColor = company.details?.brandColor || '#4F46E5';

  return (
    <Document>
      <Page size="A4" style={{ padding: 0, fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#ffffff' }}>
        <View style={{ backgroundColor: brandColor, padding: 40, color: '#ffffff', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {company.details?.logo && (
              <View style={{ backgroundColor: '#ffffff', padding: 5, borderRadius: 8 }}>
                <Image src={company.details.logo} style={{ width: 50, height: 50, objectFit: 'contain' }} />
              </View>
            )}
            <View style={{ maxWidth: 250 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{company.details?.name || 'Company Name'}</Text>
              <Text style={{ fontSize: 9, opacity: 0.8, marginTop: 4 }}>{company.details?.email} | {company.details?.phone}</Text>
              {company.details?.gstin && <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>GSTIN: {company.details.gstin}</Text>}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', textTransform: 'uppercase' }}>{documentTitle}</Text>
            <Text style={{ fontSize: 14, marginTop: 4 }}>#{docNumber}</Text>
          </View>
        </View>

        <View style={{ padding: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, marginBottom: 30 }}>
            <View>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{dateLabel}</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a', marginTop: 2 }}>{invoice.issueDate}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{validUntilLabel}</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a', marginTop: 2 }}>{validUntilValue}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Amount Due</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: brandColor, marginTop: 2 }}>Rs. {invoice.grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 40, marginBottom: 30 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: brandColor, textTransform: 'uppercase', marginBottom: 6 }}>Billed To</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{invoice.client?.name || 'Unknown Client'}</Text>
              <Text style={{ color: '#64748b', fontSize: 9, marginTop: 2 }}>{invoice.client?.address || ''}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.client?.city || ''}, {invoice.client?.state || ''} {invoice.client?.zip || ''}</Text>
              {invoice.client?.gstin && <Text style={{ marginTop: 4, fontWeight: 'bold', fontSize: 9, color: '#0f172a' }}>GSTIN: {invoice.client.gstin}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: brandColor, textTransform: 'uppercase', marginBottom: 6 }}>Company Details</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{company.details?.address || ''}</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{company.details?.city || ''}, {company.details?.state || ''} {company.details?.zip || ''}</Text>
            </View>
          </View>

          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: brandColor, paddingBottom: 8, marginBottom: 8 }}>
              <Text style={[commonStyles.col1, { fontWeight: 'bold', color: '#0f172a' }]}>#</Text>
              <Text style={[commonStyles.col2, { fontWeight: 'bold', color: '#0f172a' }]}>Description</Text>
              <Text style={[commonStyles.col3, { fontWeight: 'bold', color: '#0f172a' }]}>HSN</Text>
              <Text style={[commonStyles.col4, { fontWeight: 'bold', color: '#0f172a' }]}>Qty</Text>
              <Text style={[commonStyles.col5, { fontWeight: 'bold', color: '#0f172a' }]}>Price</Text>
              <Text style={[commonStyles.col6, { fontWeight: 'bold', color: '#0f172a' }]}>Total</Text>
            </View>
            {invoice.items.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={[commonStyles.col1, { color: '#94a3b8' }]}>{index + 1}</Text>
                <Text style={[commonStyles.col2, { fontWeight: 'bold', color: '#0f172a' }]}>{item.name}</Text>
                <Text style={[commonStyles.col3, { color: '#64748b' }]}>{item.hsn || '-'}</Text>
                <Text style={[commonStyles.col4, { color: '#64748b' }]}>{item.quantity} {item.unit}</Text>
                <Text style={[commonStyles.col5, { color: '#64748b' }]}>{item.price.toFixed(2)}</Text>
                <Text style={[commonStyles.col6, { fontWeight: 'bold', color: '#0f172a' }]}>{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 40 }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold', color: brandColor, textTransform: 'uppercase', marginBottom: 4 }}>Amount in Words</Text>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a' }}>{numberToWords(invoice.grandTotal)}</Text>
              </View>
              {selectedBankAccount && (
                <View style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 8 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: brandColor, textTransform: 'uppercase', marginBottom: 4 }}>Payment Details</Text>
                  <Text style={{ fontSize: 9, color: '#0f172a' }}>Bank: {selectedBankAccount.bankName}</Text>
                  <Text style={{ fontSize: 9, color: '#0f172a' }}>A/C No: {selectedBankAccount.accountNumber}</Text>
                  <Text style={{ fontSize: 9, color: '#0f172a' }}>IFSC: {selectedBankAccount.ifsc}</Text>
                </View>
              )}
            </View>
            <View style={{ width: 200 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#64748b' }}>Subtotal</Text>
                <Text>Rs. {invoice.subTotal.toFixed(2)}</Text>
              </View>
              {(invoice.cgst > 0 || invoice.sgst > 0) && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#64748b' }}>CGST</Text>
                    <Text>Rs. {invoice.cgst.toFixed(2)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#64748b' }}>SGST</Text>
                    <Text>Rs. {invoice.sgst.toFixed(2)}</Text>
                  </View>
                </>
              )}
              {invoice.igst > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: '#64748b' }}>IGST</Text>
                  <Text>Rs. {invoice.igst.toFixed(2)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: brandColor, color: '#ffffff', padding: 10, borderRadius: 8, marginTop: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Total</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Rs. {invoice.grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20 }}>
            <View style={{ maxWidth: 250 }}>
              <Text style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Notes:</Text>
              <Text style={{ color: '#64748b', fontSize: 9 }}>{invoice.notes || 'Thank you for your business.'}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              {company.details?.signature && <Image src={company.details.signature} style={{ height: 40, width: 'auto', marginBottom: 5 }} />}
              <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#0f172a' }}>{company.details?.name || 'Company Name'}</Text>
              <Text style={{ fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>Authorized Signatory</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
};

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, company, documentTitle = 'Invoice', numberToWords }) => {
  const template = company.details?.invoiceTemplate || 'modern';
  
  if (template === 'traditional') {
    return <TraditionalInvoicePDF invoice={invoice} company={company} documentTitle={documentTitle} numberToWords={numberToWords} />;
  }
  if (template === 'premium' && company.subscription?.plan === 'premium') {
    return <PremiumInvoicePDF invoice={invoice} company={company} documentTitle={documentTitle} numberToWords={numberToWords} />;
  }
  
  return <ModernInvoicePDF invoice={invoice} company={company} documentTitle={documentTitle} numberToWords={numberToWords} />;
};
