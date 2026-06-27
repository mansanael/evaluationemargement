'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { seminarsApi, evaluationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { CheckCircle, ArrowLeft } from 'lucide-react';

type RadioGroupProps = {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 accent-teal-600"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt}</span>
        </label>
      ))}
    </div>
  );
}

const INITIAL = {
  nom: '', poste: '',
  pertinence: '', objectifsAtteints: '', niveauAdaptation: '', themesCommentaire: '',
  methodeEfficace: '', maitriseSujet: '', participationEncouragee: '', rythme: '',
  logistique: '', supportsClairs: '', ameliorationsOrganisation: '',
  competencesAcquises: '', recommandation: '', satisfactionGlobale: '',
  plusAppreciee: '', pointsAmeliorer: '',
};

export default function EvaluationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [seminar, setSeminar] = useState<any>(null);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    seminarsApi.getOne(id).then(setSeminar);
    if (user) setForm((f) => ({ ...f, nom: user.name, poste: user.poste || '' }));
  }, [id, user]);

  const set = (field: string) => (value: string) => setForm((f) => ({ ...f, [field]: value }));
  const setE = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['pertinence', 'objectifsAtteints', 'niveauAdaptation', 'methodeEfficace', 'maitriseSujet', 'participationEncouragee', 'rythme', 'logistique', 'supportsClairs', 'competencesAcquises', 'recommandation', 'satisfactionGlobale'];
    const missing = required.filter((f) => !form[f as keyof typeof form]);
    if (missing.length > 0) {
      setError('Veuillez répondre à toutes les questions obligatoires.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await evaluationsApi.submit(id, {
        ...form,
        recommandation: form.recommandation === 'Oui',
        satisfactionGlobale: parseInt(form.satisfactionGlobale),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
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
            <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: '#e07b39' }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#264653' }}>Merci pour votre évaluation !</h1>
            <p className="text-gray-500 mb-6">Vos retours sont précieux pour améliorer nos séminaires futurs.</p>
            <Link href="/seminars" className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50">
              Retour aux séminaires
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const section = (title: string, children: React.ReactNode) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-bold text-lg mb-5 pb-3 border-b border-gray-100" style={{ color: '#2a9d8f' }}>{title}</h2>
      <div className="space-y-6">{children}</div>
    </div>
  );

  const q = (label: string, children: React.ReactNode, required = false) => (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</p>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/seminars" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#264653' }}>Questionnaire d&apos;évaluation</h1>
          <p className="text-gray-500 text-sm mt-1">
            {seminar.title} — {format(new Date(seminar.date), 'dd MMMM yyyy', { locale: fr })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Toutes vos réponses resteront confidentielles.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partie 1 */}
          {section('Partie 1 : Informations Générales', <>
            {q('Nom (facultatif)', <input type="text" value={form.nom} onChange={setE('nom')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" placeholder="Votre nom" />)}
            {q('Poste / Responsabilité', <input type="text" value={form.poste} onChange={setE('poste')} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" placeholder="Votre poste" />)}
          </>)}

          {/* Partie 2 */}
          {section('Partie 2 : Contenu du Séminaire', <>
            {q('Comment évaluez-vous la pertinence des sujets abordés ?', <RadioGroup name="pertinence" options={['Très Pertinent', 'Pertinent', 'Moyennement Pertinent', 'Pas Pertinent']} value={form.pertinence} onChange={set('pertinence')} />, true)}
            {q("Les objectifs du séminaire ont-ils été atteints ?", <RadioGroup name="objectifs" options={['Entièrement', 'Partiellement', 'Peu', 'Pas du tout']} value={form.objectifsAtteints} onChange={set('objectifsAtteints')} />, true)}
            {q('Le contenu était-il adapté à votre niveau de connaissance ?', <RadioGroup name="niveau" options={['Trop avancé', 'Juste adapté', 'Trop basique']} value={form.niveauAdaptation} onChange={set('niveauAdaptation')} />, true)}
            {q('Quels thèmes aimeriez-vous voir approfondis ou inclus à l\'avenir ?', <textarea value={form.themesCommentaire} onChange={setE('themesCommentaire')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none" placeholder="Vos suggestions..." />)}
          </>)}

          {/* Partie 3 */}
          {section('Partie 3 : Méthodologie et Animation', <>
            {q("La méthode d'enseignement utilisée était-elle efficace ?", <RadioGroup name="methode" options={['Très Efficace', 'Efficace', 'Moyennement Efficace', 'Pas Efficace']} value={form.methodeEfficace} onChange={set('methodeEfficace')} />, true)}
            {q('Le formateur a-t-il bien maîtrisé le sujet ?', <RadioGroup name="maitrise" options={['Tout à fait', 'Oui', 'Moyennement', 'Non']} value={form.maitriseSujet} onChange={set('maitriseSujet')} />, true)}
            {q('La participation des participants a-t-elle été encouragée ?', <RadioGroup name="participation" options={['Oui, beaucoup', 'Oui, un peu', 'Pas assez']} value={form.participationEncouragee} onChange={set('participationEncouragee')} />, true)}
            {q('Le rythme du séminaire était-il :', <RadioGroup name="rythme" options={['Trop rapide', 'Adapté', 'Trop lent']} value={form.rythme} onChange={set('rythme')} />, true)}
          </>)}

          {/* Partie 4 */}
          {section('Partie 4 : Organisation', <>
            {q('Comment évaluez-vous la logistique (lieu, matériel, support) ?', <RadioGroup name="logistique" options={['Très satisfaisante', 'Satisfaisante', 'Moyennement satisfaisante', 'Insatisfaisante']} value={form.logistique} onChange={set('logistique')} />, true)}
            {q('Les supports de formation étaient-ils clairs et utiles ?', <RadioGroup name="supports" options={['Tout à fait', 'Oui', 'Moyennement', 'Non']} value={form.supportsClairs} onChange={set('supportsClairs')} />, true)}
            {q('Quels aspects organisationnels pourraient être améliorés ?', <textarea value={form.ameliorationsOrganisation} onChange={setE('ameliorationsOrganisation')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none" placeholder="Vos suggestions..." />)}
          </>)}

          {/* Partie 5 */}
          {section('Partie 5 : Impact et Satisfaction', <>
            {q('Avez-vous acquis des compétences ou connaissances utiles pour votre travail ?', <RadioGroup name="competences" options={['Oui, beaucoup', 'Oui, un peu', 'Pas vraiment']} value={form.competencesAcquises} onChange={set('competencesAcquises')} />, true)}
            {q('Recommanderiez-vous ce séminaire à d\'autres personnes ?', <RadioGroup name="recommandation" options={['Oui', 'Non']} value={form.recommandation} onChange={set('recommandation')} />, true)}
            {q('Notez votre satisfaction globale (1 = très insatisfait, 10 = très satisfait)', (
              <div>
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('satisfactionGlobale')(String(n))}
                      className="w-10 h-10 rounded-lg font-semibold text-sm border transition"
                      style={{
                        background: form.satisfactionGlobale === String(n) ? '#2a9d8f' : 'white',
                        color: form.satisfactionGlobale === String(n) ? 'white' : '#374151',
                        borderColor: form.satisfactionGlobale === String(n) ? '#2a9d8f' : '#d1d5db',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {form.satisfactionGlobale && (
                  <p className="text-sm mt-2" style={{ color: '#2a9d8f' }}>Note sélectionnée : {form.satisfactionGlobale}/10</p>
                )}
              </div>
            ), true)}
          </>)}

          {/* Partie 6 */}
          {section('Partie 6 : Remarques et Suggestions', <>
            {q("Qu'avez-vous le plus apprécié dans ce séminaire ?", <textarea value={form.plusAppreciee} onChange={setE('plusAppreciee')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none" placeholder="Ce que vous avez aimé..." />)}
            {q('Quels sont les points à améliorer ?', <textarea value={form.pointsAmeliorer} onChange={setE('pointsAmeliorer')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none" placeholder="Vos suggestions d'amélioration..." />)}
          </>)}

          {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 hover:opacity-90"
            style={{ background: '#e07b39' }}
          >
            {loading ? 'Envoi en cours...' : 'Soumettre mon évaluation'}
          </button>
        </form>
      </div>
    </div>
  );
}
