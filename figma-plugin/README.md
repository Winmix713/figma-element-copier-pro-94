
# Web to Figma Converter Plugin

Ez a Figma plugin lehetővé teszi webes elemek közvetlen importálását Figmába, megőrizve a stílusokat és az elrendezést.

## Telepítés

1. **Plugin fejlesztési környezet beállítása:**
   ```bash
   cd figma-plugin
   npm install
   npm run build
   ```

2. **Plugin betöltése Figmába:**
   - Nyisd meg a Figmát
   - Menj a `Plugins` > `Development` > `Import plugin from manifest...`
   - Válaszd ki a `manifest.json` fájlt ebből a mappából

3. **Plugin futtatása:**
   - `Plugins` > `Development` > `Web to Figma Converter`

## Működés

### Weboldal oldal (React komponens)
```typescript
import { FigmaExportButton } from '@/components/FigmaExportButton';

// Használat
<div id="my-component">
  <h1>Cím</h1>
  <p>Szöveg</p>
  <FigmaExportButton elementId="my-component">
    Export to Figma
  </FigmaExportButton>
</div>
```

### Figma Plugin
1. A plugin automatikusan fogadja a weboldalról érkező adatokat
2. Konvertálja őket Figma objektumokká
3. Létrehozza a megfelelő rétegeket és stílusokat

## Támogatott funkciók

### Elemtípusok
- **Frame**: konténer elemek Auto Layout támogatással
- **Text**: szövegek teljes formázással
- **Rectangle**: háttér alakzatok

### Stílusok
- Színek (hex, rgb, rgba, hsl, hsla)
- Betűtípusok és méretek
- Szöveg igazítás és formázás
- Border radius (egyedi sarkok)
- Árnyékok és effektek
- Átlátszóság

### Layout
- Auto Layout (Flexbox alapú)
- Padding és margin
- Item spacing
- Alignment beállítások

## Fejlesztés

### Plugin kód módosítása
1. Szerkeszd a `code.ts` fájlt
2. Futtasd `npm run build` vagy `npm run watch`
3. Újraindítás a Figmában: `Plugins` > `Development` > `Reload plugin`

### Új funkciók hozzáadása
- Új node típusok: `createSingleNode()` funkció bővítése
- Új stílusok: converter funkciók (`convertFill`, `convertEffect`) kiterjesztése
- UI módosítások: `ui.html` fájl szerkesztése

## Hibakeresés

### Console logok
- Figma: `Plugins` > `Development` > `Open Console`
- Weboldal: Böngésző Developer Tools

### Gyakori problémák
1. **Betűtípus hibák**: A plugin automatikusan Inter-re vált vissza
2. **Üzenet küldési problémák**: Ellenőrizd a `postMessage` hívásokat
3. **Stílus konverziós hibák**: Nézd meg a console logokat

## API Dokumentáció

### Üzenet formátumok
```typescript
// Weboldal -> Plugin
{
  type: 'CREATE_NODES',
  nodes: FigmaNode[]
}

// Plugin -> Weboldal
{
  type: 'NODES_CREATED',
  success: boolean,
  count?: number,
  error?: string
}
```

### Node struktúra
Lásd a `src/types/figma.ts` fájlt a teljes típusdefiníciókért.
