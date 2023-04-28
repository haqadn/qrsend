<template>
  <div class="container my-5" id="app">
    <v-container>
      <v-row>
        <v-col cols="12" sm="4" :offset-md="messages.length === 0 && presence.count <= 1 ? 4 : 0">
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
        <v-col cols="12" sm="8">
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
              <v-file-input show-size label="File input" v-model="newFile"></v-file-input>
              <v-btn class="mt-2" color="primary" type="submit">Send</v-btn>
            </form>
          </div>

          <v-card
                  v-if="messages.length"
                  class="mx-auto"
                  tile
          >
            <v-card-title>Messages</v-card-title>
            <v-progress-linear v-if="binaryComing" value="15"></v-progress-linear>
            <v-list-item two-line v-for="(message, i) in messages" :key="i">
              <v-list-item-content>
                <v-list-item-title>{{ message.text }}</v-list-item-title>

                <v-list-item-subtitle v-if="message.attachment !== null">
                  <v-btn dark color="blue-grey" :href="getDownloadLink(message.attachment)" target="_blank" :download="message.attachment.name">
                    <v-icon color="grey lighten-1">fas fa-download</v-icon>
                    {{message.attachment.name}}
                  </v-btn>
                </v-list-item-subtitle>
                
                <v-list-item-subtitle class="text--style-pre text-right">{{ message.sender == name ? 'You' : message.sender }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import VueQrcode from 'vue-qrcode';
import mime from 'mime';

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
    binaryComing: false
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
    },
    binaryComing: function (status) {
      this.binaryComing = status;
    }
  },
  methods: {
    sendMessage() {
      if(this.newMessage === '' && this.newFile === null) return;
      let message = {
        text: this.newMessage,
        attachment: this.newFile === null ? null : {
          name: this.newFile.name,
          size: this.newFile.size,
          data: this.newFile,
          type: mime.getType(this.newFile.name)
        }
      };
      this.$socket.emit('message', message);

      this.messages.unshift({...message, sender: this.name});

      this.newFile = null;
      this.newMessage = '';
    },
    generateName() {
      return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        style: 'capital',
        separator: ' '
      });
    },
    getDownloadLink(attachment) {
      if(attachment === null) return '';
      let blob = new Blob([attachment.data], {type: attachment.type});
      return URL.createObjectURL(blob);
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
  * {
    font-family: sans-serif;
  }
  .qr-container img {
    max-width: calc( 100% - 40px);
    margin: 20px;
  }

  .text--style-pre {
    white-space: pre !important;
  }
</style>
