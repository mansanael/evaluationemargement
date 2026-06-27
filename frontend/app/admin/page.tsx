'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { analyticsApi, seminarsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { Plus, Users, ClipboardList, TrendingUp, Calendar, BarChart2, Trash2, Edit } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [seminars, setSeminars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      Promise.all([analyticsApi.getGlobal(), seminarsApi.getAll()])
        .then(([a, s]) => { setAnalytics(a); setSeminars(s); })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const deleteSeminar = async (id: string) => {
    if (!confirm('Supprimer ce séminaire ? Cette action est irréversible.')) return;
    await seminarsApi.delete(id);
    setSeminars((prev) => prev.filter((s) => s.id !== id));
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#264653' }}>Dashboard Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
          </div>
          <Link
            href="/admin/seminars/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white transition hover:opacity-90"
            style={{ background: '#2a9d8f' }}
          >
            <Plus className="w-4 h-4" /> Nouveau séminaire
          </Link>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Séminaires', value: analytics.totalSeminars, icon: <Calendar className="w-5 h-5" />, color: '#264653' },
              { label: 'Émargements', value: analytics.totalAttendances, icon: <Users className="w-5 h-5" />, color: '#2a9d8f' },
              { label: 'Évaluations', value: analytics.totalEvaluations, icon: <ClipboardList className="w-5 h-5" />, color: '#e07b39' },
              { label: 'Satisfaction moy.', value: analytics.totalEvaluations ? `${analytics.satisfactionMoyenne.toFixed(1)}/10` : 'N/A', icon: <TrendingUp className="w-5 h-5" />, color: '#2a9d8f' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <span className="text-sm text-gray-500">{s.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Seminars list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg" style={{ color: '#264653' }}>Tous les séminaires</h2>
          </div>
          {seminars.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Aucun séminaire. Commencez par en créer un.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {seminars.map((s) => (
                <div key={s.id} className="p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{s.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 mt-1">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{format(new Date(s.date), 'dd MMM yyyy', { locale: fr })}</span>
                      <span>{s._count.attendances} émargés</span>
                      <span>{s._count.evaluations} évaluations</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/seminars/${s.id}`} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500" title="Détails et analytics">
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/seminars/${s.id}?edit=1`} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-500" title="Modifier">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteSeminar(s.id)} className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition text-red-400" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
