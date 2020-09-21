<template>
  <div v-if="storage.display" class="form">
    <div class="form__container">
      <div class="form__inner">
        <button @click="formDelete" class="form__btn--close">✕</button>
        <section>
          <h1 class="form__title">サイトの評価をお聞かせください</h1>
          <div id="xhm-form"></div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {}
  },
  methods: {
    ...mapActions([
      'setFormScript',
      'setUserAgent',
      'setReference',
      'setCirculation',
      'setVisited',
      'setUseNavigation',
      'formDelete',
    ]),
  },
  computed: {
    ...mapState(['storage']),
  },
  mounted() {
    this.setReference()
    this.setUserAgent()
    this.setVisited()
    this.setCirculation()
    this.setUseNavigation()
    this.setFormScript()
  },
}
</script>
<style lang="scss" scoped>
.form {
  &__container {
    position: fixed;
    width: 400px;
    height: 300px;
    bottom: 0;
    right: 20px;
    border: 1px solid black;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: white;
    overflow-y: scroll;
    z-index: 50000;
  }
  &__inner {
    position: relative;
  }
  &__btn {
    &--close {
      position: absolute;
      right: 0;
      cursor: pointer;
    }
  }
  &__title {
    padding: 0.8rem;
    font-size: 1rem;
    color: white;
    text-align: center;
    background-color: black;
  }
}
</style>
