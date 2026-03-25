
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import type { Invoice, Company, BankAccount, RecurringInvoice, RecurringFrequency, InvoiceItem } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Modal from './common/Modal';
import { arrayToCSV, downloadCSV, generateGSTR1CSV, generateGSTR3BCSV } from '../utils/csvExport';
import { MessageCircle, FileText, Download, Trash2, CheckCircle, Clock, AlertCircle, Filter, ChevronDown, Share2, Printer, MoreVertical, Repeat, Calendar, Play, Pause, Edit, Plus } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';
import { Dropdown } from './common/Dropdown';

// --- Icons ---
const WhatsAppIcon = () => <MessageCircle className="w-4 h-4" />;
const EmptyStateIllustration = () => (
    <FileText className="w-64 h-64 mx-auto text-slate-200 dark:text-slate-700" strokeWidth={0.5} />
);

// --- Number to Words ---
export const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const inWords = (n: number): string => {
        if (n > 999999999) return 'overflow';
        let res = '';
        const lakhCrore = (num: number, divisor: number, word: string) => { const q = Math.floor(num/divisor); if(q>0){res+=inWords(q)+word; num%=divisor;} return num; };
        n = lakhCrore(n, 10000000, 'crore '); n = lakhCrore(n, 100000, 'lakh '); n = lakhCrore(n, 1000, 'thousand ');
        const hundreds = Math.floor(n/100); if(hundreds>0){res+=a[hundreds]+'hundred '; n%=100;}
        if(n>0){if(res!=='')res+='and '; res+=(n<20?a[n]:b[Math.floor(n/10)]+a[n%10]);}
        return res;
    };
    if (typeof num !== 'number') return '';
    let numStr = num.toFixed(2).toString();
    const [rupeesStr, paiseStr] = numStr.split('.');
    let rupees = parseInt(rupeesStr);
    let paise = parseInt(paiseStr);
    let output = inWords(rupees).trim() || 'Zero';
    let finalOutput = output.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Rupees';
    if(paise > 0) finalOutput += ' and ' + inWords(paise).trim() + ' Paise';
    return finalOutput + ' Only';
};

// --- Reusable Invoice Content Component (Legacy for Preview) ---
export const InvoiceContent: React.FC<{ invoice: Invoice, company: Company, documentTitle?: string }> = ({ invoice, company, documentTitle = 'Invoice' }) => {
    const selectedBankAccount = company.bankAccounts.find(ba => ba.id === invoice.selectedBankAccountId);
    const currency = '₹';
    
    // Handle Polymorphism between Invoice and Quotation
    const docNumber = invoice.invoiceNumber || (invoice as any).quotationNumber;
    const dateLabel = documentTitle === 'Quotation' ? 'Date' : 'Invoice Date';
    const validUntilLabel = documentTitle === 'Quotation' ? 'Valid Until' : 'Due Date';
    const validUntilValue = documentTitle === 'Quotation' ? ((invoice as any).validUntil || invoice.dueDate) : invoice.dueDate;

    return (
        <div className="bg-white text-slate-900 font-sans text-sm leading-normal p-12 max-w-[210mm] mx-auto box-border h-full flex flex-col relative shadow-lg">
            {/* Professional Header */}
            <div className="flex justify-between items-start mb-8">
                <div className="flex gap-5">
                    {company.details?.logo ? (
                        <img src={company.details.logo} alt="Logo" className="h-24 w-24 object-contain rounded-lg" />
                    ) : (
                        <div className="h-24 w-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-2xl">{company.details?.name?.substring(0,2) || 'CO'}</div>
                    )}
                    <div className="mt-1">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.details?.name || 'Company Name'}</h1>
                        <div className="text-sm text-slate-500 mt-1 space-y-0.5 max-w-xs">
                            <p>{company.details?.address || ''}</p>
                            <p>{company.details?.city || ''}{company.details?.city && company.details?.zip ? ' - ' : ''}{company.details?.zip || ''}</p>
                            <p>{company.details?.state || ''}</p>
                            <p className="mt-1">Tel: {company.details?.phone || 'N/A'} | {company.details?.email || 'N/A'}</p>
                            {company.details?.gstin && <p className="font-semibold text-slate-700">GSTIN: {company.details.gstin}</p>}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-5xl font-extrabold text-slate-100 uppercase tracking-wide leading-none absolute top-12 right-12 z-0 opacity-50">{documentTitle}</h2>
                    <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm mt-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-left">
                            <span className="text-slate-500 font-medium text-xs uppercase">{documentTitle} No</span>
                            <span className="font-bold text-slate-900">{docNumber}</span>
                            <span className="text-slate-500 font-medium text-xs uppercase">{dateLabel}</span>
                            <span className="font-semibold">{invoice.issueDate}</span>
                            <span className="text-slate-500 font-medium text-xs uppercase">{validUntilLabel}</span>
                            <span className="font-semibold text-accent">{validUntilValue}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Addresses */}
            <div className="flex gap-10 mb-10">
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Bill To</h3>
                    <p className="font-bold text-lg text-slate-900">{invoice.client?.name || 'Unknown Client'}</p>
                    <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                        <p>{invoice.client?.address || ''}</p>
                        <p>{invoice.client?.city || ''}{invoice.client?.city && invoice.client?.state ? ', ' : ''}{invoice.client?.state || ''} {invoice.client?.zip || ''}</p>
                        {invoice.client?.gstin && <p className="mt-1 font-medium text-slate-800 bg-slate-50 inline-block px-2 rounded">GSTIN: {invoice.client.gstin}</p>}
                    </div>
                </div>
                {invoice.shippingName && (
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Ship To</h3>
                        <p className="font-bold text-lg text-slate-900">{invoice.shippingName}</p>
                        <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                            <p>{invoice.shippingAddress}</p>
                            <p>{invoice.shippingCity}, {invoice.shippingState} {invoice.shippingZip}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <th className="py-3 px-4 text-left w-10">#</th>
                            <th className="py-3 px-4 text-left">Item Description</th>
                            <th className="py-3 px-4 text-center w-24">HSN</th>
                            <th className="py-3 px-4 text-right w-20">Qty</th>
                            <th className="py-3 px-4 text-right w-24">Price</th>
                            <th className="py-3 px-4 text-right w-28">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-3 px-4 align-top text-slate-400">{index + 1}</td>
                                <td className="py-3 px-4 align-top font-medium text-slate-900">{item.name}</td>
                                <td className="py-3 px-4 align-top text-center text-slate-500">{item.hsn || '-'}</td>
                                <td className="py-3 px-4 align-top text-right">{item.quantity} <span className="text-[10px] uppercase text-slate-400">{item.unit}</span></td>
                                <td className="py-3 px-4 align-top text-right">{item.price.toFixed(2)}</td>
                                <td className="py-3 px-4 align-top text-right font-bold text-slate-900">{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Calculation */}
            <div className="flex gap-8 items-start break-inside-avoid mb-auto">
                <div className="flex-1 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total in Words</p>
                        <p className="text-sm font-bold text-slate-800 capitalize italic leading-relaxed">{numberToWords(invoice.grandTotal)}</p>
                    </div>
                    {selectedBankAccount && (
                        <div className="text-xs text-slate-500">
                            <p className="font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Details</p>
                            <p>{selectedBankAccount.bankName} • {selectedBankAccount.accountNumber} • {selectedBankAccount.ifsc}</p>
                        </div>
                    )}
                </div>
                <div className="w-72 shrink-0">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
                        <div className="space-y-2 text-sm opacity-90">
                            <div className="flex justify-between"><span>Subtotal</span><span>{currency}{invoice.subTotal.toFixed(2)}</span></div>
                            
                            {(invoice.cgst > 0 || invoice.sgst > 0) && (
                                <>
                                    <div className="flex justify-between text-slate-300"><span>CGST</span><span>{currency}{invoice.cgst.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-slate-300"><span>SGST</span><span>{currency}{invoice.sgst.toFixed(2)}</span></div>
                                </>
                            )}
                            
                            {invoice.igst > 0 && (
                                <div className="flex justify-between text-slate-300"><span>IGST</span><span>{currency}{invoice.igst.toFixed(2)}</span></div>
                            )}
                        </div>
                        <div className="border-t border-white/20 my-4"></div>
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>{currency}{invoice.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Signature Area */}
            <div className="mt-12 flex justify-between items-end pt-8 border-t border-slate-100">
                <div className="text-xs text-slate-400 max-w-sm">
                    <p className="font-semibold text-slate-600 mb-1">Terms & Conditions:</p>
                    <p>{invoice.notes || (documentTitle === 'Quotation' ? 'Valid for 30 days.' : 'Payment due within 15 days.')}</p>
                </div>
                <div className="text-center">
                    {company.details?.signature && <img src={company.details.signature} className="h-12 w-auto mx-auto mb-2 opacity-80" alt="Sign"/>}
                    <p className="font-bold text-slate-900 text-sm">{company.details?.name || 'Company Name'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
};

export const InvoiceView: React.FC<{ invoice: Invoice; company: Company; onClose: () => void; onStatusChange?: (id: string, status: any) => void; documentTitle?: string }> = ({ invoice, company, onClose, onStatusChange, documentTitle = 'Invoice' }) => {
  const handleShareWhatsApp = async () => { 
      const num = invoice.invoiceNumber || (invoice as any).quotationNumber;
      const text = `*${documentTitle} from ${company.details?.name || 'Company'}*\n\nHello ${invoice.client?.name || 'Client'},\n\nHere are the details for *${documentTitle} ${num}*:\n\n*Total Amount:* Rs. ${invoice.grandTotal.toFixed(2)}\n*Date:* ${invoice.issueDate}\n\nPlease review attached details.\n\nThank you.`; 
      
      // If Web Share API is supported, try to share the PDF file
      if (navigator.share && navigator.canShare) {
          try {
              const { pdf } = await import('@react-pdf/renderer');
              const blob = await pdf(<InvoicePDF invoice={invoice} company={company} documentTitle={documentTitle} numberToWords={numberToWords} />).toBlob();
              const file = new File([blob], `${documentTitle}-${num}.pdf`, { type: 'application/pdf' });
              
              if (navigator.canShare({ files: [file] })) {
                  await navigator.share({
                      files: [file],
                      title: `${documentTitle} ${num}`,
                      text: text,
                  });
                  return; // Successfully shared via native share sheet
              }
          } catch (error) {
              console.error("Error generating or sharing PDF:", error);
              // Fallthrough to wa.me fallback
          }
      }
      
      // Fallback to wa.me if file sharing is not supported or failed
      // We do this synchronously if navigator.share is missing to avoid popup blockers
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); 
  };

  const num = invoice.invoiceNumber || (invoice as any).quotationNumber;

  return (
    <>
      <div className="max-h-[80vh] overflow-y-auto bg-slate-100 dark:bg-tertiary-dark p-4 flex justify-center">
        <div className="w-[210mm] bg-white min-h-[297mm] shadow-2xl origin-top scale-[0.8] md:scale-100"> 
          <InvoiceContent invoice={invoice} company={company} documentTitle={documentTitle} />
        </div>
      </div>
      <div className="p-6 bg-white dark:bg-primary-dark flex flex-wrap justify-between items-center gap-3 rounded-b-lg border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2">
            {onStatusChange && (
                <>
                    {documentTitle === 'Invoice' ? (
                        <>
                            {invoice.status !== 'Paid' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Paid')} className="!text-emerald-600 hover:!bg-emerald-50 border-emerald-200">Mark Paid</Button>}
                            {invoice.status !== 'Unpaid' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Unpaid')} className="!text-amber-600 hover:!bg-amber-50 border-amber-200">Mark Unpaid</Button>}
                            {invoice.status !== 'Overdue' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Overdue')} className="!text-rose-600 hover:!bg-rose-50 border-rose-200">Mark Overdue</Button>}
                        </>
                    ) : (
                        <>
                            {invoice.status !== 'Draft' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Draft')} className="!text-slate-600 hover:!bg-slate-50 border-slate-200">Mark Draft</Button>}
                            {invoice.status !== 'Sent' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Sent')} className="!text-blue-600 hover:!bg-blue-50 border-blue-200">Mark Sent</Button>}
                            {invoice.status !== 'Accepted' && <Button variant="secondary" onClick={() => onStatusChange(invoice.id, 'Accepted')} className="!text-purple-600 hover:!bg-purple-50 border-purple-200">Mark Accepted</Button>}
                        </>
                    )}
                </>
            )}
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <button onClick={handleShareWhatsApp} className="px-4 py-2 text-sm font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 transition-all active:scale-95"><WhatsAppIcon /> WhatsApp</button>
            
            <PDFDownloadLink 
                document={<InvoicePDF invoice={invoice} company={company} documentTitle={documentTitle} numberToWords={numberToWords} />} 
                fileName={`${documentTitle}-${num}.pdf`}
            >
                {({ loading }) => (
                    <Button disabled={loading}>
                        {loading ? 'Preparing...' : 'Download PDF'}
                    </Button>
                )}
            </PDFDownloadLink>
        </div>
      </div>
    </>
  );
};

// --- Main Invoices Component ---
interface InvoicesProps {
  invoices: Invoice[];
  company: Company;
  setActiveView: (view: string) => void;
  onEdit: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
  onBulkDelete: (invoiceIds: string[]) => void;
  onBulkStatusChange: (invoiceIds: string[], status: Invoice['status']) => void;
  onAddRecurring: (profile: Omit<RecurringInvoice, 'id'>) => void;
  onUpdateRecurring: (profile: RecurringInvoice) => void;
  onDeleteRecurring: (id: string) => void;
  initialFilter?: string;
}

const Invoices: React.FC<InvoicesProps> = ({ 
    invoices, company, setActiveView, onEdit, onDelete, onStatusChange,
    onBulkDelete, onBulkStatusChange, onAddRecurring, onUpdateRecurring, onDeleteRecurring,
    initialFilter
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilter || '');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const currency = '₹';

  useEffect(() => {
    if (initialFilter !== undefined) {
      setFilterStatus(initialFilter);
    }
  }, [initialFilter]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    const lowercasedQuery = searchQuery.toLowerCase();
    if (lowercasedQuery) {
        result = result.filter(invoice => 
            (invoice.invoiceNumber || '').toLowerCase().includes(lowercasedQuery) ||
            (invoice.client?.name || '').toLowerCase().includes(lowercasedQuery)
        );
    }
    if (filterStatus) result = result.filter(invoice => invoice.status === filterStatus);
    return result;
  }, [invoices, searchQuery, filterStatus]);

  const handleSelectOne = (id: string) => {
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
      else setSelectedIds([...selectedIds, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) setSelectedIds(filteredInvoices.map(i => i.id));
      else setSelectedIds([]);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
        case 'Paid': return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'Unpaid': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Overdue': return 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-400';
        default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleExportCSV = () => {
      const data = filteredInvoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          client: inv.client?.name || 'Unknown Client',
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          subTotal: inv.subTotal,
          tax: inv.cgst + inv.sgst + inv.igst,
          grandTotal: inv.grandTotal,
          status: inv.status
      }));
      const columns = [
          { key: 'invoiceNumber', label: 'Invoice #' },
          { key: 'client', label: 'Client' },
          { key: 'issueDate', label: 'Date' },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'subTotal', label: 'Subtotal' },
          { key: 'tax', label: 'Tax' },
          { key: 'grandTotal', label: 'Total' },
          { key: 'status', label: 'Status' }
      ];
      downloadCSV(arrayToCSV(data, columns), 'invoices_export.csv');
  };

  const handleExportGSTR1 = () => {
      if (!company) return;
      const csv = generateGSTR1CSV(filteredInvoices, company);
      downloadCSV(csv, `GSTR1_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportGSTR3B = () => {
      if (!company) return;
      const csv = generateGSTR3BCSV(filteredInvoices, company);
      downloadCSV(csv, `GSTR3B_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-light-text tracking-tight">Invoices</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage billing and collections</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
             <Button variant="secondary" onClick={handleExportCSV} className="flex-1 sm:flex-none gap-2"><Download className="w-4 h-4" /> Export</Button>
             <Button onClick={() => setActiveView('NewInvoice')} className="flex-1 sm:flex-none shadow-lg shadow-accent/20 gap-2"><Plus className="w-4 h-4" /> Create Invoice</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'invoices' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              All Invoices
          </button>
          <button 
            onClick={() => setActiveTab('recurring')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'recurring' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <span className="flex items-center gap-2"><Repeat className="w-4 h-4" /> Recurring</span>
          </button>
      </div>

      {activeTab === 'invoices' && (
        <>
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-grow relative">
                    <Input label="" placeholder="Search by number or client..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="!py-2.5 !pl-10 !rounded-xl"/>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Filter className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white dark:bg-primary-dark border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-accent outline-none cursor-pointer"
                    >
                        <option value="">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                    <div className="relative group">
                        <Button variant="secondary" className="gap-2">Tax Reports <ChevronDown className="w-4 h-4" /></Button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-primary-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                            <button onClick={handleExportGSTR1} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-xl">Export GSTR-1</button>
                            <button onClick={handleExportGSTR3B} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors last:rounded-b-xl">Export GSTR-3B</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-accent text-white px-6 py-3 rounded-xl mb-6 flex justify-between items-center animate-slide-in-top shadow-lg shadow-accent/30">
                    <span className="text-sm font-bold">{selectedIds.length} Invoices Selected</span>
                    <div className="flex gap-3">
                        <button onClick={() => onBulkStatusChange(selectedIds, 'Paid')} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Mark Paid</button>
                        <button onClick={() => onBulkDelete(selectedIds)} className="bg-red-500/80 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Delete Selected</button>
                        <button onClick={() => setSelectedIds([])} className="text-xs font-bold hover:underline">Clear</button>
                    </div>
                </div>
            )}

            {filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <EmptyStateIllustration />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6">No invoices found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Create your first invoice to start getting paid faster. It only takes a minute.</p>
                    <Button className="mt-6" onClick={() => setActiveView('NewInvoice')}>Create First Invoice</Button>
                </div>
            ) : (
                <div className="bg-white dark:bg-primary-dark shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                            <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-accent focus:ring-accent" 
                                            checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4">Number</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredInvoices.map((invoice, idx) => (
                                    <tr key={invoice.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => handleSelectOne(invoice.id)} className="rounded border-slate-300 text-accent focus:ring-accent" /></td>
                                        <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{invoice.client?.name || 'Unknown Client'}</td>
                                        <td className="px-6 py-4">{invoice.issueDate}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{currency}{invoice.grandTotal.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                            <Dropdown
                                                trigger={
                                                    <button className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all hover:ring-2 hover:ring-offset-1 ${getStatusBadge(invoice.status)}`}>
                                                        {invoice.status}
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </button>
                                                }
                                                isOpen={openDropdownId === invoice.id}
                                                onOpen={() => setOpenDropdownId(invoice.id)}
                                                onClose={() => setOpenDropdownId(null)}
                                            >
                                                <div className="py-1 w-32 flex flex-col">
                                                    <button onClick={() => { onStatusChange(invoice.id, 'Paid'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 font-bold transition-colors">Mark Paid</button>
                                                    <button onClick={() => { onStatusChange(invoice.id, 'Unpaid'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 font-bold transition-colors">Mark Unpaid</button>
                                                    <button onClick={() => { onStatusChange(invoice.id, 'Overdue'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 font-bold transition-colors">Mark Overdue</button>
                                                </div>
                                            </Dropdown>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => onEdit(invoice.id)} className="text-slate-400 hover:text-accent p-2 hover:bg-accent/10 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(invoice.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      )}

      {activeTab === 'recurring' && (
          <div className="animate-fade-in">
              <div className="bg-white dark:bg-primary-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <Repeat className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recurring Invoices</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">Automate your billing for retainers or subscriptions. We'll generate invoices automatically based on your schedule.</p>
                  <Button className="mt-6" onClick={() => setActiveView('NewInvoice')}>Setup Recurring Profile</Button>
              </div>
              
              {company.recurringInvoices && company.recurringInvoices.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                      {company.recurringInvoices.map(profile => (
                          <div key={profile.id} className="bg-white dark:bg-primary-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="bg-accent/10 p-3 rounded-xl text-accent">
                                      <Calendar className="w-6 h-6" />
                                  </div>
                                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${profile.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                      {profile.status}
                                  </span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{profile.client.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">Frequency: {profile.frequency}</p>
                              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                  <p className="text-lg font-black text-slate-900 dark:text-white">{currency}{profile.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</p>
                                  <div className="flex gap-2">
                                      <button onClick={() => onDeleteRecurring(profile.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                      {profile.status === 'Active' ? (
                                          <button onClick={() => onUpdateRecurring({...profile, status: 'Paused'})} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Pause className="w-4 h-4" /></button>
                                      ) : (
                                          <button onClick={() => onUpdateRecurring({...profile, status: 'Active'})} className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"><Play className="w-4 h-4" /></button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
      
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title={`Invoice #${selectedInvoice?.invoiceNumber}`}>
          {selectedInvoice && <InvoiceView invoice={selectedInvoice} company={company} onClose={() => setSelectedInvoice(null)} onStatusChange={onStatusChange} />}
      </Modal>
    </div>
  );
};

export default Invoices;
