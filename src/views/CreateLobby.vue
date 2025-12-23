<template>
  <div class="min-h-screen flex flex-col items-center justify-center z-10 relative">
    <div v-if="!game.lobby" class="bg-white/10 p-8 rounded-xl border-2 border-christmas-gold text-center">
      <h2 class="text-2xl mb-4">Impostazioni Partita</h2>
      <label>Prezzo a cartella (€)</label>
      <input type="number" step="0.10" v-model="price" class="w-full p-2 text-black rounded mb-4 mt-1 text-center font-bold" />
      <button @click="create" class="bg-christmas-gold text-black px-6 py-2 rounded font-bold">Genera Lobby</button>
    </div>

    <div v-else class="text-center w-full max-w-4xl">
      <h2 class="text-xl">CODICE STANZA:</h2>
      <h1 class="text-6xl font-christmas text-christmas-gold mb-8 tracking-widest">{{ game.lobby.code }}</h1>

      <div class="bg-black/30 p-6 rounded-lg mb-8">
        <h3 class="text-xl mb-4 border-b border-white/20 pb-2">Giocatori in attesa ({{ game.players.length }})</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="p in game.players" :key="p.id" class="bg-white/20 p-2 rounded flex justify-between">
            <span>{{ p.username }}</span>
            <span class="text-christmas-gold">{{ p.cards_count }} cartelle</span>
          </div>
        </div>
      </div>

      <button @click="startGame" class="bg-christmas-green text-2xl px-12 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition">
        INIZIA PARTITA 🎄
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';

const route = useRoute();
const router = useRouter();
const game = useGameStore();
const price = ref(0.50);

const create = async () => {
  await game.createLobby(price.value, route.query.username);
};

const startGame = async () => {
  await game.startGame();
  router.push('/game');
};
</script>
