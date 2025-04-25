import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  
  // 使用持久化插件
  pinia.use(piniaPluginPersistedstate);
  
  app.use(pinia);
  
  return {
    app,
  };
}

