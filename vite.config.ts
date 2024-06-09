import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import svgLoader from "vite-svg-loader";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    svgLoader(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        type: "module",
        enabled: true
      },
      selfDestroying: true,
      manifest: {
        icons: [
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "https://s1.imagehub.cc/images/2023/08/21/128.png",
            sizes: "128x128",
            type: "image/png"
          }
        ],
        name: "FakeCheat",
        short_name: "FakeCheat",
        display: "fullscreen",
        start_url: "/",
        description: "FakeCheat",
        background_color: "#ffffff",
        theme_color: "#ffffff"
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});
