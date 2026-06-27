'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { seminarsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Users, ClipboardList, ArrowRight } from 'lucide-react';

interface Seminar {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  isActive: boolean;
  _count: { attendances: number; evaluations: number; resources: number };
}

export default function Home() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seminarsApi.getAll().then(setSeminars).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-20 px-4 text-center text-white" style={{ background: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Plateforme de Gestion des Séminaires</h1>
          <p className="text-lg opacity-90 mb-8">
            Émargez numériquement, évaluez les formations et accédez aux ressources pédagogiques.
          </p>
          <Link
            href="/seminars"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition hover:opacity-90"
            style={{ background: '#e07b39' }}
          >
            Voir les séminaires <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: <Users className="w-8 h-8" style={{ color: '#2a9d8f' }} />, title: 'Émargement numérique', desc: 'Signez électroniquement votre présence directement depuis votre appareil.' },
            { icon: <ClipboardList className="w-8 h-8" style={{ color: '#e07b39' }} />, title: 'Évaluation en ligne', desc: 'Donnez votre avis sur les séminaires via un questionnaire complet en 6 parties.' },
            { icon: <Calendar className="w-8 h-8" style={{ color: '#264653' }} />, title: 'Ressources partagées', desc: 'Accédez aux supports de formation, documents et liens utiles.' },
          ].map((f, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50 flex-1">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#264653' }}>
            Séminaires récents
          </h2>
          {loading ? (
            <div className="text-center text-gray-400 py-12">Chargement...</div>
          ) : seminars.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Aucun séminaire disponible pour le moment.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seminars.slice(0, 6).map((s) => (
                <Link key={s.id} href={`/seminars/${s.id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{s.title}</h3>
                    {s.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full ml-2 shrink-0 bg-green-50 text-green-700">Actif</span>
                    )}
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{s.description}</p>}
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(s.date), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                    {s.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.location}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                    <span>{s._count.attendances} émargés</span>
                    <span>{s._count.evaluations} éval.</span>
                    <span>{s._count.resources} ressources</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
