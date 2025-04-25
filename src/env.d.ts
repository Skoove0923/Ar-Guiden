/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'ant-design-vue';
declare module 'vue';

declare namespace UniHelper {
  interface UniForms {
    model: any;
    rules?: any;
  }
}
