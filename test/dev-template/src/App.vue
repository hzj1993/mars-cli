<template>
  <div v-if="state.name">
    <div v-for="i in 10">456</div>
    <div>789</div>
    <div>789</div>
    <div>789</div>
    <div>000</div>
    <div>{{state.a}}</div>
    <div :id="state.id" :class="state.class">321</div>
    <button @click="increment">click</button>
  </div>
</template>

<script>
import {reactive} from 'vue'

export default {
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
