<template>
  <div v-if="this.$store.state.user && adminAccess().includes(this.$store.state.user.role)" class="text-white">
    <div class="bg-gray-800 p-2 rounded items-center h-[9vh]">
      <div class="flex">
        <h1 class="text-3xl font-title max-sm:ml-10">Website User List</h1>
        <button class="mx-4" @click="refreshData">
          <img alt="Refresh" src="@/assets/refresh.svg">
        </button>
      </div>
      <div class="flex-row flex">
        <div class="flex-row flex">
          <p class="mr-3">Filter: </p>
          <div class="relative">
            <select v-model="selected_filter"
                    class="block appearance-none w-full bg-gray-900 border border-gray-800 text-white px-4 pr-8 rounded-lg focus:outline-none focus:bg-gray-800"
                    @change="handleFilterChange">
              <option value="none">None</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="helper">Helper</option>
              <option value="user">User</option>
              <option value="terminated">Terminated</option>
              <option value="muted">Muted</option>
              <option value="banned">Banned</option>
              <!-- todo: add linked filter-->
            </select>
            <div class="absolute inset-y-0 top-[0.56vh] right-0 items-center pr-3 pointer-events-none text-white">
              <svg class="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12l-6-6h12z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="flex-row flex mx-3">
          <p class="mr-3">Sort: </p>
          <div class="relative">
            <select v-model="selected_sort"
                    class="block appearance-none w-full bg-gray-900 border border-gray-800 text-white px-4 pr-8 rounded-lg focus:outline-none focus:bg-gray-800"
                    @change="handleSortChange">
              <option value="none">None</option>
              <option value="id">By ID</option>
              <option value="username">By Username</option>
              <option value="role">By Role</option>
              <option value="creation">By Creation Date</option>
              <option value="update">By Update Date</option>
            </select>
            <div class="absolute inset-y-0 top-[0.56vh] right-0 items-center pr-3 pointer-events-none text-white">
              <svg class="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12l-6-6h12z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="modal" @enter="enter" @leave="leave" @before-enter="beforeEnter">
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
        <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full relative">
          <!-- Close button -->
          <button class="top-0 absolute right-0 mt-4 mr-4 text-gray-400"
                  @click="showModal = false; modal_button = null">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>
          <img v-if="modalUser.avatar_url" :alt="modalUser.name + '\'s Avatar'" :src="modalUser.avatar_url"
               class="max-w-24 absolute rounded-2xl right-[4vw] aspect-square object-cover">
          <img v-else :alt="modalUser.name + '\'s Avatar'" class="max-w-24 max-h-24 absolute right-[3.5vw] m-5"
               src="/favicon.svg">
          <!-- User data -->
          <div class="text-white">
            <p>Name: {{ modalUser.name }}</p>
            <p>ID: {{ modalUser.id }}</p>
            <p>Email: {{ modalUser.email }}</p>
            <p>Role: {{ modalUser.role }}</p>
            <p>Confirmed: {{ modalUser.confirmed_at !== null }}</p>
            <p v-if="modalUser.linked">
              MC: {{ modalUser.uuid }}
              <br>
              IGN: {{ this.mcUsername }}
              <!-- This is probably cheating -->
              {{ getMcName(modalUser.uuid) }}
            </p>
            <p v-else> This account is not linked</p>
            <hr class="m-3">
            <p>Created: {{ formatDateFull(modalUser.created_at) }}</p>
            <p>Updated: {{ formatDateFull(modalUser.updated_at) }}</p>
          </div>

          <!-- Action buttons -->
          <div v-if="modal_button === null" class="mt-4 flex flex-wrap">
            <button class="bg-green-600 text-white px-4 py-2 rounded m-2" @click="modal_button = 'change_roles'">
              Change Role
            </button>
            <button v-if="modalUser.avatar_url" class="bg-red-600 text-white px-4 py-2 rounded m-2"
                    @click="modal_button = 'remove_avatar'">
              Delete Avatar
            </button>
            <button v-if="modalUser.confirmed_at === null" class="bg-blue-600 text-white px-4 py-2 rounded m-2"
                    @click="sendConfirmEmail(modalUser)">
              Resend Confirmation
            </button>
            <button v-if="modalUser.terminated" class="bg-emerald-500 text-white px-4 py-2 rounded m-2"
                    @click="restoreUser(modalUser)">Restore Account
            </button>
            <button v-else class="bg-red-600 text-white px-4 py-2 rounded m-2"
                    @click="modal_button = 'terminate_user'">Terminate Account
            </button>
            <button v-if="!modalUser.muted" class="bg-yellow-500-removeme bg-blue-500 text-white px-4 py-2 rounded m-2"
                    @click="muteUser(modalUser.id)">Mute User
            </button>
            <button v-if="modalUser.muted" class="bg-yellow-500-removeme bg-indigo-500 text-white px-4 py-2 rounded m-2"
                    @click="unmuteUser(modalUser.id)">Unmute User
            </button>
            <!-- Add more buttons for other actions as needed -->
          </div>
          <div v-if="modal_button === 'change_roles'" class="mt-8 relative">
            <button class="absolute top-[-2.5vh] left-[-2vw]" @click="modal_button = null">
              <img alt="<-" src="@/assets/back.svg">
            </button>
            <div class="flex justify-between">
              <button class="bg-[#3498db] text-white px-4 py-2 rounded mr-2" @click="changeRole(modalUser, 'user')">
                User
              </button>
              <button class="bg-[#27ae60] text-white px-4 py-2 rounded mr-2" @click="changeRole(modalUser, 'helper')">
                Helper
              </button>
              <button class="bg-[#f39c12] text-white px-4 py-2 rounded mr-2"
                      @click="changeRole(modalUser, 'moderator')">Moderator
              </button>
              <button class="bg-[#c0392b] text-white px-4 py-2 rounded mr-2" @click="changeRole(modalUser, 'admin')">
                Admin
              </button>
            </div>
          </div>
          <div v-if="modal_button === 'terminate_user'" class="mt-8 relative">
            <button class="absolute top-[-2.5vh] left-[-2vw]" @click="modal_button = null">
              <svg height="22" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#fff"/>
              </svg>
            </button>
            <div class="rounded-2xl bg-gray-600 p-4">
              <label class="block text-gray-300 text-sm font-bold mb-1" for="reason">
                Termination Reason
              </label>
              <textarea id="reason"
                        v-model="termination_reason"
                        class="min-h-fit shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 mb-4"
                        placeholder="Reason" type="text"/>
              <button class="bg-red-500 text-white px-4 py-2 rounded self-center" @click="terminateUser(modalUser)">
                Terminate {{ modalUser.name }}
              </button>
            </div>
          </div>
          <div v-if="modal_button === 'remove_avatar'" class="mt-8 relative">
            <button class="absolute top-[-2.5vh] left-[-2vw]" @click="modal_button = null">
              <svg height="22" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#fff"/>
              </svg>
            </button>
            <div class="rounded-2xl bg-gray-600 p-4 justify-center flex">
              <button class="bg-red-500 text-white px-4 py-2 rounded self-center" @click="deleteAvatar(modalUser)">
                Remove {{ modalUser.name }}'s Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="">
      <div v-if="userData != null && status === 'done'" class="overflow-y-auto max-h-[79vh] p-2">
        <div v-for="user in userData" :key="user.id" class="bg-gray-800 rounded p-2 flex m-2"
             @click="showUserModal(user)">
          <div class="flex justify-center items-center mr-3">
            <h1 class="text-center ">ID: {{ user.id }} </h1>
          </div>
          <img v-if="user.avatar_url !== null" :alt="user.name + '\'s avatar'"
               :src="user.avatar_url"
               class="max-h-12 min-h-12 min-w-12 max-w-12 mr-2 rounded-2xl aspect-square object-cover">
          <img v-else alt="Default Avatar" class="max-h-12 min-h-12 min-w-12 max-w-12 mr-2" src="/favicon.svg">
          <div class="ml-2 flex-grow">
            <h1 v-if="user.terminated" class="font-semibold my-0 font-title"><span class="line-through">{{
                user.name
              }} </span><span class="no-underline mx-2 text-red-600">TERMINATED</span></h1>
            <h1 v-else class="font-semibold my-0 font-title"> {{ user.name }}</h1>
            <h1 v-if="user.confirmed_at === null" class="font-semibold my-0 font-title text-gray-500 italic">
              (Unconfirmed)</h1>

            <p class="italic text-gray-400"> {{ user.role }}</p>
          </div>
          <div class="mx-3">
            <h1>Created: {{ formatDate(user.created_at) }}</h1>
            <h1>Updated: {{ formatDate(user.updated_at) }}</h1>
          </div>
        </div>

      </div>
      <div v-else class="flex justify-center mt-10">
        <img alt="Loading ..." src="@/assets/loading.svg">
      </div>
    </div>
  </div>
  <MustLogIn v-else/>
</template>

<script>
import MustLogIn from "@/components/MustLogIn.vue";
import axios from "@/api.js";
import {useToast} from "vue-toastification";
import * as Utils from "@/Utils.js";
import {adminAccess} from "@/Utils.js";

const roleOrder = {
  owner: 1,
  admin: 2,
  moderator: 3,
  helper: 4,
  user: 5
};

export default {
  name: "Users",
  components: {MustLogIn},
  data() {
    return {
      noMutUserData: null,
      status: 'loading',
      userData: null,
      modalUser: null,
      showModal: false,
      selected_filter: 'none',
      selected_sort: 'none',
      mcUsername: null,
      modal_button: null,
      termination_reason: 'This user has been terminated for violating the Term of Service or User Conduct Agreement.',
    }
  },
  mounted() {
    // make the api request to fetch the users
    // they are, infact an admin. Don't bother wasting time if they are not
    if (this.$store.state.user) {
      if (adminAccess.includes(this.$store.state.user.role)) {
        if (this.noMutUserData == null) {
          this.refreshData();
        } else {
          console.log("Using cached data. Blah blah refresh")
        }
      } else {
        // boot them over to the 404 page if they are unauthorized
        this.$router.push('/404');
      }
    }
  },
  methods: {
    adminAccess() {
      return adminAccess
    },
    handleFilterChange() {
      this.userData = this.noMutUserData;
      switch (this.selected_filter) {
        case "none":
          break;
        case "owner": {
          this.userData = this.userData.filter(obj => obj.role === 'owner');
          break;
        }
        case "admin": {
          this.userData = this.userData.filter(obj => obj.role === 'admin');
          break;
        }
        case "moderator": {
          this.userData = this.userData.filter(obj => obj.role === 'moderator');
          break;
        }
        case "helper": {
          this.userData = this.userData.filter(obj => obj.role === 'helper');
          break;
        }
        case "user": {
          this.userData = this.userData.filter(obj => obj.role === 'user');
          break;
        }
        case "banned": {
          break;
        }
        case "terminated": {
          this.userData = this.userData.filter(obj => obj.terminated);
          break;
        }
        case "muted": {
          this.userData = this.userData.filter(obj => obj.muted);
          break;
        }
      }
    },
    handleSortChange() {
      this.userData = this.noMutUserData;
      this.handleFilterChange()

      switch (this.selected_sort) {
        case "none":
          break; // no sorting
        case "id": {
          this.userData.sort((a, b) => a.id - b.id);
          break;
        }
        case "username": {
          this.userData.sort((a, b) => a.name.localeCompare(b.name));
          break;
        }
        case "role": {
          this.userData.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
          break;
        }
        case "creation": {
          this.userData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        }
        case "update": {
          this.userData.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        }
      }
    },
    showUserModal(user) {
      this.modalUser = user;
      this.showModal = true;
    },
    formatDate(datestr) {
      return new Date(datestr).toLocaleDateString('en-us', {
        year: "2-digit",
        month: "short",
        day: "numeric"
      });
    },
    formatDateFull(datestr) {
      return new Date(datestr).toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
    },
    getMcName(uuid) {
      axios.create().get('https://api.ashcon.app/mojang/v2/user/' + uuid,)
          .then(value => this.mcUsername = value.data.username)
          .catch(reason => console.log(reason));
    },
    refreshData() {
      this.status = 'loading';
      axios.get("/admin/users")
          .then((response) => {
            useToast().success('Successfully fetched user data!', {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
            console.log(response.data.data[0])
            this.noMutUserData = response.data.data;
            this.userData = response.data.data;
            this.status = 'done';
          })
          .catch((error) => {
            if (error.response.data.message === 'You do not have access to this.') {
              Utils.logout(this.$store);
              useToast().error("Your session has expired. Please log in again.", {
                position: 'top-right',
                timeout: 1000,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              this.$router.push('/auth/login?when_done=/admin/home?page=users');
              return;
            }
            useToast().error("An error occoured whilst fetching user data!", {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
          });
    },

    // change roles
    changeRole(user, role) {
      axios.patch("/admin/roles",
          {
            target: {
              id: user.id,
              target_role: role,
            }
          })
          .then((response) => {
            useToast().success(`Successfully set ${user.name}'s role to ${role}!`, {
              position: 'top-right',
              timeout: 2000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
            this.showModal = false;
            this.modal_button = null;
          })
          .catch((error) => {
            if (error.response.data.message === 'You cannot change your own role!') {
              useToast().error(`You cannot change your own role.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            useToast().error(`An error occoured whilst attempting to set ${user.name}'s role to ${role}!`, {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
          })
    },
    terminateUser(user) {
      if (this.termination_reason === '') this.termination_reason = 'This user has been terminated for violating the Term of Service or User Conduct Agreement.';
      const data = {
        target: {
          id: user.id,
          reason: this.termination_reason,
        }
      }
      axios.post("/admin/users/terminate", data)
          .then((response) => {
            useToast().success(`Successfully terminated the user ${user.name}.`, {
              position: 'top-right',
              timeout: 2000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
            this.showModal = false;
            this.modal_button = null;
          })
          .catch((error) => {
            if (error.response.data.message === 'You cannot terminate yourself!') {
              useToast().error(`You cannot terminate yourself.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            if (error.response.data.message === 'You cannot terminate an account with more seniority over you!') {
              useToast().error(`You cannot terminate an account with more seniority over you!`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            if (error.response.data.message === 'You are not authorized to do this!') {
              useToast().error(`You are not authorized to terminate users.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            useToast().error(`An error occoured whilst attempting to terminate ${user.name}.`, {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
          })
    },
    deleteAvatar(user) {
      axios.delete(`/admin/avatars/${user.id}`)
          .then((response) => {
            useToast().success(`Successfully removed the avatar of the user ${user.name}.`, {
              position: 'top-right',
              timeout: 2000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
            this.showModal = false;
            this.modal_button = null;
          })
          .catch((error) => {
            this.showModal = false
            this.modal_button = null;
            console.log(user)
            if (error.response.data.message.includes("ERR 1009")) {
              useToast().error(`This user does not have an avatar!`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            if (error.response.data.message === 'Not authorized!') {
              useToast().error(`You are not authorized to remove user avatars.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            useToast().error(`An error occoured whilst attempting to terminate ${user.name}.`, {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
          })
    },
    restoreUser(user) {
      const data = {
        target: {
          id: user.id,
        }
      }
      axios.post("/admin/users/restore", data)
          .then((response) => {
            useToast().success(`Successfully restored the user ${user.name}.`, {
              position: 'top-right',
              timeout: 2000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
            this.showModal = false;
            this.modal_button = null;
          })
          .catch((error) => {
            if (error.response.data.message === 'You cannot restore yourself!') {
              useToast().error(`You cannot terminate yourself.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            if (error.response.data.message === 'You are not authorized to do this!') {
              useToast().error(`You are not authorized to restore users.`, {
                position: 'top-right',
                timeout: 2500,
                closeOnClick: false,
                pauseOnFocusLoss: true,
                pauseOnHover: true,
                draggable: true,
                draggablePercent: 0.6,
                showCloseButtonOnHover: false,
                hideProgressBar: true,
                closeButton: 'button',
                icon: false,
                rtl: false,
              });
              return;
            }
            useToast().error(`An error occoured whilst attempting to restore ${user.name}.`, {
              position: 'top-right',
              timeout: 1000,
              closeOnClick: false,
              pauseOnFocusLoss: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              hideProgressBar: true,
              closeButton: 'button',
              icon: false,
              rtl: false,
            });
          })
    },
    muteUser(id) {
      axios.put("admin/mute/" + id)
          .then(() => {
            useToast().success("Success!")
            this.showModal = false;
          })
          .catch(() => {
            useToast().error("An error occurred whilst muting user!")
          });
    },
    unmuteUser(id) {
      axios.delete("admin/mute/" + id)
          .then(() => {
            useToast().success("Success!")
            this.showModal = false;
          })
          .catch(() => {
            useToast().error("An error occurred whilst muting user!")
          });
    },
    sendConfirmEmail(user) {
      axios.post("confirmation", {id: user.id}).then(value => {
        if (value.data.message === 'Confirmation email has been resent.') {
          useToast().success('Successfully re-sent confirmation email!', {
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
      })
          .catch(error => {
            useToast().error('An error occoured whilst attempting to resend the email.', {
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
          });
      this.showModal = false;
    },


    // user modal
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(-50px)';
    },
    enter(el) {
      let opacity = 0;
      let top = -50;
      const opacityInterval = setInterval(() => {
        opacity += 0.25; // Adjust opacity increment for smoother fade-in
        el.style.opacity = opacity;
        if (opacity >= 1) {
          clearInterval(opacityInterval);
        }
      }, 100); // Adjust interval for smoother fade-in

      const flyInterval = setInterval(() => {
        top += 26; // Adjust increment for smoother movement
        el.style.transform = `translateY(${top}px)`;
        if (top >= 0) {
          clearInterval(flyInterval);
          //done();
        }
      }, 100); // Adjust interval for smoother movement
    },
    leave(el, done) {
      let top = 0;
      const opacityInterval = setInterval(() => {
        el.style.opacity -= 0.25; // Adjust opacity decrement for smoother fade-out
        if (el.style.opacity <= 0) {
          clearInterval(opacityInterval);
        }
      }, 100); // Adjust interval for smoother fade-out

      const interval = setInterval(() => {
        top -= 10; // Adjust increment for smoother movement
        el.style.transform = `translateY(${top}px)`;
        if (top <= -50) {
          clearInterval(interval);
          done();
        }
      }, 100); // Adjust interval for smoother movement
    }
  }
}
</script>


<style>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s, transform 0.5s ease;
}

.modal-enter, .modal-leave-to /* .modal-leave-active in <2.1.8 */
{
  opacity: 0;
}
</style>
