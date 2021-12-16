<!--
 * @Author: your name
 * @Date: 2021-11-30 14:16:54
 * @LastEditTime: 2021-11-30 21:24:08
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \geoinfocentere:\STUDY\开发\web3d\3dMdl\src\components\toolComponents\commonTableInfo.vue
-->
<template>
  <transition name="fade">
    <div class="commonTableBox" v-if="isCommonVisible">
      <span class="close_span" @click="closeOnClick">×</span>
      <el-tabs v-model="TabsValue" type="card" @tab-click="tabClick">
        <el-tab-pane
          v-for="(item, index) in dataTabs"
          :key="index"
          :label="item.title"
          :name="item.name"
        >
          <div class="content_box" v-if="item.tableType === 1">
            <table>
              <tr v-for="(item2, row) in item.tableData" :key="row">
                <td>{{ item2.label }}</td>
                <td>{{ item2.value }}</td>
              </tr>
            </table>
          </div>
          <div class="content_box_2" v-else-if="item.tableType === 2">
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
          </div>
          <div class="content_box_3" v-else-if="item.tableType === 3">
            <el-table
              :data="item.tableData"
              border
              style="width: 100%"
              height="350px"
            >
              <el-table-column prop="stratCode" label="地层编码">
              </el-table-column>
              <el-table-column prop="topElevation" label="顶板高程">
              </el-table-column>
              <el-table-column prop="bottomElevation" label="底板高程">
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    dataTabs: {
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
      tableType: {
        type: Number,
        default: 1,
      },
      default() {
        return [];
      },
    },
    // tableData: {
    //   type: Array,
    //   default() {
    //     return [];
    //   },
    // },
    isCommonVisible: {
      type: Boolean,
      default: false,
    },
    editableTabsValue: {
      type: String,
      default: "1",
    },
    // tableTheme: {
    //   type: String,
    //   default: "",
    // }
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
  data() {
    return {
      TabsValue: "1",
    };
  },
  methods: {
    closeOnClick() {
      this.$emit("sendCommonCloseInfo", false);
    },
    tabClick(tab) {
      this.$emit("sendCommonTabNameInfo", tab.name);
    },
    tableRowClassName({ row, rowIndex }) {
      console.log(row);
      if (row.active) {
        return "warning-row";
      }
      return "";
    },
  },
};
</script>
<style>
.el-tabs__header {
  margin: 0 0 5px !important;
}
.el-table .warning-row {
  background: rgb(149, 179, 175);
}

.el-table .success-row {
  background: #f0f9eb;
}
.el-tabs__nav-scroll {
  background-color: rgb(144, 147, 153) !important;
}
.el-tabs__item.is-active {
  color: white !important;
}
</style>
<style scoped>
.commonTableBox {
  width: 600px;
  height: 400px;
  padding: 5px;
  /* height: 500px; */
  background-color: rgb(244, 244, 245);
  position: fixed;
  z-index: 1;
  bottom: 40px;
  right: 0px;
}
.commonTableBox .head_box {
  position: absolute;
  right: 10px;
  top: 2px;
  width: 100%;
  height: 40px;
  background-color: rgb(144, 147, 153);
  color: rgb(255, 255, 255);
  line-height: 40px;
  padding-left: 3px;
  cursor: pointer;
  box-sizing: border-box;
}
.commonTableBox .content_box {
  width: 100%;
  height: 350px;
  overflow-y: auto;
}
.commonTableBox .content_box_2 {
  width: 100%;
  height: 350px;
  overflow-y: auto;
}
.commonTableBox .content_box_3 {
  width: 100%;
  height: 350px;
  overflow-y: auto;
}
.el-tabs__header {
  margin: 0 !important;
}
.commonTableBox table {
  width: 100%;
  border-top: 1px solid #999;
  border-spacing: 0;
  border-left: 1px solid #999;
  /* height: 400px; */
}
.commonTableBox table tr {
  height: 30px;
  text-align: center;
}
.commonTableBox table tr td {
  width: 50%;
  height: 30px;
  padding: 10px 30px;
  border-bottom: 1px solid #999;
  border-right: 1px solid #999;
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
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  transform: translateX(600px);
  opacity: 0;
}
</style>