import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderGit2, RefreshCw, FileText, CheckCircle2, Database, Shield } from 'lucide-react';
import api from '../../lib/api';
import { Card, Button } from '../ui/primitives';
import { cn } from '../../lib/utils';

export function AiKnowledgeCard({ className }) {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-knowledge'],
    queryFn: async () => (await api.get('/ai/knowledge')).data,
  });

  const reloadMutation = useMutation({
    mutationFn: async () => (await api.post('/ai/knowledge/reload')).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-knowledge'] });
    },
  });

  const knowledge = data?.knowledge || {};
  const stats = knowledge.stats || { totalFiles: 0, totalWords: 0 };
  const files = knowledge.files || [];

  return (
    <Card className={cn(
      "overflow-hidden border border-slate-200 dark:border-blue-500/30 bg-white dark:bg-slate-950/90 p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors duration-200",
      className
    )}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-400/40">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              AI Knowledge Ingestion (<span className="text-blue-600 dark:text-blue-400 font-mono">ai_files/</span>)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Custom cybersecurity documentation ingested into AI Expert memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded border border-blue-200 dark:border-cyan-500/20 font-bold shadow-sm">
            {stats.totalFiles} Docs ({stats.totalWords.toLocaleString()} words)
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={reloadMutation.isPending}
            onClick={() => reloadMutation.mutate()}
            className="h-7 text-[11px] gap-1 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCw className={cn("h-3 w-3", reloadMutation.isPending && "animate-spin")} />
            <span>{reloadMutation.isPending ? 'Reloading…' : 'Sync ai_files'}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        {files.length === 0 ? (
          <div className="sm:col-span-3 text-center py-3 text-slate-500">
            No custom documents found in <span className="font-mono text-blue-600 dark:text-cyan-400">ai_files/</span>. Add markdown files to auto-tune the AI.
          </div>
        ) : (
          files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-2.5">
              <FileText className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{f.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{f.wordCount} words</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
