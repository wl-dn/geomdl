<template>
  <div class="bottomTool">
    <div class="map-coordinates">
      <span id="cd_label" v-show="isActiveSpan">暂无坐标信息</span>
      <span id="cd_label" v-show="!isActiveSpan">
        经度：{{ commonCesiumInfos.lng }} 纬度：{{
          commonCesiumInfos.lat
        }}
        海拔高度：{{ commonCesiumInfos.height }}米 视点高度：{{
          commonCesiumInfos.ViewpointsHeight
        }}米 方向：{{ commonCesiumInfos.heading }}度 俯仰角：{{
          commonCesiumInfos.pitch
        }}度
      </span>
    </div>
    <div class="slidebox">
      <span class="demonstration">地图服务透明度</span>
      <el-slider
        v-model="imageryAlpha"
        :show-tooltip="false"
        :max="1"
        :min="0"
        :step="0.05"
        @input="changeImageryAlphaOnInput"
      ></el-slider>
    </div>
    <div class="slidebox1">
      <span class="demonstration1">地表透明</span>
      <el-slider
        v-model="slideValue"
        :show-tooltip="false"
        :max="1"
        :min="0"
        :step="0.05"
        @input="changeAlphaOnInput"
      ></el-slider>
    </div>
  </div>
</template>
<script>
import * as Cesium from "cesium";
import eventVue from "../../assets/js/eventVue";
export default {
  props: ["viewer", "slideFValue"],
  watch: {
    slideFValue(val) {
      this.slideValue = this.slideFValue;
    },
  },
  data() {
    return {
      commonCesiumInfos: {
        lng: 0,
        lat: 0,
        height: 0,
        ViewpointsHeight: 0,
        heading: 0,
        pitch: 0,
      },
      isActiveSpan: true,
      slideValue: 0.6,
      imageryAlpha: 1,
    };
  },
  methods: {
    moveShowInfo(viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement) => {
        // const moveFeature = viewer.scene.pick(movement.endPosition);
        // if (Cesium.defined(moveFeature)) {
        //   viewer._container.style.cursor = "pointer";
        // } else {
        //   viewer._container.style.cursor = "default";
        // }

        const pick = new Cesium.Cartesian2(
          movement.endPosition.x,
          movement.endPosition.y
        );
        if (!pick) {
          return;
        }
        const cartesian = viewer.scene.globe.pick(
          viewer.camera.getPickRay(pick),
          viewer.scene
        );
        if (!cartesian) {
          return;
        }
        const cartographic =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        // 经纬度
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        // 海拔
        const height = viewer.scene.globe.getHeight(cartographic);
        // 视点海拔高度
        const ViewpointsHeight =
          viewer.scene.camera.positionCartographic.height;
        this.commonCesiumInfos.lng = lng ? lng.toFixed(7) + "" : "";
        this.commonCesiumInfos.lat = lat ? lat.toFixed(7) + "" : "";
        this.commonCesiumInfos.height = height ? height.toFixed(2) + "" : "";
        this.commonCesiumInfos.ViewpointsHeight = ViewpointsHeight
          ? ViewpointsHeight.toFixed(2) + ""
          : "";
        // 方向
        this.commonCesiumInfos.heading = Cesium.Math.toDegrees(
          Number(viewer.scene.camera.heading)
        ).toFixed(2);
        // 俯仰角
        this.commonCesiumInfos.pitch = Cesium.Math.toDegrees(
          Number(viewer.scene.camera.pitch)
        ).toFixed(2);
        viewer.scene.debugShowFramesPerSecond = true;
        this.isActiveSpan = false;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    changeAlphaOnInput(val) {
      this.$emit("sendAlphaInfo", val);
    },
    changeImageryAlphaOnInput(val) {
      this.$emit("sendImageryAlpha", val);
    },
  },
  created() {
    eventVue.$on("sendCesiumViewer", (viewer) => {
      this.moveShowInfo(viewer);
    });
  },
  mounted() {},
  beforeDestroy() {
    eventVue.$off("sendCesiumViewer");
  },
};
</script>
<style>
.cesium-performanceDisplay-defaultContainer {
  /* position: absolute; */

  text-align: center;
  width: 5%;
  height: 30px;
  line-height: 30px;
}
.cesium-performanceDisplay-defaultContainer > div {
  display: flex;
  border: none;
  background: none;
  position: fixed;
  bottom: -4px;
  /* left: 780px; */
  right: 0;
}
.cesium-performanceDisplay-defaultContainer > div :nth-child(1) {
  color: bule;
  font-weight: normal;
  font-size: 13px;
  font-family: sans-serif;
}
.cesium-performanceDisplay-defaultContainer > div :nth-child(2) {
  color: red;
  margin-left: 20px;
  font-weight: normal;
  font-size: 13px;
  font-family: sans-serif;
}
</style>
<style scoped>
.bottomTool {
  width: 100%;
  height: 25px;
  line-height: 25px;
  background-color: rgb(43, 57, 90, 0.4);
  position: absolute;
  bottom: 0;
  right: 0;
  font-family: sans-serif !important;
  font-size: 13px;
  z-index: 1;
}
.map-coordinates {
  width: 50%;
}
#cd_label {
  /* font-size: 13px; */
  text-align: center;
  font-family: 微软雅黑;
  color: #edffff;
}
.slidebox {
  position: absolute;
  right: 30%;
  bottom: 0px;
  width: 10%;
  height: 30px;
  line-height: 30px;
}
.slidebox1 {
  position: absolute;
  right: 12%;
  bottom: 0px;
  width: 10%;
  height: 30px;
  line-height: 30px;
}
.demonstration {
  display: inline-block;
  height: 30px;
  position: absolute;
  color: white;
  left: -100px;
  line-height: 30px;
  top: 3px;
}
.demonstration1 {
  display: inline-block;
  height: 30px;
  position: absolute;
  color: white;
  left: -70px;
  line-height: 30px;
  top: 3px;
}
</style>