<template>
  <div class="min-h-screen p-4 flex flex-col z-10 relative">
    <div class="flex justify-between items-center mb-6 bg-black/40 p-4 rounded-lg">
      <div>
        <h2 class="text-christmas-gold text-xl">Lobby: {{ game.lobby?.code }}</h2>
        <p class="text-sm">Montepremi stimato: € {{ (game.players.length * 10).toFixed(2) }} (esempio)</p>
      </div>
      <div class="relative">
        <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl text-christmas-red font-bold shadow-xl border-4 border-christmas-gold animate-bounce">
          {{ lastNumber || '...' }}
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm">Prossimo numero in</p>
        <p class="text-4xl font-mono">{{ game.countdown }}s</p>
      </div>
    </div>

    <div class="flex justify-center gap-2 mb-8 overflow-x-auto py-2">
      <div v-for="n in last10" :key="n" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm border border-white/40">
        {{ n }}
      </div>
    </div>

    <div v-if="currentWinnings" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div class="bg-christmas-red border-4 border-christmas-gold p-8 rounded-xl text-center animate-pulse">
        <h1 class="text-4xl font-christmas text-christmas-gold mb-4 uppercase">{{ currentWinnings.type }}!</h1>
        <div v-for="win in currentWinnings.data" :key="win.name" class="text-xl">
          {{ win.name }} vince € {{ win.amount }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
      <div v-for="(card, idx) in game.user?.cards || []" :key="idx" class="bg-white text-black p-2 rounded-lg border-2 border-red-800">
        <div class="grid grid-rows-3 gap-1">
          <div v-for="(row, rIdx) in card" :key="rIdx" class="grid grid-cols-5 gap-1 bg-red-100 p-1">
            <div v-for="num in row" :key="num"
                 :class="{'bg-red-600 text-white rounded-full': extractedNumbers.includes(num)}"
                 class="h-8 flex items-center justify-center font-bold text-lg border border-red-200">
              {{ num }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="game.lobby?.status === 'finished'" class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <h1 class="text-5xl text-christmas-gold mb-8">Partita Terminata!</h1>
      <button @click="goHome" class="bg-white text-red-900 px-8 py-3 rounded font-bold">Torna alla Home</button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { useRouter } from 'vue-router';

const game = useGameStore();
const router = useRouter();

const extractedNumbers = computed(() => game.lobby?.extracted_numbers || []);
const lastNumber = computed(() => extractedNumbers.value.at(-1));
const last10 = computed(() => extractedNumbers.value.slice(-11, -1).reverse());

const currentWinnings = ref(null);

watch(() => game.lobby?.winners, (newVal) => {
  if(!newVal) return;
  if(newVal.tombola.length) showWin('TOMBOLA', newVal.tombola);
  else if(newVal.cinquina.length) showWin('CINQUINA', newVal.cinquina);
  else if(newVal.quaterna.length) showWin('QUATERNA', newVal.quaterna);
  else if(newVal.terna.length) showWin('TERNA', newVal.terna);
  else if(newVal.ambo.length) showWin('AMBO', newVal.ambo);
}, { deep: true });

function showWin(type, data) {
  if(game.lobby.current_delay === 40) {
    currentWinnings.value = { type, data };
    setTimeout(() => { currentWinnings.value = null }, 10000); 
  }
}

const goHome = () => router.push('/');
</script>
