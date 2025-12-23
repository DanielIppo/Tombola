<template>
  <div class="min-h-screen flex flex-col items-center justify-center relative z-10 p-4 text-center">
    <h1 class="text-6xl font-christmas text-christmas-gold mb-8 drop-shadow-lg">Tombola Natalizia</h1>
    
    <div class="bg-white/10 backdrop-blur-md p-8 rounded-xl border-2 border-christmas-gold w-full max-w-md">
      <input v-model="username" placeholder="Il tuo Nome" class="w-full p-3 mb-4 rounded text-black font-bold text-center" />
      
      <div class="space-y-4">
        <button @click="goToCreate" class="w-full bg-christmas-green hover:bg-green-800 p-4 rounded text-xl font-bold transition">
          Crea Nuova Lobby
        </button>
        <div class="flex gap-2">
          <input v-model="lobbyCode" placeholder="Codice Lobby" class="flex-1 p-3 rounded text-black uppercase" />
          <button @click="goToJoin" class="bg-christmas-gold hover:bg-yellow-600 px-6 rounded text-black font-bold">
            Entra
          </button>
        </div>
      </div>
    </div>
    <div class="mt-8 text-sm opacity-70">
      <router-link to="/backoffice">Area Admin</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const lobbyCode = ref('');

const goToCreate = () => {
  if(!username.value) return alert('Inserisci un nome!');
  router.push({ name: 'create', query: { username: username.value } });
};

const goToJoin = () => {
  if(!username.value || !lobbyCode.value) return alert('Dati mancanti!');
  router.push({ name: 'join', query: { username: username.value, code: lobbyCode.value } });
};
</script>