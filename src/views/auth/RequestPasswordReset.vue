<template>
  <div class="password-reset max-w-sm mx-auto p-4 mt-[10vh] border rounded-lg bg-gray-800 text-white border-slate-700">
    <h2 class="text-2xl mb-4">Reset Password</h2>
    <form @submit.prevent="requestPasswordReset">
      <div class="mb-4">
        <label class="block mb-2" for="email">Email:</label>
        <input id="email" v-model="email"
               class="w-full px-3 py-2 border rounded bg-gray-700 text-white focus:outline-none focus:border-blue-500"
               required
               type="email"/>
      </div>
      <button class="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white" type="submit">Send Reset Link
      </button>
    </form>
  </div>
</template>

<script>

import axios from "@/api.js";
import {useToast} from "vue-toastification";

export default {
  data() {
    return {
      email: '',
    };
  },
  methods: {
    requestPasswordReset() {
      axios.post('/auth/passwords', {email: this.email})
          .then(() => {
            useToast().info("A link has been sent to reset password. Please check your email and follow the instructions from there.")
            this.email = ""
          }).catch(reason => {
            useToast().error(reason.response.data);
      });
    }
  }
};
</script>

