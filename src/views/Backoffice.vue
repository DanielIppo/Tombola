<template>
  <div class="min-h-screen bg-gray-900 text-white p-8 z-10 relative">
    <div v-if="!isLogged" class="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded">
      <h2 class="text-2xl mb-4">Admin Login</h2>
      <input v-model="u" placeholder="Username" class="w-full mb-2 p-2 text-black" />
      <input v-model="p" type="password" placeholder="Password" class="w-full mb-4 p-2 text-black" />
      <button @click="login" class="bg-blue-600 px-4 py-2 w-full">Login</button>
    </div>

    <div v-else>
      <h1 class="text-3xl mb-8">Storico Partite</h1>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="p-4">Data</th>
              <th class="p-4">Codice</th>
              <th class="p-4">Prezzo</th>
              <th class="p-4">Numeri Usciti</th>
              <th class="p-4">Vincitori</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lobbies" :key="l.id" class="border-b border-gray-800">
              <td class="p-4">{{ new Date(l.created_at).toLocaleString() }}</td>
              <td class="p-4 font-mono text-yellow-500">{{ l.code }}</td>
              <td class="p-4">€ {{ l.card_price }}</td>
              <td class="p-4 text-xs max-w-xs break-words">{{ l.extracted_numbers.join(', ') }}</td>
              <td class="p-4 text-xs">
                <div v-for="(wins, type) in l.winners" :key="type">
                  <span v-if="wins.length" class="text-green-400 font-bold uppercase">{{ type }}: </span>
                  <span v-for="w in wins" :key="w.name">{{ w.name }} (€{{w.amount}}) </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/supabase';
import bcrypt from 'bcryptjs';

const isLogged = ref(false);
const u = ref('');
const p = ref('');
const lobbies = ref([]);

const login = async () => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('username, password_hash')
      .eq('username', u.value)
      .single();

    if (error || !data) {
      alert('Credenziali errate');
      return;
    }

    const isPasswordValid = await bcrypt.compare(p.value, data.password_hash);

    if (isPasswordValid) {
      isLogged.value = true;
      loadData();
    } else {
      alert('Credenziali errate');
    }
  } catch (err) {
    console.error('Errore durante il login:', err);
    alert('Errore durante il login');
  }
};

const loadData = async () => {
  const { data } = await supabase.from('lobbies').select('*').order('created_at', { ascending: false });
  lobbies.value = data;
};
</script>
