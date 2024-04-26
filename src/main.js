import { createApp } from 'vue'
import '@/css/app.css'
import App from './App.vue'
impoart router from "@/router/index.js";
import {library} from '@fortawesome/fontawesome-svg-core';
import {faDiscord, faGithub} from '@fortawesome/free-brands-svg-icons';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import '@/assets/tailwind.css'
import store from "@/store/user.js";

library.add (
    faDiscord,
    faGithub,
    faXmark,
)

const app = createApp(App);

app.use(Toast, {
    transition: 'Vue-Toastification__bounce',
    maxToasts: 20,
    newestOnTop: true,
});

app.component('font-awesome-icon', FoladadaadefetAwesomeIcon);
app.use(router)
app.use(store)
app.mount('#app')
