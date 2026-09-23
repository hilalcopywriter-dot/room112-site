# ROOM 112 — Landing page

Page d'accueil one-page du studio ROOM 112.
HTML / CSS / JavaScript natifs, sans build (hors Google Fonts).

## Lancer en local

```bash
python3 serve.py      # depuis la racine du projet, puis http://127.0.0.1:5173
```

## Arborescence

```
site/
  index.html              structure + contenus (français)
  assets/css/style.css    charte, mise en page, animations CSS
  assets/js/main.js       préchargeur, curseur, accordéon, popup brief, révélations
  assets/img/             logo SVG (noir, blanc, favicon) redessiné depuis le PDF
  assets/video/           boucle du hero (utilisée) + animations de marque (en réserve)
remotion/                 projet Remotion : sources des nouvelles animations
```

## Sections

Hero · 01 Studio · 02 Offre · 03 Process · 04 Contact

## Charte appliquée

| Rôle | Valeur |
| --- | --- |
| Noir | `#111111` |
| Blanc | `#FFFFFF` |
| Ivoire (fond clair, repris du document de marque) | `#F6F4F0` |
| Rouge profond « lumière » | `#9E1B1B` (accent vif `#C12626`) |
| Typographie | Inter, pour tout le site (titres, textes, libellés HUD) |

## Animations Remotion

```bash
cd remotion
npm run studio                                   # aperçu interactif
npx remotion render src/index.ts Aperture out.mp4  # rendu d'une composition
```

| Composition | Rendu | État |
| --- | --- | --- |
| `HeroLoop` | `R112_Hero_Loop.mp4` | boucle de fond du hero, en place |
| `Aperture` | `ROOM112_Anim_07_Ouverture.mp4` | rendu disponible, non affiché |
| `Travelling` | `ROOM112_Anim_08_Travelling.mp4` | rendu disponible, non affiché |
| `ContactSheet` | `ROOM112_Anim_09_Planche-contact.mp4` | rendu disponible, non affiché |

La section « Le studio en mouvement » qui présentait ces animations a été retirée : les
fichiers restent dans `assets/video/` (réseaux sociaux, génériques) mais ne sont plus
chargés par la page. Les supprimer allège le dossier d'environ 6 Mo.

Le monogramme est reconstruit à partir des tracés du logo (`remotion/src/brand.ts`), donc
identique au PDF de la charte.

## À compléter avant mise en ligne

1. **Coordonnées** — e-mail, téléphone et liens Instagram / TikTok / LinkedIn sont des valeurs à remplacer.
2. **Formulaire** — il vit dans la popup « Démarrer un projet » (tout bouton `data-brief` l'ouvre) et compose un brouillon d'e-mail (`mailto:`). À relier au CRM.
5. **Portfolio** — la section Réalisations (16 reels Instagram filtrables) a été retirée ; le code est récupérable dans l'historique si elle revient.
3. **Tarifs** — la stratégie prévoit des fourchettes de prix affichées ; elles ne figurent pas dans la section Offre.
4. **SEO / partage** — ajouter les balises Open Graph et une image de partage.

## Accessibilité & performances

- `prefers-reduced-motion` désactive toutes les animations.
- Seule la boucle du hero est chargée en vidéo (`preload="none"`).
- Popup accessible : `role="dialog"`, focus maintenu à l'intérieur, fermeture avec `Échap` ou clic à l'extérieur.
