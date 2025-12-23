<template>
  <div class="min-h-screen flex flex-col items-center justify-center z-10 relative">
    <div class="bg-white/10 p-8 rounded-xl border-2 border-christmas-gold text-center max-w-md w-full">
      <h2 class="text-2xl mb-4 text-christmas-gold">Benvenuto, {{ route.query.username }}</h2>

      <div v-if="!joined">
        <p class="mb-2">Quante cartelle vuoi comprare?</p>
        <div class="flex items-center justify-center gap-4 mb-6">
          <button @click="cards > 1 ? cards-- : null" class="bg-red-600 w-10 h-10 rounded text-xl">-</button>
          <span class="text-3xl font-bold w-12">{{ cards }}</span>
          <button @click="cards < 20 ? cards++ : null" class="bg-green-600 w-10 h-10 rounded text-xl">+</button>
        </div>
        <button @click="confirmJoin" class="w-full bg-christmas-gold text-black font-bold py-3 rounded">
          Conferma e Entra
        </button>
      </div>

      <div v-else>
        <p class="text-xl animate-pulse">In attesa dell'host...</p>
        <p class="text-sm opacity-60 mt-4">Hai preso {{ cards }} cartelle.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';

const route = useRoute();
const router = useRouter();
const game = useGameStore();
const cards = ref(1);
const joined = ref(false);

const confirmJoin = async () => {
  await game.joinLobby(route.query.code, route.query.username, cards.value);
  joined.value = true;
};

watch(() => game.lobby?.status, (status) => {
  if(status === 'playing') router.push('/game');
});
</script>
