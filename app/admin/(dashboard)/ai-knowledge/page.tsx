'use client';

import { useEffect, useState, useRef } from 'react';
import { RichTextEditor } from '@/components/ai/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Upload, PenLine, Trash2, FileUp, X, CheckCircle2, Loader2, BrainCircuit, ChevronRight } from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: string;
}

type Mode = 'upload' | 'editor';

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf':                                                          'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       'XLSX',
  'application/vnd.ms-excel':                                                 'XLS',
  'text/plain':                                                               'TXT',
};

const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',') + ',.pdf,.docx,.xlsx,.xls,.txt';

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function AIKnowledgePage() {
  const [entries, setEntries]     = useState<KnowledgeEntry[]>([]);
  const [selected, setSelected]   = useState<KnowledgeEntry | null>(null);
  const [mode, setMode]           = useState<Mode>('editor');

  // Editor state
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [category, setCategory]   = useState('');
  const [tags, setTags]           = useState('');
  const [saving, setSaving]       = useState(false);
  const autoSaveRef               = useRef<NodeJS.Timeout | null>(null);
  const selectedRef               = useRef(selected);
  const titleRef                  = useRef(title);
  const contentRef                = useRef(content);

  // Upload state
  const [files, setFiles]         = useState<UploadedFile[]>([]);
  const [dragging, setDragging]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);

  const fetchEntries = async () => {
    try {
      const res  = await fetch('/api/ai/knowledge');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchEntries(); }, []);

  const resetForm = () => {
    setSelected(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTags('');
  };

  const selectEntry = (entry: KnowledgeEntry) => {
    setSelected(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category ?? '');
    setTags(entry.tags?.join(', ') ?? '');
    setMode('editor');
  };

  const triggerAutoSave = () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (selectedRef.current && titleRef.current && contentRef.current) {
        handleSave(true);
      }
    }, 2000);
  };

  const handleSave = async (silent = false) => {
    const currentTitle   = titleRef.current;
    const currentContent = contentRef.current;
    if (!currentTitle || !currentContent) {
      if (!silent) toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    const payload = {
      title:    currentTitle,
      content:  currentContent,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      const currentSelected = selectedRef.current;
      const url    = currentSelected ? `/api/ai/knowledge/${currentSelected.id}` : '/api/ai/knowledge';
      const method = currentSelected ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const saved  = await res.json();
      if (!silent) toast.success(currentSelected ? 'Entry updated' : 'Entry created');
      if (!currentSelected) setSelected(saved);
      fetchEntries();
    } catch {
      if (!silent) toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This will also remove its embeddings.')) return;
    await fetch(`/api/ai/knowledge/${id}`, { method: 'DELETE' });
    toast.success('Entry deleted');
    if (selected?.id === id) resetForm();
    fetchEntries();
  };

  // ── File upload ────────────────────────────────────────────────────────────

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f => {
      const ok = f.type in ACCEPTED_TYPES ||
        f.name.match(/\.(pdf|docx|xlsx|xls|txt)$/i);
      if (!ok) toast.error(`${f.name} — unsupported format`);
      return ok;
    });
    setFiles(prev => [...prev, ...valid.map(f => ({ file: f, status: 'pending' as const }))]);
  };

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const uploadFile = async (idx: number) => {
    const item = files[idx];
    if (!item || item.status === 'uploading' || item.status === 'done') return;

    setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'uploading' } : f));

    try {
      // TXT: read client-side and save as a knowledge entry
      if (item.file.type === 'text/plain' || item.file.name.endsWith('.txt')) {
        const text = await item.file.text();
        const entryTitle = item.file.name.replace(/\.[^.]+$/, '');
        const res  = await fetch('/api/ai/knowledge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: entryTitle, content: `<p>${text.replace(/\n/g, '</p><p>')}</p>` }),
        });
        if (!res.ok) throw new Error('Failed to save');
        setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'done' } : f));
        toast.success(`${item.file.name} uploaded and indexed`);
        fetchEntries();
        return;
      }

      // PDF / DOCX / XLSX — send as multipart (backend endpoint needed)
      const form = new FormData();
      form.append('file', item.file);
      const res = await fetch('/api/ai/knowledge/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'done' } : f));
      toast.success(`${item.file.name} uploaded and indexed`);
      fetchEntries();
    } catch (e: any) {
      setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error', error: e.message } : f));
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const uploadAll = () => files.forEach((_, i) => uploadFile(i));

  const FILE_ICON_COLOR: Record<string, string> = {
    PDF: 'text-red-500', DOCX: 'text-blue-500', XLSX: 'text-green-600',
    XLS: 'text-green-600', TXT: 'text-slate-500',
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* ── Left sidebar — entry list ───────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Knowledge Base</h2>
          </div>
          <p className="text-xs text-muted-foreground">AI learns from these entries</p>
        </div>

        <div className="p-3">
          <Button size="sm" className="w-full" onClick={() => { resetForm(); setMode('editor'); }}>
            + New Entry
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
          {entries.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No entries yet</p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => selectEntry(entry)}
              className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                selected?.id === entry.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-medium line-clamp-2 flex-1">{entry.title}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-destructive hover:text-destructive/80 transition-opacity shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {entry.category && (
                <Badge variant="outline" className="text-[10px] mt-1 h-4">{entry.category}</Badge>
              )}
              {selected?.id === entry.id && (
                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mode tabs */}
        <div className="border-b px-6 flex items-center gap-1 pt-4 pb-0">
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              mode === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          <button
            onClick={() => setMode('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              mode === 'editor'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Rich Text Editor
          </button>
        </div>

        {/* ── UPLOAD MODE ─────────────────────────────────────────── */}
        {mode === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-base">Upload Knowledge Files</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload documents and the AI will extract and index their content automatically.
              </p>
            </div>

            {/* Drag & drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <FileUp className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Drag & drop files here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {['PDF', 'DOCX', 'XLSX', 'TXT'].map((fmt) => (
                    <span key={fmt} className="px-2 py-0.5 rounded bg-muted text-xs font-medium text-muted-foreground">
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                  <Button size="sm" onClick={uploadAll} disabled={files.every(f => f.status === 'done' || f.status === 'uploading')}>
                    Upload All
                  </Button>
                </div>
                <div className="space-y-2">
                  {files.map((item, idx) => {
                    const ext = (item.file.name.split('.').pop() ?? '').toUpperCase();
                    const color = FILE_ICON_COLOR[ext] ?? 'text-slate-400';
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <FileText className={`w-8 h-8 shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(item.file.size / 1024).toFixed(1)} KB · {ext}
                          </p>
                          {item.error && <p className="text-xs text-destructive mt-0.5">{item.error}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => uploadFile(idx)}>Upload</Button>
                          )}
                          {item.status === 'uploading' && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                          {item.status === 'done' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {item.status === 'error' && (
                            <Button size="sm" variant="outline" onClick={() => uploadFile(idx)}>Retry</Button>
                          )}
                          {item.status !== 'uploading' && (
                            <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Format notes */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Supported Formats</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><span className="font-medium text-red-500">PDF</span> — documents, manuals, guides</div>
                <div className="flex items-center gap-2"><span className="font-medium text-blue-500">DOCX</span> — Word documents</div>
                <div className="flex items-center gap-2"><span className="font-medium text-green-600">XLSX</span> — spreadsheets, price lists</div>
                <div className="flex items-center gap-2"><span className="font-medium text-slate-500">TXT</span> — plain text, FAQs</div>
              </div>
            </div>
          </div>
        )}

        {/* ── EDITOR MODE ─────────────────────────────────────────── */}
        {mode === 'editor' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
            <div>
              <h3 className="font-semibold text-base">
                {selected ? 'Edit Entry' : 'Create New Entry'}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Write structured content that the AI will use to answer questions.
              </p>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Entry title..."
                value={title}
                onChange={(e) => { setTitle(e.target.value); triggerAutoSave(); }}
                className="flex-1"
              />
              <Input
                placeholder="Category"
                value={category}
                onChange={(e) => { setCategory(e.target.value); triggerAutoSave(); }}
                className="w-36"
              />
              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => { setTags(e.target.value); triggerAutoSave(); }}
                className="w-48"
              />
            </div>

            <RichTextEditor
              content={content}
              onChange={(val) => { setContent(val); triggerAutoSave(); }}
            />

            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {saving ? 'Saving...' : selected ? '✓ Auto-save enabled' : ''}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving</> : selected ? 'Update Entry' : 'Create Entry'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
