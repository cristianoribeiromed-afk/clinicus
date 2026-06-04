'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { DISCIPLINAS } from '@/lib/config';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Brain,
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  Crown,
  BookOpen,
  BarChart3,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  PlusCircle,
} from 'lucide-react';

type Toast = { type: 'success' | 'error'; message: string } | null;
type ContentType = 'resumo' | 'simulado' | 'caso_clínico';
type CycleType = 'básico' | 'clínico' | 'pré-clínico';
type Difficulty = 'facil' | 'medio' | 'dificil';

interface Questao {
  id: string;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
  explicacao: string;
  dificuldade: Difficulty;
}

interface Content {
  id: string;
  tipo: ContentType;
  titulo: string;
  disciplina: string;
  ciclo: CycleType;
  descricao: string;
  premium: boolean;
  tags: string[];
  created_at: string;
  conteudo_html?: string;
  file_url?: string;
  Questões?: Questao[];
  tempo_por_questao?: number;
  vinheta?: string;
}

interface FormState {
  tipo: ContentType;
  titulo: string;
  disciplina: string;
  ciclo: CycleType;
  descricao: string;
  premium: boolean;
  tags: string[];
  conteudo_html: string;
  file_url: string;
  tempo_por_questao: number;
  Questões: Questao[];
  vinheta: string;
}

const EMPTY_FORM: FormState = {
  tipo: 'resumo',
  titulo: '',
  disciplina: '',
  ciclo: 'básico',
  descricao: '',
  premium: true,
  tags: [],
  conteudo_html: '',
  file_url: '',
  tempo_por_questao: 90,
  Questões: [],
  vinheta: '',
};

function ToastMessage({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.message}
      <button onClick={onClose}><X className="w-3 h-3 ml-2 opacity-70 hover:opacity-100" /></button>
    </div>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Digite uma tag e pressione Enter" className="flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={add}><Tag className="w-4 h-4 mr-1" />Adicionar</Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
              {tag}
              <button onClick={() => onChange(tags.filter((t) => t !== tag))}><X className="w-3 h-3 ml-1 hover:text-red-500" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestaoEditor({ questao, index, onChange, onRemove }: { questao: Questao; index: number; onChange: (q: Questao) => void; onRemove: () => void }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">Questão {index + 1}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Enunciado *</Label>
        <Textarea value={questao.enunciado} onChange={(e) => onChange({ ...questao, enunciado: e.target.value })} placeholder="Digite o enunciado..." rows={3} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Alternativas (clique na letra para marcar o gabarito)</Label>
        {questao.alternativas.map((alt, i) => (
          <div key={i} className="flex items-center gap-2 mt-1">
            <button type="button" onClick={() => onChange({ ...questao, gabarito: i })}
              className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${questao.gabarito === i ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/40 text-muted-foreground'}`}>
              {String.fromCharCode(65 + i)}
            </button>
            <Input value={alt} onChange={(e) => { const a = [...questao.alternativas]; a[i] = e.target.value; onChange({ ...questao, alternativas: a }); }} placeholder={`Alternativa ${String.fromCharCode(65 + i)}`} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Dificuldade</Label>
          <Select value={questao.dificuldade} onValueChange={(v) => onChange({ ...questao, dificuldade: v as Difficulty })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">Fácil</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="dificil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end pb-2">
          <p className="text-sm text-muted-foreground">Gabarito: <strong className="text-foreground">{String.fromCharCode(65 + questao.gabarito)}</strong></p>
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Explicação do gabarito *</Label>
        <Textarea value={questao.explicacao} onChange={(e) => onChange({ ...questao, explicacao: e.target.value })} placeholder="Explique por que esta é a resposta correta..." rows={2} className="mt-1" />
      </div>
    </div>
  );
}

function ContentForm({ initial, onSuccess, onCancel }: { initial?: Content; onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<FormState>(
    initial ? {
      tipo: initial.tipo,
      titulo: initial.titulo,
      disciplina: initial.disciplina,
      ciclo: initial.ciclo,
      descricao: initial.descricao,
      premium: initial.premium,
      tags: initial.tags ?? [],
      conteudo_html: initial.conteudo_html ?? '',
      file_url: initial.file_url ?? '',
      tempo_por_questao: initial.tempo_por_questao ?? 90,
      Questões: (initial.Questões ?? []) as Questao[],
      vinheta: initial.vinheta ?? '',
    } : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const set = (key: keyof FormState, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.titulo || !form.disciplina || !form.descricao) {
      setToast({ type: 'error', message: 'Preencha título, disciplina e descrição.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tipo: form.tipo,
        titulo: form.titulo,
        disciplina: form.disciplina,
        ciclo: form.ciclo,
        descricao: form.descricao,
        premium: form.premium,
        tags: form.tags,
        conteudo_html: form.tipo === 'resumo' ? form.conteudo_html : null,
        file_url: form.tipo === 'resumo' ? form.file_url || null : null,
        tempo_por_questao: form.tipo === 'simulado' ? form.tempo_por_questao : null,
        questoes: ['simulado', 'caso_clínico'].includes(form.tipo) ? form.Questões : [],
        vinheta: form.tipo === 'caso_clínico' ? form.vinheta : null,
      };
      const { error } = initial
        ? await supabase.from('conteudos').update(payload).eq('id', initial.id)
        : await supabase.from('conteudos').insert(payload);
      if (error) throw error;
      setToast({ type: 'success', message: initial ? 'Atualizado!' : 'Criado com sucesso!' });
      setTimeout(onSuccess, 800);
    } catch (err: unknown) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  const disciplinasFiltradas = DISCIPLINAS.filter((d) => d.ciclo === form.ciclo);

  return (
    <div className="space-y-5">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />

      <div>
        <Label className="text-sm font-semibold">Tipo *</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {([
            { value: 'resumo', label: 'Resumo', icon: FileText },
            { value: 'simulado', label: 'Simulado', icon: Brain },
            { value: 'caso_clínico', label: 'Caso Clínico', icon: Stethoscope },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" onClick={() => set('tipo', value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${form.tipo === value ? 'border-primary bg-primary/10 text-primary' : 'border-muted hover:border-muted-foreground/40'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Título *</Label>
        <Input value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: Staphylococcus aureus" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ciclo *</Label>
          <Select value={form.ciclo} onValueChange={(v) => { set('ciclo', v); set('disciplina', ''); }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="básico">Ciclo Básico</SelectItem>
              <SelectItem value="clínico">Ciclo Clínico</SelectItem>
              <SelectItem value="pré-clínico">Pré-Clínico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Disciplina *</Label>
          <Select value={form.disciplina} onValueChange={(v) => set('disciplina', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {disciplinasFiltradas.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Breve descrição do conteúdo..." rows={2} className="mt-1" />
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
        <Crown className="w-4 h-4 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Conteúdo Premium</p>
          <p className="text-xs text-muted-foreground">Apenas assinantes terão acesso</p>
        </div>
        <Switch checked={form.premium} onCheckedChange={(v) => set('premium', v)} />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="mt-1"><TagInput tags={form.tags} onChange={(t) => set('tags', t)} /></div>
      </div>

      {form.tipo === 'resumo' && (
        <div className="space-y-3">
          <div>
            <Label>Conteúdo *</Label>
            <Textarea value={form.conteudo_html} onChange={(e) => set('conteudo_html', e.target.value)} placeholder="Cole aqui o conteúdo HTML ou texto do resumo..." rows={12} className="mt-1 font-mono text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Aceita HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt; etc.</p>
          </div>
          <div>
            <Label>URL do PDF (opcional)</Label>
            <Input value={form.file_url} onChange={(e) => set('file_url', e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
        </div>
      )}

      {form.tipo === 'simulado' && (
        <div className="space-y-4">
          <div>
            <Label>Tempo por questão (segundos)</Label>
            <Input type="number" value={form.tempo_por_questao} onChange={(e) => set('tempo_por_questao', Number(e.target.value))} min={30} max={300} className="mt-1 w-40" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Questões ({form.Questões.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => set('Questões', [...form.Questões, { id: crypto.randomUUID(), enunciado: '', alternativas: ['', '', '', '', ''], gabarito: 0, explicacao: '', dificuldade: 'medio' }])}>
              <PlusCircle className="w-4 h-4 mr-1" />Nova Questão
            </Button>
          </div>
          {form.Questões.length === 0 && (
            <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground text-sm">Nenhuma questão ainda.</div>
          )}
          {form.Questões.map((q, i) => (
            <QuestaoEditor key={q.id || i} questao={q} index={i}
              onChange={(nq) => { const qs = [...form.Questões]; qs[i] = nq; set('Questões', qs); }}
              onRemove={() => set('Questões', form.Questões.filter((_, idx) => idx !== i))} />
          ))}
        </div>
      )}

      {form.tipo === 'caso_clínico' && (
        <div className="space-y-4">
          <div>
            <Label>Vinheta Clínica *</Label>
            <Textarea value={form.vinheta} onChange={(e) => set('vinheta', e.target.value)} placeholder="Paciente, 45 anos, masculino, chega ao pronto-socorro com..." rows={6} className="mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Questões ({form.Questões.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => set('Questões', [...form.Questões, { id: crypto.randomUUID(), enunciado: '', alternativas: ['', '', '', '', ''], gabarito: 0, explicacao: '', dificuldade: 'medio' }])}>
              <PlusCircle className="w-4 h-4 mr-1" />Nova Questão
            </Button>
          </div>
          {form.Questões.map((q, i) => (
            <QuestaoEditor key={q.id || i} questao={q} index={i}
              onChange={(nq) => { const qs = [...form.Questões]; qs[i] = nq; set('Questões', qs); }}
              onRemove={() => set('Questões', form.Questões.filter((_, idx) => idx !== i))} />
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : initial ? 'Salvar alterações' : 'Criar conteúdo'}
        </Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { profile, isLoading } = useAuth(true);
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [filterTipo, setFilterTipo] = useState('todos');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Content | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const role = (profile as any)?.role;
      if (role === 'admin') {
        setIsAdmin(true);
      } else if (profile !== null) {
        setIsAdmin(false);
        router.push('/dashboard');
      }
    }
  }, [isLoading, profile, router]);

  const fetchContents = useCallback(async () => {
    setLoadingContent(true);
    try {
      const res = await fetch('/api/admin/conteudos');
      const data = await res.json();
      if (Array.isArray(data)) setContents(data as Content[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchContents();
  }, [isAdmin, fetchContents]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('conteudos').delete().eq('id', id);
    if (error) {
      setToast({ type: 'error', message: 'Erro ao excluir.' });
    } else {
      setToast({ type: 'success', message: 'Excluído com sucesso.' });
      setContents((prev) => prev.filter((c) => c.id !== id));
    }
    setDeletingId(null);
  };

  const filtered = contents.filter((c) => {
    if (filterTipo !== 'todos' && c.tipo !== filterTipo) return false;
    if (search && !c.titulo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: contents.length,
    resumos: contents.filter((c) => c.tipo === 'resumo').length,
    simulados: contents.filter((c) => c.tipo === 'simulado').length,
    casos: contents.filter((c) => c.tipo === 'caso_clínico').length,
    premium: contents.filter((c) => c.premium).length,
  };

  const tipoBadge: Record<string, string> = {
    resumo: 'bg-blue-100 text-blue-700',
    simulado: 'bg-purple-100 text-purple-700',
    'caso_clínico': 'bg-emerald-100 text-emerald-700',
  };

  const tipoLabel: Record<string, string> = {
    resumo: 'Resumo',
    simulado: 'Simulado',
    'caso_clínico': 'Caso Clínico',
  };

  if (isLoading || isAdmin === null) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Painel Admin</h1>
            <p className="text-muted-foreground text-sm">Gerencie todo o conteúdo do Clinicus</p>
          </div>
          <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />Novo Conteúdo
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: BookOpen },
            { label: 'Resumos', value: stats.resumos, icon: FileText },
            { label: 'Simulados', value: stats.simulados, icon: Brain },
            { label: 'Casos', value: stats.casos, icon: Stethoscope },
            { label: 'Premium', value: stats.premium, icon: Crown },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <span className="text-2xl font-bold">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="resumo">Resumos</SelectItem>
              <SelectItem value="simulado">Simulados</SelectItem>
              <SelectItem value="caso_clínico">Casos Clínicos</SelectItem>
            </SelectContent>
          </Select>
          {(filterTipo !== 'todos' || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterTipo('todos'); setSearch(''); }}>
              <X className="w-4 h-4 mr-1" />Limpar
            </Button>
          )}
        </div>

        <div className="rounded-lg border overflow-hidden">
          {loadingContent ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum conteúdo encontrado.</p>
              <Button variant="link" onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="mt-2">Criar o primeiro conteúdo</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium max-w-xs truncate">{c.titulo}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${tipoBadge[c.tipo] ?? ''}`}>{tipoLabel[c.tipo] ?? c.tipo}</span>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{c.disciplina.replace(/-/g, ' ')}</TableCell>
                    <TableCell>
                      {c.premium
                        ? <span className="flex items-center gap-1 text-xs text-amber-600"><Crown className="w-3 h-3" />Premium</span>
                        : <span className="text-xs text-muted-foreground">Gratuito</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-right">{filtered.length} de {contents.length} conteúdos</p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Conteúdo' : 'Novo Conteúdo'}</DialogTitle>
          </DialogHeader>
          <ContentForm
            initial={editing}
            onSuccess={() => { setDialogOpen(false); fetchContents(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
