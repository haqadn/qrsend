<template>
  <div class="container my-5" id="app">
    <v-container>
      <v-row>
        <v-col md="4" :offset-md="messages.length === 0 && presence.count <= 1 ? 4 : 0">
          <v-card v-if="presence.count <= 1" class="qr-container" dark color="#303f9f">
            <vue-qrcode :value="url" :scale="20"></vue-qrcode>
            <v-card-title class="headline">Scan this code to start sharing</v-card-title>
            <v-card-subtitle>Connect another device by scanning this code and start sharing data</v-card-subtitle>
          </v-card>
          <v-card v-else>
            <v-card-title>You are {{ name }}</v-card-title>
            <v-card-subtitle>You are connected with {{ connectedDevices }}</v-card-subtitle>
          </v-card>
        </v-col>
        <v-col>
          <div v-if="presence.count > 1" class="mb-5">
            <h1>Type and send!</h1>
            <form @submit.prevent="sendMessage">
              <v-textarea
                      auto-grow
                      autofocus
                      rows="1"
                      v-model="newMessage"
                      @keyup.alt.enter="sendMessage"
                      hint="Alt+Enter to send"
              ></v-textarea>
              <v-btn class="mt-2" color="primary" type="submit">Send</v-btn>
            </form>
          </div>

          <v-card
                  v-if="messages.length"
                  class="mx-auto"
                  tile
          >
            <v-card-title>Messages</v-card-title>
            <v-list-item two-line v-for="(message, i) in messages" :key="i">
              <v-list-item-content>
                <v-list-item-title>{{ message.sender }}</v-list-item-title>
                <v-list-item-subtitle class="text--style-pre">{{ message.text }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'
import VueQrcode from 'vue-qrcode'

export default {
  components: {
    VueQrcode,
  },
  data: () => ({
    newMessage: '',
    messages: [],
    newFile: null,
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
    },
    connectedDevices() {
      return this.presence.users.filter((user) => user !== this.name).join(', ');
    }
  }
}
</script>

<style>
  .qr-container img {
    max-width: calc( 100% - 40px);
    margin: 20px;
  }

  .text--style-pre {
    white-space: pre !important;
  }
</style>
