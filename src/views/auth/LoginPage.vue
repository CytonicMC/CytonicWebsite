<template>
  <div class="flex justify-center items-center mt-[25vh] bg-black">
    <form class="bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md">
      <h1 class="text-center text-gray-300 font-title text-xl">Log In</h1>
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-bold mb-2" for="email">
          Email
        </label>
        <input v-model="email"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-800"
               id="email" type="email" placeholder="Email">
      </div>
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input v-model="password"
               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-800"
               id="password" type="password" placeholder="Password">
      </div>
      <div class="flex items-center justify-between">
        <button @click.prevent="login"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button">
          Login
        </button>
      </div>
      <div class="italic text-gray-500 mt-4">
        <p>Don't have an account?
          <router-link to="/auth/register" class="underline text-blue-500">Register</router-link>
        </p>
        <p>Forgot your password?
          <router-link to="/auth/request-password-reset" class="underline text-blue-500">Reset It</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import {useToast} from "vue-toastification";
import axios from "@/api.js";
import {deleteCookie, getCookie} from "@/Utils.js";

export default {
  data() {
    return {
      email: '',
      password: '',
      when_done: null,
    };
  },
  methods: {
    setAuthTokenCookie(token) {
      const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const cookieValue = `${encodeURIComponent(token)}; expires=${expirationDate.toUTCString()}; path=/`;
      document.cookie = `authToken=${cookieValue}; SameSite=Strict; Secure`;
    },
    login() {
      if (!getCookie('cytonic_accepted_cookies')) {
        useToast().error('You must consent to cookies to log in.', {
          position: 'top-right',
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          hideProgressBar: false,
          loseButton: 'button',
          icon: false,
          rtl: false,
        });
        return;
      }
      if (!this.email || !this.password) {
        useToast().error('Email and password are required.', {
          position: 'top-right',
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          hideProgressBar: false,
          loseButton: 'button',
          icon: false,
          rtl: false,
        })
      }
      const loginData = {
        user: {
          email: this.email,
          password: this.password,
        },
      };
      axios.post('login', loginData)
          .then((response) => {
            this.$store.commit('set', response.data.status.data.user);
            this.setAuthTokenCookie(response.headers.getAuthorization());
            if (this.when_done) {
              this.$router.push(this.when_done);
              return;
            }
            this.$router.push('/');
            useToast().success('You have successfully logged in!', {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: true,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: true,
              rtl: false,
            });
            // update the header component
            this.componentKey += 1;
          })
          .catch((error) => {
            console.error(error.response.data)
            if (!error || !error.response) return;
            if (error.code === 'ERR_NETWORK') {
              useToast().error('Connection refused. The server may be down or unreachable. Please try again later.', {
                position: 'top-right',
                timeout: 5000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
            } else if (error.response.status === 500) {
              useToast().error('Internal Server Error!', {
                position: 'top-right',
                timeout: 5000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: false,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
            } else if (error.response.data.error === 'You have to confirm your email address before continuing.') {
              useToast().error('You must verify your email before logging in!', {
                position: 'top-right',
                timeout: 10000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                howCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
              this.$router.push(`/registered?email=${this.email}`);
            } else if (error.response.data.error === 'Invalid Email or password.') {
              useToast().error('Invalid email or password!', {
                position: 'top-right',
                timeout: 10000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                howCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
            } else if (error.response.data === 'Signature has expired' || error.response.data === 'revoked token') {
              deleteCookie("authToken");
              useToast().error('Whoops! It looks like your token has expired. Please try again.', {
                position: 'top-right',
                timeout: 10000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                howCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
            } else if (error.response.data.message === 'This user has been terminated for violating the Term of Service or User Conduct Agreement.') {
              useToast().error('Your account has been terminated for violating the Term of Service or User Conduct Agreement. Please check your email for more information reguarding your account\'s termination.', {
                position: 'top-right',
                timeout: 100000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                howCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
            } else if (error.response.data === 'nil user') {
              deleteCookie("authToken");
              useToast().error('Whoops! It looks like your auth cookie was desynced with the server. Please log in again.', {
                position: 'top-right',
                timeout: 10000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                howCloseButtonOnHover: false,
                hideProgressBar: false,
                loseButton: 'button',
                icon: false,
                rtl: false,
              });
            } else {
              useToast().error('An error occoured! Please check the browser console, and report this issue!', {
                position: 'top-right',
                timeout: 5000,
                closeOnClick: true,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: false,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
            }
          });
    }
  },
  mounted() {
    // Calculate empty space after the DOM elements are mounted
    if (this.$route.query.redirect) {
      if (this.$route.query.redirect === 'confirmed_email') {
        useToast().success('Your email was successfully confirmed! You may log in now.', {
          position: 'top-right',
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          hideProgressBar: true,
          closeButton: 'button',
          icon: true,
          rtl: false,
        });
      } else if (this.$route.query.redirect === 'invalid_link') {
        useToast().error('This email has either already been verified, or the link is invalid.', {
          position: 'top-right',
          closeOnClick: true,
          pauseOnFocusLoss: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          hideProgressBar: true,
          closeButton: 'button',
          icon: true,
          rtl: false,
        });
      }
    }
    if (this.$route.query.when_done) {
      this.when_done = this.$route.query.when_done;
    }
  },
}
</script>
