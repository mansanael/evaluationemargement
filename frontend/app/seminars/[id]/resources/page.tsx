'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { seminarsApi, resourcesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { FileText, Link2, Trash2, Upload, Plus, ArrowLeft, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ResourcesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [seminar, setSeminar] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([seminarsApi.getOne(id), resourcesApi.getAll(id)])
      .then(([s, r]) => { setSeminar(s); setResources(r); })
      .finally(() => setLoading(false));
  }, [id]);

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName || !linkUrl) return;
    const r = await resourcesApi.addLink(id, linkName, linkUrl);
    setResources((prev) => [r, ...prev]);
    setLinkName('');
    setLinkUrl('');
    setShowAddLink(false);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await resourcesApi.upload(id, file);
      setResources((prev) => [r, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteResource = async (resourceId: string) => {
    await resourcesApi.delete(id, resourceId);
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/seminars" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#264653' }}>Ressources du séminaire</h1>
            {seminar && (
              <p className="text-gray-500 text-sm mt-1">
                {seminar.title} — {format(new Date(seminar.date), 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition hover:opacity-90" style={{ background: '#2a9d8f' }}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Envoi...' : 'Uploader un fichier'}
                <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
              </label>
              <button
                onClick={() => setShowAddLink(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
              >
                <Plus className="w-4 h-4" /> Ajouter un lien
              </button>
            </div>
          )}
        </div>

        {isAdmin && showAddLink && (
          <form onSubmit={addLink} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h3 className="font-medium mb-4">Ajouter un lien externe</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Nom du lien"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                required
              />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: '#264653' }}>
                Ajouter
              </button>
              <button type="button" onClick={() => setShowAddLink(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </form>
        )}

        {resources.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune ressource disponible pour ce séminaire.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {resources.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.type === 'FILE' ? '#e8f5e9' : '#e3f2fd' }}>
                  {r.type === 'FILE' ? <FileText className="w-5 h-5 text-green-600" /> : <Link2 className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.type === 'FILE' ? `Fichier${r.size ? ` • ${(r.size / 1024).toFixed(1)} KB` : ''}` : 'Lien externe'}
                    {' • '}{format(new Date(r.createdAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={r.type === 'FILE' ? `${API_URL}${r.url}` : r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {isAdmin && (
                    <button
                      onClick={() => deleteResource(r.id)}
                      className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
