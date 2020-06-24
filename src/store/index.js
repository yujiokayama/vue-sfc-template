import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import storage from './modules/sub';
import moment from 'moment';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    requestOptions: {
      method: 'GET',
      url:
        'https://museum-kddi.revn5.demo.iqnet.co.jp/api/reservations/calendar',
      headers: { 'Content-Type': 'application/json' },
      params: {
        sd: ''
      },
      responseType: 'json'
    },
    loading: true,
    calendar: true,
    reservationData: [],
    initDate: '',
    currentDate: {
      day: '',
      month: '',
      year: '',
      count: 0
    }
  },
  mutations: {
    loadingState(state, payload) {
      state.loading = payload;
    },
    setCalendar(state, payload) {
      state.calendar = payload;
    },
    getReservationData(state, payload) {
      state.reservationData = payload;
    },
    setRequestParams(state, payload) {
      state.requestOptions.params.sd = payload;
    },
    setInitDate(state, payload) {
      state.initDate = payload;
    },
    setDay(state, payload) {
      state.currentDate.day = payload;
    },
    setMonth(state, payload) {
      state.currentDate.month = payload;
    },
    setYear(state, payload) {
      state.currentDate.year = payload;
    },
    setCount(state, payload) {
      state.currentDate.count += payload;
    }
  },
  actions: {
    /**
     * API取得処理
     */
    async requestAPI({ state, commit }) {
      try {
        const res = await axios(state.requestOptions);
        const data = await res.data;
        commit('getReservationData', data);
        commit('loadingState', false);
      } catch (err) {
        console.log(err);
        commit('setCalendar', false);
      }
    },
    /**
     * ストレージ保存処理
     */
    setStorage({ dispatch, getters }) {
      dispatch('storage/setStorage', {
        key: 'reserveCullender',
        val: {
          day: getters.currentDate.day,
          month: getters.currentDate.month,
          year: getters.currentDate.year,
          count: getters.currentDate.count
        }
      });
    },
    /**
     * カレンダー初期表示処理
     */
    getReservationDataInit({ commit, dispatch, getters }) {
      try {
        dispatch('storage/getStorage', 'reserveCullender');
        const storage = JSON.parse(
          window.sessionStorage.getItem('reserveCullender')
        );
        commit('setInitDate', getters.specificationDays(1));
        commit('setRequestParams', storage.day);
        commit('setYear', storage.year);
        commit('setMonth', storage.month);
        commit('setDay', storage.day);
        commit('setCount', storage.count);
        dispatch('requestAPI');
      } catch {
        commit('setInitDate', getters.specificationDays(1));
        commit('setRequestParams', getters.specificationDays(1));
        commit('setYear', getters.getInitYear);
        commit('setMonth', getters.getInitMonth);
        commit('setDay', getters.specificationDays(1));
        dispatch('requestAPI');
      }
    },
    /**
     * 次週のカレンダーを取得する
     */
    getNextWeek({ commit, dispatch, getters }) {
      commit('loadingState', true);
      commit('setCount', 7);
      commit('setDay', getters.specificationDays(7, getters.currentDate.day));
      commit('setMonth', getters.getCurrentMonth);
      commit('setYear', getters.getCurrentYear);
      commit('setRequestParams', getters.currentDate.day);
      dispatch('setStorage');
      dispatch('requestAPI');
    },
    /**
     * 前週のカレンダーを取得する
     */
    getPrevWeek({ commit, dispatch, getters }) {
      commit('loadingState', true);
      // 前週が開始日を含んだ場合
      if (getters.currentDate.count <= 7) {
        commit('setCount', -getters.currentDate.count);
        commit('setDay', getters.specificationDays(1));
        commit('setMonth', getters.getCurrentMonth);
        commit('setRequestParams', getters.initDate);
      } else {
        commit('setCount', -7);
        commit(
          'setDay',
          getters.specificationDays(-7, getters.currentDate.day)
        );
        // 現在の月を設定
        commit('setMonth', getters.getCurrentMonth);
        // 現在の年を設定
        commit('setYear', getters.getCurrentYear);
        commit('setRequestParams', getters.currentDate.day);
      }
      dispatch('setStorage');
      dispatch('requestAPI');
    },
    /**
     * 翌月のカレンダーを取得する
     */
    getNextMonth({ commit, dispatch, getters }) {
      commit('loadingState', true);
      // 差分日
      commit(
        'setCount',
        moment(getters.currentDate.day).daysInMonth() -
          moment(getters.currentDate.day).date() +
          1
      );
      // 翌月の月初を設定する
      commit(
        'setDay',
        getters.specificationMonth(1, getters.currentDate.month)
      );
      // 現在の月をプラス1する
      commit('setMonth', getters.getNextMonth);
      // 現在の年を設定
      commit('setYear', getters.getCurrentYear);
      // 月初をリクエストする
      commit('setRequestParams', getters.currentDate.day);
      dispatch('setStorage');
      dispatch('requestAPI');
    },
    /**
     * 前月のカレンダーを取得する
     */
    getPrevMonth({ commit, dispatch, getters }) {
      commit('loadingState', true);
      // 現在の月をマイナス1する
      commit('setMonth', getters.getPrevMonth);

      // 開始日の年＆前月が開始日を含んだ場合
      if (
        getters.currentDate.year === getters.getInitYear &&
        getters.currentDate.month <= getters.getInitMonth
      ) {
        commit('setCount', -getters.currentDate.count);
        commit('setDay', getters.specificationDays(1));
        commit('setMonth', getters.getCurrentMonth);
        commit('setRequestParams', getters.initDate);
      }
      // 開始日の年ではない＆前月が開始日の月よりも前の場合
      else if (
        getters.currentDate.year !== getters.getInitYear &&
        getters.currentDate.month <= getters.getInitMonth
      ) {
        if (getters.currentDate.month === -1) {
          const endOfPreviousYear = moment()
            .add(getters.currentDate.year, -1)
            .endOf('year')
            .format('YYYYMMDD');
          commit(
            'setDay',
            getters.specificationMonth(0, moment(endOfPreviousYear).month())
          );
          commit('setMonth', moment(endOfPreviousYear).month());
          commit('setYear', moment(endOfPreviousYear).year());
        }
        // 差分日
        commit('setCount', -moment(getters.currentDate.day).daysInMonth());
        // 月初をリクエストする
        commit('setRequestParams', getters.currentDate.day);
      } else {
        // 前月の月初日を設定する
        commit(
          'setDay',
          getters.specificationMonth(0, getters.currentDate.month)
        );
        // 差分日
        commit('setCount', -moment(getters.currentDate.day).daysInMonth());
        // 月初をリクエストする
        commit('setRequestParams', getters.currentDate.day);
      }
      dispatch('setStorage');
      dispatch('requestAPI');
      commit('setYear', getters.getCurrentYear);
    }
  },
  getters: {
    /**
     * ローディング状態
     * @return {Boolean}
     */
    loading: (state) => {
      return state.loading;
    },
    calendar: (state) => {
      return state.calendar;
    },
    initDate: (state) => {
      return state.initDate;
    },
    /**
     * 日付情報
     * @return {Object}
     */
    currentDate: (state) => {
      return state.currentDate;
    },
    /**
     * 日付を加算・減算し、取得する
     * @return {string} yyyymmdd
     */
    specificationDays: () => (day, specification) => {
      const dt = specification
        ? new Date(specification.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3'))
        : new Date();
      let format = 'YYYYMMDD';
      dt.setDate(dt.getDate() + day);
      format = format.replace(/YYYY/gi, dt.getFullYear());
      format = format.replace(/MM/gi, ('0' + (dt.getMonth() + 1)).slice(-2));
      format = format.replace(/DD/gi, ('0' + dt.getDate()).slice(-2));

      return format;
    },
    /**
     * 年の初期を取得する
     * @return {String}
     */
    getInitYear: () => {
      return moment().year();
    },
    /**
     * 月の初期を取得する
     * @return {String}
     */
    getInitMonth: () => {
      return moment().month();
    },
    /**
     * 現在の月を取得する
     * @return {String}
     */
    getCurrentMonth: (state, getters) => {
      const month = moment(getters.currentDate.day).month();
      return month;
    },
    /**
     * 現在の年を取得する
     * @return {String}
     */
    getCurrentYear: (state, getters) => {
      const year = moment(getters.currentDate.day).year();
      return year;
    },
    /**
     * 翌月を取得する
     * @return {String}
     */
    getNextMonth: (state, getters) => {
      const month = moment()
        .month(getters.currentDate.month)
        .format('YYYY/MM/DD');
      return moment(month).month() + 1;
    },
    /**
     * 前月を取得する
     * @return {String}
     */
    getPrevMonth: (state, getters) => {
      const month = moment()
        .month(getters.currentDate.month)
        .format('YYYY/MM/DD');
      return moment(month).month() - 1;
    },
    /**
     * 翌月・前月の初日を取得する
     * @param {String} month 1 or -1
     * @return {Object} yyyymmdd
     */
    specificationMonth: (state, getters) => (month, currentMonth) => {
      const specificationMonth = moment()
        .month(currentMonth)
        .add('month', month)
        .startOf('month')
        .format('YYYYMMDD');
      return specificationMonth;
    },
    /**
     * 予約日を取得する
     * @return {String} yyyymmdd
     */
    getReservationDays: (state, getters) => {
      const obj = state.reservationData['10:00～11:30'];
      if (getters.typeof(obj) === 'object') return Object.keys(obj);
    },
    /**
     * 予約日枠を取得する
     * @return {String} xx:xx～xx:xx
     */
    getReservationFrame: (state) => {
      return Object.keys(state.reservationData);
    },
    /**
     * 各予約枠のデータを取得する
     * @param {String|Number} id 予約枠
     * @return {Object}
     */
    reservationData: (state, getters) => (id) => {
      const obj = state.reservationData[String(id)];
      if (getters.typeof(obj) === 'object') return obj;
    },
    /**
     * 曜日を取得する
     * @param {String} date 日付
     * @return {String} dayOfWeek
     */
    getDayOfWeek: () => (date) => {
      const dt = new Date(date);
      const weakData = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeak = weakData[dt.getDay()];
      return dayOfWeak;
    },
    /**
     * 日付のフォーマット
     * @param {String} date 日付
     * @return {String} yyyy/mm/dd (dayOfWeek)
     */
    formatDate: (state, getters) => (date) => {
      const day = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
      const result = day.split('/').filter((e) => {
        return !e[2];
      });
      return `${result.join('/')} (${getters.getDayOfWeek(day)})`;
    },
    /**
     * 在庫判定
     * @param {String} symbol
     * @return {String}
     */
    inventoryJudgment: () => (symbol) => {
      switch (symbol) {
        case '◎':
          return 'icn-circle2';
        case '〇':
          return 'icn-circle';
        case '▲':
          return 'icn-triangle';
        case '×':
          return 'icn-cross';
        default:
          return;
      }
    },
    /**
     * 型判定
     * @param {Any} obj
     * @return {String}
     */
    typeof: () => (obj) => {
      const toString = Object.prototype.toString;
      return toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase();
    },
    /**
     * ボタン制御
     * @return {Boolean}
     */
    disabledPrevWeek: (state) => {
      return state.currentDate.count <= 0 ? true : false;
    },
    disabledPrevMonth: (state) => {
      return state.currentDate.count <= 0 ? true : false;
    },
    disabledNextWeek: (state, getters) => {
      return getters.currentDate.count +
        moment(getters.currentDate.day).daysInMonth() -
        moment(getters.currentDate.day).date() +
        1 >
        180
        ? true
        : false;
    },
    disabledNextMonth: (state, getters) => {
      return getters.currentDate.count +
        moment(getters.currentDate.day).daysInMonth() -
        moment(getters.currentDate.day).date() +
        1 >
        180
        ? true
        : false;
    }
  },
  modules: {
    storage
  },
  strict: debug
});
