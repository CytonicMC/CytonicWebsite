<template>
  <div class="bg-black h-[6vh]" :style="{'height': footer_height}"></div>
  <footer class="fixed flex flex-row bottom-0 p-5 justify-between w-full bg-black bg-opacity-50 backdrop-blur-sm" id="footer">

    <div id="text" class="flex">
      <h1 class="text-white">
        © Cytonic 2025. All Rights Reserved.
      </h1>
    </div>

    <div id="icons" class="flex flex-row">

      <div class="self-center text-gray-300 hover:text-white transition mx-3">
        <a href="https://discord.gg/Jq7FwX6hqW" target="_blank">
          <font-awesome-icon class="text-white" icon="fa-brands fa-discord" size="xl"/>
        </a>
      </div>

      <div class=" self-center text-gray-300 hover:text-white transition mx-3">
        <a href="https://github.com/cytonicmc" target="_blank">
          <font-awesome-icon class="text-white" icon="fa-brands fa-github" size="xl"/>
        </a>
      </div>

    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      footer_height: '1000px'
    }
  },
  mounted() {
    this.footer_height = document.getElementById('footer').clientHeight + 'px'
  }
}
</script>
