import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

export const useGameStore = defineStore('game', {
  state: () => ({
    user: null, // { username, isHost, id }
    lobby: null,
    players: [],
    timer: null,
    countdown: 0,
    router: null
  }),
  actions: {
    setRouter(r) { this.router = r },

    // UTILS
    generateMatrix() {
      let card = [[], [], []];
      for(let r=0; r<3; r++) {
        while(card[r].length < 5) {
          let n = Math.floor(Math.random() * 90) + 1;
          if(!card[r].includes(n)) card[r].push(n);
        }
        card[r].sort((a,b) => a-b);
      }
      return card;
    },

    // CREAZIONE LOBBY
    async createLobby(cardPrice, username) {
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      const hostId = Math.random().toString(36).substring(7);

      const { data, error } = await supabase
        .from('lobbies')
        .insert({
          code,
          card_price: cardPrice,
          host_id: hostId,
          extracted_numbers: []
        })
        .select()
        .single();

      if (error) throw error;

      this.user = { username, isHost: true, id: hostId };
      this.lobby = data;
      this.subscribeToLobby(data.id);
    },

    // JOIN LOBBY
    async joinLobby(code, username, cardsRequested) {
      const { data: lobby, error } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !lobby) throw new Error("Lobby non trovata");

      // Genera cartelle
      const myCards = [];
      for(let i=0; i<cardsRequested; i++) myCards.push(this.generateMatrix());

      const { data: player } = await supabase
        .from('players')
        .insert({
          lobby_id: lobby.id,
          username,
          cards_count: cardsRequested,
          cards_matrix: myCards
        })
        .select()
        .single();

      this.user = { username, isHost: false, id: player.id, cards: myCards };
      this.lobby = lobby;
      this.subscribeToLobby(lobby.id);
    },

    // REALTIME LOGIC
    subscribeToLobby(lobbyId) {
      // Ascolta cambiamenti Lobby
      supabase.channel(`lobby:${lobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      (payload) => {
        this.lobby = payload.new;
        if(payload.new.status === 'playing' && this.lobby.status !== 'playing') {
           // Inizio partita
        }
        // Sync del countdown visivo
        if (payload.new.last_number_at) {
          this.syncTimer();
        }
      })
      .subscribe();

      // Ascolta nuovi giocatori
      supabase.channel(`players:${lobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `lobby_id=eq.${lobbyId}` },
      () => { this.fetchPlayers(lobbyId) })
      .subscribe();

      this.fetchPlayers(lobbyId);
    },

    async fetchPlayers(lobbyId) {
      const { data } = await supabase.from('players').select('*').eq('lobby_id', lobbyId);
      this.players = data || [];
    },

    // LOGICA HOST (Game Loop)
    async startGame() {
      if (!this.user.isHost) return;
      await supabase.from('lobbies').update({ status: 'playing' }).eq('id', this.lobby.id);
      this.runGameLoop();
    },

    runGameLoop() {
      if(this.timer) clearInterval(this.timer);

      this.timer = setInterval(async () => {
        if(this.lobby.status !== 'playing') return;

        // Estrazione numero
        let nextNum;
        let found = false;
        while(!found) {
          nextNum = Math.floor(Math.random() * 90) + 1;
          if(!this.lobby.extracted_numbers.includes(nextNum)) found = true;
        }

        const newNumbers = [...this.lobby.extracted_numbers, nextNum];

        const currentWinners = await this.checkAllWins(newNumbers);

        let waitTime = 20;
        let winnersUpdated = this.lobby.winners;

        if (JSON.stringify(currentWinners) !== JSON.stringify(this.lobby.winners)) {
           waitTime = 40;
           winnersUpdated = currentWinners;
        }

        if (newNumbers.length >= 90) {
           await supabase.from('lobbies').update({ status: 'finished' }).eq('id', this.lobby.id);
           clearInterval(this.timer);
           return;
        }

        await supabase.from('lobbies').update({
          extracted_numbers: newNumbers,
          last_number_at: new Date(),
          current_delay: waitTime,
          winners: winnersUpdated
        }).eq('id', this.lobby.id);

      }, this.lobby.current_delay * 1000);
    },

    async checkAllWins(extracted) {
      const { data: allPlayers } = await supabase.from('players').select('*').eq('lobby_id', this.lobby.id);

      let newWinners = { ...this.lobby.winners };
      const prizePool = this.lobby.card_price * allPlayers.reduce((acc, p) => acc + p.cards_count, 0);

      const checkCard = (matrix) => {
         let results = { ambo:0, terna:0, quaterna:0, cinquina:0, tombola:0 };
         let rowsFull = 0;
         matrix.forEach(row => {
            const matchCount = row.filter(n => extracted.includes(n)).length;
            if(matchCount >= 2) results.ambo = 1;
            if(matchCount >= 3) results.terna = 1;
            if(matchCount >= 4) results.quaterna = 1;
            if(matchCount === 5) { results.cinquina = 1; rowsFull++; }
         });
         if(rowsFull === 3) results.tombola = 1;
         return results;
      };

      let winnersRound = { ambo:[], terna:[], quaterna:[], cinquina:[], tombola:[] };

      allPlayers.forEach(p => {
         p.cards_matrix.forEach(card => {
            const res = checkCard(card);
            if(res.ambo) winnersRound.ambo.push(p.username);
            if(res.terna) winnersRound.terna.push(p.username);
            if(res.quaterna) winnersRound.quaterna.push(p.username);
            if(res.cinquina) winnersRound.cinquina.push(p.username);
            if(res.tombola) winnersRound.tombola.push(p.username);
         });
      });

      const updatePrize = (type, pct) => {
         if (this.lobby.winners[type].length === 0 && winnersRound[type].length > 0) {
            const uniqueWinners = [...new Set(winnersRound[type])]; // Rimuovi duplicati utente
            const totalPrize = prizePool * pct;
            const perPlayer = (totalPrize / uniqueWinners.length).toFixed(2);
            newWinners[type] = uniqueWinners.map(w => ({ name: w, amount: perPlayer }));
         }
      };

      updatePrize('ambo', 0.10);
      updatePrize('terna', 0.15);
      updatePrize('quaterna', 0.20);
      updatePrize('cinquina', 0.25);
      updatePrize('tombola', 0.30);

      return newWinners;
    },

    syncTimer() {
      this.countdown = this.lobby.current_delay;
      const interval = setInterval(() => {
        this.countdown--;
        if(this.countdown <= 0) clearInterval(interval);
      }, 1000);
    }
  }
})
