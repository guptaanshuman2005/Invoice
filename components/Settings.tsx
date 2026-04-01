
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Company, BankAccount, CompanyDetails } from '../types';
import Input from './common/Input';
import Button from './common/Button';
import Modal from './common/Modal';
import { INDIAN_STATES } from '../constants';
import { validateGstin, validatePan, validateEmail, validateIfsc, validateRequired, fetchLocationByPincode } from '../utils/validation';
import { Building, Image as ImageIcon } from 'lucide-react';

interface SettingsProps {
  activeCompany: Company;
  updateCompany: (updatedCompany: Company) => void;
}

type DetailsFormErrors = { [K in keyof Omit<CompanyDetails, 'logo' | 'invoicePrefix' | 'nextInvoiceNumber'>]?: string };
type BankFormErrors = { [K in keyof Omit<BankAccount, 'id' | 'isDefault'>]?: string };

const emptyBankAccount: Omit<BankAccount, 'id'> = { bankName: '', accountNumber: '', ifsc: '', isDefault: false };

const BankAccountForm: React.FC<{ 
    account: Omit<BankAccount, 'id'> | BankAccount; 
    setAccount: React.Dispatch<React.SetStateAction<Omit<BankAccount, 'id'> | BankAccount>>;
    errors: BankFormErrors;
}> = ({ account, setAccount, errors }) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'ifsc') value = value.toUpperCase();
        setAccount(prev => ({ ...prev, [name]: value }));
    }, [setAccount]);

    return (
        <div className="p-6 space-y-4">
            <Input label="Bank Name" name="bankName" value={account.bankName} onChange={handleChange} required error={errors.bankName} placeholder="e.g. HDFC Bank"/>
            <Input label="Account Number" name="accountNumber" value={account.accountNumber} onChange={handleChange} required error={errors.accountNumber} placeholder="e.g. 502000..."/>
            <Input label="IFSC Code" name="ifsc" value={account.ifsc} onChange={handleChange} required error={errors.ifsc} placeholder="e.g. HDFC0001234"/>
        </div>
    );
};

const Settings: React.FC<SettingsProps> = ({ activeCompany, updateCompany }) => {
  const [details, setDetails] = useState(activeCompany.details);
  const [logoPreview, setLogoPreview] = useState<string | null>(activeCompany.details.logo);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | Omit<BankAccount, 'id'>>(emptyBankAccount);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bankSuccessMessage, setBankSuccessMessage] = useState('');
  const [isBankDeleteConfirmOpen, setIsBankDeleteConfirmOpen] = useState(false);
  const [accountToDeleteId, setAccountToDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [detailErrors, setDetailErrors] = useState<DetailsFormErrors>({});
  const [bankErrors, setBankErrors] = useState<BankFormErrors>({});
  const [logoError, setLogoError] = useState<string|null>(null);
  const [signatureError, setSignatureError] = useState<string|null>(null);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(activeCompany.details.signature || null);

  useEffect(() => {
    setDetails(activeCompany.details);
    setLogoPreview(activeCompany.details.logo);
    setSignaturePreview(activeCompany.details.signature || null);
    setDetailErrors({});
  }, [activeCompany]);

  // Live preview of brand color
  useEffect(() => {
    if (details.brandColor) {
        const color = details.brandColor;
        document.documentElement.style.setProperty('--color-accent', color);
        
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);
        
        r = Math.max(0, Math.floor(r * 0.85));
        g = Math.max(0, Math.floor(g * 0.85));
        b = Math.max(0, Math.floor(b * 0.85));
        
        const hoverColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        document.documentElement.style.setProperty('--color-accent-hover', hoverColor);
    }
    
    // Cleanup function to revert to saved color if unmounted without saving
    return () => {
        if (activeCompany.details.brandColor) {
            const savedColor = activeCompany.details.brandColor;
            document.documentElement.style.setProperty('--color-accent', savedColor);
            
            let r = parseInt(savedColor.substring(1, 3), 16);
            let g = parseInt(savedColor.substring(3, 5), 16);
            let b = parseInt(savedColor.substring(5, 7), 16);
            
            r = Math.max(0, Math.floor(r * 0.85));
            g = Math.max(0, Math.floor(g * 0.85));
            b = Math.max(0, Math.floor(b * 0.85));
            
            const savedHoverColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            document.documentElement.style.setProperty('--color-accent-hover', savedHoverColor);
        } else {
            document.documentElement.style.removeProperty('--color-accent');
            document.documentElement.style.removeProperty('--color-accent-hover');
        }
    };
  }, [details.brandColor, activeCompany.details.brandColor]);

    useEffect(() => {
    const pincode = details.zip;
    if (pincode && pincode.length === 6) {
      const timer = setTimeout(async () => {
        setIsPincodeLoading(true);
        const location = await fetchLocationByPincode(pincode);
        if (location) {
          setDetails(prev => ({ ...prev, city: location.city, state: location.state }));
          setDetailErrors(prev => ({...prev, zip: undefined}));
        } else if (location === null) {
           setDetailErrors(prev => ({...prev, zip: 'Invalid Pincode'}));
        } else {
           // Don't block saving if lookup fails, just clear the error
           setDetailErrors(prev => ({...prev, zip: undefined}));
        }
        setIsPincodeLoading(false);
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [details.zip]);

  const validateDetailsField = useCallback((name: string, value: string): string | null => {
    switch (name) {
      case 'name': return validateRequired(value);
      case 'gstin': return validateGstin(value);
      case 'pan': return validatePan(value);
      case 'email': return validateEmail(value);
      case 'zip': return value && (value.length !== 6 || !/^\d+$/.test(value)) ? 'Pincode must be 6 digits' : null;
      default: return null;
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value, type } = e.target;
    if (['gstin', 'pan', 'ifsc'].includes(name)) {
        value = value.toUpperCase();
    }
    setDetails(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value }));
    const error = validateDetailsField(name, value);
    setDetailErrors(prev => ({...prev, [name]: error || undefined }));
  }, [validateDetailsField]);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            setLogoError('Please select an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setLogoError('Image size should be less than 2MB.');
            return;
        }
        
        setIsUploadingLogo(true);
        try {
            // Show local preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Supabase
            const { uploadFileToSupabase } = await import('../utils/supabaseStorage');
            const path = `logos/${activeCompany.id}/${Date.now()}_${file.name}`;
            const publicUrl = await uploadFileToSupabase(file, 'company-assets', path);
            
            if (publicUrl) {
                setDetails(prev => ({ ...prev, logo: publicUrl }));
            } else {
                setLogoError('Failed to upload logo to storage.');
                setLogoPreview(activeCompany.details.logo); // Revert preview
            }
        } catch (err) {
            console.error('Error uploading logo:', err);
            setLogoError('An unexpected error occurred.');
            setLogoPreview(activeCompany.details.logo); // Revert preview
        } finally {
            setIsUploadingLogo(false);
        }
    }
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureError(null);
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            setSignatureError('Please select an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setSignatureError('Image size should be less than 2MB.');
            return;
        }
        
        setIsUploadingSignature(true);
        try {
            // Show local preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Supabase
            const { uploadFileToSupabase } = await import('../utils/supabaseStorage');
            const path = `signatures/${activeCompany.id}/${Date.now()}_${file.name}`;
            const publicUrl = await uploadFileToSupabase(file, 'company-assets', path);
            
            if (publicUrl) {
                setDetails(prev => ({ ...prev, signature: publicUrl }));
            } else {
                setSignatureError('Failed to upload signature to storage.');
                setSignaturePreview(activeCompany.details.signature || null); // Revert preview
            }
        } catch (err) {
            console.error('Error uploading signature:', err);
            setSignatureError('An unexpected error occurred.');
            setSignaturePreview(activeCompany.details.signature || null); // Revert preview
        } finally {
            setIsUploadingSignature(false);
        }
    }
  };

  const handleSaveDetails = () => {
    // Validate all fields before saving
    const newErrors: DetailsFormErrors = {};
    newErrors.name = validateRequired(details.name) || undefined;
    newErrors.phone = validateRequired(details.phone) || undefined;
    newErrors.address = validateRequired(details.address) || undefined;
    newErrors.city = validateRequired(details.city) || undefined;
    newErrors.state = validateRequired(details.state) || undefined;
    newErrors.zip = validateRequired(details.zip) || validateDetailsField('zip', details.zip) || undefined;
    
    if (details.gstin) newErrors.gstin = validateDetailsField('gstin', details.gstin) || undefined;
    if (details.pan) newErrors.pan = validateDetailsField('pan', details.pan) || undefined;
    if (details.email) newErrors.email = validateDetailsField('email', details.email) || undefined;

    // Clean up undefined values
    Object.keys(newErrors).forEach(key => {
        if (newErrors[key as keyof DetailsFormErrors] === undefined) {
            delete newErrors[key as keyof DetailsFormErrors];
        }
    });
    
    // Check existing errors and new validations
    const hasErrors = Object.values(detailErrors).some(e => e) || Object.keys(newErrors).length > 0;
    
    if (hasErrors) {
        setDetailErrors(prev => ({ ...prev, ...newErrors }));
        setSaveError('Please fill all required fields correctly.');
        setTimeout(() => setSaveError(null), 3000);
        return;
    }

    setSaveError(null);
    updateCompany({ ...activeCompany, details });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleOpenBankModal = (account?: BankAccount) => {
    setBankErrors({});
    setEditingAccount(account || emptyBankAccount);
    setIsBankModalOpen(true);
  };
  
  const validateBankAccount = (account: Omit<BankAccount, 'id'> | BankAccount): boolean => {
      const errors: BankFormErrors = {};
      if (validateRequired(account.bankName)) errors.bankName = "Bank Name is required.";
      if (validateRequired(account.accountNumber)) errors.accountNumber = "Account Number is required.";
      const ifscError = validateRequired(account.ifsc) || validateIfsc(account.ifsc);
      if (ifscError) errors.ifsc = ifscError;
      setBankErrors(errors);
      return Object.keys(errors).length === 0;
  }
  
  const handleSaveBankAccount = () => {
    if (!validateBankAccount(editingAccount)) return;

    let updatedAccounts: BankAccount[];
    const isNew = !('id' in editingAccount);
    
    if (editingAccount.isDefault) {
      activeCompany.bankAccounts.forEach(acc => acc.isDefault = false);
    }

    if (isNew) {
      updatedAccounts = [...activeCompany.bankAccounts, { ...editingAccount, id: Date.now().toString() }];
    } else {
      updatedAccounts = activeCompany.bankAccounts.map(acc => acc.id === (editingAccount as BankAccount).id ? (editingAccount as BankAccount) : acc);
    }
    
    // Auto-set default if it's the first and only account
    if (updatedAccounts.length === 1) {
        updatedAccounts[0].isDefault = true;
    } else if (updatedAccounts.length > 0 && !updatedAccounts.some(acc => acc.isDefault)) {
        updatedAccounts[0].isDefault = true;
    }
    
    updateCompany({ ...activeCompany, bankAccounts: updatedAccounts });
    setIsBankModalOpen(false);
    setBankSuccessMessage(`Bank account successfully ${isNew ? 'added' : 'updated'}.`);
    setTimeout(() => setBankSuccessMessage(''), 3000);
  };

  const handleDeleteBankAccount = (accountId: string) => {
    setAccountToDeleteId(accountId);
    setIsBankDeleteConfirmOpen(true);
  };

  const confirmDeleteBankAccount = () => {
    if (accountToDeleteId) {
      const updatedAccounts = activeCompany.bankAccounts.filter(acc => acc.id !== accountToDeleteId);
      if (updatedAccounts.length > 0 && !updatedAccounts.some(acc => acc.isDefault)) {
        updatedAccounts[0].isDefault = true;
      }
      updateCompany({ ...activeCompany, bankAccounts: updatedAccounts });
      setBankSuccessMessage('Bank account successfully deleted.');
      setTimeout(() => setBankSuccessMessage(''), 3000);
    }
    setIsBankDeleteConfirmOpen(false);
    setAccountToDeleteId(null);
  };

  const handleSetDefault = (accountId: string) => {
      const updatedAccounts = activeCompany.bankAccounts.map(acc => ({ ...acc, isDefault: acc.id === accountId }));
      updateCompany({ ...activeCompany, bankAccounts: updatedAccounts });
  };

  const inputClasses = "w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm px-4 py-3 transition-all duration-200 ease-in-out border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-accent/20 focus:border-accent";

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-light-text tracking-tight">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your company profile and preferences.</p>
          </div>
          {showSuccess && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold animate-fade-in">Settings Saved!</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Company Info */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Identity Card */}
            <div className="glass-panel p-8 rounded-2xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-light-text mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">Identity & Branding</h2>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="flex-shrink-0">
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Logo</label>
                        <div className="relative group w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:border-accent transition-colors">
                            {isUploadingLogo ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                            ) : logoPreview ? (
                                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-xs text-slate-400 text-center px-2">Upload<br/>Logo</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">Change</span>
                            </div>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoChange} accept="image/*" disabled={isUploadingLogo} />
                        </div>
                        {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
                    </div>
                    <div className="flex-shrink-0">
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Signature</label>
                        <div className="relative group w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:border-accent transition-colors">
                            {isUploadingSignature ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                            ) : signaturePreview ? (
                                <img src={signaturePreview} alt="Signature" className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-xs text-slate-400 text-center px-2">Upload<br/>Signature</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">Change</span>
                            </div>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleSignatureChange} accept="image/*" disabled={isUploadingSignature} />
                        </div>
                        {signatureError && <p className="text-xs text-red-500 mt-1">{signatureError}</p>}
                    </div>
                    <div className="flex-grow space-y-6">
                        <Input label="Company Name" name="name" value={details.name} onChange={handleChange} required error={detailErrors.name} placeholder="e.g. Acme Corp" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Phone" name="phone" type="tel" value={details.phone} onChange={handleChange} required error={detailErrors.phone} placeholder="e.g. +91 98765 43210"/>
                            <Input label="Email" name="email" type="email" value={details.email} onChange={handleChange} error={detailErrors.email} placeholder="e.g. contact@acme.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    name="brandColor"
                                    value={details.brandColor || '#4F46E5'} 
                                    onChange={handleChange}
                                    className="h-10 w-20 p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded cursor-pointer" 
                                />
                                <span className="text-sm text-slate-500 font-mono">{details.brandColor || '#4F46E5'}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">This color will be used for buttons, links, and invoice headers.</p>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Address</h3>
                <div className="space-y-6">
                    <div>
                        <textarea name="address" rows={2} value={details.address} onChange={handleChange} className={`${inputClasses} ${detailErrors.address ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`} placeholder="Street Address, Area, Landmark" />
                        {detailErrors.address && <p className="text-xs text-red-500 mt-1">{detailErrors.address}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <Input label="ZIP Code" name="zip" value={details.zip} onChange={handleChange} error={detailErrors.zip} maxLength={6} required placeholder="e.g. 400001" />
                            {isPincodeLoading && <div className="absolute top-9 right-3 h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        <Input label="City" name="city" value={details.city} onChange={handleChange} required error={detailErrors.city} placeholder="e.g. Mumbai" />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">State <span className="text-red-500">*</span></label>
                            <select id="state" name="state" value={details.state} onChange={handleChange} className={`${inputClasses} ${detailErrors.state ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}>
                                <option value="">Select State</option>
                                {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                            {detailErrors.state && <p className="text-xs text-red-500 mt-1">{detailErrors.state}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Card */}
            <div className="glass-panel p-8 rounded-2xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-light-text mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">Legal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input label="GSTIN" name="gstin" value={details.gstin} onChange={handleChange} error={detailErrors.gstin} placeholder="e.g. 27AAAAA0000A1Z5" />
                    <Input label="PAN" name="pan" value={details.pan} onChange={handleChange} error={detailErrors.pan} placeholder="e.g. ABCDE1234F" />
                    <Input label="UDYAM" name="udyam" value={details.udyam} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                    {saveError && <span className="text-sm font-semibold text-red-500 animate-fade-in">{saveError}</span>}
                    <Button onClick={handleSaveDetails} className="px-8 !py-3 !text-base shadow-lg shadow-accent/20">Save Changes</Button>
                </div>
            </div>
        </div>

        {/* Right Column - Bank Accounts */}
        <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl sticky top-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-light-text">Bank Accounts</h2>
                    <button onClick={() => handleOpenBankModal()} className="text-accent hover:text-accent-hover dark:text-indigo-400 font-bold text-sm bg-accent/10 dark:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors">+ Add</button>
                </div>
                
                <div className="space-y-4">
                    {activeCompany.bankAccounts.map(account => (
                        <div key={account.id} className={`p-4 rounded-xl border transition-all ${account.isDefault ? 'border-accent bg-accent/5 dark:bg-accent/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{account.bankName}</h3>
                                {account.isDefault && <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-white px-2 py-0.5 rounded-full">Default</span>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">{account.accountNumber}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">IFSC: {account.ifsc}</p>
                            
                            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                {!account.isDefault && (
                                    <button onClick={() => handleSetDefault(account.id)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">Make Default</button>
                                )}
                                <button onClick={() => handleOpenBankModal(account)} className="text-xs font-semibold text-accent hover:text-accent-hover dark:text-indigo-400">Edit</button>
                                <button onClick={() => handleDeleteBankAccount(account.id)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>
                            </div>
                        </div>
                    ))}
                    
                    {activeCompany.bankAccounts.length === 0 && (
                        <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <Building className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No bank accounts added yet.</p>
                            <Button onClick={() => handleOpenBankModal()} variant="secondary" className="w-full text-xs">Add First Account</Button>
                        </div>
                    )}
                </div>
                
                {bankSuccessMessage && <div className="mt-4 text-center text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg animate-fade-in">{bankSuccessMessage}</div>}
            </div>
        </div>
      </div>

      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title={'id' in editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}>
          <BankAccountForm account={editingAccount} setAccount={setEditingAccount} errors={bankErrors} />
          <div className="p-6 pt-0 flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setIsBankModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveBankAccount}>Save Account</Button>
          </div>
      </Modal>

      <Modal isOpen={isBankDeleteConfirmOpen} onClose={() => setIsBankDeleteConfirmOpen(false)} title="Delete Bank Account">
          <div className="p-6">
            <p className="text-slate-600 dark:text-medium-text mb-6">Are you sure you want to delete this bank account? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setIsBankDeleteConfirmOpen(false)}>Cancel</Button>
              <Button onClick={confirmDeleteBankAccount} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Confirm Delete</Button>
            </div>
          </div>
      </Modal>

    </div>
  );
};

export default Settings;
