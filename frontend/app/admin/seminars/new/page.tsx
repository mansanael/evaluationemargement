'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { seminarsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';

export default function NewSeminarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await seminarsApi.create({ ...form, date: new Date(form.date).toISOString() });
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#264653' }}>Créer un séminaire</h1>

          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={form.title} onChange={set('title')} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" placeholder="Titre du séminaire" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none resize-none" placeholder="Description du séminaire..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={set('date')} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input type="text" value={form.location} onChange={set('location')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" placeholder="Salle, adresse..." />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 hover:opacity-90"
              style={{ background: '#2a9d8f' }}
            >
              {loading ? 'Création...' : 'Créer le séminaire'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
