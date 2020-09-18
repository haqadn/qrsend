<template>
  <div class="container my-5" id="app">
    <template v-if="presence.count <= 1">
      <div class="text-center">
        <vue-qrcode :value="url" :scale="10"></vue-qrcode>
        <div class="h3">Scan this code with your phone to start.</div>
      </div>
    </template>
    <template v-else>
      <h1 class="mb-5">Enjoy sharing!</h1>
      <form @submit.prevent="sendMessage">
        <div class="input-group mb-3">
          <input type="text" v-model="newMessage" class="form-control" placeholder="New message">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="submit" id="button-addon2">Send</button>
          </div>
        </div>
      </form>

      <ul v-cloak class="list-group">
        <li class="list-group-item" v-for="(message, i) in messages" :key="i">{{ message }}</li>
      </ul>
    </template>
  </div>
</template>

<script>
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import VueQrcode from 'vue-qrcode'

export default {
  components: {
    VueQrcode,
  },
  el: '#app',
  data: () => ({
    newMessage: '',
    messages: [],
    name: '',
    presence: {
      count: 1,
      users: []
    },
  }),
  sockets: {
    connect: function () {
      this.name = this.generateName();

      this.$socket.emit('joinRoom', {
        room: this.$route.params.uuid,
        user: this.name
      });
    },
    message: function (data) {
      this.messages.unshift(data);
    },
    presence: function (presence) {
      this.presence = presence;
    }
  },
  methods: {
    sendMessage() {
      if(this.newMessage === '') return;
      this.$socket.emit('message', this.newMessage);
      this.newMessage = '';
    },
    generateName() {
      return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        style: 'capital',
        separator: ' '
      });
    }
  },
  computed: {
    url() {
      return window.location.href;
    }
  }
}
</script>
