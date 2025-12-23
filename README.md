# 🎄 Tombola Natalizia Multiplayer

Un'applicazione web moderna per giocare alla classica Tombola Napoletana con amici e parenti, ovunque essi siano. Realizzata con **Vue.js 3** e **Supabase** per un'esperienza multiplayer in tempo reale.

![Tombola Banner](https://img.shields.io/badge/Status-Christmas_Ready-red?style=for-the-badge&logo=christmas-tree)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## ✨ Funzionalità

- **Lobby System:** Crea stanze private o unisciti tramite codice.
- **Realtime:** Estrazione numeri sincronizzata al millesimo di secondo per tutti i giocatori.
- **Cartelle Digitali:** Generazione automatica delle cartelle per i giocatori.
- **Logica di Gioco:** Gestione automatica di Ambo, Terna, Quaterna, Cinquina e Tombola.
- **Grafica a Tema:** Interfaccia responsive e festosa.

---

## 🚀 Installazione e Setup

Segui questi passaggi per configurare il tuo ambiente di gioco.

### 1. Database Setup (Supabase)

Il backend si appoggia interamente su Supabase.

1. Crea un account gratuito su [Supabase.com](https://supabase.com).
2. Crea un **Nuovo Progetto**.
3. Vai nella sezione **SQL Editor** (icona carta/matita nella barra laterale).
4. Incolla ed esegui il seguente script per generare la struttura del database:

```sql
create table admins (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password_hash text not null
);

create table lobbies (
  id uuid default gen_random_uuid() primary key,
  code text unique not null, -- Codice breve (es. TMB-123)
  status text default 'waiting', -- waiting, playing, finished
  card_price numeric not null, -- Prezzo cartella
  host_id text not null, -- ID temporaneo del creatore
  extracted_numbers int[] default '{}', -- Array numeri usciti
  last_extraction_at timestamptz default now(), -- Per sincronizzare i timer
  winners jsonb default '{}'::jsonb, -- Storico vincite {ambo: [...], terna: [...]}
  created_at timestamptz default now()
);

create table players (
  id uuid default gen_random_uuid() primary key,
  lobby_id uuid references lobbies(id) on delete cascade,
  username text not null,
  cards_count int default 0,
  cards_matrix jsonb default '[]'::jsonb, -- Le cartelle generate (numeri) del giocatore
  joined_at timestamptz default now()
);
```
### 3) Importarsi il progetto su github
Carica tutti i file del progetto in una nuova repository sul tuo account GitHub.

### 4) Hostarlo come meglio si creda
Collega la repository al tuo servizio di hosting preferito (es. Netlify).
**Importante:** Ricordati di inserire le variabili d'ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`) nel pannello di controllo dell'hosting, altrimenti il sito non funzionerà.

### 5) Divertirsi il più possibile
Raduna i giocatori e buona Tombola! 🎅
-- Abilita il Realtime per permettere al gioco di funzionare
alter publication supabase_realtime add table lobbies;
alter publication supabase_realtime add table players;
