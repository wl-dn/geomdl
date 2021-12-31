
<!--
 * @Descripttion: 
 * @Author: wenlong
 * @version: 
 * @Date: 2021-08-20 10:25:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-27 09:42:40
-->
<template>
  <div class="mapView">
    <el-tree
      :props="props"
      :data="treeData"
      show-checkbox
      node-key="id"
      :default-expanded-keys="[
        '1',
        '1-1',
        '1-1-1',
        '1-2',
        '1-3',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '9-1',
        '9-1-1',
      ]"
      :default-checked-keys="['5-1', '5-2', '6-1']"
      @check-change="handleCheckChange"
      @check="handleCheck"
      @node-contextmenu="handleContextMenu"
    >
    </el-tree>

    <mapRightDialog
      :isShowDialog="isShowDialog"
      :positionX="positionX"
      :positionY="positionY"
      :nodeData="nodeData"
      @sendCloseR="isShowDialog = false"
    ></mapRightDialog>
  </div>
</template>

<script>
import eventVue from "../../plugins/eventVue";
import rightDialog from "../toolComponents/rightDialog.vue";

export default {
  data() {
    return {
      props: {
        label: "label",
        children: "children",
      },
      /*
        treeData中的标识
        id:唯一标识
        label:显示在页面的中文名称
        name:图层名称/模型名称
        url:服务加载的地址
        attrUrl：获取属性的url
        wfsUrl:wfs的url
        layers:图层名称
        serviceType:加载的服务类型  决定使用什么接口进行加载
        dataType：分类类别
        geometryType:图形类别
      */
      treeData: [],
      currentChecked: false,
      positionX: 0,
      positionY: 0,
      isShowDialog: false,
      nodeData: null,
    };
  },
  components: {
    mapRightDialog: rightDialog,
  },
  computed: {},
  methods: {
    onMessageFromComponent() {},
    destroyComponent() {},
    handleCheckChange(data, checked) {
      this.currentChecked = checked;
    },
    handleCheck(node, checked) {
      this.$emit("sendTree2dViewInfo", {
        nodeData: node,
        isChecked: this.currentChecked,
      });
      eventVue.$emit("sendTree2DViewInfoByEventBus", {
        nodeData: node,
        isChecked: this.currentChecked,
      });
    },
    handleContextMenu(event, dataList) {
      // event.preventDefault();
      // if (!dataList.children) {
      //   this.positionY = event.pageX;
      //   this.positionX = event.pageY;
      //   this.nodeData = JSON.parse(JSON.stringify(dataList));
      //   this.isShowDialog = true;
      // }
    },
    getTreeData() {
      this.$http.get("treeConfig.json").then((res) => {
        this.treeData = res.data.tree2dList;
      });
    },
  },
  created() {
    this.getTreeData();
  },
  mounted() {},
  beforeDestroy() {},
};
</script>

<style scoped>
.mapView {
  width: 250px;
  height: 400px;
  overflow-y: scroll;
}
/* .el-tree >>> .el-tree-node .is-leaf + .el-checkbox .el-checkbox__inner {
  display: inline-block;
}
.el-tree >>> .el-tree-node .el-checkbox .el-checkbox__inner {
  display: none;
} */

/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 12px;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: rgba(84, 92, 100, 0.1);
}
</style>