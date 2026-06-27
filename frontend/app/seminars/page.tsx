'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { seminarsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Users, ClipboardList, FileText } from 'lucide-react';

interface Seminar {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  isActive: boolean;
  _count: { attendances: number; evaluations: number; resources: number };
}

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seminarsApi.getAll().then(setSeminars).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#264653' }}>Tous les séminaires</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : seminars.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun séminaire disponible.</div>
        ) : (
          <div className="space-y-4">
            {seminars.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-800">{s.title}</h2>
                      {s.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Actif</span>
                      )}
                    </div>
                    {s.description && <p className="text-gray-500 text-sm mb-3">{s.description}</p>}
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(s.date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                      {s.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {s.location}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s._count.attendances} émargés</span>
                      <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />{s._count.evaluations} évaluations</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{s._count.resources} ressources</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    <Link
                      href={`/seminars/${s.id}/emargement`}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg text-center transition hover:opacity-90"
                      style={{ background: '#2a9d8f' }}
                    >
                      Émarger
                    </Link>
                    <Link
                      href={`/seminars/${s.id}/evaluation`}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg text-center transition hover:opacity-90"
                      style={{ background: '#e07b39' }}
                    >
                      Évaluer
                    </Link>
                    <Link
                      href={`/seminars/${s.id}/resources`}
                      className="px-4 py-2 text-sm font-medium rounded-lg text-center border border-gray-300 hover:bg-gray-50 transition"
                    >
                      Ressources
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
