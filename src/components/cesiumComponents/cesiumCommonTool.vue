<!--
 * @Descripttion: 
 * @Author: wenlong
 * @version: 
 * @Date: 2021-08-20 10:25:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-11-22 11:00:25
-->
<template>
  <div class="CesiumTool_box" v-if="isCesiumCommonToolVisible">
    <ul>
      <template v-for="(item, index) in toolList">
        <el-tooltip
          effect="dark"
          :content="item.label"
          placement="right-start"
          :key="index"
        >
          <li
            @click="onClickCesiumTool(item)"
            :class="[
              'iconfont',
              item.iconClass,
              {
                activeSpan: item.active === true,
              },
            ]"
          ></li>
        </el-tooltip>
      </template>
    </ul>
    <!-- <span> {{ item.label }}</span> -->
  </div>
</template>

<script>
export default {
  props: ["isCesiumCommonToolVisible"],
  data() {
    return {
      toolList: [
        // {
        //   label: "地球显影",
        //   index: 1,
        //   iconClass: "icon-diqiu",
        //   active: false,
        // },
        {
          label: "地下空间",
          index: 2,
          iconClass: "icon-dishangdixia",

          active: false,
        },
        {
          label: "复位",
          index: 3,
          iconClass: "icon-solid-home",

          active: false,
        },
        {
          label: "放大",
          index: 4,
          iconClass: "icon-jia",

          active: false,
        },

        {
          label: "缩小",
          index: 5,
          iconClass: "icon-jian",

          active: false,
        },

        {
          label: "全屏",
          index: 6,
          iconClass: "icon-quanping",
          active: false,
        },

        // {
        //   label: "地形",
        //   index: 4,
        //   iconClass: "icon-quanping",
        //   active: false,
        // },
      ],
    };
  },
  components: {},
  computed: {},
  methods: {
    onClickCesiumTool(item) {
      if (item.index == 1 || item.index == 2 || item.index == 6) {
        item.active = !item.active;
      }
      this.$emit("commonToolHandleOnClick", item);
    },
    onMessageFromComponent() {},
    destroyComponent() {},
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
};
</script>

<style scoped>
.CesiumTool_box {
  position: absolute;
  width: 35px;
  left: 10px;
  bottom: 20px;
  z-index: 1;
}
.CesiumTool_box ul {
  width: 100%;
  padding: 0px;
  margin: 0px;
  list-style: none;
}
.CesiumTool_box ul li {
  background-color: rgb(62, 72, 82);
  color: rgb(229, 229, 227);
  margin-bottom: 10px;
  text-align: center;
  height: 35px;
  line-height: 35px;
  border-radius: 4px;
  cursor: pointer;
}
.activeSpan {
  background-color: darkcyan !important;
}
/* .CesiumTool_box {
  position: absolute;
  bottom: -20px;
  color: white;
  height: 100px;
  z-index: 1;
  left: 20px;
}
.CesiumTool_box span {
  display: inline-block;
  background-color: rgb(84, 92, 100);
  padding: 10px;
  box-shadow: 0 0 5px #fff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}
.CesiumTool_box span:hover {
  cursor: pointer;
}
.activeSpan {
  background-color: darkcyan !important;
}
.isActiveClass {
  color: #000;
} */
</style>