<!--
 * @Author: your name
 * @Date: 2021-12-01 16:56:38
 * @LastEditTime: 2021-12-27 09:41:40
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \geoinfocentere:\STUDY\开发\web3d\3dMdl\src\components\toolComponents\searchCompent\commenSearch.vue
-->
<template>
  <div class="commonSearchBox">
    <div class="commonSearchBox_left">
      <div>
        <el-radio v-model="radio" label="1">模糊查询</el-radio>
      </div>
      <div>
        <el-radio v-model="radio" label="2">图层查询</el-radio>
      </div>
      <div>
        <!-- <el-radio v-model="radio" label="3">空间检索</el-radio> -->
      </div>
    </div>
    <div class="commonSearchBox_right">
      <div v-show="radio == 1">
        <div class="vaguebox">
          <el-input
            v-model="vagueInput"
            placeholder="请输入钻孔编码断层地层"
            clearable
            suffix-icon="el-icon-search"
          ></el-input>
        </div>
        <div class="commonSearchBtn">
          <div @click="searchOnClick(1)">检索</div>
          <div @click="resetOnClick(1)">重置</div>
        </div>
      </div>

      <div v-show="radio == 2" class="layerSelectBox">
        <div>
          <span>图层选择：</span>
          <el-select
            v-model="layerSelectValue"
            placeholder="请选择图层"
            @change="layerSelectOnChange"
            clearable
          >
            <el-option
              v-for="item in layerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <div>
          <span>检索字段：</span>
          <el-select
            v-model="fieldSelectValue"
            placeholder="选择字段"
            @change="fieldSelectOnChange"
          >
            <el-option
              v-for="item in fieldOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <span style="padding: 0 10px"> </span>
          <el-input class="fieldValueinput" v-model="fieldValue"></el-input>
        </div>
        <div class="commonSearchBtn">
          <div @click="searchOnClick(2)">检索</div>
          <div @click="resetOnClick(2)">重置</div>
        </div>
      </div>
      <!-- <div v-show="radio == 3">
        <div class="spaceSearchBox">
          <div>
            <span>图层选择</span>
            <el-select
              v-model="layerSelectValue2"
              placeholder="请选择图层"
              @change="layerSelectOnChange2"
              clearable
            >
              <el-option
                v-for="item in layerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div>
            <span>空间位置</span>
            <el-select
              v-model="spaceSelectValue"
              placeholder="请选择方式"
              @change="spaceSelectOnChange"
            >
              <el-option
                v-for="item in spaceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="spaceSearchTool_box">
            <div class="spaceSearchTool_box_1" v-if="spaceSelectValue === '1'">
              <div>
                点<span
                  :class="[
                    'iconfont',
                    'icon-yuanquan',
                    { activeToolSpan: taggleIndex === 1 },
                  ]"
                  @click="taggleMapToolClick(1)"
                ></span>
              </div>
              <div>
                矩形<span
                  :class="[
                    'iconfont',
                    'icon-juxing',
                    { activeToolSpan: taggleIndex === 2 },
                  ]"
                  @click="taggleMapToolClick(2)"
                ></span>
              </div>
              <div>
                多边形<span
                  :class="[
                    'iconfont',
                    'icon-duobianxing',
                    { activeToolSpan: taggleIndex === 3 },
                  ]"
                  @click="taggleMapToolClick(3)"
                ></span>
              </div>
            </div>
            <div class="spaceSearchTool_box_2" v-if="spaceSelectValue === '2'">
              <v-region @values="regionChange"></v-region>
            </div>
            <div class="spaceSearchTool_box_3" v-if="spaceSelectValue === '3'">
              <div>
                <span>经度</span>
                <el-input
                  v-model="coordinateParams.lon"
                  :disabled="spaceDisabled1"
                  @input="changeOnInpnt1"
                ></el-input>
                <span>纬度</span>
                <el-input
                  v-model="coordinateParams.lat"
                  :disabled="spaceDisabled1"
                  @input="changeOnInpnt1"
                ></el-input>
              </div>
              <div>
                <span>经距</span>
                <el-input
                  v-model="coordinateParams.coordX"
                  :disabled="spaceDisabled2"
                  @input="changeOnInpnt2"
                ></el-input>
                <span>纬距</span>
                <el-input
                  v-model="coordinateParams.coordY"
                  :disabled="spaceDisabled2"
                  @input="changeOnInpnt2"
                ></el-input>
              </div>
              <div>
                <span>里程</span>
                <el-input
                  v-model="coordinateParams.mileage"
                  :disabled="spaceDisabled3"
                  @input="changeOnInpnt3"
                ></el-input>
                <span>偏距</span>
                <el-input
                  v-model="coordinateParams.offset"
                  :disabled="spaceDisabled3"
                  @input="changeOnInpnt3"
                ></el-input>
              </div>
              <div>
                <span>距离</span>
                <el-input v-model="bufferDistanceValue"></el-input>
                <span>缓冲区（单位： <i style="color: red">m</i>）</span>
              </div>
            </div>
          </div>
        </div>
        <div class="commonSearchBtn">
          <div @click="searchOnClick(2)">检索</div>
          <div @click="resetOnClick(2)">重置</div>
        </div>
      </div>
   -->
    </div>
    <!-- <div>
      <el-radio v-model="radio" label="1">模糊查询：</el-radio>
      <span>模糊查询：</span>
    </div>
    <div>
      <div>
        <el-radio v-model="radio" label="2">图层选择</el-radio>

        <span>图层选择</span>
      </div>
      <div>
        <el-radio v-model="radio" label="3">检索字段</el-radio>

        <span>检索字段</span>
      </div>
    </div> -->
    <div></div>
    <div></div>
  </div>
</template>

<script>
import eventVue from "../../../plugins/eventVue";
import ViewCesiumUtils from "../../../utils/cesiumUtils/ViewCesiumUtils";
export default {
  data() {
    return {
      radio: "1",
      vagueInput: "", // 模糊搜索的值
      layerOptions: [],
      fieldOptions: [
        {
          label: "",
          value: "",
        },
      ],
      layerSelectValue: "",
      layerSelectValue2: "",
      fieldSelectValue: "",
      fieldValue: "",
      spaceSelectValue: "1",
      spaceOptions: [
        {
          label: "地图选择",
          value: "1",
        },
        {
          label: "行政区",
          value: "2",
        },
        {
          label: "坐标位置",
          value: "3",
        },
      ],
      taggleIndex: 0,
      coordinateParams: {
        lon: "",
        lat: "",
        coordX: "",
        coordY: "",
        mileage: "",
        offset: "",
      },
      bufferDistanceValue: "",
      spaceDisabled1: false,
      spaceDisabled2: false,
      spaceDisabled3: false,
    };
  },
  methods: {
    // 检索
    searchOnClick(index) {
      // 模糊查询
      if (index === 1) {
        if (this.vagueInput !== "") {
          let url = window.baseURL+"/commonSearchByParams";
          this.$http
            .get(url, {
              params: {
                holename: this.vagueInput,
              },
            })
            .then((res) => {
              this.$emit("sendSearachResultDataEvent", res.data.data);
            })
            .catch((err) => {
              this.$emit("sendSearachResultDataEvent", null);
            });
        }
      } else if (index === 2) {
        this.searchByTC();
      }
    },
    getCoordinateByGeometryType(feature) {
      let type = feature.geometry.type;
      let coordinate;
      switch (type) {
        case "Point":
          coordinate = feature.geometry.coordinates;
          break;
        case "MultiLineString":
          coordinate = feature.geometry.coordinates[0][0];
          break;
        case "MultiPolygon":
          coordinate = feature.geometry.coordinates[0][0][0];
          break;
        default:
          break;
      }
      return coordinate;
    },
    // 图层查询
    searchByTC() {
      if (this.layerSelectValue === "") return;
      let layerItem = this.layerOptions.find((obj) => {
        if (obj.layers === this.layerSelectValue) {
          return obj;
        }
      });
      let tempLayreItem = JSON.parse(JSON.stringify(layerItem));
      let url = tempLayreItem.wfsUrl;
      let cqlStr = "";
      const reg = /^\d+$/; // 判断是否为数字
      const flag = reg.test(this.fieldValue);
      let tempStr = this.fieldValue;
      if (!flag) {
        // tempStr = `'${tempStr}'`;
      }
      if (this.fieldSelectValue !== "" && this.fieldValue !== "") {
        if (!flag) {
          cqlStr = `${this.fieldSelectValue}` + " like '%25";
          cqlStr += `${tempStr}` + "%25'";
          url = url + "&cql_filter=" + cqlStr;
        } else {
          cqlStr = `${this.fieldSelectValue}=${tempStr}`;
          url = url + "&cql_filter=" + cqlStr;
        }
      }
      console.log("模糊查询：", url);
      let sendData = [];
      this.$http(url).then((res) => {
        let featureList = res.data.features;
        for (let i = 0; i < featureList.length; i++) {
          for (let k in featureList[i].properties) {
            if (k.indexOf("id") >= 0) {
              let coordinates = this.getCoordinateByGeometryType(
                featureList[i]
              );
              let obj = {
                url: tempLayreItem.url,
                layer: tempLayreItem.layers,
                cqlStr: cqlStr,
                label: `${k}=${featureList[i].properties[k]}`,
                lon: coordinates[0],
                lat: coordinates[1],
                geometryType: tempLayreItem.geometryType,
              };
              sendData.push(obj);
              break;
            }
          }
        }
        console.log(sendData);
        this.$emit("sendSearchInfoInwmsLayer", sendData);
      });
    },

    resetOnClick(index) {
      if (index === 1) {
        this.vagueInput = "";
        this.$emit("sendResetInfoEvent", 0);
        this.$emit("sendResetInfoEvent", 1); // 隐藏对话框
      } else if (index === 2) {
        this.fieldOptions = [];
        this.fieldValue = "";
        this.layerSelectValue = "";
        this.fieldSelectValue = "";
        this.$emit("sendResetInfoEvent", 1); // 隐藏对话框
        this.$emit("sendResetInfoEvent", 2);
      }
    },
    layerSelectOnChange(val) {
      if (val === "") {
        this.fieldOptions = [];
        this.fieldSelectValue = "";
        this.fieldValue = "";
        return;
      }
      this.fieldValue = "";
      this.fieldSelectValue = "";
      this.fieldOptions = [];
      let url = "";
      for (let i = 0; i < this.layerOptions.length; i++) {
        if (this.layerOptions[i].layers === val) {
          url = this.layerOptions[i].attrUrl;
          break;
        }
      }
      console.log(url);
      this.$http.get(url).then((res) => {
        const tempData = res.data.featureTypes[0].properties;
        console.log(tempData);
        let resultData = [];
        for (let i = 0; i < tempData.length; i++) {
          let obj = {
            label: tempData[i].name,
            value: tempData[i].name,
          };
          resultData.push(obj);
        }
        this.fieldOptions = resultData;
      });
    },
    layerSelectOnChange2(val) {},
    fieldSelectOnChange(val) {},

    // 一下操作都不会保留上一步的操作结果
    spaceSelectOnChange(val) {
      let valIndex = parseInt(val);
      switch (valIndex) {
        case 1:
          // 清除 2和3 的状态
          break;
        case 2:
          // 清除 2和3 的状态
          break;
        case 3:
          // 清除 2和3 的状态
          break;

        default:
          break;
      }
    },
    taggleMapToolClick(index) {
      if (this.taggleIndex === index) {
        this.taggleIndex = 0;
        // 清除响应绘图事件
        return;
      }
      this.taggleIndex = index;
      switch (index) {
        case 1:
          // 清除绘制状态
          // 点选操作
          break;
        case 2:
          // 清除绘制状态
          // 框选操作
          break;
        case 3:
          // 清除绘制状态
          // 多边形操作
          break;

        default:
          break;
      }
    },
    // 行政区划改变
    regionChange(data) {
      console.log(data);
    },
    // 切换选择有点啦
    changeOnInpnt1(val) {
      if (val === "") {
        this.spaceDisabled1 = false;
        this.spaceDisabled2 = false;
        this.spaceDisabled3 = false;
      } else {
        this.coordinateParams.coordX = "";
        this.coordinateParams.coordY = "";
        this.coordinateParams.mileage = "";
        this.coordinateParams.offset = "";
        this.spaceDisabled2 = true;
        this.spaceDisabled3 = true;
      }
    },
    changeOnInpnt2(val) {
      if (val === "") {
        this.spaceDisabled1 = false;
        this.spaceDisabled2 = false;
        this.spaceDisabled3 = false;
      } else {
        this.coordinateParams.lon = "";
        this.coordinateParams.lat = "";
        this.coordinateParams.mileage = "";
        this.coordinateParams.offset = "";
        this.spaceDisabled1 = true;
        this.spaceDisabled3 = true;
      }
    },
    changeOnInpnt3(val) {
      if (val === "") {
        this.spaceDisabled1 = false;
        this.spaceDisabled2 = false;
        this.spaceDisabled3 = false;
      } else {
        this.spaceDisabled1 = true;
        this.spaceDisabled2 = true;
        this.coordinateParams.lon = "";
        this.coordinateParams.lat = "";
        this.coordinateParams.coordX = "";
        this.coordinateParams.coordY = "";
      }
    },
    formatOptions(data, isChecked) {
      debugger
      // 先确定是否显隐
      let flagIndex = -1;
      for (let i = 0; i < this.layerOptions.length; i++) {
        if (this.layerOptions[i].layers === data.layers) {
          flagIndex = i;
          break;
        }
      }
      if (flagIndex === -1) {
        isChecked ? this.layerOptions.push(data) : 1;
      } else {
        isChecked ? 1 : this.layerOptions.splice(flagIndex,1);
      }
    },
  },
  watch: {
    radio(val) {
      switch (parseInt(val)) {
        case 1:
          this.resetOnClick(2);
          break;
        case 2:
          this.resetOnClick(1);
          break;
        default:
          break;
      }
      this.$emit("sendResetInfoEvent", 1);
    },
  },
  created() {
    eventVue.$on("sendTree2DViewInfoByEventBus", (res) => {
      let tempDataType = 1;
      for (let i = 0; i < this.layerOptions.length; i++) {
        if (this.layerOptions[i].value === res.nodeData.layers) {
          tempDataType = this.layerOptions[i].dataType;
        }
      }
      if (this.radio === "2") {
        if (
          res.nodeData.children &&
          res.nodeData.serviceType === "wms" &&
          res.isChecked === false &&
          res.nodeData.dataType === tempDataType
        ) {
          this.fieldOptions = [];
          this.fieldValue = "";
          this.layerSelectValue = "";
          this.fieldSelectValue = "";
          this.$emit("sendResetInfoEvent", 1); // 隐藏对话框
          this.$emit("sendResetInfoEvent", 2);
        } else if (
          !res.nodeData.children &&
          res.nodeData.serviceType === "wms" &&
          res.isChecked === false &&
          res.nodeData.layers === this.layerSelectValue &&
          res.nodeData.dataType === tempDataType
        ) {
          this.fieldOptions = [];
          this.fieldValue = "";
          this.layerSelectValue = "";
          this.fieldSelectValue = "";
          this.$emit("sendResetInfoEvent", 1); // 隐藏对话框
          this.$emit("sendResetInfoEvent", 2);
        }
      }

      let tempList = [];
      ViewCesiumUtils.getTreeLayerData(res.nodeData, tempList);
      for (let i = 0; i < tempList.length; i++) {
        if (tempList[i].serviceType === "wms") {
          this.formatOptions(tempList[i], res.isChecked);
        }
      }
    });
  },
  beforeDestroy() {
    eventVue.$off("sendTree2DViewInfoByEventBus");
  },
};
</script>
<style>
.commonSearchBox .vaguebox .el-input {
  width: 255px; /**sisi */
}
.layerSelectBox > div:nth-child(1) .el-input {
  width: 240px; /**sisi */
}
.layerSelectBox > div:nth-child(2) .el-select {
  width: 110px; /**sisi */
}
.layerSelectBox > div:nth-child(2) .fieldValueinput {
  width: 110px; /**sisi */
}
.spaceSearchTool_box_3 .el-input .el-input__inner {
  height: 30px;
}
</style>
<style scoped>
.commonSearchBox {
  width: 100%;
  height: 100%;
  display: flex;
}
.commonSearchBox_left {
  flex: 2;
  border-right: 1px dashed rgb(195, 198, 202);
}
.commonSearchBox_right {
  flex: 5;
}
.commonSearchBox_left > div {
  margin: 50px 0px 50px 30px;
}
.vaguebox {
  margin-top: 30px;
  margin-left: 15px; /**sisi */
}
.commonSearchBtn {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 300px;
  text-align: right;
}
.commonSearchBtn > div {
  display: inline-block;
  height: 40px;
  width: 100px;
  text-align: center;
  line-height: 40px;
  color: white;
  font-weight: 700;
  background-color: rgb(0, 140, 255);
  border-radius: 5px;
  cursor: pointer;
}
.commonSearchBtn > div:nth-child(1) {
  margin-right: 15px;
}

/* 模糊查询 */
.layerSelectBox > div {
  margin-left: 20px;
  margin-top: 20px;
}
.layerSelectBox > div:nth-child(1) .el-input {
  width: 300px;
}

/* 空间检索 */
.spaceSearchBox {
  margin: 5px 0 0 20px;
}
.spaceSearchBox > div:nth-child(1) .el-select {
  margin-left: 20px;
  width: 236px; /**sisi */
}
.spaceSearchBox > div:nth-child(2) .el-select {
  margin-left: 20px;
  width: 236px; /**sisi */
  margin-top: 5px;
}
.spaceSearchBox .spaceSearchTool_box {
  margin-top: 20px;
}
.spaceSearchTool_box_1 {
  width: 300px;
  height: 80px;
  margin-left: 10px; /**sisi */
  display: flex;
}
.spaceSearchTool_box_1 > div {
  flex: 1;
}
.spaceSearchTool_box_1 > div span {
  display: inline-block;
  cursor: pointer;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background-color: rgba(202, 203, 204, 0.5);
}
.activeToolSpan {
  color: white;
  background-color: rgb(0, 140, 255) !important;
}
/* 视线检索 */

.spaceSearchTool_box_2 {
  /* width: 320px;
  height: 80px; */
  /* margin-left: 80px; */
}

.v-region {
  /* width: 96px; */
}

/* 空间位置 */
.spaceSearchTool_box_3 {
  margin-left: 0px; /**sisi */
}
.spaceSearchTool_box_3 > div {
  margin-top: 0px;
  padding-bottom: 5px;
  border-bottom: 1px dashed rgb(195, 198, 202);
}
.spaceSearchTool_box_3 .el-input {
  width: 120px;
  margin-right: 10px;
  margin-left: 3px;
}
.spaceSearchTool_box_3 .el-radio {
  margin-right: 15px;
}
.spaceSearchTool_box_3 > div:nth-child(4) {
  /* margin-left: 39px; */
  border: none !important;
}
</style>
