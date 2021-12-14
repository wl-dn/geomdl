<!--
 * @Descripttion: 
 * @Author: wenlong
 * @version: 
 * @Date: 2021-08-19 20:18:14
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-12-07 15:26:09
-->
<template>
  <div id="cesiumContainer">
    <!--添加附件logo以及标题 sisi-->
    <div class="logo_class">
      <img src="../../assets/images/CRCC.png" />
    </div>
    <div class="class_title">地理地质信息系统测试平台</div>
    <div class="cesiumMenu_box">
      <ul>
        <li
          v-for="(item, i) in cesiumMenuList"
          :key="i"
          :class="{ active: activeIndex === item.id }"
          @click="activeMenuItemOnClick(item)"
        >
          <span :class="['iconfont', item.icon]">{{ item.label }}</span>
        </li>
      </ul>
    </div>
    <!-- 右边导航功能栏 -->
    <div class="cesiumContent_box">
      <mapView
        v-show="activeIndex === 1"
        @sendTree2dViewInfo="recept2dViewInfo"
      ></mapView>
      <mdlView
        v-show="activeIndex === 2"
        @sendTree3dViewInfo="recept3dViewInfo"
      ></mdlView>
      <mdlFenxi
        v-if="activeIndex === 3"
        @sendFenxiInfo="receptFenxiInfo"
      ></mdlFenxi>
      <div class="mdlTool_box" v-if="activeIndex === 4">
        <el-select
          v-model="mdlNameValue"
          placeholder="请选择模型"
          @change="selectOnMdlchange"
        >
          <el-option
            v-for="item in mdlOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <!-- cesium通过工具 -->
    <cesiumCommonTool
      @commonToolHandleOnClick="commonToolHandleOnClick"
      :isCesiumCommonToolVisible="isCesiumCommonToolVisible"
    ></cesiumCommonTool>
    <!-- 调整 -->
    <adjustMdlComponent
      v-show="isShowTool"
      :isWireframevCheck="isWireframevCheck"
      @sendWifeinfo="receptWifeinfo"
      >/</adjustMdlComponent
    >
    <!-- 钻孔分层显示信息 -->
    <holeLayerInfo
      :drillname="drillName"
      :layerInfo="layerInfo"
      :isVisible="isLayerDialogVisible"
      @sendCloseLayerDialog="isLayerDialogVisible = false"
    ></holeLayerInfo>

    <!-- 虚拟钻孔 -->
    <virtualBox
      :virtualLayerInfo="virtualLayerInfo"
      :fieldsList="fieldsList"
      :isVisible="isvirtualLayerDialogVisible"
      :tableTheme="virtualTableTheme"
      @sendCloseVirtualDialog="isvirtualLayerDialogVisible = false"
    ></virtualBox>

    <!-- 通用盒子显示信息 -->
    <commonTableBox
      :dataTabs="tableCommonData"
      :isCommonVisible="isCommonVisible"
      @sendCommonCloseInfo="isCommonVisible = false"
    ></commonTableBox>

    <!--  搜索框 -->
    <searchBar
      @sendSearchParmsFromSerachBar="receptSearchInfo"
      @sendResultItemFromSearchCompent="receptCommonFromSearchCompent"
      @sendResetInfoEvent="receptResetInfoEvent"
      @sendLayerItemFromSearchCompent="receptLayerItemFromSearchCompent"
    ></searchBar>

    <!-- 底部信息状态栏 -->
    <bottomTool
      @sendAlphaInfo="receptAlphaInfo"
      @sendImageryAlpha="receptImageryAlpha"
    ></bottomTool>
  </div>
</template>

<script>
import * as Cesium from "cesium";

import adjustMdlComponent from "../../components/cesiumComponents/adjustMdlTool.vue";
import mapView from "../../components/cesiumComponents/2dView.vue";
import mdlView from "../../components/cesiumComponents/mdlView.vue";
import mdlFenxi from "../../components/cesiumComponents/mdlFenxi.vue";
import cesiumCommonTool from "../../components/cesiumComponents/cesiumCommonTool.vue";
import holeLayerInfo from "../../components/toolComponents/holeLayerInfo.vue";
import virtualBox from "../../components/toolComponents/virtualHoleInfo.vue";
import searchBar from "../../components/toolComponents/searchCompent/searchComopent.vue";
import commonTableBox from "../../components/toolComponents/commonTableInfo.vue";
import bottomTool from "../../components/cesiumComponents/bottomTool.vue";

import { CesiumUtils } from "../../utils/utils.js";
import TerrainLoader from "../../utils/cesiumUtils/TerrainLoader.js";
import ImageryLoader from "../../utils/cesiumUtils/ImageryLoader";
import { DrawPolygon } from "../../utils/drawUtils";
import TerrainClipPlan from "../../utils/TerrainClipPlan";
//引入虚拟钻孔grpc服务 sisi
import * as VirtualHoleService from "../../../public/proto/dummy_hole_service_grpc_web_pb";

import { Notification } from "element-ui";
import eventVue from "../../assets/js/eventVue";

import PathGraphics from "cesium/Source/DataSources/PathGraphics";
import Viewer from "cesium/Source/Widgets/Viewer/Viewer";

let tileSetList = [];
let viewer = null;
let imageryLayers = null;
let moveHighlighted = {
  feature: undefined,
  originalColor: new Cesium.Color(),
  type: undefined,
};
let rightClickHighted = {
  feature: undefined,
  originalColor: new Cesium.Color(),
};

let dbClickRay = null;
let holeBillbordsLayer = null;

// 设置这些初始值，都是应为要针对于初始tileset
export default {
  data() {
    return {
      isShowTool: false,
      flag: 0, // 记录首次加载
      mdlNameValue: "", // 记录选择的模型名称
      mdlOptions: [], // 记录加载过的模型
      cesiumMenuList: [
        {
          id: 1,
          checked: false,
          icon: "icon-map",
          label: "二维服务",
        },
        {
          id: 2,
          checked: false,
          icon: "icon-diqiu",
          label: "三维服务",
        },
        // {
        //   id: 3,
        //   checked: false,
        //   icon: "icon-fenxi",
        //   label: "专业分析",
        // },
        {
          id: 4,
          checked: false,
          icon: "icon-gongju",
          label: "模型工具",
        },
        {
          //模型分析移到右侧 sisi
          id: 5,
          checked: false,
          icon: "icon-gongju",
          label: "模型分析",
        },
      ],
      activeIndex: 0,
      isWireframevCheck: false,
      mdlName: "",
      layerInfo: [],
      drillName: "钻孔分层信息",
      isLayerDialogVisible: false,
      isMdlSelectVisible: false,
      isCesiumCommonToolVisible: true,
      activeImageUrl: [
        "https://tsy-gis1.portal.com/server/rest/services/geoinfo_geomap/MapServer/",
        "https://tsy-gis1.portal.com/server/services/geoinfo_geomap/MapServer/WMSServer",
        "http://192.10.3.237/geoserver/crcc-dev/wms",
        "http://192.10.3.237/geoserver/wms",
        "http://10.101.140.3/geoserver/db-24/wms",
        "http://192.10.3.237/geoserver/crcc-dev/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=crcc-dev:geoboundzone&maxFeatures=50&outputFormat=application/json",
      ],
      activeImageryNameSet: new Set(), // 存放唯一值
      // 图形是否闪烁
      flashX: 0.5,
      flashFlag: true,

      activeDoubleEvent: false, // 是否激活双击事件
      flagTimer: null, // 区分单击和双击

      //虚拟钻孔
      isvirtualLayerDialogVisible: true,
      virtualLayerInfo: [],
      fieldsList: [],
      virtualTableTheme: null, //设置表格title

      // 通用盒子信息
      isCommonVisible: false,
      tableCommonData: [],

      // 地层厚度
      layerThickness: [4.3, 7.2, 3.4, 5.8, 10.0, 3.9, 3.7, 4.5],

      //钻孔聚类监听对象
      removeListener: undefined,
    };
  },
  components: {
    adjustMdlComponent,
    mapView,
    mdlView,
    mdlFenxi,
    cesiumCommonTool,
    holeLayerInfo,
    searchBar,
    virtualBox,
    commonTableBox,
    bottomTool,
  },
  computed: {
    mdlParmsChange() {
      return this.$store.getters.getTileMdlTool;
    },
  },
  watch: {
    // 根据变换动态旋转矩阵
    mdlParmsChange: {
      deep: true,
      handler: function (newV) {
        this.updateMatrixMdl(newV);
      },
    },
    cesiumMenuList: {
      deep: true,
      handler: function (newV) {
        if (!newV[3].checked) {
          this.isShowTool = false;
          this.mdlNameValue = "";
        }
      },
    },
    isShowTool(val) {
      if (val) {
        let tempParams = JSON.parse(
          JSON.stringify(this.$store.getters.getTileMdlTool)
        );
        for (let i = 0; i < tileSetList.length; i++) {
          if (tileSetList[i].name === this.mdlName) {
            tempParams.longitude = tileSetList[i].longitude;
            tempParams.latitude = tileSetList[i].latitude;
            tempParams.height = tileSetList[i].height;
            this.$store.commit("setTileMdlToolInfo", tempParams);
          }
        }
      }
    },
    activeIndex(val) {
      //监视选择的index， 路由跳转 sisi
      if (val === 5) {
        let routeData = this.$router.resolve({
          path: "/mdlScene",
          query: { id: 1 },
        });
        window.open(routeData.href, "_blank");
        // this.$router.push("mdlScene")
      }
    },
  },
  methods: {
    // 切换图层杨样式
    activeMenuItemOnClick(item) {
      item.checked = !item.checked;
      this.activeIndex = item.checked === true ? item.id : 0;
      this.cesiumMenuList.forEach((child) => {
        if (child.id !== item.id) child.checked = false;
      });
    },
    // 初始化3DTILES模型
    initCesium() {
      // 初始化地球
      const showWedgit = false;
      viewer = new Cesium.Viewer("cesiumContainer", {
        geocoder: showWedgit, // 地理位置查询定位控件
        homeButton: showWedgit, // 默认相机位置控件
        timeline: showWedgit, // 时间滚动条控件
        navigationHelpButton: showWedgit, // 默认的相机控制提示控件
        sceneModePicker: showWedgit, // 切换2D、3D和Columbus View（CV）模式
        fullscreenButton: showWedgit, // 全屏控件
        creditsDisplay: showWedgit, //展示商标版权和数据源
        scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存.与sceneModePiker不能共存
        baseLayerPicker: showWedgit, // 底图切换控件
        animation: showWedgit, // 控制场景动画的播放速度控件
        shadows: false,
        infoBox: false, //是否显示信息框
        selectionIndicator: false, //关闭绿色选中框
        imageryProvider: ImageryLoader.loadGDLayer(),
        orderIndependentTranslucency: false,
        contextOptions: {
          webgl: {
            alpha: true,
          },
        },
      });
      // 修改背景颜色
      viewer.scene.skyBox.show = false;
      viewer.scene.sun.show = false;
      viewer.scene.moon.show = false;
      viewer.scene.backgroundColor = Cesium.Color.BLACK;

      // 关闭光照
      viewer.scene.globe.enableLighting = false; //关闭光照

      viewer._cesiumWidget._creditContainer.style.display = "none"; //是否显示cesium标识

      // 初始化imagelauers
      imageryLayers = viewer.imageryLayers;
      let TDZJurl =
        "http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
        this.tiandituTk;
      ImageryLoader.loadTDMapLayer(viewer, TDZJurl, "tdtCiaLayer", true);
      let mdlScene = viewer.scene;

      // 初始化钻孔层
      this.holeBillbordsLayer = viewer.scene.primitives.add(
        new Cesium.BillboardCollection({
          scene: viewer.scene,
        })
      );

      // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin); 3dtiles监视器

      // 是否开启深度检测深度检测
      mdlScene.globe.depthTestAgainstTerrain = true;

      mdlScene.globe.baseColor = Cesium.Color.BLACK;
      // // 开启地下透明
      mdlScene.globe.translucency.enabled = true; // 开启地表透明
      mdlScene.globe.translucency.frontFaceAlphaByDistance =
        new Cesium.NearFarScalar(1000.0, 1, 1000000.0, 1);

      this.flytochina();
    },
    loadSelectWfsLayer(url, name, isChecked) {
      let flagObj = this.kmlSourceIsExist(name);
      if (flagObj.flag) {
        viewer.dataSources.remove(flagObj.dataSource);
      }
    },

    // 加载三维模型
    async load3dTiles(url, name, isChecked, label) {
      if (url === "") return;
      const loadFlagObj = this.judgeIs3DTiles(name);
      if (loadFlagObj.flag) {
        loadFlagObj.tile.show = isChecked;
        return;
      }
      // 加载3Dtiles文件
      let tileSet = new Cesium.Cesium3DTileset({
        url: url,
        //控制切片视角显示的数量，可调整性能
        maximumScreenSpaceError: 2,
        maximumNumberOfLoadedTiles: 50,
      });
      const tileset = await tileSet.readyPromise;
      tileset.name = name;
      // 向场景中添加tileset
      viewer.scene.primitives.add(tileset);

      let modelMatrix = tileset.modelMatrix.clone(); // 必须要是哟个clone进行深拷贝
      let boundingSphereCenter = tileset.boundingSphere.center.clone(); // 需要记录原始网格的中央坐标

      // 设置模型选装的初始值
      // 获取经度和纬度
      let cartographicCenter =
        Cesium.Cartographic.fromCartesian(boundingSphereCenter);
      let mdlCenterParams = this.getMdlDegreeCenter(cartographicCenter);
      let tempParams = JSON.parse(
        JSON.stringify(this.$store.getters.getTileMdlTool)
      );
      tempParams.longitude = mdlCenterParams[1];
      tempParams.latitude = mdlCenterParams[2];
      tempParams.height = mdlCenterParams[0];

      // 缓存数据
      tileSetList.push({
        tileSet: tileset,
        modelMatrix: modelMatrix,
        boundingSphereCenter: boundingSphereCenter,
        name: name,
        longitude: tempParams.longitude,
        latitude: tempParams.latitude,
        height: tempParams.height,
      });
      this.mdlOptions.push({
        value: name,
        label: label,
      });
      this.mdlName = name;

      // this.$store.commit("setTileMdlToolInfo", tempParams);
      // this.isShowTool = false; //调用工具会调用input值进行矩阵变换

      // 定位到该模型
      if (name === "holemdl") {
        console.log("钻孔模型定位", mdlCenterParams);
        // viewer.zoomTo(
        //   tileSet,
        //   new Cesium.HeadingPitchRange(
        //     0.0,
        //     -0.5,
        //     tileSet.boundingSphere.radius * 0.05
        //   )
        // );
        //heading:向左（360-），向右（1+） ; pitch：正上负下

        let initialPosition = Cesium.Cartesian3.fromDegrees(
          mdlCenterParams[1] + 0.00001,
          mdlCenterParams[2],
          mdlCenterParams[0] - 400
        );
        let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
          357.27879878293835,
          -21.34390550872461,
          0.0716951918898415
        );
        viewer.scene.camera.setView({
          destination: initialPosition,
          orientation: initialOrientation,
          endTransform: Cesium.Matrix4.IDENTITY,
        });
      } else {
        let initialPosition = Cesium.Cartesian3.fromDegrees(
          tempParams.longitude,
          tempParams.latitude - 0.0005,
          tempParams.height + 50000
        );
        let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
          357.27879878293835,
          -21.34390550872461,
          0.0716951918898415
        );
        // viewer.scene.camera.setView({
        //   destination: initialPosition,
        //   orientation: initialOrientation,
        //   endTransform: Cesium.Matrix4.IDENTITY,
        // });
        viewer.zoomTo(tileSet, initialOrientation);
        // CesiumUtils.viewCesiumUtils().changeTerrainAlpha(viewer, 0.1);
        // viewer.zoomTo(
        //   tileSet,
        //   new Cesium.HeadingPitchRange(0.0, -0.5, tileSet.boundingSphere.radius)
        // );
        // CesiumUtils.viewCesiumUtils().changeTerrainAlpha(viewer, 0.1);
        // viewer.zoomTo(
        //   tileSet,
        //   new Cesium.HeadingPitchRange(0.0, -0.5, tileSet.boundingSphere.radius)
        // );
      }

      // 注册模型事件
      // tileSet.tileLoad.addEventListener((tile) => {
      //   this.processTileFeatures(tile, (feature) => {
      //     console.log(feature);
      //   });
      // });
    },
    // 模型切换
    selectOnMdlchange(val) {
      console.log("加载模型");
      this.mdlName = val;
      let tempParams = JSON.parse(
        JSON.stringify(this.$store.getters.getTileMdlTool)
      );
      for (let i = 0; i < tileSetList.length; i++) {
        if (tileSetList[i].name === this.mdlName) {
          tempParams.longitude = tileSetList[i].longitude;
          tempParams.latitude = tileSetList[i].latitude;
          tempParams.height = tileSetList[i].height;
          this.$store.commit("setTileMdlToolInfo", tempParams);
        }
      }

      this.isShowTool = true;
    },

    // 加载广告牌
    async loadHoleLayer(url, name, isChecked) {
      let flagObj = ImageryLoader.billbordsIsExist(viewer, name);
      if (flagObj.isChecked) {
        viewer.scene.primitives.remove(flagObj.obj);
        return;
      }
      //初始化广告牌
      let billboards = viewer.scene.primitives.add(
        new Cesium.BillboardCollection({
          scene: viewer.scene,
        })
      );
      billboards.name = name;
      let holeResult = await this.$http.get(url);
      for (let i = 0; i < holeResult.data.data.length; i++) {
        let lon = Number(holeResult.data.data[i].borelon);
        let lat = Number(holeResult.data.data[i].borelat);
        let height = Number(holeResult.data.data[i].boreheight);
        let label = holeResult.data.data[i].borename;
        const position = Cesium.Cartesian3.fromDegrees(lon, lat);
        if (i === 1) {
          let initialPosition = Cesium.Cartesian3.fromDegrees(
            Number(
              holeResult.data.data[parseInt(holeResult.data.data.length / 2)]
                .borelon
            ),
            Number(
              holeResult.data.data[parseInt(holeResult.data.data.length / 2)]
                .borelat
            ),
            Number(
              holeResult.data.data[parseInt(holeResult.data.data.length / 2)]
                .boreheight
            ) + 2000
          );
          let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
            -11.27879878293835,
            -20.34390550872461,
            0.0716951918898415
          );
          viewer.scene.camera.setView({
            destination: initialPosition,
            orientation: initialOrientation,
            endTransform: Cesium.Matrix4.IDENTITY,
          });
        }
        let imgUrl = require("../../assets/images/clusterIcon/hole.png");
        ImageryLoader.loadBillboardLayer(billboards, position, label, imgUrl);
      }
    },

    // 判断三维模型是否存在
    judgeIs3DTiles(name) {
      const tilePrimitives = viewer.scene.primitives._primitives;
      if (tilePrimitives.length === 0)
        return {
          flag: false,
          tile: null,
        };
      for (let i = 0; i < tilePrimitives.length; i++) {
        if (
          tilePrimitives[i] instanceof Cesium.Cesium3DTileset &&
          tilePrimitives[i].name === name
        ) {
          return {
            flag: true,
            tile: tilePrimitives[i],
          };
        }
      }
      return {
        flag: false,
        tile: null,
      };
    },
    // 获取模型的经纬度和拾取高度
    getMdlDegreeCenter(cartographic) {
      let mdlCenterHeight;
      let mdlCenterLongitude;
      let mdlCenterLatitude;
      mdlCenterHeight = cartographic.height;
      // 弧度转经纬度
      mdlCenterLongitude = Number(
        Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
      );
      mdlCenterLatitude = Number(
        Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
      );
      return [mdlCenterHeight, mdlCenterLongitude, mdlCenterLatitude];
    },
    // 更新模型矩阵
    updateMatrixMdl(mdlParams) {
      if (tileSetList.length === 0) return;
      for (let i = 0; i < tileSetList.length; i++) {
        if (tileSetList[i].name === this.mdlName) {
          // 偏移
          const tranformTool = CesiumUtils.transformUtils(
            tileSetList[i].modelMatrix,
            tileSetList[i].boundingSphereCenter
          );
          const tranM = tranformTool.translationMdl(
            mdlParams.longitude,
            mdlParams.latitude,
            mdlParams.height
          );
          const rotateM = tranformTool.rotationMdl(
            mdlParams.rotateX,
            mdlParams.rotateY,
            mdlParams.rotateZ
          );
          const scaleM = tranformTool.scaleMdl(
            mdlParams.scale,
            mdlParams.scale,
            mdlParams.scale
          );
          const resultM = new Cesium.Matrix4();
          Cesium.Matrix4.multiply(tranM, rotateM, resultM);
          Cesium.Matrix4.multiply(resultM, scaleM, resultM);
          tileSetList[i].tileSet.modelMatrix = resultM;
        }
      }
    },
    // 根据图片和文字绘制canvas
    drawCanvas(img, text, fontsize) {
      let canvas = document.createElement("canvas"); //创建canvas标签
      let ctx = canvas.getContext("2d");

      // ctx.fillStyle = "#99f";
      ctx.font = fontsize + "px Arial";

      canvas.width = ctx.measureText(text).width + fontsize * 2; //根据文字内容获取宽度
      canvas.height = fontsize * 2; // fontsize * 1.5

      ctx.drawImage(img, fontsize / 2, fontsize / 2, fontsize, fontsize);

      ctx.fillStyle = "#000";
      ctx.font = fontsize + "px Calibri,sans-serif";
      ctx.shadowOffsetX = 1; //阴影往左边偏，横向位移量
      ctx.shadowOffsetY = 0; //阴影往左边偏，纵向位移量
      ctx.shadowColor = "#fff"; //阴影颜色
      ctx.shadowBlur = 1; //阴影的模糊范围
      ctx.fillText(text, (fontsize * 7) / 6, (fontsize * 4) / 3);
      return canvas;
    },

    // 地形开挖
    dig3DTerrian() {
      if (viewer.entities) {
        if (viewer.scene.globe.clippingPlanes) {
          viewer.scene.globe.clippingPlanes.removeAll();
        }
        viewer.entities.removeAll();
      }
      let drawed = new DrawPolygon(viewer);
      drawed.startCreate((digPosition) => {
        const length = digPosition.length;
        if (digPosition[length - 1] === digPosition[length - 2]) {
          digPosition.splice(length - 1);
        }
        new TerrainClipPlan(viewer, {
          points: digPosition,
          bottomMaterial: "material/excavate_bottom_min.jpg",
          wallMaterial: "material/excavate_bottom_min.jpg",
          height: 8000,
          lerpInterval: 50,
        });
      });
    },
    // 清除绘制
    clearDraw() {
      if (viewer.entities) {
        if (viewer.scene.globe.clippingPlanes) {
          viewer.scene.globe.clippingPlanes.removeAll();
        }
        viewer.entities.removeAll();
      }
      this.activeDoubleEvent = false;
    },

    // 注册cesium事件
    registerOnclickEvent() {
      if (viewer) {
        // // 注册右键事件
        // handler.setInputAction((movement) => {
        //   // If a feature was previously highlighted, undo the highlight
        //   if (Cesium.defined(rightClickHighted.feature)) {
        //     rightClickHighted.feature.color = rightClickHighted.originalColor;
        //     rightClickHighted.feature = undefined;
        //   }

        //   // Pick a new feature
        //   let pickedFeature = viewer.scene.pick(movement.position);
        //   if (!Cesium.defined(pickedFeature)) {
        //     // this.isLayerDialogVisible = false;
        //     return;
        //   }

        //   //undo the moveFeature Highlight the feature
        //   // moveHighlighted.feature.color = moveHighlighted.originalColor;
        //   // moveHighlighted.feature = undefined;

        //   rightClickHighted.feature = pickedFeature;
        //   Cesium.Color.clone(
        //     pickedFeature.color,
        //     rightClickHighted.originalColor
        //   );
        //   pickedFeature.color = Cesium.Color.BLUE;
        //   // let pickedFeature = viewer.scene.pick(movement.position);
        //   if (Cesium.defined(pickedFeature)) {
        //     if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
        //       if (
        //         pickedFeature.tileset._url ===
        //         "3DTiles/drill_3dtiles/tileset.json"
        //       ) {
        //         let cartesian = viewer.scene.pickPosition(movement.position);
        //         let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        //         const holecode = pickedFeature.getProperty("钻孔编码");
        //         console.log(
        //           pickedFeature.getProperty("孔口标高"),
        //           this.getMdlDegreeCenter(cartographic)[0]
        //         );
        //         let mhDistance =
        //           pickedFeature.getProperty("孔口标高") -
        //           this.getMdlDegreeCenter(cartographic)[0];
        //         console.log(mhDistance);
        //         this.$http
        //           .get("/getHoleLayerInfoByHoleCode", {
        //             params: {
        //               holecode: holecode,
        //             },
        //           })
        //           .then((res) => {
        //             this.drillName = holecode;
        //             this.layerInfo = res.data.data;
        //             this.isLayerDialogVisible = true;
        //           });
        //       } else if (
        //         pickedFeature.tileset._url ===
        //         "3DTiles/model_3dtiles/tileset.json"
        //       ) {
        //         this.tableCommonData = [];
        //         let titles = "地层编码";
        //         this.tableTitleTheme = "钻孔分层信息"; //设置表格title sisi
        //         let resStr = pickedFeature.getProperty("地层编码");
        //         let obj = {
        //           label: titles,
        //           value: resStr,
        //         };
        //         this.tableCommonData.push(obj);
        //         this.isCommonVisible = true;
        //       } else {
        //         this.tableCommonData = [];
        //         let propertyList = pickedFeature.getPropertyNames();
        //         for (let i = 0; i < propertyList.length; i++) {
        //           let obj = {
        //             label: propertyList[i],
        //             value: pickedFeature.getProperty(propertyList[i]),
        //           };
        //           this.tableTitleTheme = "地层信息"; //设置表格title sisi
        //           this.tableCommonData.push(obj);
        //           this.isCommonVisible = true;
        //           console.log("右键查询");
        //         }
        //       }
        //     } else {
        //       Notification({
        //         title: "提示",
        //         message: "该3dtiles没有属性",
        //         duration: "2000",
        //       });
        //     }
        //   }
        // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // 注册左键事件
        handler.setInputAction((movement) => {
          clearTimeout(this.flagTimer);
          this.flagTimer = window.setTimeout(() => {
            this.setFeatureColor(moveHighlighted, undefined);
            if (this.get3DTilesFeature(movement) > -1) return;
            let pick = viewer.scene.pick(movement.position);

            console.log("钻孔查询");
            //获取钻孔信息
            if (Cesium.defined(pick) && Cesium.defined(pick.id)) {
              this.$http
                .get("/getHoleLayerInfoByHoleCode", {
                  params: {
                    holecode: pick.id,
                  },
                })
                .then((res) => {
                  this.layerInfo = [];
                  let count = this.layerInfo.length;
                  this.drillName = pick.id;
                  this.layerInfo.push({
                    title: pick.id,
                    name: ++count + "",
                    tableData: res.data.data,
                  });
                  this.isLayerDialogVisible = true;
                  this.isCommonVisible = false;
                });
            }

            // 获取图层信息
            if (Cesium.defined(rightClickHighted.feature)) {
              rightClickHighted.feature.color = rightClickHighted.originalColor;
              rightClickHighted.feature = undefined;
            }
            const ray = viewer.camera.getPickRay(movement.position);
            const cartesian = viewer.scene.globe.pick(ray, viewer.scene);

            if (cartesian) {
              let cartographic = Cesium.Cartographic.fromCartesian(cartesian); // 获取当前点击点的世界坐标系
              if (cartographic) {
                let xy = new Cesium.Cartesian2();
                let alti = viewer.camera.positionCartographic.height;
                let level = this.getMapLevel(alti);
                // 只有显示的并且是geoserver和arcgisserver的可以用
                // 确定哪个图层可查
                let tempImageryProvider = this.getQueryImageryProvider();
                console.log(tempImageryProvider);
                if (!tempImageryProvider.length) return;
                let searchRes = [];
                this.tableCommonData = [];
                for (const tmpImgProvider of tempImageryProvider) {
                  if (tmpImgProvider.ready) {
                    xy = tmpImgProvider.tilingScheme.positionToTileXY(
                      cartographic,
                      level,
                      xy
                    );
                    let promise = tmpImgProvider.pickFeatures(
                      xy.x,
                      xy.y,
                      level,
                      cartographic.longitude,
                      cartographic.latitude
                    );
                    Cesium.when(promise, (layerInfo) => {
                      let tmpArr = [];
                      const properList = layerInfo[0].properties;
                      console.log(layerInfo);
                      console.log(properList);
                      let obj = null;
                      this.tableTitleTheme = tmpImgProvider.label;
                      for (let k in properList) {
                        obj = {
                          label: k,
                          value: properList[k],
                        };
                        tmpArr.push(obj);
                      }
                      if (tmpArr.length) {
                        let count = this.tableCommonData.length;
                        this.tableCommonData.push({
                          title: tmpImgProvider.label,
                          name: ++count + "",
                          tableData: tmpArr,
                        });
                        this.isCommonVisible = true;
                        this.isLayerDialogVisible = false;
                      }
                    });
                  }
                }
              }
            }
          }, 200);
          console.log("左键查询");
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //注册移动事件
        handler.setInputAction((movement) => {
          // 移动变小手
          const moveFeature = viewer.scene.pick(movement.endPosition);
          this.setFeatureColor(moveHighlighted, moveFeature);
          if (Cesium.defined(moveFeature)) {
            viewer._container.style.cursor = "pointer";
            //十字 crosshair
          } else {
            viewer._container.style.cursor = "default";
            return;
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 注册双击事件（注意区分单击和双击事件）
        handler.setInputAction((movement) => {
          clearTimeout(this.flagTimer);
          if (this.activeDoubleEvent) {
            let pick = viewer.scene.pick(movement.position);
            if (Cesium.defined(pick)) {
              let cartesian = viewer.scene.pickPosition(movement.position);
              let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              let degreeCenter = this.getMdlDegreeCenter(cartographic);
              // degreeCenter 就是获取到的高度，经度，维度
              // console.log(degreeCenter);
              //查询虚拟钻孔信息  sisi
              this.virtualLayerInfo = [];
              let count = this.virtualLayerInfo.length;
              let tableData = [
                {
                  topElevation: 1,
                  bottomElevation: 1,
                  stratCode: 1,
                },
                {
                  topElevation: 1,
                  bottomElevation: 1,
                  stratCode: 1,
                },
                {
                  topElevation: 1,
                  bottomElevation: 1,
                  stratCode: 1,
                },
              ];
              this.virtualLayerInfo.push({
                title: "虚拟钻孔点位信息",
                name: ++count + "",
                tableData: tableData,
              });
              this.isvirtualLayerDialogVisible = true;
              return;
              this.virtualLayerInfo = [];
              let client = new VirtualHoleService.DummyHoleServicePromiseClient(
                "http://10.101.140.3:8011"
              );
              let virtualRequest =
                new VirtualHoleService.DummyHoleServiceRequest();
              virtualRequest.setMdlDbId(81);
              virtualRequest.setMdlId(1);
              let dots = new VirtualHoleService.A3dDot();
              dots.setX(449527.06);
              dots.setY(2714965.48);
              dots.setZ(0);
              let dotList = [];
              dotList.push(dots);
              virtualRequest.setRgnDotsList(dotList);
              client.createDummyHoles(virtualRequest, {}).then((res) => {
                let resObject = res.toObject();
                let holeList = resObject.holeListList[0];
                let infoFileds = Object.keys(holeList.layerInfoListList[0]);
                this.fieldsList = [];
                this.virtualLayerInfo = holeList.layerInfoListList;
                this.virtualTableTheme = "虚拟钻孔点位信息";
                this.isvirtualLayerDialogVisible = true;
              });

              return;
              let startPoint = Cesium.Cartesian3.fromDegrees(
                degreeCenter[1],
                degreeCenter[2],
                -9999
                // 10000
              );
              let endPoint = Cesium.Cartesian3.fromDegrees(
                degreeCenter[1],
                degreeCenter[2],
                10000
                // -99999
              );
              this.drawLine(startPoint, endPoint, Cesium.Color.RED); //绘制交汇线
              let direction = Cesium.Cartesian3.normalize(
                Cesium.Cartesian3.subtract(
                  endPoint,
                  startPoint,
                  new Cesium.Cartesian3()
                ),
                new Cesium.Cartesian3()
              );
              dbClickRay = new Cesium.Ray(startPoint, direction);

              let resultFeatureList = viewer.scene.drillPickFromRay(dbClickRay); // 计算交互点，返回第一个
              let resultLayerData = [];
              let tempFieldList = [];
              for (let i = 0; i < resultFeatureList.length; i++) {
                if (
                  resultFeatureList[i].object instanceof
                  Cesium.Cesium3DTileFeature
                ) {
                  let properList =
                    resultFeatureList[i].object.getPropertyNames();
                  let drillLayerInfo = {};
                  for (let j = 0; j < properList.length; j++) {
                    drillLayerInfo[properList[j]] = resultFeatureList[
                      i
                    ].object.getProperty(properList[j]);
                    if (i === 0) {
                      // 只记录一次
                      tempFieldList.push({
                        value: properList[j],
                        label: properList[j],
                      });
                    }
                  }

                  drillLayerInfo["地层厚度"] = this.layerThickness[i];
                  resultLayerData.push(drillLayerInfo);
                }
              }
              tempFieldList.push({
                label: "地层厚度",
                value: "地层厚度",
              });
              this.fieldsList = tempFieldList;
              this.virtualLayerInfo = resultLayerData.reverse();
              this.isvirtualLayerDialogVisible = true;
            }
          }
          console.log("双击左键");
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      }
    },

    //获取3dtiles 的feature
    get3DTilesFeature(movement) {
      // If a feature was previously highlighted, undo the highlight
      if (Cesium.defined(rightClickHighted.feature)) {
        rightClickHighted.feature.color = rightClickHighted.originalColor;
        rightClickHighted.feature = undefined;
      }

      // Pick a new feature
      let pickedFeature = viewer.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        // this.isLayerDialogVisible = false;
        return -1;
      }

      //undo the moveFeature Highlight the feature
      // moveHighlighted.feature.color = moveHighlighted.originalColor;
      // moveHighlighted.feature = undefined;

      rightClickHighted.feature = pickedFeature;
      Cesium.Color.clone(pickedFeature.color, rightClickHighted.originalColor);
      console.log("pickedFeature:", pickedFeature);
      console.log("rightClickHighted:", rightClickHighted);
      pickedFeature.color = Cesium.Color.BLUE;
      // let pickedFeature = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedFeature)) {
        if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
          if (
            pickedFeature.tileset._url === "3DTiles/drill_3dtiles/tileset.json"
          ) {
            let cartesian = viewer.scene.pickPosition(movement.position);
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const holecode = pickedFeature.getProperty("钻孔编码");
            console.log(
              pickedFeature.getProperty("孔口标高"),
              this.getMdlDegreeCenter(cartographic)[0]
            );
            let mhDistance =
              pickedFeature.getProperty("孔口标高") -
              this.getMdlDegreeCenter(cartographic)[0];
            console.log(mhDistance);
            this.$http
              .get("getHoleLayerInfoByHoleCode", {
                params: {
                  holecode: holecode,
                },
              })
              .then((res) => {
                this.layerInfo = [];
                let count = this.layerInfo.length;

                this.setColorTable(res.data.data, mhDistance);

                this.drillName = holecode;
                // this.layerInfo = res.data.data;
                console.log(count);
                this.layerInfo.push({
                  title: holecode,
                  name: ++count + "",
                  tableData: res.data.data,
                });
                this.isLayerDialogVisible = true;
                this.isCommonVisible = false;
              });
            // this.$http
            //   .get("/getHoleLayerInfoByHeight", {
            //     params: {
            //       holeCode: holecode,
            //       height: mhDistance,
            //     },
            //   })
            //   .then((res) => {
            //     this.tableCommonData = [];
            //     let properList = res.data.data[0];
            //     console.log(res.data);
            //     console.log(properList);
            //     this.tableTitleTheme = holecode;
            //     for (let k in properList) {
            //       let obj = {
            //         label: k,
            //         value: properList[k],
            //       };
            //       this.tableCommonData.push(obj);
            //     }
            //     this.isCommonVisible = true;
            //     // this.drillName = holecode;
            //     // this.layerInfo = res.data.data;
            //     // this.isLayerDialogVisible = true;
            //   })
            //   .catch((err) => {
            //     console.log(err);
            //   });
          } else if (
            pickedFeature.tileset._url === "3DTiles/model_3dtiles/tileset.json"
          ) {
            let titles = "地层编码";
            let resStr = pickedFeature.getProperty("地层编码");
            let obj = [
              {
                label: titles,
                value: resStr,
              },
            ];
            if (obj.length) {
              this.tableCommonData = [];
              let count = this.tableCommonData.length;
              this.tableCommonData.push({
                title: "模型分层信息",
                name: ++count + "",
                tableData: obj,
              });
              this.isCommonVisible = true;
              this.isLayerDialogVisible = false;
            }
          } else {
            this.tableCommonData = [];
            let tmp = [];
            let propertyList = pickedFeature.getPropertyNames();
            for (let i = 0; i < propertyList.length; i++) {
              let obj = {
                label: propertyList[i],
                value: pickedFeature.getProperty(propertyList[i]),
              };
              tmp.push(obj);
            }
            if (tmp.length) {
              this.isCommonVisible = true;
              this.isLayerDialogVisible = false;
              let count = this.tableCommonData.length;
              this.tableCommonData.push({
                title: "地层信息",
                name: ++count + "",
                tableData: tmp,
              });
            }
          }
          return 1;
        }
        // else {
        //   Notification({
        //     title: "提示",
        //     message: "该3dtiles没有属性",
        //     duration: "2000",
        //   });
        //   return 0;
        // }
      }
      return -1;
    },
    // 对应分层变色
    setColorTable(data, distence) {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        let topsidedepth = Number(data[i].topsidedepth);
        let undersidedepth = Number(data[i].undersidedepth);
        if (distence > topsidedepth && distence < undersidedepth) {
          data[i].active = true;
        } else {
          data[i].active = false;
        }
      }
    },
    // 绘制线
    drawLine(leftPoint, secPoint, color) {
      viewer.entities.add({
        polyline: {
          positions: [leftPoint, secPoint],
          arcType: Cesium.ArcType.NONE,
          width: 5,
          material: color,
          depthFailMaterial: color,
        },
      });
    },
    // 获取能够查询imageryProvider
    getQueryImageryProvider() {
      let tempImagerys = imageryLayers._layers;
      let imgArr = [];
      for (let i = 0; i < tempImagerys.length; i++) {
        let name = tempImagerys[i].imageryProvider.name;
        if (
          this.activeImageryNameSet.has(name) &&
          tempImagerys[i].show === true
        )
          imgArr.push(tempImagerys[i].imageryProvider);
      }
      return imgArr;
    },
    getMapLevel(height) {
      if (height > 48000000) {
        return 0;
      } else if (height > 24000000) {
        return 1;
      } else if (height > 12000000) {
        return 2;
      } else if (height > 6000000) {
        return 3;
      } else if (height > 3000000) {
        return 4;
      } else if (height > 1500000) {
        return 5;
      } else if (height > 750000) {
        return 6;
      } else if (height > 375000) {
        return 7;
      } else if (height > 187500) {
        return 8;
      } else if (height > 93750) {
        return 9;
      } else if (height > 46875) {
        return 10;
      } else if (height > 23437.5) {
        return 11;
      } else if (height > 11718.75) {
        return 12;
      } else if (height > 5859.38) {
        return 13;
      } else if (height > 2929.69) {
        return 14;
      } else if (height > 1464.84) {
        return 15;
      } else if (height > 732.42) {
        return 16;
      } else if (height > 366.21) {
        return 17;
      } else {
        return 18;
      }
    },

    // 下面是接收来自其他组件的通信
    // 接收二维服务
    recept2dViewInfo(data) {
      if (data.nodeData.serviceType === "wms") {
        if (data.nodeData.children) {
          for (let i = 0; i < data.nodeData.children.length; i++) {
            ImageryLoader.loadWmsLayer(
              viewer,
              data.nodeData.children[i].url,
              data.nodeData.children[i].layers,
              data.nodeData.children[i].label,
              data.isChecked
            );
            this.activeImageryNameSet.add(data.nodeData.children[i].layers);
          }
        } else {
          ImageryLoader.loadWmsLayer(
            viewer,
            data.nodeData.url,
            data.nodeData.layers,
            data.nodeData.label,
            data.isChecked
          );
          this.activeImageryNameSet.add(data.nodeData.layers);
        }
      } else if (data.nodeData.serviceType === "Google") {
        this.loadUTLayer(
          data.nodeData.url,
          data.nodeData.layers,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "ESRI") {
        this.loadESRILayer(
          data.nodeData.url,
          data.nodeData.layers,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "OSM") {
        this.loadOSMLayer(
          data.nodeData.url,
          data.nodeData.layers,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "wfs") {
        this.loadWfsLayer(
          data.nodeData.url,
          data.nodeData.name,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "mapserver") {
        ImageryLoader.loadArcgisMapServerLayer(
          viewer,
          data.nodeData.url,
          data.nodeData.layers,
          data.nodeData.label,
          data.isChecked
        );
        this.activeImageryNameSet.add(data.nodeData.layers);
      } else if (data.nodeData.serviceType === "kml") {
        ImageryLoader.loadKmlLayer(
          viewer,
          data.nodeData.url,
          data.nodeData.name,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "天地图") {
        ImageryLoader.loadTDMapLayer(
          viewer,
          data.nodeData.url,
          data.nodeData.layers,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "billboards") {
        console.log("加载billboards");
        this.loadHoleLayer(
          data.nodeData.url,
          data.nodeData.name,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "地形服务") {
        new TerrainLoader().loadLocalTerrain(
          data.nodeData.url,
          viewer,
          data.isChecked
        );
      } else if (data.nodeData.serviceType === "UrlTemplate") {
        ImageryLoader.loadUrlTemlpateImageryLayer(
          viewer,
          data.nodeData.url,
          data.nodeData.layers,
          data.isChecked
        );
      }
      console.log(this.activeImageryNameSet);
    },
    // 接收三维服务
    recept3dViewInfo(data) {
      if (data.nodeData.serviceType === "3DTiles") {
        this.load3dTiles(
          data.nodeData.url,
          data.nodeData.name,
          data.isChecked,
          data.nodeData.label
        );
      }
    },
    // 接收通用组件传递过来的值
    commonToolHandleOnClick(item) {
      if (!viewer) return;
      switch (item.index) {
        case 1:
          CesiumUtils.viewCesiumUtils().taggleEarthShow(viewer);
          break;
        case 2:
          CesiumUtils.viewCesiumUtils().taggleUnderSpace(viewer);
          break;
        case 3:
          CesiumUtils.viewCesiumUtils().resetView(
            viewer,
            113.805972,
            27.664014,
            8000000.0
          );
          break;
        case 4:
          CesiumUtils.viewCesiumUtils().zoomOut(viewer);
          break;
        case 5:
          CesiumUtils.viewCesiumUtils().zoomIn(viewer);
          break;
        case 6:
          CesiumUtils.viewCesiumUtils().taggleFullScreen(item.active);

          break;
        case 7:
          CesiumUtils.viewCesiumUtils().zoomOut(viewer);

          break;

        default:
          break;
      }
    },
    /**
     *  初始定位中国
     * */
    flytochina() {
      // viewer.camera.flyTo({
      //     destination: Cesium.Cartesian3.fromDegrees(116.435314, 40.960521, 10000000.0),
      //     duration: 8
      // });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          110.435314,
          40.960521,
          8000000.0
        ),
        orientation: {
          heading: Cesium.Math.toRadians(20), //代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
          pitch: Cesium.Math.toRadians(-95), //代表镜头上下方向,正值为上,负值为下.
          roll: Cesium.Math.toRadians(-20), //代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
        },
        complete: function callback() {
          // 定位完成之后的回调函数
        },
      });
      // let initialPosition = Cesium.Cartesian3.fromDegrees(110.435314, 40.960521, 500000.0 );
      // let initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
      //   21.27879878293835,
      //   -21.34390550872461,
      //   0.0716951918898415
      // );
      // viewer.scene.camera.setView({
      //   destination: initialPosition,
      //   orientation: initialOrientation,
      //   endTransform: Cesium.Matrix4.IDENTITY,
      // });
    },
    // 接收线框
    receptWifeinfo(val) {
      for (let i = 0; i < tileSetList.length; i++) {
        if (tileSetList[i].name === this.mdlName) {
          tileSetList[i].tileSet.debugWireframe = val;
        }
      }
    },
    // 接收分析结果
    receptFenxiInfo(data) {
      if (data.label === "地形挖掘") {
        this.dig3DTerrian();
      } else if (data.label === "清除绘制") {
        this.clearDraw();
      } else if (data.label === "虚拟钻孔") {
        this.activeDoubleEvent = true;
      }
    },
    // 接收地球透明
    receptAlphaInfo(alpha) {
      viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
        Cesium.Math.clamp(alpha, 0.0, 1.0);
    },
    // 接收地图透明
    receptImageryAlpha(alpha) {
      for (let i = 0; i < imageryLayers._layers.length; i++) {
        if (
          imageryLayers._layers[i].imageryProvider.name !== "tdtCiaLayer" &&
          imageryLayers._layers[i].imageryProvider.name !== "gdtImgLayer" &&
          imageryLayers._layers[i].imageryProvider.name !== "vecTypeOSM" &&
          imageryLayers._layers[i].imageryProvider.name !== "imgTypeESRIMap"
        ) {
          imageryLayers._layers[i].alpha = alpha;
        }
      }
    },
    // 接收来自通用查询
    async receptSearchInfo(item) {
      // 是否加载钻孔并显示
      let flagObj = ImageryLoader.billbordsIsExist("holeLayer");
      if (flagObj.isChecked && flagObj.obj.show) {
        let billboardsList = flagObj.obj._billboards;
        for (let i = 0; i < billboardsList.length; i++) {
          let primitiveId = billboardsList[i].id;
          if (primitiveId === item.worksiteid) {
            console.log(billboardsList[i]);
            let originalColor = billboardsList[i].color.clone();
            // let flashColor = new Cesium.Color(255, 255, 255, 1);
            let flashColor = new Cesium.Color.RED();
            billboardsList[i].color = flashColor;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                item.borelon,
                item.borelat,
                500
              ),
              orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-90.0),
                roll: 0.0,
              },
            });
          }
        }
      } else {
        if (billboardsList.length === 0) {
          this.$message({
            type: "warning",
            message: "请先加载钻孔",
          });
          return;
        }
      }
    },
    // 接收通用查询
    receptCommonFromSearchCompent(item) {
      let flagObj = ImageryLoader.judgeIsExistInLayerByName(
        this.holeBillbordsLayer,
        item.label
      );
      if (flagObj.isChecked) {
        console.log("已显示过");
        this.holeBillbordsLayer.remove(flagObj.obj);
      } else {
        let lon = Number(item.longitude);
        let lat = Number(item.latitude);
        let label = item.label;
        const position = Cesium.Cartesian3.fromDegrees(lon, lat);
        let imgUrl = require("../../assets/images/clusterIcon/hole1.png");
        ImageryLoader.loadBillboardLayer(
          this.holeBillbordsLayer,
          position,
          label,
          imgUrl
        );
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 500),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
            roll: 0.0,
          },
        });
      }
    },
    // 接收来自图层点击的信息
    receptLayerItemFromSearchCompent(item) {
      
      ImageryLoader.loadSelectWmsLayer(
        viewer,
        item.url,
        item.layer,
        item.label,
        item.cqlStr,
        item.active
      );
      this.activeImageryNameSet.add("temp" + item.layer + item.label);
    },
    // 重置所有结果
    receptResetInfoEvent(index) {
      if (index === 0) {
        this.holeBillbordsLayer.removeAll();
      } else if (index === 2) {
        for (let i = 0; i < imageryLayers._layers.length; i++) {
          if (
            imageryLayers._layers[i].imageryProvider.name.indexOf("temp") >= 0
          ) {
            imageryLayers.remove(imageryLayers._layers[i]);
            i = -1;
            if (imageryLayers._layers.length === 1) {
              return;
            }
          }
        }
      }
    },

    // 获取wms服务图层组的的图层
    getLayerInfoFromLayerGroup(url) {
      this.$http
        .get(
          "http://192.10.3.237/geoserver/crcc-dev/geomap-rs/wms?request=GetCapabilities&service=WMS&version=1.1.1"
        )
        .then((res) => {
          console.log(this.$x2js.xml2js(res.data)); // 将xml解析成json格式，获取所有图层
        });
    },

    /**
     * 拾取屏幕像素位置的cesium要素，并判断是什么类型(支持：Entity Cesium3DTileset Billboard Primitive)
     * @param x
     * @param y
     * @param feature 获取到的对象
     * @returns {*}
     */
    pickFeatureFromScreen(feature) {
      let resp = {
        pickResult: null,
      };
      // let pickCartesian2 = new Cesium.Cartesian2(x, y)
      // let feature = viewer.scene.pick(pickCartesian2);
      if (Cesium.defined(feature)) {
        // feature.primitive.constructor.name 也可以获取类型
        resp.pickResult = feature; // 拾取结果
        if (
          feature.hasOwnProperty("id") &&
          feature.id instanceof Cesium.Entity
        ) {
          // entity: {collection, id, primitive}
          resp.type = "Entity";
          resp.detailType = feature.primitive.constructor.name;
          resp.entity = feature.id;
          resp.primitive = feature.primitive;
        } else if (feature.primitive instanceof Cesium.Cesium3DTileset) {
          // 3DTile: {content, primitive}
          resp.type = "Cesium3DTileset";
        } else if (feature.primitive instanceof Cesium.Billboard) {
          // primitive-billboard: {collection, id, primitive}
          resp.type = "Billboard";
          resp.id = feature.id;
          resp.billboardCollection = feature.collection;
          resp.billboard = feature.primitive;
        } else if (feature.primitive instanceof Cesium.Primitive) {
          // primitive: { primitive}
          resp.type = "Primitive";
          resp.primitive = feature.primitive;
        } else if (feature.primitive instanceof Cesium.Model) {
          // primitive: { primitive}
          resp.type = "Primitive";
          resp.detailType = "Model";
          resp.primitive = feature.primitive;
        }
      }
      return resp;
    },

    /**重置上一次鼠标移动高亮的元素并设置当前获取到的feature的高亮
     * @param HightedFeatureObj 已经高亮的feature对象
     * @param currentFeature 当前feature
     */
    setFeatureColor(HightedFeatureObj, currentFeature) {
      if (Cesium.defined(HightedFeatureObj.feature)) {
        // if(HightedFeatureObj.type === "Entity"){
        // }else if(HightedFeatureObj.type === "Cesium3DTileset"){
        //   HightedFeatureObj.feature.color = HightedFeatureObj.originalColor;
        //   HightedFeatureObj.feature = undefined;
        //   HightedFeatureObj.type = undefined;
        // }else if(HightedFeatureObj.type === "Billboard"){
        //   HightedFeatureObj.feature.color = HightedFeatureObj.originalColor;
        //   HightedFeatureObj.feature = undefined;
        //   HightedFeatureObj.type = undefined;
        // }else if(HightedFeatureObj.type === "Primitive"){

        // }
        HightedFeatureObj.feature.color = HightedFeatureObj.originalColor;
        HightedFeatureObj.feature = undefined;
        HightedFeatureObj.type = undefined;
        HightedFeatureObj.originalColor = new Cesium.Color(0, 0, 0, 0);
      }

      if (!Cesium.defined(currentFeature)) return;
      let pickResult = this.pickFeatureFromScreen(currentFeature);
      if (pickResult.type === "Entity") {
        if (!pickResult.entity.model) {
          //说明不是entity 莫得model对象
          HightedFeatureObj.feature = pickResult.primitive;
          HightedFeatureObj.type = pickResult.type;
          Cesium.Color.clone(
            pickResult.primitive.color,
            HightedFeatureObj.originalColor
          );
          currentFeature.primitive.color = Cesium.Color.ORANGERED;
        } else {
          HightedFeatureObj.feature = pickResult.entity.model;
          HightedFeatureObj.type = pickResult.type;
          Cesium.Color.clone(
            pickResult.entity.model.color,
            HightedFeatureObj.originalColor
          );
          pickResult.entity.model.color = Cesium.Color.ORANGERED;
        }
      } else if (pickResult.type === "Cesium3DTileset") {
        HightedFeatureObj.feature = pickResult.pickResult;
        HightedFeatureObj.type = pickResult.type;
        Cesium.Color.clone(
          pickResult.pickResult.color,
          HightedFeatureObj.originalColor
        );
        currentFeature.color = Cesium.Color.ORANGERED;
      } else if (pickResult.type === "Billboard") {
        HightedFeatureObj.feature = pickResult.billboard;
        HightedFeatureObj.type = pickResult.type;
        Cesium.Color.clone(
          pickResult.billboard.color,
          HightedFeatureObj.originalColor
        );
        pickResult.billboard.color = Cesium.Color.ORANGERED;
      } else if (pickResult.type === "Primitive") {
        HightedFeatureObj.feature = pickResult.primitive;
        HightedFeatureObj.type = pickResult.type;
        Cesium.Color.clone(
          pickResult.primitive.color,
          HightedFeatureObj.originalColor
        );
        currentFeature.primitive.color = Cesium.Color.ORANGERED;
      }
    },

    /**获取geoserver的wms范围
     * @param url wms服务地址
     */
    getGeoServerWmsBoundingBox(url) {
      this.$http
        .get(
          url +
            "?service=wms&version=1.1.1&request=GetCapabilities&&outputFormat=application/json"
        )
        .then((res) => {
          let aa = this.$x2js.xml2js(res.data);
          let boxExtent =
            aa.WMT_MS_Capabilities.Capability.Layer.LatLonBoundingBox;
          if (!boxExtent) return;
          console.log(boxExtent);
          let rectangle = Cesium.Rectangle.fromDegrees(
            Number(boxExtent._minx),
            Number(boxExtent._miny),
            Number(boxExtent._maxx),
            Number(boxExtent._maxy)
          );
          viewer.camera.setView({
            destination: rectangle,
          });
        });
      // success: function (xmlResult) {
      //     $(xmlResult).find("Layer").find("Layer").each(function() {
      //         var item = $(this);
      //         if(item.find("Name").text()==layers.split(":")[1]){
      //             mapHelper.map.getView().fit(ol.proj.transformExtent([Number(item.find("BoundingBox").attr("minx")), Number(item.find("BoundingBox").attr("miny")), Number(item.find("BoundingBox").attr("maxx")), Number(item.find("BoundingBox").attr("maxy"))], item.find("BoundingBox").attr("SRS"), item.find("BoundingBox").attr("SRS")), { duration: 300 })
      //         }
      //     });
      // }
    },
    onMessageFromComponent() {},
    destroyMessage() {},
  },
  created() {
    this.onMessageFromComponent(); // 接收其他组件传递过来的值
  },
  mounted() {
    this.initCesium(); // cesim初始化必须放在mounted里面
    // 加载三维地形
    new TerrainLoader().loadLocalTerrain(
      "http://192.10.3.237:81/tsyTerrain/",
      viewer,
      true
    );
    this.registerOnclickEvent();
    // let a = CesiumUtils.drawUtils(viewer);
    // a.createPointBuffer([106.422638966289, 29.5698367125623], 100000);
    eventVue.$emit("sendCesiumViewer", viewer);
    // this.getGeoServerWmsBoundingBox("http://192.10.3.237/geoserver/crcc-dev/wms");
  },
  beforeDestroy() {
    this.destroyMessage();
    if (viewer) {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewer = null;
    }
    tileSetList = [];
  },
};
</script>

<style scoped>
.class_title {
  /*设置title标题样式 sisi*/
  position: absolute;
  color: rgb(174, 179, 177);
  font-size: 34px;
  z-index: 1;
  margin-left: 109px;
  margin-top: 31px;
}
.logo_class {
  /*sisi */
  position: absolute;
  z-index: 1;
}
.cesiumMenu_box {
  position: absolute;
  right: 0px;
  top: 0px;
  width: 100px;
  z-index: 1;
  background-color: rgb(244, 244, 245);
}
.cesiumMenu_box ul {
  font-size: 12px;
  list-style: none;
  margin: 0px;
  padding: 0px;
}
.cesiumMenu_box ul li {
  height: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
  padding: 5px;
  margin-bottom: 1px;
}
.cesiumMenu_box ul li:hover {
  background-color: rgb(144, 147, 153);
}
.active {
  background-color: rgb(144, 147, 153);
  color: white;
}
.cesiumContent_box {
  position: absolute;
  right: 100px;
  top: 0px;
  z-index: 1;
  background-color: rgb(255, 255, 255);
}

.mdlTool_box {
  position: fixed;
  top: 105px;
  right: 100px;
}
</style>

