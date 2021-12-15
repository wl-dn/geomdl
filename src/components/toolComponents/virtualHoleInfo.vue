<!--
 * @Author: your name
 * @Date: 2021-11-30 12:42:04
 * @LastEditTime: 2021-11-30 14:19:24
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \geoinfocentere:\STUDY\开发\web3d\3dMdl\src\components\toolComponents\virtralHoleInfo.vue
-->
<template>
  <transition name="fade">
    <div class="virtualBox" v-if="isVisible">
      <!-- <div class="virtualBox_head_box">
        {{ tableTheme }} -->
      <!--sisi  设置表名-->
      <span class="close_span" @click="closeOnClick">×</span>
      <!-- </div> -->
      <el-tabs v-model="TabsValue" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item, index) in virtualLayerInfo"
          :key="index"
          :label="item.title"
          :name="item.name"
        >
          <el-table
            :data="item.tableData"
            border
            style="width: 100%"
            height="350px"
            v-if="virtualLayerInfo.length !== 0"
          >
            <el-table-column prop="topElevation" label="顶板高程">
            </el-table-column>
            <el-table-column prop="bottomElevation" label="底板高程">
            </el-table-column>
            <el-table-column prop="stratCode" label="地层编码">
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    virtualLayerInfo: {
      type: Array,
      title: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "",
      },
      tableData: {
        type: Array,
        default() {
          return [];
        },
      },
      default() {
        return [];
      },
    },
    fieldsList: {
      type: Array,
      default() {
        return [];
      },
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    tableTheme: {
      //<!--sisi  设置表名-->
      type: String,
      default: "",
    },
    editableTabsValue: {
      type: String,
      default: "1",
    },
  },
  watch: {
    editableTabsValue: {
      deep: true,
      handler: function (newV) {
        this.TabsValue = this.editableTabsValue;
      },
    },
  },
  data() {
    return {
      TabsValue: "1",
    };
  },
  methods: {
    closeOnClick() {
      this.$emit("sendCloseVirtualDialog", false);
    },
      tabClick(tab) {
       this.$emit("sendCommonTabNameInfo", tab.name);
    }
  },
};
</script>

<style scoped>
.virtualBox {
  width: 600px;
  padding: 5px;
  /* height: 500px; */
  background-color: rgb(244, 244, 245);
  position: fixed;
  z-index: 1;
  bottom: 0px;
  right: 0px;
}
.virtualBox_head_box {
  width: 100%;
  height: 40px;
  background-color: rgb(144, 147, 153);
  color: rgb(255, 255, 255);
  line-height: 40px;
  padding-left: 3px;
  box-sizing: border-box;
}
.holelayer_table {
  width: 100%;
}
.holelayer_table tr td {
  height: 30px;
}
.holelayer_table tr td:nth-child(1) {
  width: 30%;
  background-color: cornflowerblue;
}
.close_span {
  position: absolute;
  right: 10px;
  top: 7px;
  font-size: 30px;
  cursor: pointer;
  z-index: 1;
}
/* 动画效果 */
.holefade-enter-active,
.holefade-leave-active {
  transition: all 0.2s ease;
}
.holefade-enter,
.holefade-leave-to {
  transform: translateX(600px);
  opacity: 0;
}
/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  transform: translateX(200px);
  opacity: 0;
}
</style>
