import React from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

export function LegalPagesWrapper({ title, content, globalConfig }: { title: string, content: string, globalConfig?: any }) {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 text-black selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 hover:text-black transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Retour à l'accueil
        </Link>
        <div className="bg-white rounded-none p-0 sm:p-12 shadow-none border-0 border-neutral-100">
          <h1 className="text-3xl sm:text-4xl font-display font-light text-neutral-900 tracking-[0.16em] uppercase mb-10 pb-6 border-b border-neutral-100">{title}</h1>
          <div className="markdown-body prose prose-neutral max-w-none text-neutral-700 uppercase tracking-wider text-xs leading-relaxed prose-headings:font-display prose-headings:font-medium prose-headings:tracking-[0.18em] prose-headings:text-black prose-a:text-black">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultPrivacyContent = `
## 1. Données collectées
Nous recueillons :
- **Données d'identification** : Nom, prénom ou pseudo.
- **Données de contact** : Numéro de téléphone (via WhatsApp) et adresses de livraison.
- **Données de géolocalisation** (avec votre consentement) : Pour identifier la boutique le plus proche et vous livrer précisément.
- **Données techniques** : Adresse IP, modèle d'appareil, pour identifier et résoudre les anomalies.

## 2. Pourquoi sont-elles collectées ?
Nous utilisons ces informations uniquement pour :
- Prendre en charge, préparer et livrer votre commande vers la bonne adresse.
- Assurer le suivi de commande en temps réel.
- Améliorer notre service de livraison via les retours sur expérience.

## 3. Durée de conservation
Vos données de commande sont conservées dans notre système de gestion interne pour une durée maximale de 3 ans, pour des raisons purement comptables et de suivi qualité.

## 4. Partage d'informations
Vos données ne sont **ni louées, ni vendues**. Elles sont exclusivement partagées entre le serveur central et les livreurs de ZARIA de manière chiffrée, limitées au strict nécessaire (votre position et numéro).

## 5. Vos droits
Conformément à la réglementation, vous bénéficiez des droits d'accès, de rectification, de portabilité et de suppression de vos données. Pour les exercer, contactez le support via nos numéros WhatsApp associés à vos points de vente habituels, ou par email si applicable.

## 6. Protection & Sécurité
Nous appliquons les meilleures pratiques de cryptage et de sécurisation de base de données (Zero-Trust Security, Authentification stricte des requêtes web) pour empêcher tout accès frauduleux à vos adresses.
`;

const defaultTermsContent = `
## 1. Conditions d'utilisation (CGU)
L'utilisation de cette application web implique l'acceptation pleine et entière de ces CGU. Si vous n'êtes pas d'accord, veuillez cesser votre navigation.

## 2. Conditions de Commande
Toute commande déclenchée via le bouton "Commander" (sur le site ou la redirection WhatsApp) constitue la conclusion ferme d'un achat.
- **Validation** : La commande est validée dès lors qu'elle apparaît avec le statut "Nouvelle" dans le système.
- **Disponibilité** : En cas de rupture subite de matière première, une boutique peut annuler votre commande ; vous en serez notifié via suivi ou appel direct.
- **Modification** : Une fois "En préparation" ou "En cuisine", les modifications de commande ne sont généralement plus acceptées.
- **Litiges** : Pour toute réclamation, un reçu détaillé est disponible dans votre espace de suivi.

## 3. Paiement
Les paiements se font selon les modalités locales (ex. Mobile Money ou en espèces à la livraison), détaillés au moment où notre centre vous confirmera la réception.

## 4. Tarifs
Les prix s'affichent en Ariary (Ar) ou devises locales. ZARIA se réserve le droit d’ajuster les tarifs, sans que ces changements n'impactent une commande déjà confirmée.

## 5. Propriété intellectuelle
Tous les contenus visuels, logos, noms et concepts présents sur ce site appartiennent à ZARIA.
`;

const defaultCookiesContent = `
## 1. Qu'est-ce qu'un cookie ?
Un cookie est fichier déposé de manière temporaire sur votre équipement terminal.

## 2. Notre politique « Zéro Cookie Publicitaire »
Notre plateforme est conçue pour l'action. **Nous n'utilisons aucun traceur publicitaire intrusif** (pas de retargeting, pas de pistage inter-sites).

## 3. Cookies strictement nécessaires
Nous utilisons quasi exclusivement le « Local Storage » pour :
- Mémoriser le contenu de votre panier en cas de fermeture accidentelle.
- Sauvegarder l'ID de votre commande en cours pour actualiser le statut de livraison automatiquement à votre retour.
- Votre sélection de Pays ou de Point de Vente.

## 4. Gestion
Si vous videz le cache de votre navigateur, vous perdrez votre panier en cours et votre suivi de commande, sans autres conséquences sévères sur le fonctionnement global.
`;

const defaultDeliveryContent = `
## 1. Processus et Zones
ZARIA livre à domicile dans un rayon délimité autour de chacun de ses boutiques. Lors de la commande, le point de vente le plus proche vous est automatiquement affecté ou proposé.
Veuillez vérifier les horaires d'ouverture avant validation.

## 2. Retrait sur place (À emporter)
Dans l'option "À emporter", une fois votre commande validée, un "Code de Retrait" est généré. Veuillez le présenter au comptoir pour sécuriser le transfert de votre commande sans attente !

## 3. Délais estimés
Notre algorithme et l'estimation de la boutique calculent une heure approximative d'arrivée (incluant temps de cuisson et variations de trafic). Ce délai reste **indicatif** (30 à 50 minutes en moyenne).

## 4. Limites de Livraison
En cas d'adresse erronée, illisible, absente sur les plateformes cartographiques, ou de zone non-sécurisée, le chauffeur livreur peut exiger un point de rencontre précis.
`;

const defaultAboutContent = `
## L'Esprit ZARIA : L'Art du Vêtement d'Élection

ZARIA est née d'un rêve : redéfinir la relation entre la matière et la silhouette d'exception. Notre Maison de couture combine les exigences séculaires du savoir-faire artisanal avec les visions architecturales contemporaines de la mode madrilène.

Chaque création qui quitte notre atelier d'art est une ode au détail :
- **Matières d'Exception** : Nous sourcons nos lins brodés auprès d'exploitations familiales et sélectionnons de la laine fine d'une douceur absolue.
- **Rigueur des Lignes** : Nos tailleurs sculptés et robes midi drapées sont méticuleusement modélisés pour sublimer la silhouette de chaque membre.
- **Service Sur-Mesure** : L'expérience ZARIA se prolonge en cabine privée et via notre Atelier de Mesure Virtuel, garantissant une coupe d'une justesse d'expert.

## Notre Mission : L'Intemporalité au Présent

Nous ne créons pas pour une saison éphémère ; nous façonnons des pièces intimes destinées à traverser les décennies, transmettant une vision d'élégance minimaliste, noble et puissante.
`;

const defaultContactContent = `
## Qui sommes-nous ?
**ZARIA**
Société internationale de haute couture et prêt-à-porter de prestige, opérant ses collections uniques inspirées d'Espagne.

## Coordonnées Générales
- **Adresse centrale** : [Avenue des Champs-Élysées, Paris, France]
- **Email** : contact@zaria-espana.com
- **Siège social** : Antananarivo, Madagascar.

## Mentions de contact Support & Réclamation
En cas de problème sur votre commande, le livreur ou la plateforme :
1. Privilégiez directement la **ligne WhatsApp du support** (visible sur votre application / en bas de page).
2. Fournissez votre numéro de commande "CMD-XXXX".
3. Un responsable opérationnel prendra le relai dans les minutes qui suivent.
`;

export function PagePrivacy() { return <LegalPagesWrapper title="Politique de Confidentialité" content={defaultPrivacyContent} /> }
export function PageTerms() { return <LegalPagesWrapper title="TOS & Conditions de Commande" content={defaultTermsContent} /> }
export function PageCookies() { return <LegalPagesWrapper title="Politique des Cookies" content={defaultCookiesContent} /> }
export function PageDelivery() { return <LegalPagesWrapper title="Livraison & Retrait" content={defaultDeliveryContent} /> }
export function PageAbout() { return <LegalPagesWrapper title="À Propos" content={defaultAboutContent} /> }
export function PageContact() { return <LegalPagesWrapper title="Contact & Accessibilité" content={defaultContactContent} /> }

