# Chrono v2.0.0

Release ufficiale di Chrono per desktop e web.

## Novita principali

- **Applicazione Desktop Standalone (Windows x64)**: basata su runtime Tauri 2.12 e WebView2 a basso consumo di memoria RAM (< 45 MB a riposo).
- **Installer guidato personalizzato**: pacchetto NSIS con configurazione della cartella di destinazione, creazione collegamenti e opzione di avvio automatico all'accesso.
- **Eseguibile portatile (Plug & Play)**: binario singolo `chrono_desktop.exe` pronto all'uso, senza installazione o privilegi di amministrazione.
- **Integrazione di sistema**: minimizzazione nella tray bar di Windows, notifiche native e avvio all'accesso configurabile.
- **Persistenza locale e offline**: motore SQLite locale con sincronizzazione asincrona verso Supabase.
- **Supporto MCP**: compatibilita completa con Model Context Protocol per automazioni e integrazioni IA.
- **Tour interattivo di onboarding**: guida iniziale integrata con Driver.js per la configurazione del workspace.
- **Registro icone esteso**: catalogo curato di oltre 330 icone vettoriali per progetti e viste.

## Pacchetti di rilascio

| File | Dimensione | Descrizione |
| :--- | :--- | :--- |
| `Chrono_2.0.0_x64-setup.exe` | 6.00 MB | Installer guidato per Windows 10/11 x64 |
| `chrono_desktop.exe` | 17.7 MB | Versione portatile autonoma Plug & Play |
| `Chrono_2.0.0_x64_en-US.msi` | 8.84 MB | Pacchetto MSI per installazioni aziendali |
| `latest.json` | 1 KB | Manifest per aggiornamenti automatici |
| `SHA256SUMS.txt` | 1 KB | Firme di integrita crittografica |

## Checksum SHA256

```text
48d799954840c9b6e0c2641a638a10f06287ccc071993039e5954ada68b01c7e *Chrono_2.0.0_x64-setup.exe
95e82d56ca6415af31b010f370eb9fa3706cc36e61e18abdaf4224681e93f0df *chrono_desktop.exe
b2c03dd5aca47145bf231718e91c6bcb64bcc4a9a7da5c898c1318d2171708bb *Chrono_2.0.0_x64_en-US.msi
```
