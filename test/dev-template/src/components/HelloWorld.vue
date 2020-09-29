<template>
  <div>hello world</div>
</template>

<style scoped>
  div {
    color: cadetblue;
    font-size: 10px;
  }
</style>
<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      count: 0
    }
  }
}
</script>
