'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { analyticsApi, attendanceApi, seminarsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Users, Star, ThumbsUp, MessageSquare, Download, ToggleLeft, ToggleRight } from 'lucide-react';

const COLORS = ['#2a9d8f', '#264653', '#e07b39', '#e9c46a', '#f4a261'];

function ChartCard({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={120} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdminSeminarPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [seminar, setSeminar] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', location: '', isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'attendances' | 'edit'>(!isEdit ? 'analytics' : 'edit');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      Promise.all([analyticsApi.getForSeminar(id), attendanceApi.getAll(id), seminarsApi.getOne(id)])
        .then(([a, att, s]) => {
          setAnalytics(a);
          setAttendances(att);
          setSeminar(s);
          setEditForm({ title: s.title, description: s.description || '', date: s.date?.split('T')[0] || '', location: s.location || '', isActive: s.isActive });
        })
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  const exportCsv = () => {
    const rows = [
      ['Nom', 'Poste', 'Jour', 'Date', 'Heure', 'Type'],
      ...attendances.map((a) => [
        a.user?.name || a.guestName || 'Anonyme',
        a.user?.poste || a.guestPoste || '',
        format(new Date(a.signedAt), 'EEEE', { locale: fr }),
        format(new Date(a.signedAt), 'dd/MM/yyyy', { locale: fr }),
        format(new Date(a.signedAt), 'HH:mm', { locale: fr }),
        a.userId ? 'Compte' : 'Invité',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emargements-${seminar?.title?.replace(/\s+/g, '-') || id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await seminarsApi.update(id, { ...editForm, date: new Date(editForm.date).toISOString() });
      router.push('/admin');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  const tabs = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'attendances', label: `Émargements (${attendances.length})` },
    { key: 'edit', label: 'Modifier' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#264653' }}>{seminar?.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {seminar && format(new Date(seminar.date), 'dd MMMM yyyy', { locale: fr })}
            {seminar?.location && ` · ${seminar.location}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition"
              style={{
                borderColor: activeTab === t.key ? '#2a9d8f' : 'transparent',
                color: activeTab === t.key ? '#2a9d8f' : '#6b7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <>
            {analytics.totalEvaluations === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune évaluation pour ce séminaire encore.</p>
              </div>
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Évaluations', value: analytics.totalEvaluations, icon: <MessageSquare className="w-5 h-5" />, color: '#e07b39' },
                    { label: 'Émargements', value: analytics.totalAttendances, icon: <Users className="w-5 h-5" />, color: '#2a9d8f' },
                    { label: 'Satisfaction moy.', value: `${analytics.satisfactionMoyenne.toFixed(1)}/10`, icon: <Star className="w-5 h-5" />, color: '#264653' },
                    { label: 'Recommandation', value: `${analytics.tauxRecommandation.toFixed(0)}%`, icon: <ThumbsUp className="w-5 h-5" />, color: '#2a9d8f' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2 mb-1" style={{ color: s.color }}>{s.icon}<span className="text-xs text-gray-500">{s.label}</span></div>
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  <ChartCard title="Pertinence des sujets" data={analytics.pertinence} />
                  <ChartCard title="Objectifs atteints" data={analytics.objectifsAtteints} />
                  <ChartCard title="Méthode d'enseignement" data={analytics.methodeEfficace} />
                  <ChartCard title="Maîtrise du sujet par le formateur" data={analytics.maitriseSujet} />
                  <ChartCard title="Logistique" data={analytics.logistique} />
                  <ChartCard title="Supports de formation" data={analytics.supportsClairs} />
                  <ChartCard title="Compétences acquises" data={analytics.competencesAcquises} />
                  <ChartCard title="Rythme du séminaire" data={analytics.rythme} />
                </div>

                {/* Comments */}
                {analytics.commentaires.plusAppreciee.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">Ce qui a été le plus apprécié</h3>
                    <ul className="space-y-2">
                      {analytics.commentaires.plusAppreciee.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 pl-3 border-l-2" style={{ borderColor: '#2a9d8f' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analytics.commentaires.pointsAmeliorer.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">Points à améliorer</h3>
                    <ul className="space-y-2">
                      {analytics.commentaires.pointsAmeliorer.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 pl-3 border-l-2" style={{ borderColor: '#e07b39' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Attendances Tab */}
        {activeTab === 'attendances' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {attendances.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{attendances.length} émargement{attendances.length > 1 ? 's' : ''}</span>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600"
                >
                  <Download className="w-4 h-4" /> Exporter CSV
                </button>
              </div>
            )}
            {attendances.length === 0 ? (
              <div className="p-12 text-center text-gray-400">Aucun émargement enregistré.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase">
                    <th className="px-6 py-3">Participant</th>
                    <th className="px-6 py-3">Poste</th>
                    <th className="px-6 py-3">Jour &amp; Heure</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendances.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {a.user?.name || a.guestName || <span className="text-gray-400 italic">Anonyme</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {a.user?.poste || a.guestPoste || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-700 capitalize">
                          {format(new Date(a.signedAt), 'EEEE dd/MM/yyyy', { locale: fr })}
                        </span>
                        <br />
                        <span className="text-xs">{format(new Date(a.signedAt), 'HH:mm', { locale: fr })}</span>
                      </td>
                      <td className="px-6 py-4">
                        {a.userId ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-green-700">Compte</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Invité</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <img src={a.signatureData} alt="Signature" className="h-10 border rounded" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-xl">
            <h2 className="font-bold text-lg mb-6" style={{ color: '#264653' }}>Modifier le séminaire</h2>
            <form onSubmit={saveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">Séminaire actif</p>
                  <p className="text-xs text-gray-400 mt-0.5">Les participants peuvent émarger et évaluer</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className="transition"
                  style={{ color: editForm.isActive ? '#2a9d8f' : '#9ca3af' }}
                >
                  {editForm.isActive
                    ? <ToggleRight className="w-10 h-10" />
                    : <ToggleLeft className="w-10 h-10" />}
                </button>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50" style={{ background: '#2a9d8f' }}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
