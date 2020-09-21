import '@babel/polyfill';
import 'es6-promise/auto';
import Vue from 'vue';
import App from './components/App';
import store from './store';

new Vue({
  el: '#XHM_APP',
  store,
  render: (h) => h(App)
});
