'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  ExternalLinkIcon,
  CloseIcon,
  CheckIcon,
  AlertIcon,
  FileTextIcon,
  CompassIcon
} from '@/components/Icons';

interface ReceiptRecord {
  id: string;
  userId?: string;
  fileName: string;
  fileUrl: string;
  title: string;
  type: 'Hotel' | 'Restaurant' | 'Ticket' | 'Transport' | 'Other';
  date?: string;
  destination?: string;
  amount?: string;
  currency?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export default function ReceiptVaultPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('Auto-detect');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      loadReceipts(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = session?.user ?? null;
      setUser(current);
      loadReceipts(current);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadReceipts = async (currentUser: SupabaseUser | null) => {
    let localSaved: ReceiptRecord[] = [];

    try {
      const stored = localStorage.getItem('tripwise_vault_receipts');
      if (stored) localSaved = JSON.parse(stored);
    } catch (e) {}

    if (currentUser) {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const remoteRecords: ReceiptRecord[] = data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            fileName: item.file_name,
            fileUrl: item.file_url,
            title: item.title,
            type: item.type as any,
            date: item.date,
            destination: item.destination,
            amount: item.amount,
            currency: item.currency,
            reference: item.reference,
            notes: item.notes,
            createdAt: item.created_at,
          }));

          const combined = [...remoteRecords];
          localSaved.forEach((loc) => {
            if (!combined.some((r) => r.id === loc.id)) combined.push(loc);
          });
          setReceipts(combined);
          return;
        }
      } catch (e) {}
    }

    setReceipts(localSaved);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a receipt image or document.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Convert file to Base64
      setUploadStep('Reading receipt document...');
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Step 2: Upload to Supabase Storage if user logged in
      let publicFileUrl = base64Data; // Default preview url
      const recordId = `rcpt-${Date.now()}`;

      if (user) {
        setUploadStep('Uploading file to Supabase Storage bucket...');
        try {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user.id}/${recordId}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from('receipts')
            .upload(filePath, file, { upsert: true });

          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
            if (urlData?.publicUrl) publicFileUrl = urlData.publicUrl;
          }
        } catch (sErr) {
          console.log('Supabase storage fallback to inline preview');
        }
      }

      // Step 3: Call Gemini AI Extraction via Express Backend
      setUploadStep('Extracting structured details with Gemini AI...');
      let extractedData = {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        type: selectedType !== 'Auto-detect' ? selectedType : 'Other',
        date: new Date().toISOString().split('T')[0],
        destination: 'Not detected',
        amount: 'Not detected',
        currency: 'INR',
        reference: 'Not detected',
        notes: 'Extracted automatically.'
      };

      try {
        const res = await fetch('/api/vault/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: file.type || 'image/png',
            fileName: file.name
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.extractedData) {
            extractedData = { ...extractedData, ...result.extractedData };
          }
        }
      } catch (aErr) {
        console.warn('AI extraction fallback:', aErr);
      }

      // Override type if user explicitly selected a category
      if (selectedType !== 'Auto-detect') {
        extractedData.type = selectedType;
      }

      // Step 4: Construct Record
      const newRecord: ReceiptRecord = {
        id: recordId,
        userId: user?.id,
        fileName: file.name,
        fileUrl: publicFileUrl,
        title: extractedData.title || file.name,
        type: (extractedData.type as any) || 'Other',
        date: extractedData.date || 'Not detected',
        destination: extractedData.destination || 'Not detected',
        amount: extractedData.amount || 'Not detected',
        currency: extractedData.currency || 'INR',
        reference: extractedData.reference || 'Not detected',
        notes: extractedData.notes || 'Stored safely.',
        createdAt: new Date().toISOString()
      };

      // Step 5: Save Record locally + Supabase DB
      const updated = [newRecord, ...receipts];
      setReceipts(updated);
      localStorage.setItem('tripwise_vault_receipts', JSON.stringify(updated));

      if (user) {
        try {
          await supabase.from('receipts').insert({
            id: newRecord.id,
            user_id: user.id,
            file_name: newRecord.fileName,
            file_url: newRecord.fileUrl,
            title: newRecord.title,
            type: newRecord.type,
            date: newRecord.date,
            destination: newRecord.destination,
            amount: newRecord.amount,
            currency: newRecord.currency,
            reference: newRecord.reference,
            notes: newRecord.notes
          });
        } catch (dErr) {}
      }

      setUploading(false);
      setIsUploadModalOpen(false);
      setFile(null);
      setSelectedType('Auto-detect');
    } catch (err: any) {
      setError(err?.message || 'Failed to upload receipt.');
      setUploading(false);
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;
    const updated = receipts.filter((r) => r.id !== id);
    setReceipts(updated);
    localStorage.setItem('tripwise_vault_receipts', JSON.stringify(updated));

    if (user) {
      try {
        await supabase.from('receipts').delete().eq('id', id);
      } catch (e) {}
    }
  };

  const categories = ['All', 'Hotel', 'Restaurant', 'Ticket', 'Transport', 'Other'];

  const filteredReceipts = selectedCategory === 'All'
    ? receipts
    : receipts.filter((r) => r.type === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131314] font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Top Header Card */}
        <div className="tw-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <span className="tw-badge tw-badge-amber">
              <SparklesIcon size={14} className="text-amber-600" /> AI Document Extraction Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#131314]">
              Travel Vault
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xl">
              Upload hotel bookings, restaurant bills, ticket passes, and flight/train receipts. Gemini AI automatically categorizes and extracts details into your vault.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="tw-btn-primary text-xs shrink-0 !py-3 !px-6"
          >
            <PlusIcon size={16} />
            <span>Upload Receipt</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#131314] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[#131314]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Receipts Display Grid */}
        {filteredReceipts.length === 0 ? (
          <div className="tw-card p-12 text-center max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] mx-auto mb-4">
              <FileTextIcon size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-extrabold font-display text-[#131314] mb-2">No {selectedCategory === 'All' ? '' : selectedCategory} receipts stored</h3>
            <p className="text-xs text-[var(--muted)] mb-6 font-medium">
              Upload hotel confirmations, restaurant bills, or tickets to store and categorize them in your vault.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="tw-btn-primary text-xs"
            >
              <PlusIcon size={16} /> Upload First Receipt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceipts.map((rcpt) => (
              <div key={rcpt.id} className="tw-card-lift p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`tw-badge ${
                      rcpt.type === 'Hotel' ? 'tw-badge-amber' :
                      rcpt.type === 'Restaurant' ? 'tw-badge-emerald' :
                      rcpt.type === 'Transport' ? 'tw-badge-sky' :
                      rcpt.type === 'Ticket' ? 'tw-badge-amber' : 'tw-badge'
                    }`}>
                      {rcpt.type === 'Hotel' ? '🏨 Hotel' :
                       rcpt.type === 'Restaurant' ? '🍴 Restaurant' :
                       rcpt.type === 'Transport' ? '✈️ Transport' :
                       rcpt.type === 'Ticket' ? '🎟️ Ticket' : '📄 Other'}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] font-medium">
                      {new Date(rcpt.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold font-display text-[#131314] line-clamp-1">
                    {rcpt.title}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
                    {rcpt.amount && rcpt.amount !== 'Not detected' && (
                      <div className="flex justify-between items-center font-extrabold text-[#131314]">
                        <span className="text-[var(--muted)] font-medium">Amount:</span>
                        <span className="text-amber-600 font-display text-sm">{rcpt.amount}</span>
                      </div>
                    )}

                    {rcpt.date && rcpt.date !== 'Not detected' && (
                      <div className="flex justify-between items-center text-[var(--muted)]">
                        <span>Date:</span>
                        <span className="font-semibold text-[#131314]">{rcpt.date}</span>
                      </div>
                    )}

                    {rcpt.destination && rcpt.destination !== 'Not detected' && (
                      <div className="flex justify-between items-center text-[var(--muted)]">
                        <span>Location:</span>
                        <span className="font-semibold text-[#131314]">{rcpt.destination}</span>
                      </div>
                    )}

                    {rcpt.reference && rcpt.reference !== 'Not detected' && (
                      <div className="flex justify-between items-center text-[var(--muted)]">
                        <span>Ref #:</span>
                        <span className="font-mono text-[11px] font-bold text-[#131314]">{rcpt.reference}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <a
                    href={rcpt.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Receipt</span>
                    <ExternalLinkIcon size={12} />
                  </a>

                  <button
                    onClick={() => handleDeleteReceipt(rcpt.id)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Receipt"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="tw-card p-6 sm:p-8 max-w-lg w-full space-y-5 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 font-extrabold font-display text-[#131314] text-base">
                <SparklesIcon size={18} className="text-amber-600" /> Upload Receipt to Vault
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[var(--muted)] hover:text-[#131314] text-xs p-1.5 rounded-lg hover:bg-[var(--surface)]"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertIcon size={16} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {uploading ? (
              <div className="py-8 text-center space-y-4">
                <CompassIcon size={32} className="animate-spin text-amber-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#131314] font-display">Processing Document...</h4>
                  <p className="text-xs text-[var(--muted)]">{uploadStep}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block tw-eyebrow mb-2">Select Category Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 bg-white border border-[var(--border)] rounded-xl text-xs font-semibold text-[#131314] focus:outline-none focus:border-[#131314]"
                  >
                    <option value="Auto-detect">✨ Auto-detect Category with Gemini AI</option>
                    <option value="Hotel">🏨 Hotel / Accommodation</option>
                    <option value="Restaurant">🍴 Restaurant / Food / Cafe</option>
                    <option value="Transport">✈️ Transport (Flight / Train / Bus / Cab)</option>
                    <option value="Ticket">🎟️ Attraction / Museum Entry Ticket</option>
                    <option value="Other">📄 Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block tw-eyebrow mb-2">Select Receipt File (JPG, PNG, PDF)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    required
                    onChange={handleFileChange}
                    className="w-full text-xs text-[var(--muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#131314] file:text-white hover:file:bg-black cursor-pointer"
                  />
                </div>

                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Gemini AI will scan your document to extract venue names, totals, reference codes, and dates automatically.
                </p>

                <button
                  type="submit"
                  className="tw-btn-primary w-full !py-3 text-xs"
                >
                  <SparklesIcon size={16} className="text-amber-400" />
                  <span>Extract & Save to Vault</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
