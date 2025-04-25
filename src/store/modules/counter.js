import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: ref(1),
    token: ref(''),
    userdate:ref({})
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    clearToken() {
      this.token = '';
      localStorage.removeItem('token');
    },
    setUserdate(userdate){
      this.userdate = userdate;
      localStorage.setItem('userdate', userdate);
    }
  },
});
 