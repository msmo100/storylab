import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Section = 'overview' | 'blocks' | 'scrolly' | 'embed';

const NAV: { id: Section; label: string }[] = [
  { id: 'overview', label: 'Kom igång' },
  { id: 'blocks',   label: 'Blocktyper' },
  { id: 'scrolly',  label: 'ScrollyMedia' },
  { id: 'embed',    label: 'Inbäddning' },
];

export function HelpModal({ open, onClose }: Props) {
  const [section, setSection] = useState<Section>('overview');

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Hur man använder GP StoryLab</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Stäng"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar nav */}
          <nav className="flex-shrink-0 w-44 border-r border-gray-100 dark:border-gray-800 py-4 px-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  section === n.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {section === 'overview' && <OverviewSection />}
            {section === 'blocks'   && <BlocksSection />}
            {section === 'scrolly'  && <ScrollySection />}
            {section === 'embed'    && <EmbedSection />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 mt-6 first:mt-0">{children}</h3>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 mt-4">{children}</h4>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-gray-600 dark:text-gray-400">{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="mb-1 text-gray-600 dark:text-gray-400">{children}</li>;
}
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold mr-2 ${color}`}>{children}</span>;
}
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
      💡 {children}
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <>
      <H2>Vad är GP StoryLab?</H2>
      <P>
        GP StoryLab är ett verktyg för att skapa visuella, interaktiva berättelser som kan bäddas in i GP:s CMS.
        Varje projekt är ett <strong>block</strong> — du väljer en typ när du skapar projektet och redigerar
        det direkt i byggaren.
      </P>

      <H2>Skapa ett projekt</H2>
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Klicka på <strong>+ Nytt projekt</strong> i dashboarden.</li>
        <li>Projektet öppnas i byggaren. Klicka på <strong>+ Block</strong> och välj en typ.</li>
        <li>Klicka på <strong>Redigera</strong> på blocket för att lägga till innehåll.</li>
        <li>Förhandsgranskningen uppdateras direkt i realtid.</li>
        <li>Projektet sparas automatiskt en sekund efter varje ändring.</li>
      </ol>

      <H2>Byggaren</H2>
      <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-600 dark:text-gray-400">
        <Li><strong>+ Block</strong> — lägg till ett block (visas bara om artikeln är tom)</Li>
        <Li><strong>Redigera</strong> — öppnar innehållsredigeraren för blocket</Li>
        <Li><strong>Stil</strong> — öppnar stilpanelen (färg, typsnitt, storlek m.m.)</Li>
        <Li><strong>⎘</strong> — duplicerar blocket</Li>
        <Li><strong>✕</strong> — tar bort blocket permanent</Li>
        <Li><strong>↩ / ↪</strong> — ångra / gör om (även ⌘Z / ⌘⇧Z)</Li>
        <Li><strong>Kopiera inbäddningskod</strong> — kopierar iframe-koden för CMS:et</Li>
        <Li><strong>Öppna ↗</strong> — öppnar förhandsgranskningen i ett nytt fönster</Li>
      </ul>

      <Tip>Projektet har ett block — du byter blocktyp genom att ta bort det befintliga och lägga till ett nytt.</Tip>
    </>
  );
}

function BlocksSection() {
  return (
    <>
      <H2>Tillgängliga blocktyper</H2>
      <P>Varje projekt innehåller exakt ett block. Välj den typ som passar din berättelse bäst.</P>

      <H3><Badge color="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Text</Badge></H3>
      <P>Ett stycke brödtext i HTML-format. Stöder taggar som <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">&lt;p&gt;</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">&lt;strong&gt;</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">&lt;a&gt;</code> m.fl. Passar för ingress eller faktaruta.</P>

      <H3><Badge color="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Bild</Badge></H3>
      <P>Ett heltäckande foto med valfri bildtext. Ange en URL till bilden. Bilden skalas automatiskt till full bredd.</P>

      <H3><Badge color="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Video</Badge></H3>
      <P>En video som spelas upp automatiskt och ljudlöst när den rullas in i vyport (autoplay). Stöder MP4 och WebM. Lämplig för korta klipp utan ljud.</P>

      <H3><Badge color="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Citat</Badge></H3>
      <P>Ett lyft citat med valfri källa. Visar citattexten i kursiv med en accentlinje på vänster sida. Passar för intervjusvar eller viktiga konstateranden.</P>

      <H3><Badge color="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Hero</Badge></H3>
      <P>En helskärmsöppning med bakgrundsbild eller -video, rubrik och underrubrik. Bakgrunden har en inbyggd parallaxeffekt när användaren scrollar. Passar som ingångsbild för en artikel.</P>

      <H3><Badge color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">Klistrad sektion</Badge></H3>
      <P>
        Bakgrunden sitter fast (sticky) medan en serie textöverlägg tonar in och ut när användaren scrollar.
        Lägg till flera överläggsmeningar för att bygga upp en berättelse mot en stabil bakgrundsbild eller -video.
      </P>

      <H3><Badge color="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">Tidslinje</Badge></H3>
      <P>Händelser längs en vertikal linje. Varje händelse har en tid, rubrik och brödtext. Händelserna animeras in i vyport. Passar för kronologiska förlopp.</P>

      <H3><Badge color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Chatt</Badge></H3>
      <P>
        En iPhone-liknande konversation med avsändare och mottagare. Valfri telefon-ram, statusrad och kontakthuvud.
        Meddelandena kan animeras in ett och ett för dramatisk effekt.
      </P>

      <H3><Badge color="bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300">Karusell</Badge></H3>
      <P>Svepbara bilder eller videor i en horisontell rad. Stöder touch-svep och klickbara punktindikatorer. Fungerar med både bild-URLer och video-URLer.</P>

      <H3><Badge color="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">ScrollyMedia</Badge></H3>
      <P>Scrollytelling med bilder/video som bakgrund. Varje sektion fyller hela vyportens höjd. Bäddas in separat med en sticky iframe. Se fliken <em>ScrollyMedia</em> för detaljer.</P>
    </>
  );
}

function ScrollySection() {
  return (
    <>
      <H2>ScrollyMedia</H2>
      <P>
        ScrollyMedia är ett specialblock för scrollytelling — användaren scrollar och bakgrunden
        övergår mjukt från sektion till sektion med parallaxeffekt, medan texten rör sig uppåt
        genom vyportens mitt.
      </P>

      <H2>Så här bygger du en ScrollyMedia</H2>
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Lägg till ett <strong>ScrollyMedia</strong>-block i projektet.</li>
        <li>Klicka på <strong>Redigera</strong> och sedan <strong>+ Lägg till sektion</strong>.</li>
        <li>Välj bakgrundstyp (Bild eller Video) och klistra in en URL.</li>
        <li>Fyll i rubrik, underrubrik och/eller brödtext — all text är valfri.</li>
        <li>Justera överläggsopaciteten (hur mörkt skiktet ovanpå bakgrunden är) med slidern.</li>
        <li>Repetera för fler sektioner.</li>
      </ol>

      <H2>Animationer</H2>
      <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-600 dark:text-gray-400">
        <Li><strong>Bakgrund:</strong> Parallax-rörelse uppåt (-8 %) när sektionen passerar.</Li>
        <Li><strong>Korstonad bakgrund:</strong> Mjuk dissolve (35 % av scrollsträckan) mellan sektioner — ingen svart-blixt.</Li>
        <Li><strong>Text:</strong> Rör sig kontinuerligt uppåt genom vyportens mitt. Tonas in underifrån, glider ut i toppen — ingen fade-ut, texten scrollas fysiskt ur bild.</Li>
      </ul>

      <H2>Tips för bra videor</H2>
      <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-600 dark:text-gray-400">
        <Li>Använd MP4 (H.264) för bäst kompatibilitet.</Li>
        <Li>Ladda upp till en CDN eller Cloudinary — direkta filsökvägar fungerar inte i CMS:et.</Li>
        <Li>Ange en poster-bild (en stillbild) som visas innan videon laddas klart.</Li>
        <Li>Liggande videoformat (16:9) täcker vyportens höjd bäst.</Li>
      </ul>

      <Tip>
        Förhandsgranskningen i byggaren visar ScrollyMedia i en sticky iframe. Öppna
        förhandsgranskningen i nytt fönster (Öppna ↗) för att testa scrolleffekterna fullt ut.
      </Tip>
    </>
  );
}

function EmbedSection() {
  return (
    <>
      <H2>Inbäddning i CMS:et</H2>
      <P>
        När projektet är klart klickar du på <strong>Kopiera inbäddningskod</strong> i verktygsfältet.
        Koden är anpassad efter blocktypen.
      </P>

      <H2>Vanliga block (Text, Bild, Hero m.fl.)</H2>
      <P>
        En enkel iframe vars höjd anpassas automatiskt via <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">postMessage</code>.
        CMS:et behöver tillåta iframes och köra det medföljande skriptblocket.
      </P>

      <H2>ScrollyMedia-block</H2>
      <P>
        Kräver en <strong>sticky wrapper</strong>: en yttre div med höjden <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">N×100vh</code>
        (N = antal sektioner) och en inre iframe med <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">position:sticky; top:0; height:100vh</code>.
        Det medföljande skriptet:
      </P>
      <ul className="list-disc list-inside mb-4 space-y-1.5 text-gray-600 dark:text-gray-400">
        <Li>Lyssnar på <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">storylab-scrolly-init</code> för att ställa in wrapperns höjd dynamiskt.</Li>
        <Li>Räknar ut scroll-progress (0–1) och skickar det till iframen via <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">storylab-scroll</code>.</Li>
      </ul>

      <Tip>
        GP:s CMS tillåter skriptblock i inbäddningsrutor. Klistra in hela koden (div + iframe + script)
        som ett HTML-block. Testa alltid i <strong>test.gp.se</strong> innan publicering.
      </Tip>

      <H2>Tangentbordsgenvägar</H2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-xs">⌘S</span><span>Spara manuellt</span>
        <span className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-xs">⌘Z</span><span>Ångra</span>
        <span className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-xs">⌘⇧Z</span><span>Gör om</span>
        <span className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-xs">Esc</span><span>Stäng stilpanelen</span>
      </div>
    </>
  );
}
