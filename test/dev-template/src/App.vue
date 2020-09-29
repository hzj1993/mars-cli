<template>
  <div>
    <div>App.vue</div>
    <hello-world></hello-world>
  </div>
</template>

<style scoped>
  div {
    color: #fff;
    font-size: 40px;
  }
</style>

<script>
import {reactive} from 'vue'
import HelloWorld from './components/HelloWorld.vue'

export default {
  components: {
    HelloWorld
  },
  setup() {
    const state = reactive({
      id: 'rrr',
      class: 'yui',
      a: 1,
      name: true
    });
    function increment() {
      state.a++
    }
    return {
      state,
      increment
    }
  }
}
</script>
