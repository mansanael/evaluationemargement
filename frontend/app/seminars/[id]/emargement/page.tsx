'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import SignatureCanvas from 'react-signature-canvas';
import { seminarsApi, attendanceApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { CheckCircle, RotateCcw, ArrowLeft, CalendarDays } from 'lucide-react';

// Parse a yyyy-MM-dd string in local timezone (avoids UTC-midnight shift)
function parseLocal(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export default function EmargementPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas>(null);

  const [seminar, setSeminar] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPoste, setGuestPoste] = useState('');
  // Selected date as yyyy-MM-dd string (local)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successDate, setSuccessDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    seminarsApi.getOne(id).then(setSeminar);
  }, [id]);

  // ── Derived values ──────────────────────────────────────
  const seminarDateStr = seminar ? format(new Date(seminar.date), 'yyyy-MM-dd') : todayStr();
  const seminarDate = parseLocal(seminarDateStr);

  // How many days have elapsed since the seminar started (≥ 0)
  const today = parseLocal(todayStr());
  const elapsed = Math.max(0, Math.floor((today.getTime() - seminarDate.getTime()) / 86_400_000));
  // Show buttons for Jour 1 → Jour N (max 7)
  const numDays = Math.min(7, elapsed + 1);

  // Map day number ↔ date string
  const dateForDay = (n: number): string => {
    const d = new Date(seminarDate);
    d.setDate(d.getDate() + n - 1);
    return format(d, 'yyyy-MM-dd');
  };
  const dayForDate = (str: string): number => {
    const diff = Math.floor((parseLocal(str).getTime() - seminarDate.getTime()) / 86_400_000);
    return diff + 1; // 1-indexed
  };

  const currentDayNum = dayForDate(selectedDate);

  // Build the ISO signedAt to send: today → current time; past → noon
  const buildSignedAt = (): string => {
    if (selectedDate === todayStr()) return new Date().toISOString();
    const d = parseLocal(selectedDate);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError('Veuillez signer avant de valider.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const signatureData = sigRef.current.toDataURL('image/png');
      await attendanceApi.sign(id, {
        signatureData,
        guestName: !user ? guestName : undefined,
        guestPoste: !user ? guestPoste : undefined,
        signedAt: buildSignedAt(),
      });
      setSuccessDate(selectedDate);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'émargement");
    } finally {
      setLoading(false);
    }
  };

  if (!seminar) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#2a9d8f' }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#264653' }}>Émargement enregistré !</h1>
            <p className="text-gray-500 mb-1">
              Signé pour <strong>{seminar.title}</strong>
            </p>
            <p className="text-gray-400 text-sm mb-6 capitalize">
              {format(parseLocal(successDate), 'EEEE dd MMMM yyyy', { locale: fr })}
              {` (Jour ${dayForDate(successDate)})`}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/seminars/${id}/evaluation`} className="px-5 py-2.5 rounded-lg text-white font-medium" style={{ background: '#e07b39' }}>
                Évaluer ce séminaire
              </Link>
              <Link href="/seminars" className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50">
                Retour aux séminaires
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10 w-full">
        <Link href="/seminars" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour aux séminaires
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#264653' }}>Feuille d&apos;émargement</h1>
          <p className="font-medium text-gray-800 mb-1">{seminar.title}</p>
          <p className="text-sm text-gray-400 mb-6 capitalize">
            Début : {format(seminarDate, 'EEEE dd MMMM yyyy', { locale: fr })}
            {seminar.location && ` · ${seminar.location}`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Identité ── */}
            {!user && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                <p className="text-sm text-amber-700 font-medium">Vous n&apos;êtes pas connecté. Veuillez renseigner vos informations :</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste / Fonction</label>
                  <input
                    type="text"
                    value={guestPoste}
                    onChange={(e) => setGuestPoste(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Votre poste"
                  />
                </div>
              </div>
            )}

            {user && (
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#2a9d8f' }}>Participant identifié</p>
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                {user.poste && <p className="text-sm text-gray-600">{user.poste}</p>}
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}

            {/* ── Sélecteur jour / date ── */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CalendarDays className="w-4 h-4" style={{ color: '#2a9d8f' }} />
                Jour d&apos;émargement
              </div>

              {/* Boutons numéro de jour */}
              {numDays > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: numDays }, (_, i) => i + 1).map((n) => {
                    const ds = dateForDay(n);
                    const active = selectedDate === ds;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSelectedDate(ds)}
                        className="px-3 py-2 rounded-lg text-sm font-medium border transition text-center min-w-[72px]"
                        style={
                          active
                            ? { background: '#2a9d8f', borderColor: '#2a9d8f', color: '#fff' }
                            : { borderColor: '#e5e7eb', color: '#374151', background: '#fff' }
                        }
                      >
                        <span className="block font-semibold">Jour {n}</span>
                        <span className="block text-xs mt-0.5 opacity-80">
                          {format(parseLocal(ds), 'EEE dd/MM', { locale: fr })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Date picker */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">
                  {numDays > 1 ? 'Ou une date précise :' : 'Date :'}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  min={seminarDateStr}
                  max={todayStr()}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>

              {/* Résumé */}
              <div
                className="rounded-lg px-4 py-2.5 text-sm"
                style={{ background: '#f0fdf9', borderLeft: '3px solid #2a9d8f' }}
              >
                <span className="text-gray-500">Émargement pour : </span>
                <strong className="text-gray-800 capitalize">
                  {format(parseLocal(selectedDate), 'EEEE dd MMMM yyyy', { locale: fr })}
                </strong>
                {currentDayNum >= 1 && (
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                    Jour {currentDayNum}
                  </span>
                )}
              </div>
            </div>

            {/* ── Signature ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signature *</label>
              <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#264653"
                  canvasProps={{ className: 'w-full', height: 200 }}
                />
                <button
                  type="button"
                  onClick={() => sigRef.current?.clear()}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition"
                  title="Effacer la signature"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Signez dans le cadre ci-dessus avec votre souris ou doigt</p>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 hover:opacity-90"
              style={{ background: '#2a9d8f' }}
            >
              {loading ? 'Enregistrement...' : 'Valider mon émargement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
