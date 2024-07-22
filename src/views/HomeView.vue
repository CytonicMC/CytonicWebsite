<template>
  <div class="text-white bg-black">
    <div id="banner" class="bg-banner w-screen h-1/2 bg-cover bg-center text-white">
      <div class="h-full w-full min-h-[45vh] self-center bg-black bg-opacity-20 flex flex-col items-center justify-center">
        <h1 class="lg:text-6xl text-4xl font-title">We are Cytonic</h1>
        <hr>
        <span class="text-lg font-title">Minecraft, reimagined.</span>
      </div>
    </div>
    <!--  Meet Us  -->
    <div class="bg-black text-white">
      <h1 class="lg:text-4xl text-2xl font-title p-4 m-4 text-center"> Meet the Team </h1>
      <div class="flex-wrap flex justify-center">
        <div v-for="item in staff" :key="item.id"
             class="border border-black hover:border-zinc-50 flex-row flex justify-center m-6 min-w-[300px] max-w-[200px] rounded p-3 overflow-ellipsis flex-grow transform transition duration-100">
          <div>
            <img :alt="item.name + '\'s avatar'" :src="item.avatar_url"
                 class="max-h-16 min-h-16 min-w-16 max-w-16 rounded-3xl m-1 p-1 aspect-square object-cover">
          </div>
          <div class="flex flex-col justify-center items-center">
            <h1 class="px-2">{{ item.name }}</h1>
            <p class="px-2 font-protest text-gray-400">{{ item.position }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center my-5">
      <hr class="w-1/3 justify-center self-center text-center">
    </div>
    <!-- FAQ -->
    <div class="bg-black text-white">
      <h1 class="lg:text-4xl text-2xl font-title p-4 m-4 text-center"> Frequently Asked Questions </h1>

      <div class="flex flex-col justify-center items-center self-center w-full h-full">
        <div v-for="item in faq" :key="item.id" class="flex-col flex justify-center m-6 p-3 overflow-ellipsis transform transition duration-100 max-w-[75vw] center">
            <h1 class="px-2 text-center text-lg">{{ item.q }}</h1>
            <p class="px-2 text-gray-400 text-center">{{ item.a }}</p>
        </div>
      </div>

    </div>

  </div>
</template>
<script>
import favicon from "/favicon.svg"
import axios from "@/api.js";
export default {
  data() {
    return {
      staff: [
        {
          id: 1,
          name: "Webhead1104",
          position: "CEO",
          avatar: 7
        },
        {
          id: 2,
          name: "Foxikle",
          position: "Lead Network Developer",
          avatar: 1
        },
        {
          id: 3,
          name: "PrinceLegacy",
          position: "Manager",
          avatar: 6
        },
        {
          id: 4,
          name: "ResTheCoder",
          position: "Network Developer",
          avatar: 14
        },
        {
          id: 5,
          name: "Yello",
          position: "Mod",
          avatar: 8
        },
        {
          id: 6,
          name: "LZ",
          position: "Helper",
          avatar: null
        },
      ],
      faq: [
        {
          id: 1,
          q: 'Why Cytonic?',
          a: 'Cytonic is a fresh take on Minecraft. With exceptional attention to detail and a fine eye for quality, we aim to provide the best possible player experience.'
        },
        {
          id: 2,
          q: 'When will it release?',
          a: 'Unfortunately, we do not have a release date.'
        },
        {
          id: 3,
          q: 'How can I get involved?',
          a: 'We are currently looking for people! For an exhaustive list of open positions, join our Discord Server!'
        }
      ]
    }
  },
  mounted() {
    for (let index in this.staff) {
      let user = this.staff[index];

      if(user.avatar == null) {
        this.staff[index].avatar_url = favicon;
      }
      axios.get('users/' + user.avatar)
          .then(value => {
            let avatar = value.data.data.attributes.avatar_url;
            if(avatar != null) {
              this.staff[index].avatar_url = avatar;
            } else {
              this.staff[index].avatar_url = favicon;
            }
          })
          .catch(reason => {
            this.staff[index].avatar_url = favicon;
          })
    }
  },
}
</script>
