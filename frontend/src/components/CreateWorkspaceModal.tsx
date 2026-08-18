import React, { useEffect, useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useBoardStore } from '../store/boardStore';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Errors {
  name?: string;
  workspaceKey?: string;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace } = useWorkspaceStore();
  const { showToast } = useBoardStore();

  const [name, setName] = useState('');
  const [workspaceKey, setWorkspaceKey] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setWorkspaceKey('');
      setDescription('');
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) {
      next.name = 'Workspace name is required';
    }
    if (!workspaceKey.trim()) {
      next.workspaceKey = 'Key is required';
    } else if (workspaceKey.trim().length < 2 || workspaceKey.trim().length > 10) {
      next.workspaceKey = 'Key must be between 2 and 10 characters';
    } else if (!/^[A-Za-z]+$/.test(workspaceKey.trim())) {
      next.workspaceKey = 'Key must contain letters only';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createWorkspace(name.trim(), workspaceKey.trim().toUpperCase(), description.trim());
      showToast('Workspace created successfully!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create workspace', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="cw-title">
      <div className="w-[480px] max-w-full bg-bg-secondary text-text-primary rounded-xl overflow-hidden shadow-xl border border-border-primary select-none">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-primary/55 flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <FolderPlus size={18} />
            <h3 id="cw-title" className="text-sm font-bold text-text-heading">Create new workspace</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-bg-tertiary rounded-lg text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Workspace Name */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Workspace Name <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Boostt.ai"
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Key */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Workspace Key <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              value={workspaceKey}
              onChange={(e) => setWorkspaceKey(e.target.value.toUpperCase())}
              placeholder="e.g. BOOSTT"
              maxLength={10}
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            <span className="text-[9px] text-text-secondary mt-1 block">Short prefix used for ticket keys (e.g. BOOSTT-1, BOOSTT-2)</span>
            {errors.workspaceKey && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.workspaceKey}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the workspace..."
              rows={3}
              className="w-full px-3 py-2 bg-bg-primary border border-border-primary rounded-lg text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border-primary/55 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>

        </form>

      </div>
    </Modal>
  );
};
