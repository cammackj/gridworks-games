import axios from 'axios'
import vue from 'vue'
import vuex from 'vuex'
import router from '../router'

var production = !window.location.host.includes('localhost');
var baseUrl = production ? '//gridgames.herokuapp.com/' : '//localhost:3000/';

let api = axios.create({
  baseURL: baseUrl + 'api/',
  timeout: 4000,
  withCredentials: true
})

let auth = axios.create({
  baseURL: baseUrl,
  timeout: 4000,
  withCredentials: true
})

vue.use(vuex)

var store = new vuex.Store({

  state: {
    activeUser: {

    },
    activeWins: null,
    activeGames: null,
    loggedIn: null,
    leaderBoard: null,


  },

  mutations: {
    setUser(state, data) {
      state.activeGames = data.gamesPlayed
      state.activeWins = data.wins
      state.activeUser = data || {}
    },

    setLoggedIn(state, data) {
      state.loggedIn = data
    },

    setBoard(state, data) {
      state.leaderBoard = data
    },

    handleError(state, err) {
      state.error = err
    }

  },

  actions: {

    getUser({ commit, dispatch }, user) {
      api('userwins/' + user._id)
        .then(res => {
          commit('setUser', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    setUser(data) {
      commit('setUser', data)
    },

    getLeaderBoard({ commit, dispatch }) {
      api('leaderboards')
        .then(res => {
          var sorted = res.data.data.sort(function (a, b) {
            return b.wins - a.wins;
          });
          sorted.splice(5)
          commit('setBoard', sorted)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    getCurrentLeaderBoard() {
      return this.$store.state.leaderBoard;
    },

    updateUser({ commit, dispatch }, user) {
      api.put('userwins/' + user._id, user)
        .then(res => {
          //console.log('updatedUser', res)
          dispatch('authenticate')
          //commit('setUser', res.data.data)
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    register({ commit, dispatch }, accountUser) {
      auth.post('register', accountUser)
        .then(res => {
          commit('setUser', res.data.data)
          if (!res.data.data) {
            router.push('/Home');
          }
        })
        .catch(err => {
          commit('handleError', err)
        })
    },


    login({ commit, dispatch }, accountUser) {
      auth.post('login', accountUser)
        .then(res => {
          commit('setUser', res.data.data)
          commit('setLoggedIn', true)
          if (!res.data.data) {
            router.push('/Home');
          }
        })
        .catch(err => {
          commit('handleError', err)
        })
    },

    logout({ commit, dispatch }, credentials) {
      auth.delete('/logout')
        .then(res => {
          commit('setLoggedIn', false)
        }).catch(err => {
          commit('handleError', err)
        })
    },

    authenticate({ commit, dispatch }) {
      auth('/authenticate')
        .then(res => {
          if (res.data.data._id) {
            commit('setLoggedIn', true)
            commit('setUser', res.data.data)
          } else {
            commit('setLoggedIn', false)
            console.log('No session found!')
          }
        }).catch(err => {
          commit('handleError', err)
          commit('setLoggedIn', false)
        })
    },

    handleError({ commit, dispatch }, err) {
      commit('handleError', err)
    }
  }


})

export default store