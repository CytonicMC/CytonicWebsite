<template>
  <div v-if="this.success" class="flex items-center justify-center">
    <div class="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-[50vw] mt-[30vh]">
      <h2 class="text-2xl font-bold mb-4">Password Reset</h2>
      <form @submit.prevent>
        <div class="mb-4">
          <label class="block text-sm font-medium" for="password">New Password</label>
          <input id="password" v-model="password"
                 class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                 placeholder="Enter new password"
                 type="password">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium" for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" v-model="confirmPassword"
                 class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-400 dark:bg-gray-800 dark:text-white"
                 placeholder="Confirm new password"
                 type="password">
        </div>
        <button
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            type="submit" @click="resetPassword">
          Reset Password
        </button>
      </form>
    </div>
  </div>
  <div v-else class="flex justify-center flex-col items-center">
    <h1 class="text-center font-title text-white text-5xl mt-[20vh]">
      403; Forbidden
    </h1>
    <p class="text-gray-400 mx-5 text-center max-w-[30vw] m-4">You are not authorized to change a password right now. If
      you belive this to be an error, contact support.</p>
    <strong class="text-gray-400">ERR: {{ err }}</strong>
  </div>
</template>
<script>
import {useToast} from "vue-toastification";
import axios from "axios";

export default {
  name: "PasswordReset",
  data() {
    return {
      success: false,
      id: 0,
      token: null,
      password: "",
      confirmPassword: "",
      err: "UNKNOWN, CONTACT SUPPORT.",
    }
  },
  methods: {
    resetPassword() {
      // Implement password reset logic here
      if (this.password === this.confirmPassword) {
        if (this.password.length < 6) {
          useToast().error("Password must be at least 6 characters long!")
          return;
        }
        // Passwords match, reset password and redirect to login page
        const data = {
          password: this.password,
          reset_password_token: this.token,
          password_confirmation: this.confirmPassword,
        }
        axios.put('/auth/passwords/' + this.id, data)
            .then(() => {
              useToast().success("Password successfully changed! Please log in again.");
              this.$router.push({name: 'login', query: {redirect: 'password_reset_success'}});
            })
            .catch(() => {
              console.error("Error :(")
            });
      } else {
        // Passwords do not match, display error message
        useToast().error("Passwords do not match!")
      }
    }
  },
  mounted() {
    this.token = this.$route.query.reset_token;
    this.id = this.$route.query.id;
    if (this.$route.query.redirect) {
      // these always indicate an error
      const data = this.$route.query.redirect;
      if (data === 'wrong_token') {
        this.err = "WRONG TOKEN"
        this.success = false; // Show the success message without token
        useToast().error("The provided reset token exists, but has already been used. You will need to reset your password again.")
        return;
      }
      if (data === 'expired_token') {
        this.err = "EXPIRED TOKEN"
        this.success = false; // Show the success message without token
        useToast().error("The provided reset token exists, but has expired. You will need to reset your password again.")
        return;
      }
      if (data === 'invalid_link') {
        this.err = "INVALID LINK"
        this.success = false; // Show the success message without token
        useToast().error("For some reason the link is invalid. Please contact support if this issue persists.")
        return;
      }

      if (data === 'already_changed') {
        this.err = "ALREADY CHANGED"
        this.success = false; // Show the success message without token
        useToast().warning("Your password was already changed with this reset token. Please try to reset your password again.")
        return;
      }
    }


    if (!this.token) {
      useToast().error("Your token is invalid! Please go back to your email and click the link again. If this issue persists, please contact support.");
      this.err = "NO TOKEN"
      this.success = false; // Show the success message without token
      return; // Don't attempt to fetch user data if token is invalid or missing'
    }

    if (!this.id) {
      useToast().error("No User ID Found! Please go back to your email and click the link again. If this issue persists, please contact support.");
      this.err = "NO USER ID"
      this.success = false; // Show the success message without id
      return; // Don't attempt to fetch user data if id is invalid or missing'
    }

    if (this.id <= 0) { // doesn't exist, or is invalid
      useToast().error("Your user ID is invalid! Please go back to your email and click the link again. If this issue persists, please contact support.");
      this.err = "INVALID USER ID"
      this.success = false; // Show the success message without id
      return; // Don't attempt to fetch user data if id is invalid or missing'
    }

    this.success = true; // Show the success message with token
    useToast().success("Success! Enter your new password to change it!")

  }
}
</script>
