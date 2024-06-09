import { onMounted, ref } from "vue";

export const useYolov8 = () => {
  const modelName = "yolov8n";
  const loading = ref({ loading: true, progress: 0 });
  const model = ref({
    net: null,
    inputShape: [1, 0, 0, 3]
  });
  onMounted(() => {
    tf.ready().then(async () => {
      const yolov8: any = await tf.loadGraphModel(`./${modelName}_web_model/model.json`, {
        onProgress: (progress: any) => {
          loading.value = { loading: true, progress };
          console.log(progress);
        }
      }); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      loading.value = { loading: false, progress: 1 };
      model.value = {
        net: yolov8,
        inputShape: yolov8.inputs[0].shape
      };

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  });
  return {
    loading,
    model
  };
};
