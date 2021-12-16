<!--
 * @Author: your name
 * @Date: 2021-11-18 13:28:39
 * @LastEditTime: 2021-11-30 12:59:21
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \geoinfocentere:\STUDY\开发\web3d\3dMdl\src\components\toolComponents\holeLayerInfo.vue
-->
<template>
  <transition name="holefade">
    <div class="holeLayerBox" v-if="isVisible">
      <span class="close_span" @click="closeOnClick">×</span>
      <!--缩小宽度sisi-->
      <el-tabs v-model="TabsValue" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item, index) in layerInfo"
          :key="index"
          :label="item.title"
          :name="item.name"
        >
          <el-table
            :data="item.tableData"
            border
            style="width: 100%"
            height="350px"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="stdstratumcode" label="标准层号">
            </el-table-column>
            <el-table-column prop="topsidedepth" label="顶板埋深">
            </el-table-column>
            <el-table-column prop="undersidedepth" label="顶底埋深">
            </el-table-column>
            <el-table-column prop="boreheight" label="孔口标高">
            </el-table-column>
            <el-table-column prop="qgenesis" label="地质成因">
            </el-table-column>
            <el-table-column prop="stratumeras" label="地质年代">
            </el-table-column>
            <el-table-column prop="lithology" label="岩性"> </el-table-column>
            <el-table-column prop="clayeystate" label="岩土体状态">
            </el-table-column>
            <el-table-column prop="soilrockclassify" label="土石类别">
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
    drillname: {
      type: String,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    layerInfo: {
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
    editableTabsValue: {
      type: String,
      default: "1",
    },
  },
  data() {
    return {
      TabsValue: "1",
    };
  },
  watch: {
    editableTabsValue: {
      deep: true,
      handler: function (newV) {
        this.TabsValue = this.editableTabsValue;
        console.log(this.TabsValue);
      },
    },
  },
  methods: {
    closeOnClick() {
      this.$emit("sendCloseLayerDialog", false);
    },
    tableRowClassName({ row, rowIndex }) {
      console.log(row);
      if (row.active) {
        return "warning-row";
      }
      return "";
    },
    tabClick(tab) {
      this.$emit("sendCommonTabNameInfo", tab.name);
    },
  },
};
</script>
<style >
.el-table .warning-row {
  background: rgb(149, 179, 175);
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>
<style scoped>
.holeLayerBox {
  width: 600px;
  padding: 5px;
  /* height: 500px; */
  background-color: rgb(244, 244, 245);
  position: fixed;
  z-index: 1;
  bottom: 40px;
  right: 0px;
}
.holeLayer_head_box {
  width: 100%;
  height: 40px;
  background-color: rgb(144, 147, 153);
  color: rgb(255, 255, 255);
  line-height: 40px;
  padding-left: 3px;
  box-sizing: border-box;
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
</style>
