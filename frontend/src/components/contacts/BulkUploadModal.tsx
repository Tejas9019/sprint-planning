import React, { useEffect, useRef, useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useContactsStore, type InviteInput } from '../../store/contactsStore';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow extends InviteInput {
  valid: boolean;
  reason?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal RFC-ish CSV line parser (handles quoted fields with embedded commas).
const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

const pick = (row: Record<string, string>, keys: string[]) => {
  for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k];
  return '';
};

const normalizeRows = (raw: Record<string, string>[]): ParsedRow[] =>
  raw
    .map((r) => {
      const lower: Record<string, string> = {};
      Object.keys(r).forEach((k) => { lower[k.trim().toLowerCase()] = String(r[k] ?? '').trim(); });
      const name = pick(lower, ['name', 'full name', 'fullname']);
      const email = pick(lower, ['email', 'email id', 'e-mail', 'mail']);
      const role = pick(lower, ['role']) || 'Member';
      const department = pick(lower, ['department', 'dept']) || '—';
      const valid = !!email && EMAIL_RE.test(email);
      return { name, email, role, department, valid, reason: !email ? 'missing email' : !valid ? 'invalid email' : undefined };
    })
    .filter((r) => r.name || r.email);

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { bulkInvite } = useContactsStore();
  const { activeTenantId } = useAuthStore();
  const { showToast } = useBoardStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFileName('');
      setRows([]);
      setError('');
      setParsing(false);
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [isOpen]);

  const handleFile = async (file: File) => {
    setError('');
    setRows([]);
    setFileName(file.name);
    setParsing(true);
    try {
      const isCsv = /\.csv$/i.test(file.name);
      let rawObjects: Record<string, string>[] = [];

      if (isCsv) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('File needs a header row and at least one data row.');
        const headers = parseCsvLine(lines[0]);
        rawObjects = lines.slice(1).map((line) => {
          const cells = parseCsvLine(line);
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
          return obj;
        });
      } else {
        // Excel — lazy-load SheetJS only when an .xlsx/.xls file is chosen.
        const XLSX = await import('xlsx');
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        rawObjects = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
      }

      const normalized = normalizeRows(rawObjects);
      if (normalized.length === 0) throw new Error('No rows found. Make sure there are name and email columns.');
      setRows(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read this file.');
    } finally {
      setParsing(false);
    }
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidCount = rows.length - validRows.length;

  const handleImport = async () => {
    if (!activeTenantId) return;
    setImporting(true);
    try {
      const { added, skipped } = await bulkInvite(activeTenantId, validRows.map(({ name, email, role, department }) => ({ name, email, role, department })));
      showToast(`Imported ${added} invitation${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''}.`, added ? 'success' : 'info');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to import bulk invites', 'error');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,email,role,department\nJane Doe,jane@company.com,Member,Engineering\nSam Lee,sam@company.com,Manager,Product\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trackflows-invite-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="bulk-title" className="w-full max-w-lg">
      <div className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border-primary/50 flex items-center justify-between">
          <h3 id="bulk-title" className="font-semibold text-text-heading text-sm flex items-center gap-2">
            <FileSpreadsheet size={15} className="text-emerald-500" />
            Bulk invite from spreadsheet
          </h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-text-secondary hover:text-text-heading hover:bg-bg-tertiary p-1 rounded-lg transition-all cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-3">
            <p className="text-text-secondary leading-relaxed">
              Upload a <strong>.csv</strong> or <strong>.xlsx</strong> with columns: <code className="px-1 rounded bg-bg-tertiary">name</code>, <code className="px-1 rounded bg-bg-tertiary">email</code>, <code className="px-1 rounded bg-bg-tertiary">role</code>, <code className="px-1 rounded bg-bg-tertiary">department</code>.
            </p>
            <button onClick={downloadTemplate} className="flex items-center gap-1.5 flex-shrink-0 text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer">
              <Download size={13} /> Template
            </button>
          </div>

          {/* Dropzone / picker */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border-primary hover:border-purple-500/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
          >
            <UploadCloud size={26} className="text-text-secondary" />
            <span className="text-text-primary font-semibold">{fileName || 'Choose a file to upload'}</span>
            <span className="text-text-secondary/70">CSV, XLSX or XLS</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            aria-label="Spreadsheet file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {parsing && <p className="text-text-secondary">Reading file…</p>}

          {error && (
            <p role="alert" className="flex items-center gap-1.5 text-rose-500">
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 size={13} /> {validRows.length} ready
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertTriangle size={13} /> {invalidCount} skipped (bad email)
                  </span>
                )}
              </div>
              <div className="max-h-44 overflow-y-auto border border-border-primary/60 rounded-xl">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-bg-secondary">
                    <tr className="text-text-secondary border-b border-border-primary/60">
                      <th className="p-2 font-semibold">Name</th>
                      <th className="p-2 font-semibold">Email</th>
                      <th className="p-2 font-semibold">Role</th>
                      <th className="p-2 font-semibold">Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/30">
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className={r.valid ? '' : 'opacity-50'}>
                        <td className="p-2 text-text-primary">{r.name || '—'}</td>
                        <td className="p-2 text-text-secondary">{r.email || '—'}</td>
                        <td className="p-2 text-text-secondary">{r.role}</td>
                        <td className="p-2 text-text-secondary">{r.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-primary/50">
            <button onClick={onClose} className="bg-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-heading rounded-lg px-4 py-2 font-semibold transition-all cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={validRows.length === 0 || importing}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer"
            >
              {importing ? 'Importing...' : `Import ${validRows.length || ''} ${validRows.length === 1 ? 'invite' : 'invites'}`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
