/**
 * Aupets Banho & Tosa - Booking Data Store
 * Lucas do Rio Verde - MT
 * Sincronização Local + Supabase Realtime + Polling Contínuo
 */

const SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

const BOOKING_STORE_KEY = 'aupets_appointments_v1';
const BLOCKED_SLOTS_KEY = 'aupets_blocked_slots_v1';

// Horários específicos da Aupets (Lucas do Rio Verde - MT)
const MORNING_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'
];

const AFTERNOON_SLOTS = [
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Retorna os horários possíveis para um determinado dia da semana
// 0: Domingo (Fechado), 1-4: Seg a Qui (Manhã e Tarde), 5: Sex (Manhã), 6: Sáb (Manhã)
function getSlotsForDay(dayOfWeek) {
  if (dayOfWeek === 0) return []; // Domingo fechado
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return [...MORNING_SLOTS]; // Sexta e Sábado até 11:30
  }
  return [...MORNING_SLOTS, ...AFTERNOON_SLOTS]; // Segunda a Quinta
}

const DEFAULT_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

// Conversores entre o formato do Frontend e as colunas do Supabase
function mapFromSupabase(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    petName: row.pet_name,
    petBreed: row.pet_breed || 'SRD / Vira-lata',
    petSize: row.pet_size,
    service: row.service,
    date: row.date,
    time: row.time,
    status: row.status || 'confirmado',
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function mapToSupabase(app) {
  return {
    id: app.id,
    client_name: app.clientName,
    client_phone: app.clientPhone,
    pet_name: app.petName,
    pet_breed: app.petBreed || 'SRD / Vira-lata',
    pet_size: app.petSize,
    service: app.service,
    date: app.date,
    time: app.time,
    status: app.status || 'confirmado',
    notes: app.notes || '',
    created_at: app.createdAt || new Date().toISOString()
  };
}

// Canal de comunicação instantânea entre abas no mesmo navegador
const aupetsBroadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('aupets_channel_v1') : null;
if (aupetsBroadcast) {
  aupetsBroadcast.onmessage = (event) => {
    if (event.data && event.data.type === 'NEW_APPOINTMENT' && event.data.appointment) {
      window.dispatchEvent(new CustomEvent('aupets_new_appointment', {
        detail: event.data.appointment
      }));
    }
    if (event.data && event.data.type === 'SYNC') {
      window.dispatchEvent(new CustomEvent('aupets_sync'));
    }
  };
}

const BookingStore = (function () {
  let isSupabaseReady = false;
  let supabaseClient = null;

  function initSupabase() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        isSupabaseReady = true;
        setupRealtimeSubscription();
        startContinuousPolling();
      } catch (err) {
        console.warn('Aupets: Erro ao inicializar cliente Supabase:', err);
      }
    }
  }

  // Polling contínuo (a cada 3.5 segundos) para sincronização perfeita
  function startContinuousPolling() {
    if (!supabaseClient) return;
    setInterval(async () => {
      try {
        const { data: remoteApps, error } = await supabaseClient
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });

        if (!error && remoteApps) {
          const currentLocal = getLocalAppointments();
          const remoteMapped = remoteApps.map(mapFromSupabase);

          // Verifica se houve novo agendamento
          if (remoteMapped.length > currentLocal.length) {
            const currentIds = new Set(currentLocal.map(a => a.id));
            const newOnes = remoteMapped.filter(a => !currentIds.has(a.id));
            newOnes.forEach(newItem => {
              window.dispatchEvent(new CustomEvent('aupets_new_appointment', {
                detail: newItem
              }));
            });
          }

          saveLocalAppointments(remoteMapped);
          window.dispatchEvent(new CustomEvent('aupets_sync'));
        }
      } catch (e) {
        // Silencioso em caso de oscilação de rede
      }
    }, 3500);
  }

  function setupRealtimeSubscription() {
    if (!supabaseClient) return;
    try {
      supabaseClient
        .channel('aupets_appointments_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newItem = mapFromSupabase(payload.new);
            const list = getLocalAppointments();
            if (!list.find(x => x.id === newItem.id)) {
              list.push(newItem);
              saveLocalAppointments(list);
              window.dispatchEvent(new CustomEvent('aupets_new_appointment', {
                detail: newItem
              }));
              window.dispatchEvent(new CustomEvent('aupets_sync'));
            }
          } else {
            BookingStore.syncWithRemote();
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Aupets: Falha ao ativar canal Realtime:', err);
    }
  }

  function getLocalAppointments() {
    try {
      const data = localStorage.getItem(BOOKING_STORE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalAppointments(list) {
    try {
      localStorage.setItem(BOOKING_STORE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Aupets: Falha ao salvar localmente:', e);
    }
  }

  function getLocalBlockedSlots() {
    try {
      const data = localStorage.getItem(BLOCKED_SLOTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalBlockedSlots(list) {
    try {
      localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Aupets: Falha ao salvar bloqueios:', e);
    }
  }

  return {
    init: function () {
      initSupabase();
      if (isSupabaseReady) {
        this.syncWithRemote();
      }
    },

    isConfigured: function () {
      return isSupabaseReady;
    },

    syncWithRemote: async function () {
      if (!isSupabaseReady || !supabaseClient) return;
      try {
        const { data: apps, error: errApps } = await supabaseClient
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });

        if (!errApps && apps) {
          saveLocalAppointments(apps.map(mapFromSupabase));
        }

        const { data: blocks, error: errBlocks } = await supabaseClient
          .from('blocked_slots')
          .select('*');

        if (!errBlocks && blocks) {
          saveLocalBlockedSlots(blocks.map(b => ({
            id: b.id,
            date: b.date,
            time: b.time,
            reason: b.reason
          })));
        }

        window.dispatchEvent(new CustomEvent('aupets_sync'));
      } catch (err) {
        console.warn('Aupets: Erro na sincronização remota:', err);
      }
    },

    getAll: function () {
      return getLocalAppointments();
    },

    getByDate: function (dateStr) {
      const all = getLocalAppointments();
      return all.filter(a => a.date === dateStr && a.status !== 'cancelado');
    },

    getAvailableSlots: function (dateStr) {
      if (!dateStr) return [];
      
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.getDay();

      if (dayOfWeek === 0) {
        return []; // Domingo fechado
      }

      const possibleSlots = getSlotsForDay(dayOfWeek);
      const booked = this.getByDate(dateStr).map(a => a.time);
      const blocked = this.getBlockedSlots(dateStr).map(b => b.time);

      return possibleSlots.map(time => ({
        time,
        isAvailable: !booked.includes(time) && !blocked.includes(time),
        isBooked: booked.includes(time),
        isBlocked: blocked.includes(time)
      }));
    },

    create: function (appointmentData) {
      const newApp = {
        id: 'AUP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 3).toUpperCase(),
        status: 'confirmado',
        createdAt: new Date().toISOString(),
        ...appointmentData
      };

      const list = getLocalAppointments();
      list.push(newApp);
      saveLocalAppointments(list);

      // Dispara broadcast para abas locais
      if (aupetsBroadcast) {
        aupetsBroadcast.postMessage({
          type: 'NEW_APPOINTMENT',
          appointment: newApp
        });
      }

      window.dispatchEvent(new CustomEvent('aupets_new_appointment', {
        detail: newApp
      }));

      // Sincroniza com Supabase se disponível
      if (isSupabaseReady && supabaseClient) {
        supabaseClient
          .from('appointments')
          .insert([mapToSupabase(newApp)])
          .then(({ error }) => {
            if (error) console.error('Aupets: Erro ao inserir no Supabase:', error);
          });
      }

      return newApp;
    },

    updateStatus: function (id, newStatus) {
      const list = getLocalAppointments();
      const item = list.find(a => a.id === id);
      if (item) {
        item.status = newStatus;
        saveLocalAppointments(list);
        window.dispatchEvent(new CustomEvent('aupets_sync'));

        if (aupetsBroadcast) {
          aupetsBroadcast.postMessage({ type: 'SYNC' });
        }

        if (isSupabaseReady && supabaseClient) {
          supabaseClient
            .from('appointments')
            .update({ status: newStatus })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Aupets: Erro ao atualizar status:', error);
            });
        }
        return true;
      }
      return false;
    },

    delete: function (id) {
      let list = getLocalAppointments();
      list = list.filter(a => a.id !== id);
      saveLocalAppointments(list);
      window.dispatchEvent(new CustomEvent('aupets_sync'));

      if (aupetsBroadcast) {
        aupetsBroadcast.postMessage({ type: 'SYNC' });
      }

      if (isSupabaseReady && supabaseClient) {
        supabaseClient
          .from('appointments')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Aupets: Erro ao deletar no Supabase:', error);
          });
      }
      return true;
    },

    clearAll: function () {
      saveLocalAppointments([]);
      saveLocalBlockedSlots([]);
      window.dispatchEvent(new CustomEvent('aupets_sync'));

      if (isSupabaseReady && supabaseClient) {
        supabaseClient.from('appointments').delete().neq('id', 'placeholder').then();
        supabaseClient.from('blocked_slots').delete().neq('id', 'placeholder').then();
      }
    },

    getBlockedSlots: function (dateStr) {
      const list = getLocalBlockedSlots();
      return dateStr ? list.filter(b => b.date === dateStr) : list;
    },

    blockSlot: function (dateStr, timeStr, reason) {
      const list = getLocalBlockedSlots();
      const blockId = 'BLK-' + Date.now().toString(36).toUpperCase();
      const newBlock = {
        id: blockId,
        date: dateStr,
        time: timeStr,
        reason: reason || 'Bloqueado pela administração'
      };

      list.push(newBlock);
      saveLocalBlockedSlots(list);
      window.dispatchEvent(new CustomEvent('aupets_sync'));

      if (isSupabaseReady && supabaseClient) {
        supabaseClient
          .from('blocked_slots')
          .insert([{
            id: newBlock.id,
            date: newBlock.date,
            time: newBlock.time,
            reason: newBlock.reason,
            created_at: new Date().toISOString()
          }])
          .then(({ error }) => {
            if (error) console.error('Aupets: Erro ao bloquear no Supabase:', error);
          });
      }

      return newBlock;
    },

    unblockSlot: function (blockId) {
      let list = getLocalBlockedSlots();
      list = list.filter(b => b.id !== blockId);
      saveLocalBlockedSlots(list);
      window.dispatchEvent(new CustomEvent('aupets_sync'));

      if (isSupabaseReady && supabaseClient) {
        supabaseClient
          .from('blocked_slots')
          .delete()
          .eq('id', blockId)
          .then(({ error }) => {
            if (error) console.error('Aupets: Erro ao desbloquear no Supabase:', error);
          });
      }
      return true;
    }
  };
})();

// Inicializa automaticamente no carregamento da página
if (typeof window !== 'undefined') {
  window.BookingStore = BookingStore;
  document.addEventListener('DOMContentLoaded', () => {
    BookingStore.init();
  });
}
