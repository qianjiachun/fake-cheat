<script setup lang="ts">
import { NButton, NSpin } from "naive-ui";
import Description from "@/components/Description/index.vue";
import { useYolov8 } from "@/hooks/useYolov8";
import { ref } from "vue";
import { detectVideo } from "@/utils/yolov8/detect";

const { loading, model } = useYolov8();
const refVideo = ref();
const refCanvas = ref();
const isCapture = ref(false);

const onClickCapture = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: 800,
        facingMode: "user"
      }
    });
    isCapture.value = true;
    refVideo.value.srcObject = stream;
    refVideo.value.play();
    // 设置 video 元素的宽度和高度
    let timer = setInterval(() => {
      if (refVideo.value.videoWidth > 0) {
        clearInterval(timer);
        detectVideo(model.value, refVideo.value, refCanvas.value);
      }
    }, 500);
  } catch (err) {
    console.error("Error: " + err);
  }
};
</script>

<template>
  <div>
    <div v-if="!isCapture" class="w-full h-full max-w-6xl mx-auto">
      <div class="pt-20 flex flex-col-reverse lg:flex-row items-center">
        <div class="flex flex-col max-w-xl w-full mt-8 lg:mt-0">
          <span class="text-5xl lg:text-[3.5rem] leading-tight font-bold text-center lg:text-start">
            <span class="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">Fake Cheat</span>
            <a href="https://github.com/qianjiachun/fake-cheat" class="ml-2 inline-flex" target="_blank">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2323" width="24" height="24">
                <path
                  d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667"
                  p-id="2324"
                ></path>
              </svg>
            </a>
          </span>

          <span class="text-4xl lg:text-[3.5rem] leading-tight font-bold text-[#3c3c43] text-center lg:text-start whitespace-pre-wrap lg:whitespace-nowrap">基于yolov8的伪作弊插件</span>
          <div class="flex items-center mt-8 flex-col lg:flex-row px-8 lg:px-0">
            <NButton :disabled="loading.loading" size="large" type="info" round @click="onClickCapture">捕获屏幕</NButton>
            <span v-if="loading.loading" class="ml-4 flex items-center space-x-2">
              <NSpin size="small" />
              <span>模型加载中...{{ loading.progress * 100 }}%</span>
            </span>
          </div>
        </div>
        <div class="flex-1 flex justify-center items-center">
          <div class="w-72 h-72 lg:w-80 lg:h-80 relative flex justify-center items-center">
            <div class="rounded-full absolute w-[90%] h-[90%] bg-animation bg-gradient-to-tr from-red-500 to-blue-500 blur-[72px]"></div>
            <div class="text-[13rem] lg:text-[14rem] cursor-default select-none absolute text-center align-middle">🎮</div>
          </div>
        </div>
      </div>
      <div class="px-8 lg:px-0 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mt-4">
        <Description emoji="🚀" title="高性能" description="使用Fastify服务端，完全响应式页面，微秒级检测，精简准确的数据传输方案"></Description>
        <Description emoji="🖥️" title="端对端" description="基于WebRTC技术(P2P)，实现多人多设备异网接近无延迟的数据同步，数据不通过服务器，信息安全"></Description>
        <Description emoji="✨" title="易使用" description="开箱即用，无需安装任何插件；内置多套预设，简单替换图片链接即可实现自定义皮肤，每个按键皆可独立替换，支持拖拽/调节尺寸/旋转"></Description>
      </div>
    </div>
    <div class="relative">
      <canvas class="absolute top-0 w-full h-full" :width="model.inputShape[1]" :height="model.inputShape[2]" ref="refCanvas" />
      <video id="video-stream" class="w-full h-full" ref="refVideo" autoplay muted></video>
    </div>
  </div>
</template>

<style scoped>
.bg-animation {
  background-size: 150% 150%;
  animation: gradient 3s ease infinite, rotate 3s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
